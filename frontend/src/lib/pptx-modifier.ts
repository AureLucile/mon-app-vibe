import JSZip from 'jszip'

export interface SlideImprovement {
  slideNumber: number
  replacements: { original: string; improved: string }[]
}

export async function applyImprovements(
  file: File,
  improvements: SlideImprovement[]
): Promise<Blob> {
  const buffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(buffer)

  for (const imp of improvements) {
    const slideFile = `ppt/slides/slide${imp.slideNumber}.xml`
    const entry = zip.file(slideFile)
    if (!entry) continue

    let xml = await entry.async('string')

    for (const r of imp.replacements) {
      if (r.original && r.improved && r.original !== r.improved) {
        // Replace all occurrences of original text in the slide XML
        const parts = xml.split(r.original)
        xml = parts.join(r.improved)
      }
    }

    zip.file(slideFile, xml)
  }

  return zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' })
}
