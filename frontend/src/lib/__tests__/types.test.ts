import { describe, it, expect } from 'vitest'
import { MEETING_TYPES } from '../types'

// Test 9: MEETING_TYPES contient les 6 types avec labels et icones
describe('MEETING_TYPES — structure et completude', () => {
  it('contient exactement 6 types de reunion', () => {
    expect(MEETING_TYPES).toHaveLength(6)
  })

  it('chaque type a un id unique', () => {
    const ids = MEETING_TYPES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('chaque type a tous les champs requis non-vides', () => {
    for (const type of MEETING_TYPES) {
      expect(type.id).toBeTruthy()
      expect(type.labelFr.trim()).not.toBe('')
      expect(type.labelEn.trim()).not.toBe('')
      expect(type.descriptionFr.trim()).not.toBe('')
      expect(type.descriptionEn.trim()).not.toBe('')
      expect(type.icon.trim()).not.toBe('')
    }
  })

  it('contient les 6 types attendus', () => {
    const ids = MEETING_TYPES.map((t) => t.id)
    expect(ids).toContain('comite-direction')
    expect(ids).toContain('kick-off')
    expect(ids).toContain('revue-projet')
    expect(ids).toContain('commercial')
    expect(ids).toContain('formation')
    expect(ids).toContain('autre')
  })
})
