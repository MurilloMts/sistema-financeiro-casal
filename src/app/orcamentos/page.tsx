'use client'

import { useState } from 'react'
import { useBudgets } from '@/hooks/useBudgets'
import { useCategories } from '@/hooks/useCategories'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { BudgetForm } from '@/components/forms/BudgetForm'
import { BudgetProgress } from '@/components/ui/BudgetProgress'
import { BudgetAdherence } from '@/components/ui/BudgetAdherence'
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout'
import { BudgetWithCategories, BudgetFormData } from '@/types'
import { formatCurrency } from '@/lib/utils'

export default function OrcamentosPage() {
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetWithCategories | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const {
    budgets,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    getCurrentMonthBudget,
  } = useBudgets()

  const { categories } = useCategories()

  const handleCreateBudget = async (data: BudgetFormData) => {
    setFormLoading(true)
    try {
      const { error } = await createBudget(data)
      if (error) throw error
      
      setIsBudgetModalOpen(false)
      setEditingBudget(null)
    } catch (err: any) {
      alert('Erro ao criar orçamento: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateBudget = async (data: BudgetFormData) => {
    if (!editingBudget) return

    setFormLoading(true)
    try {
      const { error } = await updateBudget(editingBudget.id, data)
      if (error) throw error
      
      setIsBudgetModalOpen(false)
      setEditingBudget(null)
    } catch (err: any) {
      alert('Erro ao atualizar orçamento: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteBudget = async (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId)
    if (!budget) return

    if (!confirm(`Tem certeza que deseja excluir o orçamento "${budget.name}"?`)) {
      return
    }

    setActionLoading(budgetId)
    try {
      const { error } = await deleteBudget(budgetId)
      if (error) throw error
    } catch (err: any) {
      alert('Erro ao excluir orçamento: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const openCreateModal = () => {
    setEditingBudget(null)
    setIsBudgetModalOpen(true)
  }

  const openEditModal = (budget: BudgetWithCategories) => {
    setEditingBudget(budget)
    setIsBudgetModalOpen(true)
  }

  const closeModal = () => {
    setIsBudgetModalOpen(false)
    setEditingBudget(null)
  }

  const currentMonthBudget = getCurrentMonthBudget()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erro ao carregar orçamentos: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-gray-600">Planeje e acompanhe seus gastos mensais</p>
        </div>
        <Button onClick={openCreateModal}>
          Novo Orçamento
        </Button>
      </div>

      {/* Orçamento do mês atual */}
      {currentMonthBudget && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Orçamento Atual</h2>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(currentMonthBudget)}
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteBudget(currentMonthBudget.id)}
                  loading={actionLoading === currentMonthBudget.id}
                  className="text-red-600 hover:text-red-700"
                >
                  Excluir
                </Button>
              </div>
            </div>
            <BudgetProgress budget={currentMonthBudget} showDetails={true} />
          </div>
          
          <BudgetAdherence budget={currentMonthBudget} showComparison={true} />
        </div>
      )}

      {/* Lista de orçamentos */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Todos os Orçamentos</h2>
        </div>

        {budgets.length === 0 ? (
          <div className="p-6 text-center">
            <div className="max-w-sm mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum orçamento</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comece criando seu primeiro orçamento mensal.
              </p>
              <div className="mt-6">
                <Button onClick={openCreateModal}>
                  Criar Primeiro Orçamento
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {budgets.map((budget) => {
              const totalSpent = budget.categories.reduce((sum, cat) => sum + (cat.spent_amount || 0), 0)
              const percentage = budget.total_planned > 0 ? (totalSpent / budget.total_planned) * 100 : 0
              const isOverBudget = totalSpent > budget.total_planned
              const isCurrent = budget.id === currentMonthBudget?.id

              return (
                <div key={budget.id} className={`p-6 ${isCurrent ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {budget.name}
                        </h3>
                        {isCurrent && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Atual
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(budget.year, budget.month - 1).toLocaleDateString('pt-BR', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">
                          Planejado: {formatCurrency(budget.total_planned)}
                        </span>
                        <span className={`${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                          Gasto: {formatCurrency(totalSpent)}
                        </span>
                        <span className={`font-medium ${
                          isOverBudget ? 'text-red-600' : 
                          percentage > 80 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(budget)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBudget(budget.id)}
                        loading={actionLoading === budget.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>

                  {/* Barra de progresso simples */}
                  <div className="mt-4">
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isOverBudget ? 'bg-red-500' : 
                          percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de formulário */}
      <Modal
        isOpen={isBudgetModalOpen}
        onClose={closeModal}
        title={editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
        size="lg"
      >
        <BudgetForm
          budget={editingBudget || undefined}
          categories={categories}
          onSubmit={editingBudget ? handleUpdateBudget : handleCreateBudget}
          onCancel={closeModal}
          loading={formLoading}
        />
      </Modal>
      </div>
    </AuthenticatedLayout>
  )
}