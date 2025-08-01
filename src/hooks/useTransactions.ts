'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { TransactionInsert, TransactionUpdate, TransactionWithDetails, TransactionFilters } from '@/types'
import { useAuth } from './useAuth'
import { formatDateInput } from '@/lib/utils'

export function useTransactions() {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, profile } = useAuth()

  // Carregar transações
  const fetchTransactions = useCallback(async (filters?: TransactionFilters, limit = 50, offset = 0) => {
    if (!profile?.couple_id) return { data: [], count: 0 }

    try {
      setLoading(true)

      let query = supabase
        .from('transactions')
        .select(`
          *,
          categories(id, name, color, type),
          profiles(id, name, email)
        `, { count: 'exact' })
        .eq('couple_id', profile.couple_id)
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Aplicar filtros
      if (filters?.type) {
        query = query.eq('type', filters.type)
      }
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id)
      }
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id)
      }
      if (filters?.start_date) {
        query = query.gte('transaction_date', filters.start_date)
      }
      if (filters?.end_date) {
        query = query.lte('transaction_date', filters.end_date)
      }
      if (filters?.search) {
        query = query.ilike('description', `%${filters.search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      const transactionsWithDetails = (data || []).map(transaction => ({
        ...transaction,
        category: transaction.categories,
        user: transaction.profiles,
      })) as TransactionWithDetails[]

      // Sempre atualizar as transações quando não há offset (primeira página)
      if (offset === 0) {
        setTransactions(transactionsWithDetails)
      }

      return { data: transactionsWithDetails, count: count || 0 }
    } catch (err: any) {
      setError(err.message)
      return { data: [], count: 0 }
    } finally {
      setLoading(false)
    }
  }, [profile?.couple_id])

  // Criar transação
  const createTransaction = async (transactionData: Omit<TransactionInsert, 'user_id' | 'couple_id'>) => {
    if (!user || !profile?.couple_id) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transactionData,
        user_id: user.id,
        couple_id: profile.couple_id,
      })
      .select(`
        *,
        categories(id, name, color, type),
        profiles(id, name, email)
      `)
      .single()

    if (error) throw error

    const transactionWithDetails = {
      ...data,
      category: data.categories,
      user: data.profiles,
    } as TransactionWithDetails

    setTransactions(prev => [transactionWithDetails, ...prev])
    return transactionWithDetails
  }

  // Atualizar transação
  const updateTransaction = async (id: string, updates: TransactionUpdate) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        categories(id, name, color, type),
        profiles(id, name, email)
      `)
      .single()

    if (error) throw error

    const transactionWithDetails = {
      ...data,
      category: data.categories,
      user: data.profiles,
    } as TransactionWithDetails

    setTransactions(prev =>
      prev.map(transaction => 
        transaction.id === id ? transactionWithDetails : transaction
      )
    )
    
    return transactionWithDetails
  }

  // Excluir transação
  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) throw error

    setTransactions(prev => prev.filter(transaction => transaction.id !== id))
  }

  // Duplicar transação
  const duplicateTransaction = async (transaction: TransactionWithDetails) => {
    const duplicateData = {
      description: `${transaction.description} (cópia)`,
      amount: transaction.amount,
      type: transaction.type,
      transaction_date: formatDateInput(new Date()),
      category_id: transaction.category_id,
    }

    return await createTransaction(duplicateData)
  }

  // Obter transações recentes
  const getRecentTransactions = async (limit = 5) => {
    if (!profile?.couple_id) return []

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories(id, name, color, type),
          profiles(id, name, email)
        `)
        .eq('couple_id', profile.couple_id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data || []).map(transaction => ({
        ...transaction,
        category: transaction.categories,
        user: transaction.profiles,
      })) as TransactionWithDetails[]
    } catch (error) {
      console.error('Erro ao obter transações recentes:', error)
      return []
    }
  }

  useEffect(() => {
    if (profile?.couple_id) {
      fetchTransactions()
    }
  }, [profile?.couple_id, fetchTransactions])

  // Configurar real-time subscription
  useEffect(() => {
    if (!profile?.couple_id) return

    const subscription = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `couple_id=eq.${profile.couple_id}`,
        },
        () => {
          fetchTransactions()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [profile?.couple_id, fetchTransactions])

  return {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    duplicateTransaction,
    fetchTransactions,
    getRecentTransactions,
    refetch: () => fetchTransactions(),
  }
}
