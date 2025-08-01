import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionForm } from '../TransactionForm'

const mockCategories = [
  { id: '1', name: 'Alimentação', color: '#FF6B6B', couple_id: '1' },
  { id: '2', name: 'Transporte', color: '#4ECDC4', couple_id: '1' },
  { id: '3', name: 'Moradia', color: '#45B7D1', couple_id: '1' },
]

const mockOnSubmit = jest.fn()
const mockOnCancel = jest.fn()

describe('TransactionForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(
      <TransactionForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading={false}
      />
    )

    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/valor/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/data/i)).toBeInTheDocument()
  })

  it('submits form with correct data', async () => {
    const user = userEvent.setup()
    
    render(
      <TransactionForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading={false}
      />
    )

    await user.type(screen.getByLabelText(/descrição/i), 'Compra no supermercado')
    await user.type(screen.getByLabelText(/valor/i), '150.50')
    await user.selectOptions(screen.getByLabelText(/categoria/i), '1')
    await user.selectOptions(screen.getByLabelText(/tipo/i), 'expense')
    await user.type(screen.getByLabelText(/data/i), '2024-01-15')

    await user.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        description: 'Compra no supermercado',
        amount: 150.50,
        category_id: '1',
        type: 'expense',
        date: '2024-01-15',
      })
    })
  })

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup()
    
    render(
      <TransactionForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading={false}
      />
    )

    await user.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(screen.getByText(/descrição é obrigatória/i)).toBeInTheDocument()
      expect(screen.getByText(/valor é obrigatório/i)).toBeInTheDocument()
      expect(screen.getByText(/categoria é obrigatória/i)).toBeInTheDocument()
    })
  })

  it('validates minimum amount', async () => {
    const user = userEvent.setup()
    
    render(
      <TransactionForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading={false}
      />
    )

    await user.type(screen.getByLabelText(/valor/i), '0')
    await user.click(screen.getByRole('button', { name: /salvar/i }))

    await waitFor(() => {
      expect(screen.getByText(/valor deve ser maior que zero/i)).toBeInTheDocument()
    })
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <TransactionForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading={false}
      />
    )

    await user.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('disables form when loading', () => {
    render(
      <TransactionForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading={true}
      />
    )

    expect(screen.getByLabelText(/descrição/i)).toBeDisabled()
    expect(screen.getByLabelText(/valor/i)).toBeDisabled()
    expect(screen.getByLabelText(/categoria/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled()
  })

  it('populates form with initial data when editing', () => {
    const initialData = {
      description: 'Transação existente',
      amount: 100,
      category_id: '2',
      type: 'income' as const,
      date: '2024-01-10',
    }

    render(
      <TransactionForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading={false}
        initialData={initialData}
      />
    )

    expect(screen.getByDisplayValue('Transação existente')).toBeInTheDocument()
    expect(screen.getByDisplayValue('100')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
    expect(screen.getByDisplayValue('income')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2024-01-10')).toBeInTheDocument()
  })

  it('shows correct button text when editing', () => {
    const initialData = {
      description: 'Transação existente',
      amount: 100,
      category_id: '2',
      type: 'income' as const,
      date: '2024-01-10',
    }

    render(
      <TransactionForm
        categories={mockCategories}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading={false}
        initialData={initialData}
      />
    )

    expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument()
  })
})