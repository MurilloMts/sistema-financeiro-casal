'use client'

import { useState, useCallback, useEffect } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TransactionForm } from '@/components/forms/TransactionForm'
import { TransactionFilters } from '@/components/forms/TransactionFilters'
import { TransactionSummary } from '@/components/ui/TransactionSummary'
import { Pagination } from '@/components/ui/Pagination'
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout'
import { TransactionWithDetails, TransactionFormData, TransactionFilters as ITransactionFilters } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function TransactionsPage() {
  const {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    duplicateTransaction,
    fetchTransactions,
  } = useTransactions()

  useCategories() // Necessário para carregar categorias

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithDetails | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deletingTransaction, setDeletingTransaction] = useState<string | null>(null)
  const [defaultType, setDefaultType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [filters, setFilters] = useState<ITransactionFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithDetails[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const itemsPerPage = 20

  // Carregar transações com filtros e paginação
  const loadTransactions = useCallback(async (page = 1, currentFilters = filters) => {
    try {
      const offset = (page - 1) * itemsPerPage
      const { data, count } = await fetchTransactions(currentFilters, itemsPerPage, offset)

      setFilteredTransactions(data)
      setTotalCount(count)
      setCurrentPage(page)
    } catch (error) {
      console.error('Erro ao carregar transações:', error)
    }
  }, [filters, fetchTransactions, itemsPerPage])

  // Gerenciar transações - usar hook diretamente quando não há filtros
  useEffect(() => {
    if (Object.keys(filters).length === 0) {
      // Sem filtros: usar transações do hook diretamente
      setFilteredTransactions(transactions)
      setTotalCount(transactions.length)
      setCurrentPage(1)
    } else {
      // Com filtros: carregar transações filtradas
      loadTransactions(1)
    }
  }, [transactions, filters, loadTransactions])

  // Manipular mudanças nos filtros
  const handleFiltersChange = useCallback((newFilters: ITransactionFilters) => {
    setFilters(newFilters)
    loadTransactions(1, newFilters)
  }, [loadTransactions])

  // Manipular mudança de página
  const handlePageChange = useCallback((page: number) => {
    loadTransactions(page)
  }, [loadTransactions])

  const handleCreateTransaction = async (data: TransactionFormData) => {
    setFormLoading(true)
    try {
      await createTransaction(data)
      setIsModalOpen(false)

      // Se há filtros, recarregar transações filtradas
      if (Object.keys(filters).length > 0) {
        loadTransactions(1)
      }
      // Se não há filtros, as transações já foram atualizadas pelo hook
    } catch (err: any) {
      alert('Erro ao criar transação: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateTransaction = async (data: TransactionFormData) => {
    if (!editingTransaction) return

    setFormLoading(true)
    try {
      const updatedTransaction = await updateTransaction(editingTransaction.id, data)
      setIsModalOpen(false)
      setEditingTransaction(null)

      // Atualizar a transação na lista local
      setFilteredTransactions(prev =>
        prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
      )
    } catch (err: any) {
      alert('Erro ao atualizar transação: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteTransaction = async (transaction: TransactionWithDetails) => {
    if (!confirm(`Tem certeza que deseja excluir a transação "${transaction.description}"?`)) {
      return
    }

    setDeletingTransaction(transaction.id)
    try {
      await deleteTransaction(transaction.id)
      // Recarregar a página atual ou voltar uma página se necessário
      const newTotalCount = totalCount - 1
      const maxPage = Math.ceil(newTotalCount / itemsPerPage)
      const pageToLoad = currentPage > maxPage ? Math.max(1, maxPage) : currentPage
      loadTransactions(pageToLoad)
    } catch (err: any) {
      alert('Erro ao excluir transação: ' + err.message)
    } finally {
      setDeletingTransaction(null)
    }
  }

  const handleDuplicateTransaction = async (transaction: TransactionWithDetails) => {
    try {
      await duplicateTransaction(transaction)
      // Recarregar a primeira página para mostrar a transação duplicada
      loadTransactions(1)
    } catch (err: any) {
      alert('Erro ao duplicar transação: ' + err.message)
    }
  }

  const openCreateModal = (type: 'INCOME' | 'EXPENSE' = 'EXPENSE') => {
    setEditingTransaction(null)
    setDefaultType(type)
    setIsModalOpen(true)
  }

  const openEditModal = (transaction: TransactionWithDetails) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTransaction(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando transações...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar transações: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transações</h1>
              <p className="text-gray-600 mt-1">
                Gerencie suas receitas e despesas
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Ocultar' : 'Mostrar'} filtros
              </Button>
              <Button
                variant="outline"
                onClick={() => openCreateModal('INCOME')}
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
              >
                + Receita
              </Button>
              <Button
                onClick={() => openCreateModal('EXPENSE')}
                className="bg-red-600 hover:bg-red-700"
              >
                + Despesa
              </Button>
            </div>
          </div>

          {/* Filtros */}
          {showFilters && (
            <TransactionFilters
              onFiltersChange={handleFiltersChange}
              initialFilters={filters}
            />
          )}

          {/* Resumo */}
          <TransactionSummary
            transactions={filteredTransactions.length > 0 ? filteredTransactions : transactions}
            loading={loading}
          />

          {/* Lista de transações */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Transações ({totalCount || transactions.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {(filteredTransactions.length > 0 ? filteredTransactions : transactions).map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onEdit={() => openEditModal(transaction)}
                  onDelete={() => handleDeleteTransaction(transaction)}
                  onDuplicate={() => handleDuplicateTransaction(transaction)}
                  deleting={deletingTransaction === transaction.id}
                />
              ))}
            </div>

            {(filteredTransactions.length === 0 && transactions.length === 0) && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {Object.keys(filters).length > 0 ? 'Nenhuma transação encontrada com os filtros aplicados' : 'Nenhuma transação encontrada'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {Object.keys(filters).length > 0
                    ? 'Tente ajustar os filtros ou limpar todos os filtros'
                    : 'Comece adicionando sua primeira receita ou despesa'
                  }
                </p>
                <div className="flex justify-center space-x-3">
                  {Object.keys(filters).length > 0 ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilters({})
                        loadTransactions(1, {})
                      }}
                    >
                      Limpar filtros
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => openCreateModal('INCOME')}
                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      >
                        + Receita
                      </Button>
                      <Button onClick={() => openCreateModal('EXPENSE')}>
                        + Despesa
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Paginação */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal de formulário */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTransaction ? 'Editar transação' : 'Nova transação'}
        size="lg"
      >
        <TransactionForm
          transaction={editingTransaction || undefined}
          onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
          onCancel={closeModal}
          loading={formLoading}
          defaultType={defaultType}
        />
      </Modal>
    </AuthenticatedLayout>
  )
}

interface TransactionCardProps {
  transaction: TransactionWithDetails
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  deleting: boolean
}

function TransactionCard({ transaction, onEdit, onDelete, onDuplicate, deleting }: TransactionCardProps) {
  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: transaction.category?.color || '#6B7280' }}
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">{transaction.description}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.type === 'INCOME'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                }`}>
                {transaction.type === 'INCOME' ? 'Receita' : 'Despesa'}
              </span>
            </div>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
              <span>{transaction.category?.name || 'Sem categoria'}</span>
              <span>•</span>
              <span>{formatDate(transaction.transaction_date)}</span>
              <span>•</span>
              <span>por {transaction.user?.name || 'Usuário desconhecido'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className={`text-lg font-semibold ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
            }`}>
            {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </div>

          <div className="flex space-x-1">
            <button
              onClick={onDuplicate}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Duplicar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={onEdit}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Editar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              disabled={deleting}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Excluir"
            >
              {deleting ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}