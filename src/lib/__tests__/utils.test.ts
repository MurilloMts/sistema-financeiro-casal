import { formatCurrency, cn, calculatePercentageChange, formatDate } from '../utils'

describe('Utils Functions', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers correctly', () => {
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56')
      expect(formatCurrency(100)).toBe('R$ 100,00')
      expect(formatCurrency(0.99)).toBe('R$ 0,99')
    })

    it('formats negative numbers correctly', () => {
      expect(formatCurrency(-1234.56)).toBe('R$ -1.234,56')
      expect(formatCurrency(-100)).toBe('R$ -100,00')
    })

    it('handles zero correctly', () => {
      expect(formatCurrency(0)).toBe('R$ 0,00')
    })

    it('handles very large numbers', () => {
      expect(formatCurrency(1000000)).toBe('R$ 1.000.000,00')
    })
  })

  describe('cn (className utility)', () => {
    it('combines class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })

    it('handles undefined and null values', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end')
    })

    it('merges Tailwind classes correctly', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2') // Later class should override
    })
  })

  describe('calculatePercentageChange', () => {
    it('calculates positive percentage change', () => {
      expect(calculatePercentageChange(100, 150)).toBe(50)
      expect(calculatePercentageChange(200, 250)).toBe(25)
    })

    it('calculates negative percentage change', () => {
      expect(calculatePercentageChange(150, 100)).toBe(-33.33)
      expect(calculatePercentageChange(200, 150)).toBe(-25)
    })

    it('handles zero previous value', () => {
      expect(calculatePercentageChange(0, 100)).toBe(0)
    })

    it('handles zero current value', () => {
      expect(calculatePercentageChange(100, 0)).toBe(-100)
    })

    it('handles both values being zero', () => {
      expect(calculatePercentageChange(0, 0)).toBe(0)
    })

    it('rounds to 2 decimal places', () => {
      expect(calculatePercentageChange(3, 10)).toBe(233.33)
    })
  })

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00')
      expect(formatDate(date)).toBe('formatted-dd/MM/yyyy')
    })

    it('formats date with custom format', () => {
      const date = new Date('2024-01-15T10:30:00')
      expect(formatDate(date, 'yyyy-MM-dd')).toBe('formatted-yyyy-MM-dd')
    })

    it('handles string dates', () => {
      expect(formatDate('2024-01-15')).toBe('formatted-dd/MM/yyyy')
    })
  })
})
