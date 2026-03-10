import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ScoreBadge } from '@/components/ui/Badge'
import { mockSubmissions } from '@/lib/mock-data'
import { MEETING_TYPES } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Eye } from 'lucide-react'

export function History() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const getMeetingLabel = (id: string) => {
    const mt = MEETING_TYPES.find((m) => m.id === id)
    return mt ? (lang === 'fr' ? mt.labelFr : mt.labelEn) : id
  }

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold text-[#003B80]">{t('nav.history')}</h1>

      <Card>
        <CardHeader>
          <p className="text-sm text-gray-500">
            {mockSubmissions.length} {t('dashboard.totalSubmissions').toLowerCase()}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                <th className="px-6 py-3 font-medium">{t('common.file')}</th>
                <th className="px-6 py-3 font-medium">{t('common.type')}</th>
                <th className="px-6 py-3 font-medium">{t('common.score')}</th>
                <th className="px-6 py-3 font-medium">{t('common.date')}</th>
                <th className="px-6 py-3 font-medium">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {mockSubmissions.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-sm font-medium text-[#003B80]">
                    {sub.fileName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {getMeetingLabel(sub.meetingType)}
                  </td>
                  <td className="px-6 py-4">
                    {sub.overallScore !== undefined && <ScoreBadge score={sub.overallScore} />}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(sub.createdAt, lang)}
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/results/${sub.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye size={14} />
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
