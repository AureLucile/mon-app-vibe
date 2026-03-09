import type { Submission, CoachReport } from './types'

export const mockReport: CoachReport = {
  id: 'r-001',
  submissionId: 's-001',
  meetingType: 'comite-direction',
  overallScore: 3.7,
  criteriaScores: [
    {
      name: 'Clarté de la demande de décision',
      score: 4.0,
      weight: 30,
      rationale:
        "L'objectif est clairement posé dès la slide 2 avec deux options présentées. Toutefois, les impacts financiers de chaque option pourraient être mieux quantifiés pour faciliter la prise de décision.",
      slidesReferenced: ['Slide 2', 'Slide 3'],
    },
    {
      name: 'Argumentation et données',
      score: 3.5,
      weight: 25,
      rationale:
        "Les arguments sont solides et étayés par des données de marché pertinentes. La distinction entre faits et analyses est claire. Cependant, certaines sources mériteraient d'être citées explicitement.",
      slidesReferenced: ['Slide 4', 'Slide 5', 'Slide 6'],
    },
    {
      name: 'Synthèse et concision',
      score: 3.0,
      weight: 20,
      rationale:
        "La présentation compte 18 slides, ce qui est un peu long pour un comité de direction. L'executive summary est présent mais pourrait être plus percutant. Certaines slides pourraient être fusionnées.",
      slidesReferenced: ['Slide 1', 'Slide 12-15'],
    },
    {
      name: 'Prochaines étapes',
      score: 4.5,
      weight: 15,
      rationale:
        'Excellent ! Les next steps sont clairement définis avec des responsables nommés, des délais précis et des critères de succès mesurables.',
      slidesReferenced: ['Slide 17', 'Slide 18'],
    },
    {
      name: 'Qualité formelle',
      score: 3.5,
      weight: 10,
      rationale:
        'Bonne cohérence visuelle globale. Quelques coquilles détectées sur les slides 7 et 11. La taille de police sur les graphiques pourrait être augmentée pour une meilleure lisibilité.',
      slidesReferenced: ['Slide 7', 'Slide 11'],
    },
  ],
  strengths: [
    "L'objectif de la réunion est posé clairement dès le début, ce qui permet au comité de se concentrer sur les décisions attendues.",
    'Les prochaines étapes sont exemplaires : responsables identifiés, délais réalistes et indicateurs de suivi définis.',
    "L'utilisation de données de marché récentes renforce significativement la crédibilité de l'argumentation.",
  ],
  improvements: [
    "Réduire le nombre de slides de 18 à 12-14 en fusionnant les slides de contexte (12-15) pour gagner en concision et maintenir l'attention du comité.",
    'Ajouter les impacts financiers chiffrés pour chaque option de décision afin de faciliter le choix du comité.',
    "Citer explicitement les sources des données présentées pour renforcer la transparence de l'analyse.",
  ],
  suggestions: [
    {
      type: 'reformulation',
      slideRef: 'Slide 2',
      before: 'Nous avons plusieurs options à considérer pour ce projet.',
      after:
        'Deux options se présentent pour ce projet : [Option A — impact estimé X€] et [Option B — impact estimé Y€]. Notre recommandation est l\'Option A car...',
      description:
        'Reformulez la demande de décision pour inclure les impacts chiffrés directement.',
    },
    {
      type: 'reorganize',
      slideRef: 'Slides 12-15',
      description:
        "Fusionnez les 4 slides de contexte marché en 2 slides synthétiques. Le comité de direction préfère une vue d'ensemble à un détail exhaustif.",
    },
    {
      type: 'add-slide',
      description:
        "Ajoutez une slide de synthèse comparative (tableau) présentant les deux options côte à côte avec les critères clés : coût, délai, risque, ROI estimé.",
    },
  ],
  encouragement:
    "Votre présentation montre une réelle maîtrise du sujet et une bonne compréhension des attentes du comité. Les prochaines étapes sont particulièrement bien structurées — c'est un point fort à conserver ! En travaillant sur la concision et le chiffrage des options, votre présentation sera parfaitement calibrée pour une prise de décision rapide et éclairée.",
  language: 'fr',
  createdAt: '2026-03-09T14:30:00Z',
}

export const mockSubmissions: Submission[] = [
  {
    id: 's-001',
    fileName: 'Stratégie_Digitale_2026_v2.pptx',
    meetingType: 'comite-direction',
    audience: 'direction',
    status: 'completed',
    overallScore: 3.7,
    report: mockReport,
    createdAt: '2026-03-09T14:30:00Z',
  },
  {
    id: 's-002',
    fileName: 'Kickoff_Projet_Phoenix.pptx',
    meetingType: 'kick-off',
    audience: 'mixte',
    status: 'completed',
    overallScore: 4.2,
    createdAt: '2026-03-07T10:15:00Z',
  },
  {
    id: 's-003',
    fileName: 'Revue_Sprint_14.pptx',
    meetingType: 'revue-projet',
    audience: 'technique',
    status: 'completed',
    overallScore: 2.8,
    createdAt: '2026-03-05T09:00:00Z',
  },
  {
    id: 's-004',
    fileName: 'Proposition_ClientX.pptx',
    meetingType: 'commercial',
    audience: 'clients-internes',
    status: 'completed',
    overallScore: 4.5,
    createdAt: '2026-03-03T16:45:00Z',
  },
  {
    id: 's-005',
    fileName: 'Onboarding_Nouveaux.pptx',
    meetingType: 'formation',
    status: 'completed',
    overallScore: 3.1,
    createdAt: '2026-02-28T11:30:00Z',
  },
  {
    id: 's-006',
    fileName: 'Stratégie_Digitale_2026_v1.pptx',
    meetingType: 'comite-direction',
    audience: 'direction',
    status: 'completed',
    overallScore: 3.0,
    createdAt: '2026-02-25T14:00:00Z',
  },
]

export const scoreHistory = [
  { date: '2026-01', score: 2.8 },
  { date: '2026-02', score: 3.1 },
  { date: '2026-03', score: 3.7 },
]
