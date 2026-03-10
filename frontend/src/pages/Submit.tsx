import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Upload, AlertTriangle, FileText, X, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MEETING_TYPES, type MeetingType, type AudienceType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { analyzePresentation } from '@/lib/api'

const AUDIENCES: { id: AudienceType; labelKey: string }[] = [
  { id: 'direction', labelKey: 'audience.direction' },
  { id: 'technique', labelKey: 'audience.technique' },
  { id: 'clients-internes', labelKey: 'audience.clients-internes' },
  { id: 'mixte', labelKey: 'audience.mixte' },
]

export function Submit() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const lang = i18n.language
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [meetingType, setMeetingType] = useState<MeetingType | null>(null)
  const [audience, setAudience] = useState<AudienceType | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped?.name.endsWith('.pptx')) {
      setFile(dropped)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected?.name.endsWith('.pptx')) {
      setFile(selected)
    }
  }

  const handleSubmit = async () => {
    if (!file || !meetingType) return
    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await analyzePresentation(file, meetingType, audience, lang)
      navigate(`/results/${result.report.submissionId}`, {
        state: {
          report: result.report,
          downloadId: result.downloadId,
          fileName: file.name,
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setIsAnalyzing(false)
    }
  }

  if (isAnalyzing) {
    return (
      <div className="max-w-2xl mx-auto mt-20">
        <Card>
          <CardContent className="flex flex-col items-center py-16 gap-6">
            <div className="relative">
              <Loader2 size={48} className="text-[#009EE0] animate-spin" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-[#003B80]">
                {t('submit.analyzing')}
              </h2>
              <p className="text-gray-500 mt-2">{t('submit.analyzingDesc')}</p>
              <p className="text-sm text-gray-400 mt-4">{t('submit.estimatedTime')}</p>
            </div>
            <div className="w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#009EE0] rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[#003B80]">{t('submit.title')}</h1>

      {/* Warning */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-800">{t('submit.warning')}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle size={20} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* File Upload */}
      <Card>
        <CardContent className="py-6">
          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors',
                isDragging
                  ? 'border-[#009EE0] bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              )}
            >
              <Upload size={40} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-700 font-medium">{t('submit.dragDrop')}</p>
              <p className="text-gray-400 text-sm mt-2">{t('submit.or')}</p>
              <Button variant="secondary" size="sm" className="mt-3">
                {t('submit.browse')}
              </Button>
              <p className="text-xs text-gray-400 mt-3">{t('submit.maxSize')}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pptx"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-[#009EE0]" />
                <div>
                  <p className="text-sm font-medium text-[#003B80]">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(1)} Mo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-1 hover:bg-blue-100 rounded cursor-pointer"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meeting Type */}
      <Card>
        <CardContent className="py-6">
          <label className="block text-sm font-semibold text-[#003B80] mb-3">
            {t('submit.meetingType')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {MEETING_TYPES.map((mt) => (
              <button
                key={mt.id}
                onClick={() => setMeetingType(mt.id)}
                className={cn(
                  'p-4 rounded-lg border-2 text-left transition-colors cursor-pointer',
                  meetingType === mt.id
                    ? 'border-[#009EE0] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <p className="font-medium text-sm text-[#003B80]">
                  {lang === 'fr' ? mt.labelFr : mt.labelEn}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === 'fr' ? mt.descriptionFr : mt.descriptionEn}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audience */}
      <Card>
        <CardContent className="py-6">
          <label className="block text-sm font-semibold text-[#003B80] mb-3">
            {t('submit.audience')}
          </label>
          <div className="flex gap-3">
            {AUDIENCES.map((a) => (
              <button
                key={a.id}
                onClick={() => setAudience(audience === a.id ? null : a.id)}
                className={cn(
                  'px-4 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer',
                  audience === a.id
                    ? 'border-[#009EE0] bg-blue-50 text-[#009EE0]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                )}
              >
                {t(a.labelKey)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        size="lg"
        className="w-full"
        disabled={!file || !meetingType}
        onClick={handleSubmit}
      >
        <Upload size={18} />
        {t('submit.analyze')}
      </Button>
    </div>
  )
}
