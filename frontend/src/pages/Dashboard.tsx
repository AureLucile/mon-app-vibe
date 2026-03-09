import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  FileText,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Upload,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ScoreBadge } from '@/components/ui/Badge'
import { ScoreCircle } from '@/components/ui/ScoreCircle'
import { mockSubmissions, scoreHistory } from '@/lib/mock-data'
import { MEETING_TYPES } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export function Dashboard() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const avgScore =
    mockSubmissions.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) /
    mockSubmissions.length

  const stats = [
    {
      label: t('dashboard.totalSubmissions'),
      value: mockSubmissions.length,
      icon: FileText,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: t('dashboard.avgScore'),
      value: avgScore.toFixed(1) + '/5',
      icon: BarChart3,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: t('dashboard.improvement'),
      value: '+0.9',
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: t('dashboard.resubmissions'),
      value: '1',
      icon: RefreshCw,
      color: 'text-amber-600 bg-amber-50',
    },
  ]

  const getMeetingLabel = (id: string) => {
    const mt = MEETING_TYPES.find((m) => m.id === id)
    return mt ? (lang === 'fr' ? mt.labelFr : mt.labelEn) : id
  }

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1E2761]">{t('dashboard.welcome')}</h1>
        <p className="text-gray-500 mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1E2761]">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Score Evolution Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <h2 className="font-semibold text-[#1E2761]">{t('dashboard.scoreEvolution')}</h2>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Submit */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-[#1E2761]">{t('dashboard.quickSubmit')}</h2>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-52 gap-4">
            <ScoreCircle score={avgScore} size="md" />
            <Link to="/submit">
              <Button size="lg">
                <Upload size={18} />
                {t('nav.submit')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-semibold text-[#1E2761]">{t('dashboard.recentSubmissions')}</h2>
          <Link to="/history">
            <Button variant="ghost" size="sm">
              {t('common.view')}
              <ArrowRight size={14} />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                <th className="px-6 py-3 font-medium">{t('common.file')}</th>
                <th className="px-6 py-3 font-medium">{t('common.type')}</th>
                <th className="px-6 py-3 font-medium">{t('common.score')}</th>
                <th className="px-6 py-3 font-medium">{t('common.date')}</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {mockSubmissions.slice(0, 5).map((sub) => (
                <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-3 text-sm font-medium text-[#1E2761]">
                    {sub.fileName}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {getMeetingLabel(sub.meetingType)}
                  </td>
                  <td className="px-6 py-3">
                    {sub.overallScore && <ScoreBadge score={sub.overallScore} />}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {formatDate(sub.createdAt, lang)}
                  </td>
                  <td className="px-6 py-3">
                    <Link to={`/results/${sub.id}`}>
                      <Button variant="ghost" size="sm">
                        {t('common.view')}
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
