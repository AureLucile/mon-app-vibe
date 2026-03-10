import { describe, it, expect } from 'vitest'
import { TEMPLATES } from '../templates'
import type { MeetingType } from '../types'

const VALID_MEETING_TYPES: MeetingType[] = [
  'comite-direction',
  'kick-off',
  'revue-projet',
  'commercial',
  'formation',
  'autre',
]

// Test 7: TEMPLATES couvre les 6 types de reunion
describe('TEMPLATES — couverture des types de reunion', () => {
  it('contient exactement 6 templates', () => {
    expect(TEMPLATES).toHaveLength(6)
  })

  it('chaque template correspond a un MeetingType valide', () => {
    const types = TEMPLATES.map((t) => t.meetingType)
    for (const type of VALID_MEETING_TYPES) {
      expect(types).toContain(type)
    }
  })

  it('chaque template a un nombre de slides correspondant a totalSlides', () => {
    for (const template of TEMPLATES) {
      expect(template.slides).toHaveLength(template.totalSlides)
    }
  })
})

// Test 8: chaque slide a des champs FR et EN remplis
describe('TEMPLATES — completude des traductions', () => {
  it('chaque slide a titleFr et titleEn non-vides', () => {
    for (const template of TEMPLATES) {
      for (const slide of template.slides) {
        expect(slide.titleFr.trim()).not.toBe('')
        expect(slide.titleEn.trim()).not.toBe('')
      }
    }
  })

  it('chaque slide a descriptionFr et descriptionEn non-vides', () => {
    for (const template of TEMPLATES) {
      for (const slide of template.slides) {
        expect(slide.descriptionFr.trim()).not.toBe('')
        expect(slide.descriptionEn.trim()).not.toBe('')
      }
    }
  })

  it('chaque slide a tipFr et tipEn non-vides', () => {
    for (const template of TEMPLATES) {
      for (const slide of template.slides) {
        expect(slide.tipFr.trim()).not.toBe('')
        expect(slide.tipEn.trim()).not.toBe('')
      }
    }
  })

  it('les slides sont numerotees sequentiellement a partir de 1', () => {
    for (const template of TEMPLATES) {
      template.slides.forEach((slide, index) => {
        expect(slide.number).toBe(index + 1)
      })
    }
  })
})
