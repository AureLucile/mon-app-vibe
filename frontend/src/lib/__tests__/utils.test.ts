import { describe, it, expect } from 'vitest'
import { getScoreColor, getScoreBgColor, getScoreLabel, formatDate } from '../utils'

// Test 1: getScoreColor retourne la bonne couleur selon les seuils
describe('getScoreColor', () => {
  it('retourne vert pour score >= 3.5', () => {
    expect(getScoreColor(5)).toBe('text-[#00A15F]')
    expect(getScoreColor(4)).toBe('text-[#00A15F]')
    expect(getScoreColor(3.5)).toBe('text-[#00A15F]')
  })

  it('retourne orange pour score >= 2.5 et < 3.5', () => {
    expect(getScoreColor(3.49)).toBe('text-[#E4751F]')
    expect(getScoreColor(3)).toBe('text-[#E4751F]')
    expect(getScoreColor(2.5)).toBe('text-[#E4751F]')
  })

  it('retourne rouge pour score < 2.5', () => {
    expect(getScoreColor(2.49)).toBe('text-[#E2001A]')
    expect(getScoreColor(1)).toBe('text-[#E2001A]')
    expect(getScoreColor(0)).toBe('text-[#E2001A]')
  })
})

// Test 2: getScoreBgColor retourne le bon fond selon les seuils
describe('getScoreBgColor', () => {
  it('retourne fond vert pour score >= 3.5', () => {
    expect(getScoreBgColor(4)).toBe('bg-[#00A15F]/10 border-[#00A15F]/20')
    expect(getScoreBgColor(3.5)).toBe('bg-[#00A15F]/10 border-[#00A15F]/20')
  })

  it('retourne fond orange pour score >= 2.5 et < 3.5', () => {
    expect(getScoreBgColor(3)).toBe('bg-[#E4751F]/10 border-[#E4751F]/20')
    expect(getScoreBgColor(2.5)).toBe('bg-[#E4751F]/10 border-[#E4751F]/20')
  })

  it('retourne fond rouge pour score < 2.5', () => {
    expect(getScoreBgColor(2)).toBe('bg-[#E2001A]/10 border-[#E2001A]/20')
    expect(getScoreBgColor(0)).toBe('bg-[#E2001A]/10 border-[#E2001A]/20')
  })
})

// Test 3: getScoreLabel retourne le bon label FR et EN
describe('getScoreLabel', () => {
  it('retourne les labels corrects en francais', () => {
    expect(getScoreLabel(5, 'fr')).toBe('Excellent')
    expect(getScoreLabel(4.5, 'fr')).toBe('Excellent')
    expect(getScoreLabel(4, 'fr')).toBe('Bon')
    expect(getScoreLabel(3.5, 'fr')).toBe('Bon')
    expect(getScoreLabel(3, 'fr')).toBe('Perfectible')
    expect(getScoreLabel(2.5, 'fr')).toBe('Perfectible')
    expect(getScoreLabel(2, 'fr')).toBe('À retravailler')
    expect(getScoreLabel(0, 'fr')).toBe('À retravailler')
  })

  it('retourne les labels corrects en anglais', () => {
    expect(getScoreLabel(5, 'en')).toBe('Excellent')
    expect(getScoreLabel(4.5, 'en')).toBe('Excellent')
    expect(getScoreLabel(4, 'en')).toBe('Good')
    expect(getScoreLabel(3.5, 'en')).toBe('Good')
    expect(getScoreLabel(3, 'en')).toBe('Room for improvement')
    expect(getScoreLabel(2.5, 'en')).toBe('Room for improvement')
    expect(getScoreLabel(2, 'en')).toBe('Needs rework')
  })

  it('utilise le francais par defaut', () => {
    expect(getScoreLabel(4)).toBe('Bon')
  })
})

// Test 4: formatDate formate correctement en FR et EN
describe('formatDate', () => {
  it('formate une date en francais', () => {
    const result = formatDate('2026-03-10', 'fr')
    expect(result).toBe('10 mars 2026')
  })

  it('formate une date en anglais', () => {
    const result = formatDate('2026-03-10', 'en')
    expect(result).toBe('10 March 2026')
  })

  it('utilise le francais par defaut', () => {
    const result = formatDate('2026-01-15')
    expect(result).toBe('15 janvier 2026')
  })
})
