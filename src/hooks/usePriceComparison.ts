'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Store, PriceComparison, ItemPriceHistory } from '@/types'
import { useAuth } from './useAuth'

export function usePriceComparison() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { profile } = useAuth()

  // Carregar estabelecimentos
  const fetchStores = async () => {
    if (!profile?.couple_id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('couple_id', profile.couple_id)
        .order('name')

      if (error) throw error
      setStores(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Criar estabelecimento
  const createStore = async (name: string, address?: string) => {
    if (!profile?.couple_id) throw new Error('Casal não configurado')

    const { data, error } = await supabase
      .from('stores')
      .insert({
        name: name.trim(),
        address: address?.trim(),
        couple_id: profile.couple_id,
      })
      .select()
      .single()

    if (error) throw error

    setStores(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  // Atualizar estabelecimento
  const updateStore = async (id: string, name: string, address?: string) => {
    const { data, error } = await supabase
      .from('stores')
      .update({
        name: name.trim(),
        address: address?.trim(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    setStores(prev =>
      prev.map(store => store.id === id ? data : store).sort((a, b) => a.name.localeCompare(b.name))
    )
    return data
  }

  // Excluir estabelecimento
  const deleteStore = async (id: string) => {
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', id)

    if (error) throw error

    setStores(prev => prev.filter(store => store.id !== id))
  }

  // Obter comparação de preços para um item
  const getPriceComparison = async (itemName: string, daysBack = 90): Promise<PriceComparison[]> => {
    if (!profile?.couple_id) return []

    try {
      const { data, error } = await supabase.rpc('get_price_comparison', {
        item_name_param: itemName,
        couple_id_param: profile.couple_id,
        days_back: daysBack
      })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erro ao obter comparação de preços:', err)
      return []
    }
  }

  // Obter histórico de preços de um item
  const getItemPriceHistory = async (itemName: string, daysBack = 365): Promise<ItemPriceHistory[]> => {
    if (!profile?.couple_id) return []

    try {
      const { data, error } = await supabase.rpc('get_item_price_history', {
        item_name_param: itemName,
        couple_id_param: profile.couple_id,
        days_back: daysBack
      })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Erro ao obter histórico de preços:', err)
      return []
    }
  }

  // Registrar preço manualmente
  const recordPrice = async (itemName: string, price: number, storeId: string) => {
    if (!profile?.couple_id) throw new Error('Casal não configurado')

    const { error } = await supabase
      .from('price_history')
      .insert({
        item_name: itemName.trim(),
        price,
        store_id: storeId,
        couple_id: profile.couple_id,
      })

    if (error) throw error
  }

  // Obter itens mais pesquisados
  const getMostSearchedItems = async (limit = 20) => {
    if (!profile?.couple_id) return []

    try {
      const { data, error } = await supabase
        .from('price_history')
        .select('item_name')
        .eq('couple_id', profile.couple_id)

      if (error) throw error

      // Contar frequência dos itens
      const itemCounts: Record<string, number> = {}
      data?.forEach(record => {
        const name = record.item_name.toLowerCase()
        itemCounts[name] = (itemCounts[name] || 0) + 1
      })

      return Object.entries(itemCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([name, count]) => ({ name, count }))
    } catch (err) {
      console.error('Erro ao obter itens mais pesquisados:', err)
      return []
    }
  }

  // Obter melhor preço para um item
  const getBestPrice = async (itemName: string, daysBack = 30) => {
    const comparison = await getPriceComparison(itemName, daysBack)
    if (comparison.length === 0) return null

    return comparison.reduce((best, current) => 
      current.last_price < best.last_price ? current : best
    )
  }

  // Obter estatísticas de economia
  const getSavingsStats = async (daysBack = 30) => {
    if (!profile?.couple_id) return null

    try {
      const { data, error } = await supabase
        .from('price_history')
        .select('item_name, price, store_id, stores(name)')
        .eq('couple_id', profile.couple_id)
        .gte('recorded_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())

      if (error) throw error

      // Agrupar por item e calcular economia potencial
      const itemGroups: Record<string, any[]> = {}
      data?.forEach(record => {
        const itemName = record.item_name.toLowerCase()
        if (!itemGroups[itemName]) {
          itemGroups[itemName] = []
        }
        itemGroups[itemName].push(record)
      })

      let totalSavings = 0
      let itemsWithSavings = 0

      Object.values(itemGroups).forEach(items => {
        if (items.length > 1) {
          const prices = items.map(item => item.price)
          const minPrice = Math.min(...prices)
          const maxPrice = Math.max(...prices)
          const savings = maxPrice - minPrice
          
          if (savings > 0) {
            totalSavings += savings
            itemsWithSavings++
          }
        }
      })

      return {
        totalSavings,
        itemsWithSavings,
        itemsTracked: Object.keys(itemGroups).length,
        averageSavingsPerItem: itemsWithSavings > 0 ? totalSavings / itemsWithSavings : 0
      }
    } catch (err) {
      console.error('Erro ao calcular estatísticas de economia:', err)
      return null
    }
  }

  // Criar estabelecimentos padrão
  const createDefaultStores = async () => {
    if (!profile?.couple_id || stores.length > 0) return

    const defaultStores = [
      'Supermercado Extra',
      'Carrefour',
      'Pão de Açúcar',
      'Atacadão',
      'BIG',
      'Walmart',
      'Mercado Local'
    ]

    try {
      for (const storeName of defaultStores) {
        await createStore(storeName)
      }
    } catch (error) {
      console.error('Erro ao criar estabelecimentos padrão:', error)
    }
  }

  useEffect(() => {
    if (profile?.couple_id) {
      fetchStores()
    }
  }, [profile?.couple_id])

  return {
    stores,
    loading,
    error,
    createStore,
    updateStore,
    deleteStore,
    getPriceComparison,
    getItemPriceHistory,
    recordPrice,
    getMostSearchedItems,
    getBestPrice,
    getSavingsStats,
    createDefaultStores,
    refetch: fetchStores,
  }
}
