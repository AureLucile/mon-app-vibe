import { useTranslation } from 'react-i18next'
import { Lightbulb } from 'lucide-react'
import type { SlideTemplate } from '@/lib/templates'

interface SlidePreviewProps {
  slide: SlideTemplate
  totalSlides: number
  meetingLabel: string
}

export function SlidePreview({ slide, totalSlides, meetingLabel }: SlidePreviewProps) {
  const { i18n } = useTranslation()
  const lang = i18n.language

  const title = lang === 'fr' ? slide.titleFr : slide.titleEn
  const description = lang === 'fr' ? slide.descriptionFr : slide.descriptionEn
  const tip = lang === 'fr' ? slide.tipFr : slide.tipEn

  return (
    <div className="space-y-2">
      {/* Slide visual (16:9 aspect ratio) */}
      <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
        style={{ aspectRatio: '16 / 9' }}
      >
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#009EE0]" />

        <div className="p-5 pt-5 h-full flex flex-col">
          {/* Slide number + title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="shrink-0 w-8 h-8 rounded-md bg-[#003B80] text-white flex items-center justify-center font-bold text-xs">
              {slide.number}
            </div>
            <h4 className="font-bold text-[#003B80] text-sm leading-tight">{title}</h4>
          </div>

          {/* Content placeholder */}
          <div className="flex-1 rounded-md border-2 border-dashed border-gray-200 bg-[#F5F7FA] p-4 flex flex-col justify-center">
            <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
            <p className="text-xs text-gray-300 italic mt-3">
              {lang === 'fr' ? '[ Votre contenu ici ]' : '[ Your content here ]'}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 text-[10px] text-gray-300">
            <span>DeckReview AI — {meetingLabel}</span>
            <span>{slide.number} / {totalSlides}</span>
          </div>
        </div>
      </div>

      {/* Coaching tip below slide */}
      <div className="flex items-start gap-1.5 px-1">
        <Lightbulb size={12} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700">{tip}</p>
      </div>
    </div>
  )
}
