import { describe, it, expect } from 'vitest'
import JSZip from 'jszip'
import { applyImprovements, type SlideImprovement } from '../pptx-modifier'

async function buildPptxFile(
  slides: Record<string, string>,
  name = 'test.pptx'
): Promise<File> {
  const zip = new JSZip()
  for (const [path, content] of Object.entries(slides)) {
    zip.file(path, content)
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  return new File([blob], name, {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  })
}

async function extractSlideXml(blob: Blob, slidePath: string): Promise<string> {
  const buffer = await blob.arrayBuffer()
  const zip = await JSZip.loadAsync(buffer)
  const entry = zip.file(slidePath)
  if (!entry) throw new Error(`Slide ${slidePath} not found`)
  return entry.async('string')
}

// Test 10: applyImprovements remplace le texte dans le XML
describe('applyImprovements', () => {
  it('remplace le texte original par le texte ameliore', async () => {
    const slideXml = `<p:sld><p:cSld><p:spTree>
      <p:sp><p:txBody><a:p><a:r><a:t>Texte original</a:t></a:r></a:p></p:txBody></p:sp>
    </p:spTree></p:cSld></p:sld>`

    const file = await buildPptxFile({ 'ppt/slides/slide1.xml': slideXml })

    const improvements: SlideImprovement[] = [
      {
        slideNumber: 1,
        replacements: [
          { original: 'Texte original', improved: 'Texte ameliore' },
        ],
      },
    ]

    const result = await applyImprovements(file, improvements)
    const xml = await extractSlideXml(result, 'ppt/slides/slide1.xml')

    expect(xml).toContain('Texte ameliore')
    expect(xml).not.toContain('Texte original')
  })

  it('ne modifie pas les slides sans ameliorations', async () => {
    const slide1 = `<p:sld><a:t>Slide 1 contenu</a:t></p:sld>`
    const slide2 = `<p:sld><a:t>Slide 2 contenu</a:t></p:sld>`

    const file = await buildPptxFile({
      'ppt/slides/slide1.xml': slide1,
      'ppt/slides/slide2.xml': slide2,
    })

    const improvements: SlideImprovement[] = [
      {
        slideNumber: 1,
        replacements: [{ original: 'Slide 1 contenu', improved: 'Slide 1 modifie' }],
      },
    ]

    const result = await applyImprovements(file, improvements)
    const xml2 = await extractSlideXml(result, 'ppt/slides/slide2.xml')

    expect(xml2).toContain('Slide 2 contenu')
  })

  it('ignore les remplacements ou original === improved', async () => {
    const slideXml = `<p:sld><a:t>Contenu inchange</a:t></p:sld>`
    const file = await buildPptxFile({ 'ppt/slides/slide1.xml': slideXml })

    const improvements: SlideImprovement[] = [
      {
        slideNumber: 1,
        replacements: [{ original: 'Contenu inchange', improved: 'Contenu inchange' }],
      },
    ]

    const result = await applyImprovements(file, improvements)
    const xml = await extractSlideXml(result, 'ppt/slides/slide1.xml')

    expect(xml).toContain('Contenu inchange')
  })
})
