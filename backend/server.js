import express from 'express'
import cors from 'cors'
import multer from 'multer'
import JSZip from 'jszip'
import Anthropic from '@anthropic-ai/sdk'
import { randomUUID } from 'crypto'
import { writeFile, readFile, unlink, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(cors())
app.use(express.json())

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
})

const anthropic = new Anthropic()

const tmpDir = join(__dirname, 'tmp')
await mkdir(tmpDir, { recursive: true })

// ---------------------------------------------------------------------------
// PPTX Parser – extract text per slide from the uploaded .pptx (ZIP of XML)
// ---------------------------------------------------------------------------

async function parsePptx(buffer) {
  const zip = await JSZip.loadAsync(buffer)
  const slides = []

  const slideFiles = Object.keys(zip.files)
    .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)[1])
      const numB = parseInt(b.match(/slide(\d+)/)[1])
      return numA - numB
    })

  for (const slideFile of slideFiles) {
    const xml = await zip.file(slideFile).async('string')
    const slideNum = parseInt(slideFile.match(/slide(\d+)/)[1])

    // Collect every <a:t> text node
    const texts = []
    const textRegex = /<a:t>([^<]*)<\/a:t>/g
    let m
    while ((m = textRegex.exec(xml)) !== null) {
      if (m[1].trim()) texts.push(m[1])
    }

    // Try to detect the title (text inside a title placeholder shape)
    let title = ''
    const titleShapeRe =
      /<p:sp>[\s\S]*?<p:ph[^>]*type="(?:title|ctrTitle)"[\s\S]*?<\/p:sp>/gi
    const titleShapeMatch = xml.match(titleShapeRe)
    if (titleShapeMatch) {
      const titleTexts = []
      const innerRe = /<a:t>([^<]*)<\/a:t>/g
      let tm
      while ((tm = innerRe.exec(titleShapeMatch[0])) !== null) {
        if (tm[1].trim()) titleTexts.push(tm[1])
      }
      title = titleTexts.join(' ')
    }

    slides.push({
      number: slideNum,
      title: title || texts[0] || `Slide ${slideNum}`,
      content: texts.join('\n'),
      file: slideFile,
    })
  }

  return slides
}

// ---------------------------------------------------------------------------
// Create improved PPTX by replacing text directly in the slide XML
// ---------------------------------------------------------------------------

async function createImprovedPptx(originalBuffer, improvements) {
  const zip = await JSZip.loadAsync(originalBuffer)

  for (const imp of improvements) {
    const slideFile = `ppt/slides/slide${imp.slideNumber}.xml`
    const file = zip.file(slideFile)
    if (!file) continue

    let xml = await file.async('string')

    for (const r of imp.replacements || []) {
      if (r.original && r.improved && r.original !== r.improved) {
        // Escape special regex characters in the original text
        const escaped = r.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        xml = xml.replaceAll(r.original, r.improved)
      }
    }

    zip.file(slideFile, xml)
  }

  return zip.generateAsync({ type: 'nodebuffer' })
}

// ---------------------------------------------------------------------------
// Criteria grids per meeting type
// ---------------------------------------------------------------------------

const CRITERIA = {
  'comite-direction': [
    { name: 'Clarté de la demande de décision', weight: 30 },
    { name: 'Argumentation et données', weight: 25 },
    { name: 'Synthèse et concision', weight: 20 },
    { name: 'Prochaines étapes', weight: 15 },
    { name: 'Qualité formelle', weight: 10 },
  ],
  'kick-off': [
    { name: 'Contexte et objectifs', weight: 25 },
    { name: 'Gouvernance et rôles', weight: 20 },
    { name: 'Planning et jalons', weight: 25 },
    { name: 'Risques identifiés', weight: 15 },
    { name: 'Règles de fonctionnement', weight: 15 },
  ],
  'revue-projet': [
    { name: 'Statut synthétique', weight: 25 },
    { name: 'Avancement vs planning', weight: 25 },
    { name: 'Points bloquants', weight: 20 },
    { name: 'Prochaines étapes', weight: 20 },
    { name: 'Qualité formelle', weight: 10 },
  ],
  commercial: [
    { name: 'Connaissance du prospect', weight: 20 },
    { name: 'Proposition de valeur', weight: 30 },
    { name: 'Storytelling', weight: 20 },
    { name: 'Call to action', weight: 15 },
    { name: 'Qualité formelle', weight: 15 },
  ],
  formation: [
    { name: 'Objectifs pédagogiques', weight: 25 },
    { name: 'Progression logique', weight: 25 },
    { name: 'Clarté des explications', weight: 20 },
    { name: 'Exercices et interactions', weight: 15 },
    { name: 'Récapitulatif', weight: 15 },
  ],
  autre: [
    { name: 'Objectifs clairs', weight: 25 },
    { name: 'Structure logique', weight: 25 },
    { name: 'Prochaines étapes', weight: 20 },
    { name: 'Pertinence du contenu', weight: 20 },
    { name: 'Qualité formelle', weight: 10 },
  ],
}

// ---------------------------------------------------------------------------
// Build prompt for Claude
// ---------------------------------------------------------------------------

function buildPrompt(slides, meetingType, audience, lang) {
  const criteria = CRITERIA[meetingType] || CRITERIA['autre']

  const slidesText = slides
    .map(
      (s) =>
        `--- Slide ${s.number} ---\nTitre: ${s.title}\nContenu:\n${s.content}`
    )
    .join('\n\n')

  const isEn = lang === 'en'

  return `${isEn ? 'You are an expert in professional communication and PowerPoint presentation design. Reply entirely in English.' : 'Tu es un expert en communication professionnelle et en conception de présentations PowerPoint. Réponds entièrement en français.'}

${isEn ? 'Analyze this presentation' : 'Analyse cette présentation'} de type "${meetingType}"${audience ? ` ${isEn ? 'for' : 'destinée à une audience'} "${audience}"` : ''}.

${isEn ? 'Here is the extracted content from each slide:' : 'Voici le contenu extrait des slides :'}

${slidesText}

${isEn ? 'Criteria grid to use:' : 'Grille de critères à utiliser :'}
${criteria.map((c) => `- ${c.name} (${isEn ? 'weight' : 'pondération'}: ${c.weight}%)`).join('\n')}

${isEn ? 'Return a JSON response strictly matching this structure' : 'Fournis une réponse JSON strictement conforme à cette structure'} :

{
  "overallScore": <number 0-5>,
  "criteriaScores": [
    {
      "name": "<criterion name>",
      "score": <number 0-5>,
      "weight": <number>,
      "rationale": "<detailed justification>",
      "slidesReferenced": ["Slide X", ...]
    }
  ],
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "suggestions": [
    {
      "type": "reformulation" | "add-slide" | "remove-slide" | "reorganize",
      "slideRef": "<Slide X>",
      "before": "<original text>",
      "after": "<improved text>",
      "description": "<description>"
    }
  ],
  "encouragement": "<personalized encouragement message>",
  "improvedSlides": [
    {
      "slideNumber": <number>,
      "replacements": [
        {
          "original": "<exact original text as extracted above>",
          "improved": "<improved text>"
        }
      ]
    }
  ]
}

IMPORTANT ${isEn ? 'for' : 'pour'} improvedSlides:
- "original" ${isEn ? 'must match EXACTLY the text extracted from the slides above' : 'doit correspondre EXACTEMENT au texte extrait des slides ci-dessus'}
- ${isEn ? 'Only suggest replacements when genuinely useful (no need to change everything)' : 'Ne propose des remplacements que quand c\'est utile (pas besoin de tout changer)'}
- ${isEn ? 'Keep an appropriate tone and style for the meeting type' : 'Garde le style et le ton appropriés pour le type de réunion'}
- ${isEn ? 'Improve clarity, impact, and structure' : 'Améliore la clarté, l\'impact et la structure du texte'}

${isEn ? 'Reply ONLY with the JSON, no text before or after.' : 'Réponds UNIQUEMENT avec le JSON, sans aucun texte avant ou après.'}`
}

// ---------------------------------------------------------------------------
// POST /api/analyze – main endpoint
// ---------------------------------------------------------------------------

app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    const { meetingType, audience, lang } = req.body

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    if (!meetingType) {
      return res.status(400).json({ error: 'Meeting type required' })
    }

    // 1. Parse PPTX
    const slides = await parsePptx(req.file.buffer)

    if (slides.length === 0) {
      return res.status(400).json({ error: 'No slides found in the PPTX file' })
    }

    console.log(`Parsed ${slides.length} slides, calling Claude API...`)

    // 2. Call Claude API
    const prompt = buildPrompt(slides, meetingType, audience, lang || 'fr')

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = message.content[0].text

    // Parse JSON response (handle optional markdown fences)
    let analysis
    try {
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/)
      analysis = JSON.parse(jsonMatch ? jsonMatch[1] : responseText)
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr.message)
      console.error('Raw response:', responseText.substring(0, 500))
      return res.status(500).json({ error: 'Failed to parse AI response' })
    }

    // 3. Create improved PPTX
    const { improvedSlides, ...report } = analysis

    let downloadId = null
    if (improvedSlides && improvedSlides.length > 0) {
      const improvedBuffer = await createImprovedPptx(
        req.file.buffer,
        improvedSlides
      )
      downloadId = randomUUID()
      const filePath = join(tmpDir, `${downloadId}.pptx`)
      await writeFile(filePath, improvedBuffer)

      // Auto-cleanup after 30 minutes
      setTimeout(async () => {
        try {
          await unlink(filePath)
        } catch {}
      }, 30 * 60 * 1000)
    }

    // 4. Return response
    res.json({
      report: {
        id: randomUUID(),
        submissionId: randomUUID(),
        meetingType,
        ...report,
        language: lang || 'fr',
        createdAt: new Date().toISOString(),
      },
      downloadId,
    })
  } catch (err) {
    console.error('Analysis error:', err)
    res.status(500).json({ error: err.message || 'Internal server error' })
  }
})

// ---------------------------------------------------------------------------
// GET /api/download/:id – download improved PPTX
// ---------------------------------------------------------------------------

app.get('/api/download/:id', async (req, res) => {
  try {
    const filePath = join(tmpDir, `${req.params.id}.pptx`)
    const buffer = await readFile(filePath)
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    )
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="presentation_amelioree.pptx"'
    )
    res.send(buffer)
  } catch {
    res.status(404).json({ error: 'File not found or expired' })
  }
})

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`DeckReview API running on http://localhost:${PORT}`)
})
