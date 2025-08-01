'use client'

import { useState, useEffect } from 'react'
import { useCreditCards } from '@/hooks/useCreditCards'
import { useCreditCardExpenses } from '@/hooks/useCreditCardExpenses'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { CreditCardForm } from '@/components/forms/CreditCardForm'
import { CreditCardExpenseForm } from '@/components/forms/CreditCardExpenseForm'
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout'
import { 
  CreditCardWithDetails, 
  CreditCardFormData, 
  CreditCardExpenseFormData,
  CreditCardExpenseWithDetails
} from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function CreditCardsPage() {
  const {
    creditCards,
    loading: cardsLoading,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    updateCardBalance,
    getCreditCardsStats,
  } = useCreditCards()

  const {
    expenses,
    loading: expensesLoading,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useCreditCardExpenses()

  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CreditCardWithDetails | null>(null)
  const [editingExpense, setEditingExpenseState] = useState<CreditCardExpenseWithDetails | null>(null)
  const [selectedCardForExpense, setSelectedCardForExpense] = useState<string>('')
  const [formLoading, setFormLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)

  // Carregar estatísticas
  useEffect(() => {
    if (!cardsLoading && creditCards.length > 0) {
      const cardStats = getCreditCardsStats()
      setStats(cardStats)
    }
  }, [creditCards, cardsLoading])

  const handleCreateCard = async (data: CreditCardFormData) => {
    setFormLoading(true)
    try {
      await createCreditCard(data)
      setIsCardModalOpen(false)
    } catch (err: any) {
      alert('Erro ao criar cartão: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateCard = async (data: CreditCardFormData) => {
    if (!editingCard) return

    setFormLoading(true)
    try {
      await updateCreditCard(editingCard.id, data)
      setIsCardModalOpen(false)
      setEditingCard(null)
    } catch (err: any) {
      alert('Erro ao atualizar cartão: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteCard = async (card: CreditCardWithDetails) => {
    if (!confirm(`Tem certeza que deseja excluir o cartão "${card.name}"?`)) {
      return
    }

    try {
      await deleteCreditCard(card.id)
    } catch (err: any) {
      alert('Erro ao excluir cartão: ' + err.message)
    }
  }

  const handleUpdateBalance = async (cardId: string, newBalance: number) => {
    try {
      await updateCardBalance(cardId, newBalance)
    } catch (err: any) {
      alert('Erro ao atualizar saldo: ' + err.message)
    }
  }

  const handleCreateExpense = async (data: CreditCardExpenseFormData) => {
    setFormLoading(true)
    try {
      await createExpense(data)
      
      // Atualizar saldo do cartão
      const card = creditCards.find(c => c.id === data.credit_card_id)
      if (card) {
        const newBalance = card.current_balance + data.amount
        await updateCardBalance(card.id, newBalance)
      }
      
      setIsExpenseModalOpen(false)
      setSelectedCardForExpense('')
    } catch (err: any) {
      alert('Erro ao adicionar gasto: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateExpense = async (data: CreditCardExpenseFormData) => {
    if (!editingExpense) return

    setFormLoading(true)
    try {
      const oldAmount = editingExpense.amount
      await updateExpense(editingExpense.id, data)
      
      // Atualizar saldo do cartão se o valor mudou
      if (oldAmount !== data.amount) {
        const card = creditCards.find(c => c.id === data.credit_card_id)
        if (card) {
          const difference = data.amount - oldAmount
          const newBalance = card.current_balance + difference
          await updateCardBalance(card.id, newBalance)
        }
      }
      
      setIsExpenseModalOpen(false)
      setEditingExpenseState(null)
    } catch (err: any) {
      alert('Erro ao atualizar gasto: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteExpense = async (expense: CreditCardExpenseWithDetails) => {
    if (!confirm(`Tem certeza que deseja excluir o gasto "${expense.description}"?`)) {
      return
    }

    try {
      await deleteExpense(expense.id)
      
      // Atualizar saldo do cartão
      const card = creditCards.find(c => c.id === expense.credit_card_id)
      if (card) {
        const newBalance = card.current_balance - expense.amount
        await updateCardBalance(card.id, newBalance)
      }
    } catch (err: any) {
      alert('Erro ao excluir gasto: ' + err.message)
    }
  }

  const openCreateCardModal = () => {
    setEditingCard(null)
    setIsCardModalOpen(true)
  }

  const openEditCardModal = (card: CreditCardWithDetails) => {
    setEditingCard(card)
    setIsCardModalOpen(true)
  }

  const openCreateExpenseModal = (cardId?: string) => {
    setEditingExpenseState(null)
    setSelectedCardForExpense(cardId || '')
    setIsExpenseModalOpen(true)
  }

  const openEditExpenseModal = (expense: CreditCardExpenseWithDetails) => {
    setEditingExpenseState(expense)
    setSelectedCardForExpense('')
    setIsExpenseModalOpen(true)
  }

  if (cardsLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AuthenticatedLayout>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cartões de Crédito</h1>
            <p className="text-gray-600">Gerencie seus cartões e acompanhe os gastos</p>
          </div>
          <div className="flex space-x-3">
            <Button onClick={() => openCreateExpenseModal()}>
              Adicionar Gasto
            </Button>
            <Button onClick={openCreateCardModal}>
              Novo Cartão
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total de Cartões</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalCards}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Limite Total</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalLimit)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Usado</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalUsed)}</p>
                  <p className="text-xs text-gray-400">{stats.averageUsage.toFixed(1)}% do limite</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Próximo do Limite</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.cardsNearLimit}</p>
                  <p className="text-xs text-gray-400">cartões acima de 80%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de cartões */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creditCards.map((card) => (
            <CreditCardComponent
              key={card.id}
              card={card}
              onEdit={() => openEditCardModal(card)}
              onDelete={() => handleDeleteCard(card)}
              onAddExpense={() => openCreateExpenseModal(card.id)}
              onUpdateBalance={(newBalance) => handleUpdateBalance(card.id, newBalance)}
            />
          ))}
        </div>

        {creditCards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum cartão cadastrado
            </h3>
            <p className="text-gray-600 mb-4">
              Comece adicionando seu primeiro cartão de crédito
            </p>
            <Button onClick={openCreateCardModal}>
              Adicionar Cartão
            </Button>
          </div>
        )}

        {/* Gastos recentes */}
        {expenses.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Gastos Recentes
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {expenses.slice(0, 10).map((expense) => (
                <div key={expense.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: expense.credit_card.color }}
                      />
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium text-gray-900">{expense.description}</h3>
                          {expense.installments && expense.installments > 1 && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {expense.current_installment || 1}/{expense.installments}x
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>{expense.credit_card.name} (••••{expense.credit_card.last_four_digits})</span>
                          <span>•</span>
                          <span>{formatDate(expense.expense_date)}</span>
                          {expense.category && (
                            <>
                              <span>•</span>
                              <span>{expense.category.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-lg font-semibold text-red-600">
                        {formatCurrency(expense.amount)}
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => openEditExpenseModal(expense)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Editar gasto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Excluir gasto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal do cartão */}
      <Modal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false)
          setEditingCard(null)
        }}
        title={editingCard ? 'Editar Cartão' : 'Novo Cartão'}
      >
        <CreditCardForm
          creditCard={editingCard || undefined}
          onSubmit={editingCard ? handleUpdateCard : handleCreateCard}
          onCancel={() => {
            setIsCardModalOpen(false)
            setEditingCard(null)
          }}
          loading={formLoading}
        />
      </Modal>

      {/* Modal do gasto */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false)
          setEditingExpenseState(null)
          setSelectedCardForExpense('')
        }}
        title={editingExpense ? 'Editar Gasto' : 'Novo Gasto'}
      >
        <CreditCardExpenseForm
          expense={editingExpense || undefined}
          creditCards={creditCards}
          selectedCardId={selectedCardForExpense}
          onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
          onCancel={() => {
            setIsExpenseModalOpen(false)
            setEditingExpenseState(null)
            setSelectedCardForExpense('')
          }}
          loading={formLoading}
        />
      </Modal>
    </AuthenticatedLayout>
  )
}

// Componente do cartão
interface CreditCardComponentProps {
  card: CreditCardWithDetails
  onEdit: () => void
  onDelete: () => void
  onAddExpense: () => void
  onUpdateBalance: (newBalance: number) => void
}

function CreditCardComponent({ 
  card, 
  onEdit, 
  onDelete, 
  onAddExpense, 
  onUpdateBalance 
}: CreditCardComponentProps) {
  const [isEditingBalance, setIsEditingBalance] = useState(false)
  const [newBalance, setNewBalance] = useState(card.current_balance)

  const usagePercentage = (card.current_balance / card.credit_limit) * 100
  const availableLimit = card.credit_limit - card.current_balance

  const handleBalanceUpdate = () => {
    onUpdateBalance(newBalance)
    setIsEditingBalance(false)
  }

  const getUsageColor = () => {
    if (usagePercentage >= 80) return 'bg-red-500'
    if (usagePercentage >= 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Cartão visual */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{ backgroundColor: card.color }}
        />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="text-sm opacity-75">{card.name}</div>
            <div className="w-8 h-6 bg-white rounded opacity-75" />
          </div>
          
          <div className="mb-4">
            <div className="text-lg font-mono tracking-wider">
              •••• •••• •••• {card.last_four_digits}
            </div>
          </div>
          
          <div className="flex justify-between items-end text-sm">
            <div>
              <div className="opacity-75 mb-1">Vencimento</div>
              <div>Todo dia {card.due_date}</div>
            </div>
            <div className="text-right">
              <div className="opacity-75 mb-1">Limite</div>
              <div>{formatCurrency(card.credit_limit)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Informações do cartão */}
      <div className="p-6 space-y-4">
        {/* Saldo atual */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Saldo Atual</span>
            {isEditingBalance ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.01"
                  value={newBalance}
                  onChange={(e) => setNewBalance(parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                />
                <button
                  onClick={handleBalanceUpdate}
                  className="text-green-600 hover:text-green-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setIsEditingBalance(false)
                    setNewBalance(card.current_balance)
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingBalance(true)}
                className="text-lg font-semibold text-red-600 hover:text-red-700"
              >
                {formatCurrency(card.current_balance)}
              </button>
            )}
          </div>
          
          {/* Barra de progresso */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getUsageColor()}`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{usagePercentage.toFixed(1)}% usado</span>
            <span>Disponível: {formatCurrency(availableLimit)}</span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={onAddExpense}
            className="flex-1"
          >
            Adicionar Gasto
          </Button>
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Editar cartão"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Excluir cartão"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}