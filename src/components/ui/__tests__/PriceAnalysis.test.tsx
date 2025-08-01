import { render, screen, waitFor } from '@testing-library/react'
import { PriceAnalysis } from '../PriceAnalysis'
import { supabase } from '@/lib/supabase'

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    profile: { couple_id: 'couple-123' }
  })
}))

const mockPriceData = [
  {
    actual_price: 10.50,
    shopping_lists: { created_at: '2024-01-01' }
  },
  {
    actual_price: 12.00,
    shopping_lists: { created_at: '2024-01-15' }
  },
  {
    actual_price: 9.75,
    shopping_lists: { created_at: '2024-02-01' }
  }
]

describe('PriceAnalysis Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock Supabase query chain
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
  })

  it('shows loading state initially', () => {
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: mockPriceData, error: null }),
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
    
    render(<PriceAnalysis itemName="Arroz" currentPrice={11.00} />)
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  it('displays price analysis when data is available', async () => {
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: mockPriceData, error: null }),
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
    
    render(<PriceAnalysis itemName="Arroz" currentPrice={11.00} />)
    
    await waitFor(() => {
      expect(screen.getByText('Análise de Preço')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Preço atual:')).toBeInTheDocument()
    expect(screen.getByText('Preço médio:')).toBeInTheDocument()
    expect(screen.getByText('Menor preço:')).toBeInTheDocument()
    expect(screen.getByText('Maior preço:')).toBeInTheDocument()
  })

  it('shows good price indicator when current price is below average', async () => {
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: mockPriceData, error: null }),
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
    
    render(<PriceAnalysis itemName="Arroz" currentPrice={9.00} />)
    
    await waitFor(() => {
      expect(screen.getByText('(Bom preço!)')).toBeInTheDocument()
    })
  })

  it('shows high price warning when current price is above maximum', async () => {
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: mockPriceData, error: null }),
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
    
    render(<PriceAnalysis itemName="Arroz" currentPrice={15.00} />)
    
    await waitFor(() => {
      expect(screen.getByText('(Acima da média)')).toBeInTheDocument()
    })
  })

  it('displays price change percentage', async () => {
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: mockPriceData, error: null }),
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
    
    render(<PriceAnalysis itemName="Arroz" />)
    
    await waitFor(() => {
      expect(screen.getByText('Variação:')).toBeInTheDocument()
    })
  })

  it('shows no data message when no price history exists', async () => {
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
    
    render(<PriceAnalysis itemName="Item Inexistente" />)
    
    await waitFor(() => {
      expect(screen.getByText('Sem histórico de preços para este item.')).toBeInTheDocument()
    })
  })

  it('displays price evolution chart when multiple data points exist', async () => {
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: mockPriceData, error: null }),
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
    
    render(<PriceAnalysis itemName="Arroz" />)
    
    await waitFor(() => {
      expect(screen.getByText('Evolução de preço')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    const mockQuery = {
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockRejectedValue(new Error('API Error')),
    }
    
    ;(supabase.from as jest.Mock).mockReturnValue(mockQuery)
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    render(<PriceAnalysis itemName="Arroz" />)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao buscar histórico de preços:', expect.any(Error))
    })
    
    consoleSpy.mockRestore()
  })
})
