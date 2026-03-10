import JSZip from 'jszip'

export interface ParsedSlide {
  number: number
  title: string
  content: string
  file: string
}

export async function parsePptx(file: File): Promise<ParsedSlide[]> {
  const buffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(buffer)
  const slides: ParsedSlide[] = []

  const slideFiles = Object.keys(zip.files)
    .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)![1])
      const numB = parseInt(b.match(/slide(\d+)/)![1])
      return numA - numB
    })

  for (const slideFile of slideFiles) {
    const xml = await zip.file(slideFile)!.async('string')
    const slideNum = parseInt(slideFile.match(/slide(\d+)/)![1])

    // Collect every <a:t> text node
    const texts: string[] = []
    const textRegex = /<a:t>([^<]*)<\/a:t>/g
    let m
    while ((m = textRegex.exec(xml)) !== null) {
      if (m[1].trim()) texts.push(m[1])
    }

    // Detect title from title placeholder shape
    let title = ''
    const titleShapeRe =
      /<p:sp>[\s\S]*?<p:ph[^>]*type="(?:title|ctrTitle)"[\s\S]*?<\/p:sp>/gi
    const titleShapeMatch = xml.match(titleShapeRe)
    if (titleShapeMatch) {
      const titleTexts: string[] = []
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
