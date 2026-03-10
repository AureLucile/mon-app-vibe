import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import {
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowLeft,
  RefreshCw,
  MessageSquare,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ScoreCircle } from '@/components/ui/ScoreCircle'
import { Progress } from '@/components/ui/Progress'
import { mockReport } from '@/lib/mock-data'
import { MEETING_TYPES } from '@/lib/types'
import { getScoreColor, getScoreLabel } from '@/lib/utils'

export function Results() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const report = mockReport

  const meetingLabel = MEETING_TYPES.find((m) => m.id === report.meetingType)
  const radarData = report.criteriaScores.map((c) => ({
    criterion: c.name.length > 25 ? c.name.substring(0, 25) + '...' : c.name,
    score: c.score,
    fullMark: 5,
  }))

  const suggestionIcons: Record<string, typeof Lightbulb> = {
    reformulation: MessageSquare,
    'add-slide': Lightbulb,
    'remove-slide': AlertCircle,
    reorganize: RefreshCw,
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={16} />
              {t('results.backToDashboard')}
            </Button>
          </Link>
        </div>
        <Link to="/submit">
          <Button variant="secondary">
            <RefreshCw size={16} />
            {t('results.resubmit')}
          </Button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-[#003B80]">{t('results.title')}</h1>

      {/* Overall Score + Radar */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardContent className="flex flex-col items-center py-8 gap-4">
            <ScoreCircle score={report.overallScore} size="lg" />
            <div className="text-center">
              <p className={`text-lg font-semibold ${getScoreColor(report.overallScore)}`}>
                {getScoreLabel(report.overallScore, lang)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {meetingLabel
                  ? lang === 'fr'
                    ? meetingLabel.labelFr
                    : meetingLabel.labelEn
                  : ''}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
                <Radar
                  dataKey="score"
                  stroke="#009EE0"
                  fill="#009EE0"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Criteria Breakdown */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[#003B80]">{t('results.criteriaBreakdown')}</h2>
        </CardHeader>
        <CardContent className="space-y-5">
          {report.criteriaScores.map((criterion) => (
            <div key={criterion.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm text-[#003B80]">
                    {criterion.name}
                  </span>
                  <Badge variant="info">{t('results.weight')}: {criterion.weight}%</Badge>
                </div>
                <span className={`font-bold text-lg ${getScoreColor(criterion.score)}`}>
                  {criterion.score.toFixed(1)}/5
                </span>
              </div>
              <Progress value={criterion.score} max={5} />
              <p className="text-sm text-gray-600 leading-relaxed">{criterion.rationale}</p>
              {criterion.slidesReferenced.length > 0 && (
                <p className="text-xs text-gray-400">
                  {t('results.slidesRef')}: {criterion.slidesReferenced.join(', ')}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <h2 className="font-semibold text-[#003B80]">{t('results.strengths')}</h2>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {report.strengths.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700">
                  <span className="text-emerald-500 mt-1 shrink-0">+</span>
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertCircle size={18} className="text-amber-500" />
            <h2 className="font-semibold text-[#003B80]">{t('results.improvements')}</h2>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {report.improvements.map((imp, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700">
                  <span className="text-amber-500 font-bold shrink-0">{i + 1}.</span>
                  {imp}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Lightbulb size={18} className="text-[#009EE0]" />
          <h2 className="font-semibold text-[#003B80]">{t('results.suggestions')}</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {report.suggestions.map((sug, i) => {
            const Icon = suggestionIcons[sug.type] ?? Lightbulb
            return (
              <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} className="text-[#009EE0]" />
                  <span className="text-sm font-semibold text-[#003B80]">
                    {t(`suggestion.${sug.type}`)}
                  </span>
                  {sug.slideRef && (
                    <Badge>{sug.slideRef}</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-700">{sug.description}</p>
                {sug.before && sug.after && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="p-3 bg-red-50 border border-red-100 rounded text-sm text-red-800">
                      <p className="text-xs font-medium text-red-500 mb-1">Avant</p>
                      {sug.before}
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded text-sm text-emerald-800">
                      <p className="text-xs font-medium text-emerald-500 mb-1">Après</p>
                      {sug.after}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Encouragement */}
      <Card className="border-[#009EE0]/20 bg-blue-50/50">
        <CardContent className="py-6">
          <p className="text-sm text-[#003B80] leading-relaxed italic">
            "{report.encouragement}"
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
