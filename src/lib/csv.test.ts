import { describe, it, expect } from 'vitest'
import { serializeCsv } from './csv'

describe('serializeCsv', () => {
  it('handles basic fields without special characters', () => {
    const headers = ['Name', 'Age', 'City']
    const rows = [
      ['Alice', '30', 'London'],
      ['Bob', '25', 'Manchester'],
    ]
    const csv = serializeCsv(headers, rows)
    expect(csv).toBe('Name,Age,City\r\nAlice,30,London\r\nBob,25,Manchester')
  })

  it('escapes fields containing commas', () => {
    const headers = ['Name', 'Address']
    const rows = [['Alice', 'London, UK']]
    const csv = serializeCsv(headers, rows)
    expect(csv).toBe('Name,Address\r\nAlice,"London, UK"')
  })

  it('escapes fields containing double-quotes', () => {
    const headers = ['Name', 'Quote']
    const rows = [['Alice', 'She said "hello"']]
    const csv = serializeCsv(headers, rows)
    expect(csv).toBe('Name,Quote\r\nAlice,"She said ""hello"""')
  })

  it('escapes fields containing newlines', () => {
    const headers = ['Name', 'Notes']
    const rows = [['Alice', 'Line 1\nLine 2']]
    const csv = serializeCsv(headers, rows)
    expect(csv).toBe('Name,Notes\r\nAlice,"Line 1\nLine 2"')
  })

  it('escapes fields containing all special characters', () => {
    const headers = ['Name', 'Complex']
    const rows = [['Alice', 'She said "hello", then\nwent away']]
    const csv = serializeCsv(headers, rows)
    expect(csv).toBe('Name,Complex\r\nAlice,"She said ""hello"", then\nwent away"')
  })

  it('handles null and undefined values as empty strings', () => {
    const headers = ['Name', 'Age', 'City']
    const rows = [
      ['Alice', null, 'London'],
      ['Bob', undefined, 'Manchester'],
    ]
    const csv = serializeCsv(headers, rows)
    expect(csv).toBe('Name,Age,City\r\nAlice,,London\r\nBob,,Manchester')
  })

  it('converts numbers to strings', () => {
    const headers = ['Name', 'Revenue']
    const rows = [
      ['Sales', 15000],
      ['Profit', 5000],
    ]
    const csv = serializeCsv(headers, rows)
    expect(csv).toBe('Name,Revenue\r\nSales,15000\r\nProfit,5000')
  })

  it('handles empty rows array', () => {
    const headers = ['Name', 'Age']
    const rows: (string | number | null | undefined)[][] = []
    const csv = serializeCsv(headers, rows)
    expect(csv).toBe('Name,Age\r\n')
  })

  it('handles carriage return in field', () => {
    const headers = ['Name', 'Notes']
    const rows = [['Alice', 'Line 1\rLine 2']]
    const csv = serializeCsv(headers, rows)
    expect(csv).toBe('Name,Notes\r\nAlice,"Line 1\rLine 2"')
  })
})
