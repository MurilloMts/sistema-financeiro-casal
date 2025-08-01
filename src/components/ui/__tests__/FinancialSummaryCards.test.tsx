import { render, screen } from '@testing-library/react'
import { FinancialSummaryCards } from '../FinancialSummaryCards'

const mockData = {
  totalIncome: 5000,
  totalExpenses: 3500,
  balance: 1500,
  pendingBills: 800,
  incomeChange: 10,
  expensesChange: -5,
  balanceChange: 15,
  pendingBillsChange: -20,
}

describe('FinancialSummaryCards Component', () => {
  it('renders all financial summary cards', () => {
    render(<FinancialSummaryCards data={mockData} loading={false} />)
    
    expect(screen.getByText('Receitas do Mês')).toBeInTheDocument()
    expect(screen.getByText('Despesas do Mês')).toBeInTheDocument()
    expect(screen.getByText('Saldo Disponível')).toBeInTheDocument()
    expect(screen.getByText('Contas Pendentes')).toBeInTheDocument()
  })

  it('displays formatted currency values', () => {
    render(<FinancialSummaryCards data={mockData} loading={false} />)
    
    expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 3.500,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 800,00')).toBeInTheDocument()
  })

  it('shows percentage changes with correct colors', () => {
    render(<FinancialSummaryCards data={mockData} loading={false} />)
    
    // Positive changes should be green
    const positiveChanges = screen.getAllByText(/\+10%|\+15%/)
    positiveChanges.forEach(element => {
      expect(element).toHaveClass('text-green-600')
    })

    // Negative changes should be red
    const negativeChanges = screen.getAllByText(/-5%|-20%/)
    negativeChanges.forEach(element => {
      expect(element).toHaveClass('text-red-600')
    })
  })

  it('shows loading skeleton when loading', () => {
    render(<FinancialSummaryCards data={mockData} loading={true} />)
    
    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons).toHaveLength(4) // One for each card
  })

  it('handles zero values correctly', () => {
    const zeroData = {
      ...mockData,
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      pendingBills: 0,
    }
    
    render(<FinancialSummaryCards data={zeroData} loading={false} />)
    
    const zeroValues = screen.getAllByText('R$ 0,00')
    expect(zeroValues).toHaveLength(4)
  })

  it('handles negative balance correctly', () => {
    const negativeBalanceData = {
      ...mockData,
      balance: -500,
    }
    
    render(<FinancialSummaryCards data={negativeBalanceData} loading={false} />)
    
    expect(screen.getByText('R$ -500,00')).toBeInTheDocument()
  })
})
