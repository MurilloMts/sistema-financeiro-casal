import { render, screen } from '@testing-library/react'
import { BudgetProgress } from '../BudgetProgress'

const mockBudgetData = [
  {
    category: { id: '1', name: 'Alimentação', color: '#FF6B6B' },
    budgeted: 1000,
    spent: 750,
    percentage: 75,
    remaining: 250,
    status: 'on_track' as const,
  },
  {
    category: { id: '2', name: 'Transporte', color: '#4ECDC4' },
    budgeted: 500,
    spent: 600,
    percentage: 120,
    remaining: -100,
    status: 'over_budget' as const,
  },
  {
    category: { id: '3', name: 'Lazer', color: '#45B7D1' },
    budgeted: 300,
    spent: 50,
    percentage: 16.67,
    remaining: 250,
    status: 'under_budget' as const,
  },
]

describe('BudgetProgress Component', () => {
  it('renders budget progress for all categories', () => {
    render(<BudgetProgress data={mockBudgetData} loading={false} />)
    
    expect(screen.getByText('Alimentação')).toBeInTheDocument()
    expect(screen.getByText('Transporte')).toBeInTheDocument()
    expect(screen.getByText('Lazer')).toBeInTheDocument()
  })

  it('displays correct budget amounts and percentages', () => {
    render(<BudgetProgress data={mockBudgetData} loading={false} />)
    
    expect(screen.getByText('R$ 750,00 de R$ 1.000,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 600,00 de R$ 500,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 50,00 de R$ 300,00')).toBeInTheDocument()
    
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('120%')).toBeInTheDocument()
    expect(screen.getByText('17%')).toBeInTheDocument()
  })

  it('shows correct status indicators', () => {
    render(<BudgetProgress data={mockBudgetData} loading={false} />)
    
    // On track should be blue/normal
    const onTrackProgress = screen.getByText('75%').closest('.progress-bar')
    expect(onTrackProgress).toHaveClass('bg-blue-500')
    
    // Over budget should be red
    const overBudgetProgress = screen.getByText('120%').closest('.progress-bar')
    expect(overBudgetProgress).toHaveClass('bg-red-500')
    
    // Under budget should be green
    const underBudgetProgress = screen.getByText('17%').closest('.progress-bar')
    expect(underBudgetProgress).toHaveClass('bg-green-500')
  })

  it('displays remaining amounts correctly', () => {
    render(<BudgetProgress data={mockBudgetData} loading={false} />)
    
    expect(screen.getByText('Restam R$ 250,00')).toBeInTheDocument()
    expect(screen.getByText('Excedeu em R$ 100,00')).toBeInTheDocument()
    expect(screen.getByText('Restam R$ 250,00')).toBeInTheDocument()
  })

  it('shows loading skeleton when loading', () => {
    render(<BudgetProgress data={[]} loading={true} />)
    
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows empty state when no data', () => {
    render(<BudgetProgress data={[]} loading={false} />)
    
    expect(screen.getByText(/nenhum orçamento encontrado/i)).toBeInTheDocument()
  })

  it('handles zero budgeted amount', () => {
    const zeroData = [{
      category: { id: '1', name: 'Test', color: '#FF6B6B' },
      budgeted: 0,
      spent: 100,
      percentage: 0,
      remaining: -100,
      status: 'over_budget' as const,
    }]
    
    render(<BudgetProgress data={zeroData} loading={false} />)
    
    expect(screen.getByText('R$ 100,00 de R$ 0,00')).toBeInTheDocument()
  })

  it('applies category colors to progress bars', () => {
    render(<BudgetProgress data={mockBudgetData} loading={false} />)
    
    const progressBars = screen.getAllByRole('progressbar')
    
    // Should use category colors for progress bars
    expect(progressBars[0]).toHaveStyle('background-color: #FF6B6B')
    expect(progressBars[1]).toHaveStyle('background-color: #4ECDC4')
    expect(progressBars[2]).toHaveStyle('background-color: #45B7D1')
  })
})