'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { queryKeys } from '@/lib/react-query'
import { useRealTimeUpdates } from './useRealTimeUpdates'
import { useEffect } from 'react'

export function useDashboardOptimized() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()

  // Query para resumo financeiro
  const {
    data: financialSummary,
    isLoading: summaryLoading,
    error: summaryError
  } = useQuery({
    queryKey: queryKeys.financialSummary(profile?.couple_id || ''),
    queryFn: async () => {
      if (!profile?.couple_id) throw new Error('No couple ID')

      const currentDate = new Date()
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      // Buscar receitas e despesas do mês
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('couple_id', profile.couple_id)
        .gte('transaction_date', startOfMonth.toISOString().split('T')[0])
        .lte('date', endOfMonth.toISOString().split('T')[0])

      // Buscar contas pendentes
      const { data: pendingBills } = await supabase
        .from('bills')
        .select('amount')
        .eq('couple_id', profile.couple_id)
        .eq('paid', false)

      const income = transactions?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) || 0
      
      const expenses = transactions?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) || 0

      const pendingAmount = pendingBills?.reduce((sum, b) => sum + b.amount, 0) || 0

      return {
        income,
        expenses,
        balance: income - expenses,
        pendingBills: pendingAmount,
        transactionsCount: transactions?.length || 0
      }
    },
    enabled: !!profile?.couple_id,
    staleTime: 2 * 60 * 1000, // 2 minutos para dados financeiros
  })

  // Query para transações recentes
  const {
    data: recentTransactions,
    isLoading: transactionsLoading
  } = useQuery({
    queryKey: queryKeys.recentTransactions(profile?.couple_id || ''),
    queryFn: async () => {
      if (!profile?.couple_id) throw new Error('No couple ID')

      const { data } = await supabase
        .from('transactions')
        .select(`
          id,
          description,
          amount,
          type,
          date,
          created_by,
          categories(name, color),
          profiles(name)
        `)
        .eq('couple_id', profile.couple_id)
        .order('created_at', { ascending: false })
        .limit(5)

      return data || []
    },
    enabled: !!profile?.couple_id,
    staleTime: 1 * 60 * 1000, // 1 minuto para transações recentes
  })

  // Query para contas próximas do vencimento
  const {
    data: upcomingBills,
    isLoading: billsLoading
  } = useQuery({
    queryKey: queryKeys.upcomingBills(profile?.couple_id || ''),
    queryFn: async () => {
      if (!profile?.couple_id) throw new Error('No couple ID')

      const today = new Date()
      const in15Days = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000)

      const { data } = await supabase
        .from('bills')
        .select(`
          id,
          description,
          amount,
          due_date,
          paid,
          categories(name, color)
        `)
        .eq('couple_id', profile.couple_id)
        .eq('paid', false)
        .lte('due_date', in15Days.toISOString().split('T')[0])
        .order('due_date', { ascending: true })
        .limit(5)

      return data || []
    },
    enabled: !!profile?.couple_id,
    staleTime: 5 * 60 * 1000, // 5 minutos para contas
  })

  // Configurar atualizações em tempo real
  useRealTimeUpdates()

  // Invalidar queries quando houver mudanças em tempo real
  useEffect(() => {
    if (!profile?.couple_id) return

    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `couple_id=eq.${profile.couple_id}`
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.financialSummary(profile.couple_id)
          })
          queryClient.invalidateQueries({
            queryKey: queryKeys.recentTransactions(profile.couple_id)
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bills',
          filter: `couple_id=eq.${profile.couple_id}`
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.financialSummary(profile.couple_id)
          })
          queryClient.invalidateQueries({
            queryKey: queryKeys.upcomingBills(profile.couple_id)
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.couple_id, queryClient])

  return {
    financialSummary,
    recentTransactions,
    upcomingBills,
    isLoading: summaryLoading || transactionsLoading || billsLoading,
    error: summaryError,
    // Função para invalidar cache manualmente
    refetch: () => {
      if (profile?.couple_id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.financialSummary(profile.couple_id)
        })
        queryClient.invalidateQueries({
          queryKey: queryKeys.recentTransactions(profile.couple_id)
        })
        queryClient.invalidateQueries({
          queryKey: queryKeys.upcomingBills(profile.couple_id)
        })
      }
    }
  }
}
