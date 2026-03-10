import { supabase } from './supabase'
import { parsePptx } from './pptx-parser'
import { applyImprovements, type SlideImprovement } from './pptx-modifier'
import type { CoachReport, MeetingType, AudienceType } from './types'

export interface AnalysisResult {
  report: CoachReport
  downloadUrl: string | null
}

export async function analyzePresentation(
  file: File,
  meetingType: MeetingType,
  audience: AudienceType | null,
  lang: string
): Promise<AnalysisResult> {
  // 1. Parse PPTX client-side to extract slide text
  const slides = await parsePptx(file)
  if (slides.length === 0) {
    throw new Error('Aucune slide trouvée dans le fichier PPTX')
  }

  // 2. Create submission record in DB
  const submissionId = crypto.randomUUID()
  const storagePath = `uploads/${submissionId}.pptx`

  const { error: insertErr } = await supabase.from('submissions').insert({
    id: submissionId,
    file_name: file.name,
    storage_path: storagePath,
    meeting_type: meetingType,
    audience,
    status: 'analyzing',
  })
  if (insertErr) throw new Error(`DB error: ${insertErr.message}`)

  // 3. Upload original PPTX to Supabase Storage
  const { error: uploadErr } = await supabase.storage
    .from('presentations')
    .upload(storagePath, file)
  if (uploadErr) throw new Error(`Storage error: ${uploadErr.message}`)

  // 4. Call Supabase Edge Function with extracted text
  const { data: analysis, error: fnErr } = await supabase.functions.invoke(
    'analyze',
    {
      body: {
        slides: slides.map((s) => ({
          number: s.number,
          title: s.title,
          content: s.content,
        })),
        meetingType,
        audience,
        lang,
      },
    }
  )

  if (fnErr) throw new Error(`Analysis error: ${fnErr.message}`)
  if (analysis.error) throw new Error(analysis.error)

  const { improvedSlides, ...reportData } = analysis as {
    improvedSlides?: SlideImprovement[]
  } & Record<string, unknown>

  // 5. Generate improved PPTX client-side and upload to Storage
  let downloadUrl: string | null = null
  const improvedPath = `improved/${submissionId}.pptx`

  if (improvedSlides && improvedSlides.length > 0) {
    const improvedBlob = await applyImprovements(file, improvedSlides)

    const { error: upErr } = await supabase.storage
      .from('presentations')
      .upload(improvedPath, improvedBlob)

    if (!upErr) {
      const { data: urlData } = supabase.storage
        .from('presentations')
        .getPublicUrl(improvedPath)
      downloadUrl = urlData.publicUrl
    }
  }

  // 6. Build report object
  const report: CoachReport = {
    id: crypto.randomUUID(),
    submissionId,
    meetingType,
    overallScore: reportData.overallScore as number,
    criteriaScores: reportData.criteriaScores as CoachReport['criteriaScores'],
    strengths: reportData.strengths as string[],
    improvements: reportData.improvements as string[],
    suggestions: reportData.suggestions as CoachReport['suggestions'],
    encouragement: reportData.encouragement as string,
    language: lang as 'fr' | 'en',
    createdAt: new Date().toISOString(),
  }

  // 7. Save report to DB
  await supabase.from('reports').insert({
    id: report.id,
    submission_id: submissionId,
    meeting_type: meetingType,
    overall_score: report.overallScore,
    criteria_scores: report.criteriaScores,
    strengths: report.strengths,
    improvements: report.improvements,
    suggestions: report.suggestions,
    encouragement: report.encouragement,
    improved_storage_path: downloadUrl ? improvedPath : null,
    language: lang,
  })

  // 8. Update submission status
  await supabase
    .from('submissions')
    .update({ status: 'completed' })
    .eq('id', submissionId)

  return { report, downloadUrl }
}
