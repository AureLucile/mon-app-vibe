import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getScoreColor(score: number): string {
  if (score >= 3.5) return 'text-[#00A15F]'
  if (score >= 2.5) return 'text-[#E4751F]'
  return 'text-[#E2001A]'
}

export function getScoreBgColor(score: number): string {
  if (score >= 3.5) return 'bg-[#00A15F]/10 border-[#00A15F]/20'
  if (score >= 2.5) return 'bg-[#E4751F]/10 border-[#E4751F]/20'
  return 'bg-[#E2001A]/10 border-[#E2001A]/20'
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
