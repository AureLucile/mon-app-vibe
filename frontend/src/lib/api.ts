import type { CoachReport, MeetingType, AudienceType } from './types'

const API_BASE = '/api'

export interface AnalysisResult {
  report: CoachReport
  downloadId: string | null
}

export async function analyzePresentation(
  file: File,
  meetingType: MeetingType,
  audience: AudienceType | null,
  lang: string
): Promise<AnalysisResult> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('meetingType', meetingType)
  formData.append('lang', lang)
  if (audience) {
    formData.append('audience', audience)
  }

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Server error' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export function getDownloadUrl(downloadId: string): string {
  return `${API_BASE}/download/${downloadId}`
}
