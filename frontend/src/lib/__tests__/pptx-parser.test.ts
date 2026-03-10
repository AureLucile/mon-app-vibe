import { describe, it, expect } from 'vitest'
import JSZip from 'jszip'
import { parsePptx } from '../pptx-parser'

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

// Test 5: parsePptx extrait le texte des slides XML
describe('parsePptx — extraction de texte', () => {
  it('extrait le texte depuis les noeuds <a:t>', async () => {
    const slideXml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld>
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p><a:r><a:t>Titre principal</a:t></a:r></a:p>
          <a:p><a:r><a:t>Contenu de la slide</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`

    const file = await buildPptxFile({ 'ppt/slides/slide1.xml': slideXml })
    const slides = await parsePptx(file)

    expect(slides).toHaveLength(1)
    expect(slides[0].number).toBe(1)
    expect(slides[0].content).toContain('Titre principal')
    expect(slides[0].content).toContain('Contenu de la slide')
  })

  it('trie les slides par numero', async () => {
    const makeSlide = (text: string) => `<p:sld><p:cSld><p:spTree>
      <p:sp><p:txBody><a:p><a:r><a:t>${text}</a:t></a:r></a:p></p:txBody></p:sp>
    </p:spTree></p:cSld></p:sld>`

    const file = await buildPptxFile({
      'ppt/slides/slide3.xml': makeSlide('Slide 3'),
      'ppt/slides/slide1.xml': makeSlide('Slide 1'),
      'ppt/slides/slide2.xml': makeSlide('Slide 2'),
    })
    const slides = await parsePptx(file)

    expect(slides).toHaveLength(3)
    expect(slides[0].number).toBe(1)
    expect(slides[1].number).toBe(2)
    expect(slides[2].number).toBe(3)
  })
})

// Test 6: parsePptx detecte le titre depuis le placeholder title
describe('parsePptx — detection du titre', () => {
  it('extrait le titre depuis un placeholder type="title"', async () => {
    const slideXml = `<?xml version="1.0" encoding="UTF-8"?>
<p:sld>
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:nvSpPr><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr>
        <p:txBody>
          <a:p><a:r><a:t>Mon Titre</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:txBody>
          <a:p><a:r><a:t>Corps du texte</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`

    const file = await buildPptxFile({ 'ppt/slides/slide1.xml': slideXml })
    const slides = await parsePptx(file)

    expect(slides[0].title).toBe('Mon Titre')
  })

  it('utilise le premier texte comme fallback si pas de placeholder title', async () => {
    const slideXml = `<p:sld><p:cSld><p:spTree>
      <p:sp><p:txBody><a:p><a:r><a:t>Premier texte</a:t></a:r></a:p></p:txBody></p:sp>
    </p:spTree></p:cSld></p:sld>`

    const file = await buildPptxFile({ 'ppt/slides/slide1.xml': slideXml })
    const slides = await parsePptx(file)

    expect(slides[0].title).toBe('Premier texte')
  })

  it('utilise "Slide N" comme fallback si aucun texte', async () => {
    const slideXml = `<p:sld><p:cSld><p:spTree></p:spTree></p:cSld></p:sld>`

    const file = await buildPptxFile({ 'ppt/slides/slide1.xml': slideXml })
    const slides = await parsePptx(file)

    expect(slides[0].title).toBe('Slide 1')
  })
})
