import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Download,
  Eye,
  List,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SlidePreview } from '@/components/SlidePreview'
import { MEETING_TYPES } from '@/lib/types'
import { TEMPLATES, type PresentationTemplate } from '@/lib/templates'
import { downloadPptx } from '@/lib/pptx-generator'
import { cn } from '@/lib/utils'

type ViewMode = 'list' | 'slides'

function TemplateCard({ template }: { template: PresentationTemplate }) {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'fr' | 'en'
  const [expanded, setExpanded] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('slides')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [downloading, setDownloading] = useState(false)

  const meetingType = MEETING_TYPES.find((m) => m.id === template.meetingType)
  if (!meetingType) return null

  const label = lang === 'fr' ? meetingType.labelFr : meetingType.labelEn
  const description = lang === 'fr' ? meetingType.descriptionFr : meetingType.descriptionEn
  const duration = lang === 'fr' ? template.durationMinFr : template.durationMinEn

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setDownloading(true)
    try {
      await downloadPptx(template, lang)
    } finally {
      setDownloading(false)
    }
  }

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
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('slides')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer',
                  viewMode === 'slides'
                    ? 'bg-white text-[#1E2761] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Eye size={13} />
                {lang === 'fr' ? 'Aperçu' : 'Preview'}
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer',
                  viewMode === 'list'
                    ? 'bg-white text-[#1E2761] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <List size={13} />
                {lang === 'fr' ? 'Liste' : 'List'}
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
            >
              <Download size={14} />
              {downloading
                ? lang === 'fr' ? 'Génération...' : 'Generating...'
                : lang === 'fr' ? 'Télécharger .pptx' : 'Download .pptx'}
            </Button>
          </div>

          {/* Slides preview mode */}
          {viewMode === 'slides' && (
            <div>
              {/* Slide grid (3 columns) */}
              <div className="grid grid-cols-3 gap-4">
                {template.slides.map((slide, index) => (
                  <div
                    key={slide.number}
                    className={cn(
                      'cursor-pointer rounded-lg transition-all',
                      currentSlide === index
                        ? 'ring-2 ring-[#3B82F6] ring-offset-2'
                        : 'hover:ring-1 hover:ring-gray-300 hover:ring-offset-1'
                    )}
                    onClick={() => setCurrentSlide(index)}
                  >
                    <SlidePreview
                      slide={slide}
                      totalSlides={template.totalSlides}
                      meetingLabel={label}
                    />
                  </div>
                ))}
              </div>

              {/* Large preview of selected slide */}
              <div className="mt-6 border-t border-gray-100 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-[#1E2761]">
                    Slide {currentSlide + 1} / {template.totalSlides}
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                      disabled={currentSlide === 0}
                      className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 cursor-pointer disabled:cursor-default"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setCurrentSlide(Math.min(template.slides.length - 1, currentSlide + 1))}
                      disabled={currentSlide === template.slides.length - 1}
                      className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 cursor-pointer disabled:cursor-default"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                <div className="max-w-2xl mx-auto">
                  <SlidePreview
                    slide={template.slides[currentSlide]}
                    totalSlides={template.totalSlides}
                    meetingLabel={label}
                  />
                </div>
              </div>
            </div>
          )}

          {/* List mode */}
          {viewMode === 'list' && (
            <div className="space-y-2">
              {template.slides.map((slide) => (
                <div
                  key={slide.number}
                  className="flex gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-[#1E2761] text-white flex items-center justify-center font-bold text-sm">
                    {slide.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#1E2761] text-sm">
                      {lang === 'fr' ? slide.titleFr : slide.titleEn}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {lang === 'fr' ? slide.descriptionFr : slide.descriptionEn}
                    </p>
                    <div className="flex items-start gap-1.5 mt-2">
                      <Grid3X3 size={12} className="text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-amber-700 italic">
                        {lang === 'fr' ? slide.tipFr : slide.tipEn}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

export function Templates() {
  const { t } = useTranslation()

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E2761]">{t('templates.title')}</h1>
        <p className="text-gray-500 mt-1">{t('templates.subtitle')}</p>
      </div>

      <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
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
