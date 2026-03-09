import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { MEETING_TYPES } from '@/lib/types'

const criteriaByType: Record<string, { name: string; weight: number }[]> = {
  'comite-direction': [
    { name: 'Clarté de la demande de décision', weight: 30 },
    { name: 'Argumentation et données', weight: 25 },
    { name: 'Synthèse et concision', weight: 20 },
    { name: 'Prochaines étapes', weight: 15 },
    { name: 'Qualité formelle', weight: 10 },
  ],
  'kick-off': [
    { name: 'Contexte et objectifs du projet', weight: 25 },
    { name: 'Gouvernance et RACI', weight: 25 },
    { name: 'Planning et jalons', weight: 20 },
    { name: 'Risques et hypothèses', weight: 15 },
    { name: 'Règles de fonctionnement', weight: 15 },
  ],
  'revue-projet': [
    { name: 'Statut synthétique', weight: 25 },
    { name: 'Avancement vs. plan', weight: 20 },
    { name: 'Problèmes et escalades', weight: 25 },
    { name: 'Prochaines étapes', weight: 20 },
    { name: 'Qualité formelle', weight: 10 },
  ],
  commercial: [
    { name: 'Connaissance du prospect/client', weight: 20 },
    { name: 'Proposition de valeur', weight: 30 },
    { name: 'Storytelling et persuasion', weight: 20 },
    { name: 'Call to action', weight: 20 },
    { name: 'Qualité formelle', weight: 10 },
  ],
  formation: [
    { name: 'Objectifs pédagogiques', weight: 25 },
    { name: 'Progression logique', weight: 25 },
    { name: 'Clarté et accessibilité', weight: 20 },
    { name: 'Exercices et interactions', weight: 15 },
    { name: 'Récapitulatif et ressources', weight: 15 },
  ],
  autre: [
    { name: 'Clarté des objectifs', weight: 25 },
    { name: 'Structure et fluidité', weight: 25 },
    { name: 'Prochaines étapes', weight: 20 },
    { name: 'Pertinence du contenu', weight: 20 },
    { name: 'Qualité formelle', weight: 10 },
  ],
}

const avgScoresByType = [
  { type: 'Comité Dir.', score: 3.4 },
  { type: 'Kick-off', score: 4.1 },
  { type: 'Revue Projet', score: 2.9 },
  { type: 'Commercial', score: 4.3 },
  { type: 'Formation', score: 3.2 },
  { type: 'Autre', score: 3.5 },
]

export function Admin() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  return (
    <div className="max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold text-[#1E2761]">{t('admin.title')}</h1>

      {/* Analytics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-semibold text-[#1E2761]">{t('admin.avgByType')}</h2>
          <Badge variant="info">{t('admin.totalAnalyses')}: 127</Badge>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={avgScoresByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="type" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Grids */}
      <div>
        <h2 className="font-semibold text-[#1E2761] text-lg mb-4">{t('admin.grids')}</h2>
        <div className="grid grid-cols-2 gap-4">
          {MEETING_TYPES.map((mt) => (
            <Card key={mt.id}>
              <CardHeader>
                <h3 className="font-semibold text-[#1E2761]">
                  {lang === 'fr' ? mt.labelFr : mt.labelEn}
                </h3>
                <p className="text-sm text-gray-500">
                  {lang === 'fr' ? mt.descriptionFr : mt.descriptionEn}
                </p>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                      <th className="pb-2 font-medium">{t('admin.criteria')}</th>
                      <th className="pb-2 font-medium text-right">{t('results.weight')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criteriaByType[mt.id]?.map((c) => (
                      <tr key={c.name} className="border-b border-gray-50">
                        <td className="py-2 text-sm text-gray-700">{c.name}</td>
                        <td className="py-2 text-sm text-right font-medium text-[#1E2761]">
                          {c.weight}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
