'use client'

import { useState, useEffect } from 'react'
import { useBills } from '@/hooks/useBills'
import { useCategories } from '@/hooks/useCategories'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { BillForm } from '@/components/forms/BillForm'
import { BillStatus } from '@/components/ui/BillStatus'
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout'
import { BillWithDetails, BillFormData } from '@/types'
import { formatCurrency, formatDate, formatDateInput } from '@/lib/utils'

export default function BillsPage() {
  const {
    bills,
    loading,
    error,
    createBill,
    updateBill,
    deleteBill,
    markAsPaid,
    markAsPending,
    duplicateBill,
    getBillsStats,
  } = useBills()

  const { categories } = useCategories()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBill, setEditingBill] = useState<BillWithDetails | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all')

  // Carregar estatísticas
  useEffect(() => {
    const loadStats = async () => {
      const billsStats = await getBillsStats()
      setStats(billsStats)
    }
    
    if (!loading) {
      loadStats()
    }
  }, [bills, loading])

  const handleCreateBill = async (data: BillFormData) => {
    setFormLoading(true)
    try {
      await createBill(data)
      setIsModalOpen(false)
    } catch (err: any) {
      alert('Erro ao criar conta: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateBill = async (data: BillFormData) => {
    if (!editingBill) return

    setFormLoading(true)
    try {
      await updateBill(editingBill.id, data)
      setIsModalOpen(false)
      setEditingBill(null)
    } catch (err: any) {
      alert('Erro ao atualizar conta: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteBill = async (bill: BillWithDetails) => {
    if (!confirm(`Tem certeza que deseja excluir a conta "${bill.title}"?`)) {
      return
    }

    setActionLoading(bill.id)
    try {
      await deleteBill(bill.id)
    } catch (err: any) {
      alert('Erro ao excluir conta: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleMarkAsPaid = async (bill: BillWithDetails) => {
    setActionLoading(bill.id)
    try {
      await markAsPaid(bill.id)
    } catch (err: any) {
      alert('Erro ao marcar conta como paga: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleMarkAsPending = async (bill: BillWithDetails) => {
    setActionLoading(bill.id)
    try {
      await markAsPending(bill.id)
    } catch (err: any) {
      alert('Erro ao marcar conta como pendente: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDuplicateBill = async (bill: BillWithDetails) => {
    const nextMonth = new Date(bill.due_date)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    
    try {
      await duplicateBill(bill, formatDateInput(nextMonth))
    } catch (err: any) {
      alert('Erro ao duplicar conta: ' + err.message)
    }
  }

  const openCreateModal = () => {
    setEditingBill(null)
    setIsModalOpen(true)
  }

  const openEditModal = (bill: BillWithDetails) => {
    setEditingBill(bill)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBill(null)
  }

  // Filtrar contas
  const filteredBills = bills.filter(bill => {
    if (filter === 'all') return true
    if (filter === 'pending') return bill.status === 'PENDING'
    if (filter === 'paid') return bill.status === 'PAID'
    if (filter === 'overdue') {
      const today = formatDateInput(new Date())
      return bill.status === 'OVERDUE' || (bill.status === 'PENDING' && bill.due_date < today)
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando contas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar contas: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contas a Pagar</h1>
              <p className="text-gray-600 mt-1">
                Gerencie suas contas e controle os vencimentos
              </p>
            </div>
            <Button onClick={openCreateModal}>
              Nova conta
            </Button>
          </div>

          {/* Estatísticas */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(stats.totalAmount)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(stats.pendingAmount)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pagas</p>
                    <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(stats.paidAmount)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Vencidas</p>
                    <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(stats.overdueAmount)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex space-x-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todas ({bills.length})
              </Button>
              <Button
                variant={filter === 'pending' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pendentes ({stats?.pending || 0})
              </Button>
              <Button
                variant={filter === 'overdue' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('overdue')}
              >
                Vencidas ({stats?.overdue || 0})
              </Button>
              <Button
                variant={filter === 'paid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('paid')}
              >
                Pagas ({stats?.paid || 0})
              </Button>
            </div>
          </div>

          {/* Lista de contas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Contas ({filteredBills.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredBills.map((bill) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onEdit={() => openEditModal(bill)}
                  onDelete={() => handleDeleteBill(bill)}
                  onMarkAsPaid={() => handleMarkAsPaid(bill)}
                  onMarkAsPending={() => handleMarkAsPending(bill)}
                  onDuplicate={() => handleDuplicateBill(bill)}
                  loading={actionLoading === bill.id}
                />
              ))}
            </div>

            {filteredBills.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'all' ? 'Nenhuma conta encontrada' : `Nenhuma conta ${
                    filter === 'pending' ? 'pendente' :
                    filter === 'paid' ? 'paga' : 'vencida'
                  } encontrada`}
                </h3>
                <p className="text-gray-600 mb-4">
                  {filter === 'all' 
                    ? 'Comece adicionando sua primeira conta a pagar'
                    : 'Tente ajustar os filtros ou adicionar uma nova conta'
                  }
                </p>
                {filter === 'all' && (
                  <Button onClick={openCreateModal}>
                    Adicionar conta
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de formulário */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingBill ? 'Editar conta' : 'Nova conta'}
        size="lg"
      >
        <BillForm
          bill={editingBill || undefined}
          onSubmit={editingBill ? handleUpdateBill : handleCreateBill}
          onCancel={closeModal}
          loading={formLoading}
        />
      </Modal>
    </AuthenticatedLayout>
  )
}

interface BillCardProps {
  bill: BillWithDetails
  onEdit: () => void
  onDelete: () => void
  onMarkAsPaid: () => void
  onMarkAsPending: () => void
  onDuplicate: () => void
  loading: boolean
}

function BillCard({ 
  bill, 
  onEdit, 
  onDelete, 
  onMarkAsPaid, 
  onMarkAsPending, 
  onDuplicate, 
  loading 
}: BillCardProps) {
  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: bill.category.color }}
          />
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="font-medium text-gray-900">{bill.title}</h3>
              <BillStatus status={bill.status} dueDate={bill.due_date} />
            </div>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
              <span>{bill.category.name}</span>
              <span>•</span>
              <span>Vence em {formatDate(bill.due_date)}</span>
              <span>•</span>
              <span>por {bill.user.name}</span>
              {bill.paid_at && (
                <>
                  <span>•</span>
                  <span>Paga em {formatDate(bill.paid_at)}</span>
                </>
              )}
            </div>
            {bill.notes && (
              <p className="text-sm text-gray-500 mt-1">{bill.notes}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-lg font-semibold text-red-600">
            {formatCurrency(bill.amount)}
          </div>
          
          <div className="flex space-x-1">
            {bill.status === 'PENDING' ? (
              <button
                onClick={onMarkAsPaid}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                title="Marcar como paga"
              >
                {loading ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ) : (
              <button
                onClick={onMarkAsPending}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-yellow-600 transition-colors disabled:opacity-50"
                title="Marcar como pendente"
              >
                {loading ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>
            )}
            
            <button
              onClick={onDuplicate}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Duplicar para próximo mês"
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
              disabled={loading}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              title="Excluir"
            >
              {loading ? (
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