'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Budget, BudgetWithCategories, BudgetFormData, BudgetCategory } from '@/types'

export function useBudgets() {
  const [budgets, setBudgets] = useState<BudgetWithCategories[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { profile } = useAuth()

  // Carregar orçamentos
  const fetchBudgets = async () => {
    if (!profile?.couple_id) return

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          *,
          budget_categories(
            *,
            categories(*)
          )
        `)
        .eq('couple_id', profile.couple_id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setBudgets(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Criar orçamento
  const createBudget = async (budgetData: BudgetFormData) => {
    if (!profile?.couple_id) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        ...budgetData,
        couple_id: profile.couple_id,
      })
      .select()
      .single()

    if (error) throw error

    fetchBudgets() // Recarregar lista
    return data
  }

  // Atualizar orçamento
  const updateBudget = async (id: string, updates: Partial<BudgetFormData>) => {
    const { data, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    fetchBudgets() // Recarregar lista
    return data
  }

  // Excluir orçamento
  const deleteBudget = async (id: string) => {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)

    if (error) throw error

    setBudgets(prev => prev.filter(budget => budget.id !== id))
  }

  // Obter progresso do orçamento (existing function, not directly used by page.tsx for current month)
  const getBudgetProgress = async (budgetId: string) => {
    if (!profile?.couple_id) return null

    try {
      // Buscar categorias do orçamento
      const { data: budgetCategories } = await supabase
        .from('budget_categories')
        .select('category_id, planned_amount')
        .eq('budget_id', budgetId)

      if (!budgetCategories) return null

      // Buscar gastos reais das categorias
      const categoryIds = budgetCategories.map(bc => bc.category_id)
      
      const { data: transactions } = await supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('couple_id', profile.couple_id)
        .eq('type', 'EXPENSE')
        .in('category_id', categoryIds)

      // Calcular progresso por categoria
      const progress = budgetCategories.map(bc => {
        const spent = (transactions || [])
          .filter(t => t.category_id === bc.category_id)
          .reduce((sum, t) => sum + t.amount, 0)

        return {
          category_id: bc.category_id,
          planned: bc.planned_amount,
          spent,
          remaining: bc.planned_amount - spent,
          percentage: (spent / bc.planned_amount) * 100
        }
      })

      return progress
    } catch (error) {
      console.error('Erro ao obter progresso do orçamento:', error)
      return null
    }
  }

  // Nova função para obter o orçamento do mês atual
  const getCurrentMonthBudget = (): BudgetWithCategories | undefined => {
    const now = new Date()
    const currentMonth = now.getMonth() + 1 // getMonth() is 0-indexed
    const currentYear = now.getFullYear()

    return budgets.find(
      (budget) => budget.month === currentMonth && budget.year === currentYear
    )
  }

  useEffect(() => {
    if (profile?.couple_id) {
      fetchBudgets()
    }
  }, [profile?.couple_id])

  return {
    budgets,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudgetProgress,
    getCurrentMonthBudget, // Now correctly returned
    refetch: fetchBudgets,
  }
}
