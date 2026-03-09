export type MeetingType =
  | 'comite-direction'
  | 'kick-off'
  | 'revue-projet'
  | 'commercial'
  | 'formation'
  | 'autre'

export type AudienceType =
  | 'direction'
  | 'technique'
  | 'clients-internes'
  | 'mixte'

export interface CriterionScore {
  name: string
  score: number
  weight: number
  rationale: string
  slidesReferenced: string[]
}

export interface CoachReport {
  id: string
  submissionId: string
  meetingType: MeetingType
  overallScore: number
  criteriaScores: CriterionScore[]
  strengths: string[]
  improvements: string[]
  suggestions: Suggestion[]
  encouragement: string
  language: 'fr' | 'en'
  createdAt: string
}

export interface Suggestion {
  type: 'reformulation' | 'add-slide' | 'remove-slide' | 'reorganize'
  slideRef?: string
  before?: string
  after?: string
  description: string
}

export interface Submission {
  id: string
  fileName: string
  meetingType: MeetingType
  audience?: AudienceType
  status: 'uploading' | 'analyzing' | 'completed' | 'error'
  overallScore?: number
  report?: CoachReport
  createdAt: string
}

export interface MeetingTypeInfo {
  id: MeetingType
  labelFr: string
  labelEn: string
  descriptionFr: string
  descriptionEn: string
  icon: string
}

export const MEETING_TYPES: MeetingTypeInfo[] = [
  {
    id: 'comite-direction',
    labelFr: 'Comité de Direction',
    labelEn: 'Board Committee',
    descriptionFr: 'Prise de décision stratégique au niveau C-Level',
    descriptionEn: 'Strategic decision-making at C-Level',
    icon: 'crown',
  },
  {
    id: 'kick-off',
    labelFr: 'Kick-off Projet',
    labelEn: 'Project Kick-off',
    descriptionFr: 'Alignement initial avec l\'équipe et les sponsors',
    descriptionEn: 'Initial alignment with team and sponsors',
    icon: 'rocket',
  },
  {
    id: 'revue-projet',
    labelFr: 'Revue de Projet',
    labelEn: 'Project Review',
    descriptionFr: 'Suivi d\'avancement et escalades',
    descriptionEn: 'Progress tracking and escalations',
    icon: 'clipboard-check',
  },
  {
    id: 'commercial',
    labelFr: 'Réunion Commerciale',
    labelEn: 'Sales Meeting',
    descriptionFr: 'Convaincre et structurer l\'approche client',
    descriptionEn: 'Convince and structure client approach',
    icon: 'handshake',
  },
  {
    id: 'formation',
    labelFr: 'Formation',
    labelEn: 'Training',
    descriptionFr: 'Transmettre un savoir de manière claire',
    descriptionEn: 'Transmit knowledge clearly',
    icon: 'graduation-cap',
  },
  {
    id: 'autre',
    labelFr: 'Autre',
    labelEn: 'Other',
    descriptionFr: 'Grille d\'évaluation générique',
    descriptionEn: 'Generic evaluation grid',
    icon: 'file-text',
  },
]
