'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ShoppingList, ShoppingListInsert, ShoppingListUpdate, ShoppingListWithItems, ShoppingItem, ShoppingItemInsert, ShoppingItemUpdate } from '@/types'
import { useAuth } from './useAuth'

export function useShoppingLists() {
  const [shoppingLists, setShoppingLists] = useState<ShoppingListWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, profile } = useAuth()

  // Carregar listas de compras
  const fetchShoppingLists = async (includeCompleted = false) => {
    if (!profile?.couple_id) return

    try {
      setLoading(true)
      
      let query = supabase
        .from('shopping_lists')
        .select(`
          *,
          profiles(id, name, email),
          shopping_items(*)
        `)
        .eq('couple_id', profile.couple_id)
        .order('created_at', { ascending: false })

      if (!includeCompleted) {
        query = query.eq('status', 'ACTIVE')
      }

      const { data, error } = await query

      if (error) throw error

      const listsWithItems = (data || []).map(list => ({
        ...list,
        user: list.profiles,
        items: list.shopping_items || [],
      })) as ShoppingListWithItems[]

      setShoppingLists(listsWithItems)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Criar lista de compras
  const createShoppingList = async (listData: Omit<ShoppingListInsert, 'user_id' | 'couple_id'>) => {
    if (!user || !profile?.couple_id) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('shopping_lists')
      .insert({
        ...listData,
        user_id: user.id,
        couple_id: profile.couple_id,
      })
      .select(`
        *,
        profiles(id, name, email),
        shopping_items(*)
      `)
      .single()

    if (error) throw error

    const listWithItems = {
      ...data,
      user: data.profiles,
      items: data.shopping_items || [],
    } as ShoppingListWithItems

    setShoppingLists(prev => [listWithItems, ...prev])
    return listWithItems
  }

  // Atualizar lista de compras
  const updateShoppingList = async (id: string, updates: ShoppingListUpdate) => {
    const { data, error } = await supabase
      .from('shopping_lists')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        profiles(id, name, email),
        shopping_items(*)
      `)
      .single()

    if (error) throw error

    const listWithItems = {
      ...data,
      user: data.profiles,
      items: data.shopping_items || [],
    } as ShoppingListWithItems

    setShoppingLists(prev =>
      prev.map(list => list.id === id ? listWithItems : list)
    )
    
    return listWithItems
  }

  // Excluir lista de compras
  const deleteShoppingList = async (id: string) => {
    const { error } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', id)

    if (error) throw error

    setShoppingLists(prev => prev.filter(list => list.id !== id))
  }

  // Adicionar item à lista
  const addItemToList = async (listId: string, itemData: Omit<ShoppingItemInsert, 'shopping_list_id'>) => {
    const { data, error } = await supabase
      .from('shopping_items')
      .insert({
        ...itemData,
        shopping_list_id: listId,
      })
      .select()
      .single()

    if (error) throw error

    // Atualizar lista local
    setShoppingLists(prev =>
      prev.map(list =>
        list.id === listId
          ? { ...list, items: [...list.items, data] }
          : list
      )
    )

    return data
  }

  // Atualizar item da lista
  const updateItem = async (itemId: string, updates: ShoppingItemUpdate) => {
    const { data, error } = await supabase
      .from('shopping_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single()

    if (error) throw error

    // Atualizar lista local
    setShoppingLists(prev =>
      prev.map(list => ({
        ...list,
        items: list.items.map(item =>
          item.id === itemId ? data : item
        )
      }))
    )

    return data
  }

  // Remover item da lista
  const removeItemFromList = async (itemId: string) => {
    const { error } = await supabase
      .from('shopping_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error

    // Atualizar lista local
    setShoppingLists(prev =>
      prev.map(list => ({
        ...list,
        items: list.items.filter(item => item.id !== itemId)
      }))
    )
  }

  // Marcar item como comprado/não comprado
  const toggleItemPurchased = async (itemId: string, purchased: boolean, actualPrice?: number) => {
    const updates: ShoppingItemUpdate = {
      purchased,
      actual_price: actualPrice,
      updated_at: new Date().toISOString(),
    }

    return await updateItem(itemId, updates)
  }

  // Finalizar lista de compras
  const completeShoppingList = async (listId: string, categoryId?: string) => {
    const list = shoppingLists.find(l => l.id === listId)
    if (!list) throw new Error('Lista não encontrada')

    // Calcular total real
    const totalActual = list.items
      .filter(item => item.purchased)
      .reduce((sum, item) => sum + (item.actual_price || item.estimated_price) * item.quantity, 0)

    // Atualizar status da lista
    const { error: updateError } = await supabase
      .from('shopping_lists')
      .update({
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        total_actual: totalActual,
      })
      .eq('id', listId)

    if (updateError) throw updateError

    // Se uma categoria foi fornecida, criar transação de despesa
    if (categoryId) {
      const { error: transactionError } = await supabase.rpc('finalize_shopping_list', {
        shopping_list_id_param: listId,
        category_id_param: categoryId
      })

      if (transactionError) throw transactionError
    }

    // Atualizar lista local
    setShoppingLists(prev =>
      prev.map(list =>
        list.id === listId
          ? { ...list, status: 'COMPLETED', completed_at: new Date().toISOString(), total_actual: totalActual }
          : list
      )
    )

    return totalActual
  }

  // Duplicar lista de compras
  const duplicateShoppingList = async (listId: string) => {
    const originalList = shoppingLists.find(l => l.id === listId)
    if (!originalList) throw new Error('Lista não encontrada')

    // Criar nova lista
    const newList = await createShoppingList({
      name: `${originalList.name} (cópia)`,
    })

    // Adicionar itens da lista original
    for (const item of originalList.items) {
      await addItemToList(newList.id, {
        name: item.name,
        quantity: item.quantity,
        estimated_price: item.estimated_price,
      })
    }

    return newList
  }

  // Obter estatísticas das listas
  const getShoppingStats = () => {
    const activeLists = shoppingLists.filter(list => list.status === 'ACTIVE')
    const completedLists = shoppingLists.filter(list => list.status === 'COMPLETED')
    
    const totalItems = activeLists.reduce((sum, list) => sum + list.items.length, 0)
    const purchasedItems = activeLists.reduce((sum, list) => 
      sum + list.items.filter(item => item.purchased).length, 0
    )
    
    const totalEstimated = activeLists.reduce((sum, list) => sum + list.total_estimated, 0)
    const totalActual = completedLists.reduce((sum, list) => sum + (list.total_actual || 0), 0)

    return {
      activeLists: activeLists.length,
      completedLists: completedLists.length,
      totalItems,
      purchasedItems,
      pendingItems: totalItems - purchasedItems,
      totalEstimated,
      totalActual,
      completionRate: totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0,
    }
  }

  // Obter itens mais comprados
  const getMostPurchasedItems = async (limit = 10) => {
    if (!profile?.couple_id) return []

    try {
      const { data, error } = await supabase
        .from('shopping_items')
        .select(`
          name,
          count:name
        `)
        .eq('purchased', true)
        .in('shopping_list_id', 
          shoppingLists.map(list => list.id)
        )

      if (error) throw error

      // Agrupar por nome e contar
      const itemCounts: Record<string, number> = {}
      data?.forEach(item => {
        const name = item.name.toLowerCase()
        itemCounts[name] = (itemCounts[name] || 0) + 1
      })

      return Object.entries(itemCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([name, count]) => ({ name, count }))
    } catch (error) {
      console.error('Erro ao obter itens mais comprados:', error)
      return []
    }
  }

  useEffect(() => {
    if (profile?.couple_id) {
      fetchShoppingLists()
    }
  }, [profile?.couple_id])

  // Configurar real-time subscription
  useEffect(() => {
    if (!profile?.couple_id) return

    const listSubscription = supabase
      .channel('shopping-lists-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shopping_lists',
          filter: `couple_id=eq.${profile.couple_id}`,
        },
        () => {
          fetchShoppingLists()
        }
      )
      .subscribe()

    const itemSubscription = supabase
      .channel('shopping-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shopping_items',
        },
        () => {
          fetchShoppingLists()
        }
      )
      .subscribe()

    return () => {
      listSubscription.unsubscribe()
      itemSubscription.unsubscribe()
    }
  }, [profile?.couple_id])

  return {
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
    refetch: () => fetchShoppingLists(),
    fetchCompleted: () => fetchShoppingLists(true),
  }
}
