'use client'

import { useState, useEffect } from 'react'
import { useShoppingLists } from '@/hooks/useShoppingLists'
import { useCategories } from '@/hooks/useCategories'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ShoppingListForm } from '@/components/forms/ShoppingListForm'
import { ShoppingItemForm } from '@/components/forms/ShoppingItemForm'
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout'
import { ShoppingListWithItems, ShoppingListFormData, ShoppingItemFormData, ShoppingItem } from '@/types'
import { formatCurrency } from '@/lib/utils'

export default function MarketPage() {
  const {
    shoppingLists,
    loading,
    error,
    createShoppingList,
    updateShoppingList,
    deleteShoppingList,
    addItemToList,
    updateItem,
    removeItemFromList,
    toggleItemPurchased,
    completeShoppingList,
    duplicateShoppingList,
    getShoppingStats,
    getMostPurchasedItems,
  } = useShoppingLists()

  const { categories } = useCategories()

  const [isListModalOpen, setIsListModalOpen] = useState(false)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [editingList, setEditingList] = useState<ShoppingListWithItems | null>(null)
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null)
  const [activeListId, setActiveListId] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [suggestedItems, setSuggestedItems] = useState<string[]>([])
  const [showCompleted, setShowCompleted] = useState(false)

  // Carregar estatísticas e sugestões
  useEffect(() => {
    if (!loading) {
      const shoppingStats = getShoppingStats()
      setStats(shoppingStats)
      
      getMostPurchasedItems(10).then(items => {
        setSuggestedItems(items.map(item => item.name))
      })
    }
  }, [shoppingLists, loading])

  const handleCreateList = async (data: ShoppingListFormData) => {
    setFormLoading(true)
    try {
      await createShoppingList(data)
      setIsListModalOpen(false)
    } catch (err: any) {
      alert('Erro ao criar lista: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateList = async (data: ShoppingListFormData) => {
    if (!editingList) return

    setFormLoading(true)
    try {
      await updateShoppingList(editingList.id, data)
      setIsListModalOpen(false)
      setEditingList(null)
    } catch (err: any) {
      alert('Erro ao atualizar lista: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteList = async (list: ShoppingListWithItems) => {
    if (!confirm(`Tem certeza que deseja excluir a lista "${list.name}"?`)) {
      return
    }

    setActionLoading(list.id)
    try {
      await deleteShoppingList(list.id)
    } catch (err: any) {
      alert('Erro ao excluir lista: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddItem = async (data: ShoppingItemFormData) => {
    if (!activeListId) return

    setFormLoading(true)
    try {
      await addItemToList(activeListId, data)
      setIsItemModalOpen(false)
      setActiveListId(null)
    } catch (err: any) {
      alert('Erro ao adicionar item: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateItem = async (data: ShoppingItemFormData) => {
    if (!editingItem) return

    setFormLoading(true)
    try {
      await updateItem(editingItem.id, data)
      setIsItemModalOpen(false)
      setEditingItem(null)
    } catch (err: any) {
      alert('Erro ao atualizar item: ' + err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleItem = async (item: ShoppingItem, purchased: boolean, actualPrice?: number) => {
    setActionLoading(item.id)
    try {
      await toggleItemPurchased(item.id, purchased, actualPrice)
    } catch (err: any) {
      alert('Erro ao atualizar item: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCompleteList = async (listId: string) => {
    const list = shoppingLists.find(l => l.id === listId)
    if (!list) return

    const expenseCategories = categories.filter(cat => cat.type === 'EXPENSE' || cat.type === 'BOTH')
    const defaultCategory = expenseCategories.find(cat => cat.name.toLowerCase().includes('alimentação')) || expenseCategories[0]

    if (!defaultCategory) {
      alert('É necessário ter pelo menos uma categoria de despesa para finalizar a lista')
      return
    }

    if (!confirm(`Finalizar a lista "${list.name}" e criar uma despesa de ${formatCurrency(list.total_estimated)}?`)) {
      return
    }

    setActionLoading(listId)
    try {
      await completeShoppingList(listId, defaultCategory.id)
      alert('Lista finalizada e despesa criada com sucesso!')
    } catch (err: any) {
      alert('Erro ao finalizar lista: ' + err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const openCreateListModal = () => {
    setEditingList(null)
    setIsListModalOpen(true)
  }

  const openEditListModal = (list: ShoppingListWithItems) => {
    setEditingList(list)
    setIsListModalOpen(true)
  }

  const openAddItemModal = (listId: string) => {
    setActiveListId(listId)
    setEditingItem(null)
    setIsItemModalOpen(true)
  }

  const openEditItemModal = (item: ShoppingItem) => {
    setEditingItem(item)
    setActiveListId(null)
    setIsItemModalOpen(true)
  }

  const closeModals = () => {
    setIsListModalOpen(false)
    setIsItemModalOpen(false)
    setEditingList(null)
    setEditingItem(null)
    setActiveListId(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando listas de compras...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar listas: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  const activeLists = shoppingLists.filter(list => list.status === 'ACTIVE')
  const completedLists = shoppingLists.filter(list => list.status === 'COMPLETED')
  const displayLists = showCompleted ? completedLists : activeLists

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Listas de Compras</h1>
              <p className="text-gray-600 mt-1">
                Organize suas compras e controle os gastos
              </p>
            </div>
            <Button onClick={openCreateListModal}>
              Nova lista
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
                    <p className="text-sm font-medium text-gray-500">Listas Ativas</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.activeLists}</p>
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
                    <p className="text-sm font-medium text-gray-500">Itens Comprados</p>
                    <p className="text-2xl font-bold text-green-600">{stats.purchasedItems}</p>
                    <p className="text-xs text-gray-400">de {stats.totalItems} itens</p>
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
                    <p className="text-sm font-medium text-gray-500">Itens Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingItems}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Estimado</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(stats.totalEstimated)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex space-x-2">
              <Button
                variant={!showCompleted ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setShowCompleted(false)}
              >
                Ativas ({activeLists.length})
              </Button>
              <Button
                variant={showCompleted ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setShowCompleted(true)}
              >
                Finalizadas ({completedLists.length})
              </Button>
            </div>
          </div>

          {/* Lista de listas de compras */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayLists.map((list) => (
              <ShoppingListCard
                key={list.id}
                list={list}
                onEdit={() => openEditListModal(list)}
                onDelete={() => handleDeleteList(list)}
                onAddItem={() => openAddItemModal(list.id)}
                onEditItem={openEditItemModal}
                onToggleItem={handleToggleItem}
                onComplete={() => handleCompleteList(list.id)}
                onDuplicate={() => duplicateShoppingList(list.id)}
                loading={actionLoading === list.id}
                itemLoading={actionLoading}
              />
            ))}
          </div>

          {displayLists.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {showCompleted ? 'Nenhuma lista finalizada' : 'Nenhuma lista ativa'}
              </h3>
              <p className="text-gray-600 mb-4">
                {showCompleted 
                  ? 'Você ainda não finalizou nenhuma lista de compras'
                  : 'Comece criando sua primeira lista de compras'
                }
              </p>
              {!showCompleted && (
                <Button onClick={openCreateListModal}>
                  Criar primeira lista
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      <Modal
        isOpen={isListModalOpen}
        onClose={closeModals}
        title={editingList ? 'Editar lista' : 'Nova lista'}
      >
        <ShoppingListForm
          shoppingList={editingList || undefined}
          onSubmit={editingList ? handleUpdateList : handleCreateList}
          onCancel={closeModals}
          loading={formLoading}
        />
      </Modal>

      <Modal
        isOpen={isItemModalOpen}
        onClose={closeModals}
        title={editingItem ? 'Editar item' : 'Novo item'}
      >
        <ShoppingItemForm
          item={editingItem || undefined}
          onSubmit={editingItem ? handleUpdateItem : handleAddItem}
          onCancel={closeModals}
          loading={formLoading}
          suggestedItems={suggestedItems}
        />
      </Modal>
    </AuthenticatedLayout>
  )
}

interface ShoppingListCardProps {
  list: ShoppingListWithItems
  onEdit: () => void
  onDelete: () => void
  onAddItem: () => void
  onEditItem: (item: ShoppingItem) => void
  onToggleItem: (item: ShoppingItem, purchased: boolean, actualPrice?: number) => void
  onComplete: () => void
  onDuplicate: () => void
  loading: boolean
  itemLoading: string | null
}

function ShoppingListCard({ 
  list, 
  onEdit, 
  onDelete, 
  onAddItem, 
  onEditItem, 
  onToggleItem, 
  onComplete, 
  onDuplicate,
  loading,
  itemLoading
}: ShoppingListCardProps) {
  const [showAllItems, setShowAllItems] = useState(false)
  
  const purchasedItems = list.items.filter(item => item.purchased)
  const pendingItems = list.items.filter(item => !item.purchased)
  const completionRate = list.items.length > 0 ? (purchasedItems.length / list.items.length) * 100 : 0
  
  const displayItems = showAllItems ? list.items : list.items.slice(0, 5)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header da lista */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{list.name}</h3>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
            <span>{list.items.length} itens</span>
            <span>•</span>
            <span>{formatCurrency(list.total_estimated)} estimado</span>
            {list.status === 'COMPLETED' && list.total_actual && (
              <>
                <span>•</span>
                <span className="font-medium">{formatCurrency(list.total_actual)} real</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex space-x-1">
          {list.status === 'ACTIVE' && (
            <button
              onClick={onAddItem}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Adicionar item"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          )}
          
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
            onClick={onDuplicate}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Duplicar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
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

      {/* Barra de progresso */}
      {list.status === 'ACTIVE' && list.items.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progresso</span>
            <span>{Math.round(completionRate)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}

      {/* Lista de itens */}
      <div className="space-y-2 mb-4">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-2 rounded ${
              item.purchased ? 'bg-green-50' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              {list.status === 'ACTIVE' && (
                <button
                  onClick={() => onToggleItem(item, !item.purchased)}
                  disabled={itemLoading === item.id}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    item.purchased
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {itemLoading === item.id ? (
                    <div className="w-2 h-2 animate-spin rounded-full border border-white border-t-transparent" />
                  ) : item.purchased ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : null}
                </button>
              )}
              
              <div className="flex-1">
                <div className={`font-medium ${item.purchased ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {item.name}
                </div>
                <div className="text-sm text-gray-600">
                  {item.quantity}x {formatCurrency(item.estimated_price)}
                  {item.actual_price && item.actual_price !== item.estimated_price && (
                    <span className="ml-2 text-green-600">
                      (real: {formatCurrency(item.actual_price)})
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`font-medium ${item.purchased ? 'text-gray-500' : 'text-gray-900'}`}>
                {formatCurrency((item.actual_price || item.estimated_price) * item.quantity)}
              </span>
              
              {list.status === 'ACTIVE' && (
                <button
                  onClick={() => onEditItem(item)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Editar item"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
        
        {list.items.length > 5 && (
          <button
            onClick={() => setShowAllItems(!showAllItems)}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2"
          >
            {showAllItems ? 'Ver menos' : `Ver mais ${list.items.length - 5} itens`}
          </button>
        )}
      </div>

      {/* Ações da lista */}
      {list.status === 'ACTIVE' && list.items.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={onComplete}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
            size="sm"
          >
            {loading ? 'Finalizando...' : 'Finalizar compras'}
          </Button>
        </div>
      )}
    </div>
  )
}
