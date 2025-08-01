'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  CreditCardExpense,
  CreditCardExpenseInsert, 
  CreditCardExpenseUpdate, 
  CreditCardExpenseWithDetails
} from '@/types'
import { useAuth } from './useAuth'

export function useCreditCardExpenses() {
  const [expenses, setExpenses] = useState<CreditCardExpenseWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, profile } = useAuth()

  // Carregar gastos dos cartões
  const fetchExpenses = async (creditCardId?: string, limit = 50, offset = 0) => {
    if (!profile?.couple_id) return { data: [], count: 0 }

    try {
      setLoading(true)
      
      let query = supabase
        .from('credit_card_expenses')
        .select(`
          *,
          categories(id, name, color, type),
          credit_cards(id, name, last_four_digits, color),
          profiles(id, name, email)
        `, { count: 'exact' })
        .eq('couple_id', profile.couple_id)
        .order('expense_date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (creditCardId) {
        query = query.eq('credit_card_id', creditCardId)
      }

      const { data, error, count } = await query

      if (error) throw error

      const expensesWithDetails = (data || []).map(expense => ({
        ...expense,
        category: expense.categories,
        credit_card: expense.credit_cards,
        user: expense.profiles,
      })) as CreditCardExpenseWithDetails[]

      if (offset === 0) {
        setExpenses(expensesWithDetails)
      }

      return { data: expensesWithDetails, count: count || 0 }
    } catch (err: any) {
      setError(err.message)
      return { data: [], count: 0 }
    } finally {
      setLoading(false)
    }
  }

  // Criar gasto no cartão
  const createExpense = async (expenseData: Omit<CreditCardExpenseInsert, 'user_id' | 'couple_id'>) => {
    if (!user || !profile?.couple_id) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('credit_card_expenses')
      .insert({
        ...expenseData,
        user_id: user.id,
        couple_id: profile.couple_id,
      })
      .select(`
        *,
        categories(id, name, color, type),
        credit_cards(id, name, last_four_digits, color),
        profiles(id, name, email)
      `)
      .single()

    if (error) throw error

    const expenseWithDetails = {
      ...data,
      category: data.categories,
      credit_card: data.credit_cards,
      user: data.profiles,
    } as CreditCardExpenseWithDetails

    setExpenses(prev => [expenseWithDetails, ...prev])
    
    return expenseWithDetails
  }

  // Atualizar gasto
  const updateExpense = async (id: string, updates: CreditCardExpenseUpdate) => {
    const { data, error } = await supabase
      .from('credit_card_expenses')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        categories(id, name, color, type),
        credit_cards(id, name, last_four_digits, color),
        profiles(id, name, email)
      `)
      .single()

    if (error) throw error

    const expenseWithDetails = {
      ...data,
      category: data.categories,
      credit_card: data.credit_cards,
      user: data.profiles,
    } as CreditCardExpenseWithDetails

    setExpenses(prev =>
      prev.map(expense => 
        expense.id === id ? expenseWithDetails : expense
      )
    )
    
    return expenseWithDetails
  }

  // Excluir gasto
  const deleteExpense = async (id: string) => {
    const { error } = await supabase
      .from('credit_card_expenses')
      .delete()
      .eq('id', id)

    if (error) throw error

    setExpenses(prev => prev.filter(expense => expense.id !== id))
  }

  // Obter gastos por cartão
  const getExpensesByCard = async (creditCardId: string) => {
    return await fetchExpenses(creditCardId)
  }

  // Obter total de gastos por período
  const getExpensesByPeriod = async (startDate: string, endDate: string, creditCardId?: string) => {
    if (!profile?.couple_id) return []

    try {
      let query = supabase
        .from('credit_card_expenses')
        .select(`
          *,
          categories(id, name, color, type),
          credit_cards(id, name, last_four_digits, color)
        `)
        .eq('couple_id', profile.couple_id)
        .gte('expense_date', startDate)
        .lte('expense_date', endDate)
        .order('expense_date', { ascending: false })

      if (creditCardId) {
        query = query.eq('credit_card_id', creditCardId)
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []).map(expense => ({
        ...expense,
        category: expense.categories,
        credit_card: expense.credit_cards,
      })) as CreditCardExpenseWithDetails[]
    } catch (err) {
      console.error('Erro ao obter gastos por período:', err)
      return []
    }
  }

  useEffect(() => {
    if (profile?.couple_id) {
      fetchExpenses()
    }
  }, [profile?.couple_id])

  // Configurar real-time subscription
  useEffect(() => {
    if (!profile?.couple_id) return

    const subscription = supabase
      .channel('credit-card-expenses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credit_card_expenses',
          filter: `couple_id=eq.${profile.couple_id}`,
        },
        () => {
          fetchExpenses()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [profile?.couple_id])

  return {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchExpenses,
    getExpensesByCard,
    getExpensesByPeriod,
    refetch: () => fetchExpenses(),
  }
}