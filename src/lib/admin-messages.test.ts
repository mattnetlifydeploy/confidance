import { describe, it, expect } from 'vitest'
import { buildInitialDeliveryStatus, mergeDeliveryStatus } from './admin-messages'

describe('admin-messages', () => {
  describe('buildInitialDeliveryStatus', () => {
    it('returns an empty object', () => {
      const result = buildInitialDeliveryStatus()
      expect(result).toEqual({})
    })
  })

  describe('mergeDeliveryStatus', () => {
    it('adds a single event type with timestamp', () => {
      const current = {}
      const result = mergeDeliveryStatus(current, 'delivered', '2025-06-29T10:00:00Z')
      expect(result).toEqual({ delivered: '2025-06-29T10:00:00Z' })
    })

    it('preserves existing event types when adding a new one', () => {
      const current = { delivered: '2025-06-29T10:00:00Z' }
      const result = mergeDeliveryStatus(current, 'bounced', '2025-06-29T10:05:00Z')
      expect(result).toEqual({
        delivered: '2025-06-29T10:00:00Z',
        bounced: '2025-06-29T10:05:00Z',
      })
    })

    it('overwrites an existing event type with a new timestamp', () => {
      const current = { delivered: '2025-06-29T10:00:00Z' }
      const result = mergeDeliveryStatus(current, 'delivered', '2025-06-29T10:05:00Z')
      expect(result).toEqual({ delivered: '2025-06-29T10:05:00Z' })
    })

    it('handles complained event type', () => {
      const current = {}
      const result = mergeDeliveryStatus(current, 'complained', '2025-06-29T10:00:00Z')
      expect(result).toEqual({ complained: '2025-06-29T10:00:00Z' })
    })

    it('handles unknown event types', () => {
      const current = {}
      const result = mergeDeliveryStatus(current, 'unknown_type', '2025-06-29T10:00:00Z')
      expect(result).toEqual({ unknown_type: '2025-06-29T10:00:00Z' })
    })

    it('handles multiple events in sequence', () => {
      let status = buildInitialDeliveryStatus()
      status = mergeDeliveryStatus(status, 'sent', '2025-06-29T10:00:00Z')
      status = mergeDeliveryStatus(status, 'delivered', '2025-06-29T10:01:00Z')
      status = mergeDeliveryStatus(status, 'bounced', '2025-06-29T10:02:00Z')
      expect(status).toEqual({
        sent: '2025-06-29T10:00:00Z',
        delivered: '2025-06-29T10:01:00Z',
        bounced: '2025-06-29T10:02:00Z',
      })
    })
  })
})
