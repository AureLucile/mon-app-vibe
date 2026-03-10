import PptxGenJS from 'pptxgenjs'
import type { PresentationTemplate } from './templates'
import { MEETING_TYPES } from './types'

const NAVY = '003B80'
const BLUE = '009EE0'
const LIGHT_BG = 'F5F7FA'
const WHITE = 'FFFFFF'
const GRAY = '64748B'

export function generatePptx(template: PresentationTemplate, lang: 'fr' | 'en') {
  const pptx = new PptxGenJS()

  const meetingType = MEETING_TYPES.find((m) => m.id === template.meetingType)
  const title = meetingType
    ? lang === 'fr'
      ? meetingType.labelFr
      : meetingType.labelEn
    : template.meetingType

  pptx.author = 'DeckReview AI'
  pptx.subject = title
  pptx.title = `Template — ${title}`
  pptx.layout = 'LAYOUT_WIDE'

  // --- Cover slide ---
  const cover = pptx.addSlide()
  cover.background = { color: NAVY }

  cover.addText('DeckReview AI', {
    x: 0.8,
    y: 0.5,
    w: '80%',
    fontSize: 14,
    color: BLUE,
    fontFace: 'Arial',
    bold: true,
  })

  cover.addText(title, {
    x: 0.8,
    y: 2.0,
    w: '80%',
    fontSize: 36,
    color: WHITE,
    fontFace: 'Arial',
    bold: true,
  })

  cover.addText(
    lang === 'fr'
      ? `Modèle de présentation — ${template.totalSlides} slides`
      : `Presentation template — ${template.totalSlides} slides`,
    {
      x: 0.8,
      y: 3.2,
      w: '80%',
      fontSize: 16,
      color: BLUE,
      fontFace: 'Arial',
    }
  )

  cover.addText(
    lang === 'fr'
      ? 'Remplacez le contenu de chaque slide par le vôtre.\nLes instructions et conseils sont dans les notes du présentateur.'
      : 'Replace each slide content with your own.\nInstructions and tips are in the speaker notes.',
    {
      x: 0.8,
      y: 4.2,
      w: '80%',
      fontSize: 12,
      color: 'A0AEC0',
      fontFace: 'Arial',
    }
  )

  // --- Content slides ---
  for (const slide of template.slides) {
    const s = pptx.addSlide()
    s.background = { color: WHITE }

    // Top bar
    s.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.08,
      fill: { color: BLUE },
    })

    // Slide number badge
    s.addText(String(slide.number), {
      x: 0.5,
      y: 0.4,
      w: 0.55,
      h: 0.55,
      fontSize: 18,
      color: WHITE,
      fontFace: 'Arial',
      bold: true,
      align: 'center',
      valign: 'middle',
      fill: { color: NAVY },
      shape: pptx.ShapeType.roundRect,
      rectRadius: 0.08,
    })

    // Title
    const slideTitle = lang === 'fr' ? slide.titleFr : slide.titleEn
    s.addText(slideTitle, {
      x: 1.3,
      y: 0.35,
      w: '75%',
      fontSize: 24,
      color: NAVY,
      fontFace: 'Arial',
      bold: true,
    })

    // Description / placeholder
    const desc = lang === 'fr' ? slide.descriptionFr : slide.descriptionEn
    s.addText(desc, {
      x: 0.8,
      y: 1.4,
      w: '85%',
      h: 3.5,
      fontSize: 16,
      color: GRAY,
      fontFace: 'Arial',
      valign: 'top',
      paraSpaceAfter: 8,
    })

    // Placeholder box
    s.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.3,
      w: 11.4,
      h: 3.7,
      fill: { color: LIGHT_BG },
      line: { color: 'E2E8F0', width: 1, dashType: 'dash' },
      rectRadius: 0.1,
    })

    // Re-add text on top of box
    s.addText(
      [
        {
          text: desc,
          options: { fontSize: 16, color: GRAY, fontFace: 'Arial' },
        },
        {
          text:
            lang === 'fr'
              ? '\n\n[ Votre contenu ici ]'
              : '\n\n[ Your content here ]',
          options: { fontSize: 14, color: 'A0AEC0', fontFace: 'Arial', italic: true },
        },
      ],
      {
        x: 1.2,
        y: 1.6,
        w: 10.6,
        h: 3.2,
        valign: 'top',
      }
    )

    // Footer
    s.addText(`DeckReview AI — ${title}`, {
      x: 0.5,
      y: 6.9,
      w: '50%',
      fontSize: 8,
      color: 'A0AEC0',
      fontFace: 'Arial',
    })

    s.addText(`${slide.number} / ${template.totalSlides}`, {
      x: '80%',
      y: 6.9,
      w: '15%',
      fontSize: 8,
      color: 'A0AEC0',
      fontFace: 'Arial',
      align: 'right',
    })

    // Speaker notes with tip
    const tip = lang === 'fr' ? slide.tipFr : slide.tipEn
    s.addNotes(
      `${slideTitle}\n\n${desc}\n\n💡 ${lang === 'fr' ? 'Conseil' : 'Tip'}: ${tip}`
    )
  }

  return pptx
}

export async function downloadPptx(template: PresentationTemplate, lang: 'fr' | 'en') {
  const meetingType = MEETING_TYPES.find((m) => m.id === template.meetingType)
  const label = meetingType
    ? lang === 'fr'
      ? meetingType.labelFr
      : meetingType.labelEn
    : template.meetingType

  const pptx = generatePptx(template, lang)
  const fileName = `Template_${label.replace(/\s+/g, '_')}.pptx`
  await pptx.writeFile({ fileName })
}
