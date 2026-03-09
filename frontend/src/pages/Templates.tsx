import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Lightbulb,
  Download,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MEETING_TYPES } from '@/lib/types'
import { TEMPLATES, type PresentationTemplate } from '@/lib/templates'
import { cn } from '@/lib/utils'

function TemplateCard({ template }: { template: PresentationTemplate }) {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const [expanded, setExpanded] = useState(false)

  const meetingType = MEETING_TYPES.find((m) => m.id === template.meetingType)
  if (!meetingType) return null

  const label = lang === 'fr' ? meetingType.labelFr : meetingType.labelEn
  const description = lang === 'fr' ? meetingType.descriptionFr : meetingType.descriptionEn
  const duration = lang === 'fr' ? template.durationMinFr : template.durationMinEn

  return (
    <Card>
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#1E2761] text-lg">{label}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Layers size={14} />
                {template.totalSlides} slides
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {duration}
              </span>
            </div>
            {expanded ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {template.slides.map((slide) => (
              <div
                key={slide.number}
                className="flex gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
              >
                {/* Slide number */}
                <div className="shrink-0 w-10 h-10 rounded-lg bg-[#1E2761] text-white flex items-center justify-center font-bold text-sm">
                  {slide.number}
                </div>

                {/* Slide content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#1E2761] text-sm">
                    {lang === 'fr' ? slide.titleFr : slide.titleEn}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {lang === 'fr' ? slide.descriptionFr : slide.descriptionEn}
                  </p>
                  <div className="flex items-start gap-1.5 mt-2">
                    <Lightbulb size={13} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 italic">
                      {lang === 'fr' ? slide.tipFr : slide.tipEn}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
            <Button variant="secondary" size="sm" disabled>
              <Download size={14} />
              {lang === 'fr' ? 'Télécharger le template .pptx' : 'Download .pptx template'}
              <Badge variant="info" className="ml-1">
                {lang === 'fr' ? 'Bientôt' : 'Soon'}
              </Badge>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

export function Templates() {
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E2761]">{t('templates.title')}</h1>
        <p className="text-gray-500 mt-1">{t('templates.subtitle')}</p>
      </div>

      <div className={cn(
        'p-4 rounded-lg border',
        'bg-blue-50 border-blue-200'
      )}>
        <p className="text-sm text-blue-800">
          {t('templates.hint')}
        </p>
      </div>

      <div className="space-y-4">
        {TEMPLATES.map((template) => (
          <TemplateCard key={template.meetingType} template={template} />
        ))}
      </div>
    </div>
  )
}
