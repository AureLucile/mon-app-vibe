import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getScoreColor(score: number): string {
  if (score >= 3.5) return 'text-emerald-600'
  if (score >= 2.5) return 'text-amber-500'
  return 'text-red-600'
}

export function getScoreBgColor(score: number): string {
  if (score >= 3.5) return 'bg-emerald-50 border-emerald-200'
  if (score >= 2.5) return 'bg-amber-50 border-amber-200'
  return 'bg-red-50 border-red-200'
}

export function getScoreLabel(score: number, lang: string = 'fr'): string {
  if (lang === 'fr') {
    if (score >= 4.5) return 'Excellent'
    if (score >= 3.5) return 'Bon'
    if (score >= 2.5) return 'Perfectible'
    return 'À retravailler'
  }
  if (score >= 4.5) return 'Excellent'
  if (score >= 3.5) return 'Good'
  if (score >= 2.5) return 'Room for improvement'
  return 'Needs rework'
}

export function formatDate(date: string, lang: string = 'fr'): string {
  return new Date(date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
