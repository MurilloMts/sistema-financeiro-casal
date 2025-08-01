'use client'

import { useState } from 'react'
import { useCategories } from '@/hooks/useCategories'
import { useCategorySuggestions } from '@/hooks/useCategorySuggestions'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { CategoryForm } from '@/components/forms/CategoryForm'
import { BulkReclassifyForm } from '@/components/forms/BulkReclassifyForm'
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout'
import { Category, CategoryFormData } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function CategoriesPage() {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryStats,
    checkCategoryInUse,
  } = useCategories()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [categoryStats, setCategoryStats] = useState<Record<string, any>>({})
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null)
  const [isReclassifyModalOpen, setIsReclassifyModalOpen] = useState(false)
  const [reclassifyLoading, setReclassifyLoading] = useState(false)
  const [mostUsedCategories, setMostUsedCategories] = useState<any[]>([])
  const [showStats, setShowStats] = useState(false)

  const { profile } = useAuth()
  const { getMostUsedCategories, getCategoryStatsByPeriod } = useCategorySuggestions()

  // Carregar estatísticas das categorias
  const loadCategoryStats = async (categoryId: string) => {
    if (categoryStats[categoryId]) return categoryStats[categoryId]

    try {
      const stats = await getCategoryStats(categoryId)
      setCategoryStats(prev => ({ ...prev, [categoryId]: stats }))
      return stats
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
      return { totalIncome: 0, totalExpense: 0, transactionCount: 0 }
    }
  }

  const handleCreateCategory = async (data: CategoryFormData) => {
    setFormLoading(true)
    try {
      await createCategory(data)
      setIsModalOpen(false)
    } catch (err: any) {
      alert('Erro ao criar categoria: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateCategory = async (data: CategoryFormData) => {
    if (!editingCategory) return

    setFormLoading(true)
    try {
      await updateCategory(editingCategory.id, data)
      setIsModalOpen(false)
      setEditingCategory(null)
    } catch (err: any) {
      alert('Erro ao atualizar categoria: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      return
    }

    setDeletingCategory(category.id)
    try {
      await deleteCategory(category.id)
    } catch (err: any) {
      alert('Erro ao excluir categoria: ' + err.message)
    } finally {
      setDeletingCategory(null)
    }
  }

  const openCreateModal = () => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
  }

  // Carregar categorias mais usadas
  const loadMostUsedCategories = async () => {
    try {
      const mostUsed = await getMostUsedCategories(undefined, 10)
      setMostUsedCategories(mostUsed)
    } catch (error) {
      console.error('Erro ao carregar categorias mais usadas:', error)
    }
  }

  // Reclassificar transações em massa
  const handleBulkReclassify = async (filters: any, newCategoryId: string) => {
    if (!profile?.couple_id) return

    setReclassifyLoading(true)
    try {
      let query = supabase
        .from('transactions')
        .update({ category_id: newCategoryId })
        .eq('couple_id', profile.couple_id)

      // Aplicar filtros
      if (filters.fromCategoryId) {
        query = query.eq('category_id', filters.fromCategoryId)
      }
      if (filters.description) {
        query = query.ilike('description', `%${filters.description}%`)
      }
      if (filters.startDate) {
        query = query.gte('transaction_date', filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte('transaction_date', filters.endDate)
      }
      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      const { error } = await query

      if (error) throw error

      alert('Transações reclassificadas com sucesso!')
      setIsReclassifyModalOpen(false)

      // Recarregar estatísticas
      setCategoryStats({})
    } catch (err: any) {
      alert('Erro ao reclassificar transações: ' + err.message)
    } finally {
      setReclassifyLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando categorias...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar categorias: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  const incomeCategories = categories.filter(cat => cat.type === 'INCOME' || cat.type === 'BOTH')
  const expenseCategories = categories.filter(cat => cat.type === 'EXPENSE' || cat.type === 'BOTH')

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
              <p className="text-gray-600 mt-1">
                Gerencie as categorias para organizar suas receitas e despesas
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowStats(!showStats)}
              >
                {showStats ? 'Ocultar' : 'Ver'} estatísticas
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsReclassifyModalOpen(true)}
              >
                Reclassificar
              </Button>
              <Button onClick={openCreateModal}>
                Nova categoria
              </Button>
            </div>
          </div>

          {/* Estatísticas */}
          {showStats && (
            <div className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Estatísticas de uso
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Categorias mais usadas */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Categorias mais usadas
                  </h3>
                  <div className="space-y-2">
                    {mostUsedCategories.slice(0, 5).map((item, index) => (
                      <div key={item.category.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">#{index + 1}</span>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.category.color }}
                          />
                          <span className="text-sm font-medium">{item.category.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">{item.reason}</span>
                      </div>
                    ))}
                    {mostUsedCategories.length === 0 && (
                      <div className="text-center py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={loadMostUsedCategories}
                        >
                          Carregar estatísticas
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resumo geral */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Resumo geral
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total de categorias:</span>
                      <span className="font-medium">{categories.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Categorias de receita:</span>
                      <span className="font-medium">{incomeCategories.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Categorias de despesa:</span>
                      <span className="font-medium">{expenseCategories.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Categorias padrão:</span>
                      <span className="font-medium">
                        {categories.filter(cat => cat.is_default).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Categorias de Receitas */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Receitas ({incomeCategories.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {incomeCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={() => openEditModal(category)}
                  onDelete={() => handleDeleteCategory(category)}
                  onLoadStats={() => loadCategoryStats(category.id)}
                  stats={categoryStats[category.id]}
                  deleting={deletingCategory === category.id}
                />
              ))}
            </div>
          </div>

          {/* Categorias de Despesas */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Despesas ({expenseCategories.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expenseCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={() => openEditModal(category)}
                  onDelete={() => handleDeleteCategory(category)}
                  onLoadStats={() => loadCategoryStats(category.id)}
                  stats={categoryStats[category.id]}
                  deleting={deletingCategory === category.id}
                />
              ))}
            </div>
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma categoria encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                Comece criando sua primeira categoria para organizar suas finanças
              </p>
              <Button onClick={openCreateModal}>
                Criar primeira categoria
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de formulário */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingCategory ? 'Editar categoria' : 'Nova categoria'}
      >
        <CategoryForm
          category={editingCategory || undefined}
          onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
          onCancel={closeModal}
          loading={formLoading}
        />
      </Modal>

      {/* Modal de reclassificação */}
      <Modal
        isOpen={isReclassifyModalOpen}
        onClose={() => setIsReclassifyModalOpen(false)}
        title="Reclassificar transações em massa"
        size="lg"
      >
        <BulkReclassifyForm
          categories={categories}
          onReclassify={handleBulkReclassify}
          onCancel={() => setIsReclassifyModalOpen(false)}
          loading={reclassifyLoading}
        />
      </Modal>
    </AuthenticatedLayout>
  )
}

interface CategoryCardProps {
  category: Category
  onEdit: () => void
  onDelete: () => void
  onLoadStats: () => Promise<any>
  stats?: any
  deleting: boolean
}

function CategoryCard({ category, onEdit, onDelete, onLoadStats, stats, deleting }: CategoryCardProps) {
  const [statsLoaded, setStatsLoaded] = useState(false)

  const handleLoadStats = async () => {
    if (!statsLoaded) {
      await onLoadStats()
      setStatsLoaded(true)
    }
  }

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleLoadStats}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <h3 className="font-medium text-gray-900">{category.name}</h3>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            disabled={deleting}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
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

      <div className="space-y-1 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Tipo:</span>
          <span className="font-medium">
            {category.type === 'INCOME' ? 'Receita' :
              category.type === 'EXPENSE' ? 'Despesa' : 'Ambos'}
          </span>
        </div>

        {category.is_default && (
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="text-blue-600 font-medium">Padrão</span>
          </div>
        )}

        {stats && (
          <>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="text-xs text-gray-500 mb-1">Este mês:</div>
              {stats.totalIncome > 0 && (
                <div className="flex justify-between">
                  <span>Receitas:</span>
                  <span className="text-green-600 font-medium">
                    {formatCurrency(stats.totalIncome)}
                  </span>
                </div>
              )}
              {stats.totalExpense > 0 && (
                <div className="flex justify-between">
                  <span>Despesas:</span>
                  <span className="text-red-600 font-medium">
                    {formatCurrency(stats.totalExpense)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Transações:</span>
                <span className="font-medium">{stats.transactionCount}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
