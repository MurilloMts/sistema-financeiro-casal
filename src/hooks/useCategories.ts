'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Category, CategoryInsert, CategoryUpdate } from '@/types'
import { useAuth } from './useAuth'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { profile } = useAuth()

  // Carregar categorias
  const fetchCategories = async () => {
    if (!profile?.couple_id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('couple_id', profile.couple_id)
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Criar categoria
  const createCategory = async (categoryData: Omit<CategoryInsert, 'couple_id'>) => {
    if (!profile?.couple_id) throw new Error('Casal não configurado')

    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...categoryData,
        couple_id: profile.couple_id,
      })
      .select()
      .single()

    if (error) throw error

    setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return data
  }

  // Atualizar categoria
  const updateCategory = async (id: string, updates: CategoryUpdate) => {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    setCategories(prev =>
      prev.map(cat => cat.id === id ? data : cat).sort((a, b) => a.name.localeCompare(b.name))
    )
    return data
  }

  // Verificar se categoria está em uso
  const checkCategoryInUse = async (id: string) => {
    const [transactionsCheck, billsCheck] = await Promise.all([
      supabase
        .from('transactions')
        .select('id')
        .eq('category_id', id)
        .limit(1),
      supabase
        .from('bills')
        .select('id')
        .eq('category_id', id)
        .limit(1)
    ])

    return (transactionsCheck.data?.length || 0) > 0 || (billsCheck.data?.length || 0) > 0
  }

  // Excluir categoria
  const deleteCategory = async (id: string) => {
    // Verificar se está em uso
    const inUse = await checkCategoryInUse(id)
    if (inUse) {
      throw new Error('Não é possível excluir uma categoria que está sendo usada em transações ou contas')
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error

    setCategories(prev => prev.filter(cat => cat.id !== id))
  }

  // Obter categorias por tipo
  const getCategoriesByType = (type: 'INCOME' | 'EXPENSE') => {
    return categories.filter(cat => cat.type === type || cat.type === 'BOTH')
  }

  // Obter estatísticas de uso da categoria
  const getCategoryStats = async (categoryId: string, month?: number, year?: number) => {
    const currentMonth = month || new Date().getMonth() + 1
    const currentYear = year || new Date().getFullYear()

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('category_id', categoryId)
      .gte('transaction_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
      .lt('transaction_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`)

    if (error) throw error

    const stats = data?.reduce(
      (acc, transaction) => {
        if (transaction.type === 'INCOME') {
          acc.totalIncome += transaction.amount
        } else {
          acc.totalExpense += transaction.amount
        }
        acc.transactionCount++
        return acc
      },
      { totalIncome: 0, totalExpense: 0, transactionCount: 0 }
    ) || { totalIncome: 0, totalExpense: 0, transactionCount: 0 }

    return stats
  }

  useEffect(() => {
    fetchCategories()
  }, [profile?.couple_id])

  // Configurar real-time subscription
  useEffect(() => {
    if (!profile?.couple_id) return

    const subscription = supabase
      .channel('categories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
          filter: `couple_id=eq.${profile.couple_id}`,
        },
        () => {
          fetchCategories()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [profile?.couple_id])

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoriesByType,
    getCategoryStats,
    checkCategoryInUse,
    refetch: fetchCategories,
  }
}