import { describe, it, expect } from 'vitest'
import { formatPence, formatRefundRow } from './refund-formatter'

describe('formatPence', () => {
  it('converts pence to GBP with 2 decimal places', () => {
    expect(formatPence(1000)).toBe('£10.00')
    expect(formatPence(1200)).toBe('£12.00')
    expect(formatPence(100)).toBe('£1.00')
  })

  it('handles odd pence amounts', () => {
    expect(formatPence(1050)).toBe('£10.50')
    expect(formatPence(1005)).toBe('£10.05')
  })

  it('handles zero', () => {
    expect(formatPence(0)).toBe('£0.00')
  })
})

describe('formatRefundRow', () => {
  it('creates a refund row with all required fields', () => {
    const row = formatRefundRow(
      '2026-01-15T10:30:00Z',
      'Jane Smith',
      'jane@example.com',
      'Alice Smith',
      1200,
      1200,
      'Session cancelled',
      'Admin User',
    )

    expect(row.date).toBe('2026-01-15T10:30:00Z')
    expect(row.parentName).toBe('Jane Smith')
    expect(row.parentEmail).toBe('jane@example.com')
    expect(row.childName).toBe('Alice Smith')
    expect(row.originalAmountPence).toBe(1200)
    expect(row.refundAmountPence).toBe(1200)
    expect(row.reason).toBe('Session cancelled')
    expect(row.processedBy).toBe('Admin User')
  })

  it('preserves refund amounts even if different from original', () => {
    const row = formatRefundRow(
      '2026-01-15T10:30:00Z',
      'John Doe',
      'john@example.com',
      'Bob Doe',
      1200,
      600,
      'Partial refund',
      'Manager',
    )

    expect(row.originalAmountPence).toBe(1200)
    expect(row.refundAmountPence).toBe(600)
  })

  it('handles special characters in names and emails', () => {
    const row = formatRefundRow(
      '2026-01-15T10:30:00Z',
      "O'Connor-Smith",
      'test+tag@example.com',
      "Michael's Child",
      1000,
      1000,
      "Can't attend",
      'Admin',
    )

    expect(row.parentName).toBe("O'Connor-Smith")
    expect(row.parentEmail).toBe('test+tag@example.com')
    expect(row.childName).toBe("Michael's Child")
    expect(row.reason).toBe("Can't attend")
  })
})
