'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '@/lib/supabase'
import { formatDateInput } from '@/lib/utils'

interface DashboardStats {
  currentMonth: {
    totalIncome: number
    totalExpenses: number
    balance: number
    transactionCount: number
  }
  nextMonth: {
    projectedIncome: number
    projectedExpenses: number
    projectedBalance: number
    recurringBills: number
    upcomingBills: number
    upcomingBillsAmount: number
  }
  bills: {
    totalPending: number
    pendingAmount: number
    overdueCount: number
  }
  creditCards: {
    totalCards: number
    totalLimit: number
    totalUsed: number
    totalAvailable: number
    cardsNearLimit: number
    averageUsage: number
  }
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { profile } = useAuth()

  const loadDashboardData = async () => {
    if (!profile?.couple_id) return

    try {
      setLoading(true)
      setError(null)

      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()

      // 1. Buscar transações do mês atual
      const { data: monthlyTransactions } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('couple_id', profile.couple_id)
        .gte('transaction_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('transaction_date', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`)

      // 2. Buscar contas do mês atual (pagas + pendentes que vencem este mês)
      const currentMonthStart = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`
      const currentMonthEnd = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`

      // Contas pagas este mês
      const { data: paidBills } = await supabase
        .from('bills')
        .select('amount')
        .eq('couple_id', profile.couple_id)
        .eq('status', 'PAID')
        .gte('paid_at', currentMonthStart)
        .lt('paid_at', currentMonthEnd)

      // TODAS as contas pendentes e vencidas (devem ser consideradas despesas)
      const { data: allPendingBills } = await supabase
        .from('bills')
        .select('amount, due_date, status')
        .eq('couple_id', profile.couple_id)
        .in('status', ['PENDING', 'OVERDUE'])

      const paidBillsAmount = (paidBills || []).reduce((sum, bill) => sum + bill.amount, 0)
      const currentMonthBillsAmount = (allPendingBills || []).reduce((sum, bill) => sum + bill.amount, 0)
      const totalBillsAmount = paidBillsAmount + currentMonthBillsAmount

      // 3. Calcular totais do mês (incluindo contas pagas)
      const monthlyStats = (monthlyTransactions || []).reduce(
        (acc, transaction) => {
          if (transaction.type === 'INCOME') {
            acc.totalIncome += transaction.amount
          } else {
            acc.totalExpenses += transaction.amount
          }
          acc.transactionCount++
          return acc
        },
        { totalIncome: 0, totalExpenses: totalBillsAmount, transactionCount: 0 }
      )

      // 4. Buscar estatísticas de contas
      const { data: billsData } = await supabase
        .from('bills')
        .select('status, amount, due_date')
        .eq('couple_id', profile.couple_id)

      const today = formatDateInput(new Date())

      const billsStats = (billsData || []).reduce(
        (acc, bill) => {
          if (bill.status === 'PENDING' || bill.status === 'OVERDUE') {
            acc.totalPending++
            acc.pendingAmount += bill.amount
          }
          
          if (bill.status === 'OVERDUE' || (bill.status === 'PENDING' && bill.due_date < today)) {
            acc.overdueCount++
          }
          
          return acc
        },
        {
          totalPending: 0,
          pendingAmount: 0,
          overdueCount: 0,
        }
      )

      // 5. Calcular previsões do próximo mês
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear

      // Buscar transações dos últimos 3 meses para calcular média
      const { data: lastThreeMonths } = await supabase
        .from('transactions')
        .select('type, amount, transaction_date')
        .eq('couple_id', profile.couple_id)
        .gte('transaction_date', `${currentYear}-${Math.max(1, currentMonth - 2).toString().padStart(2, '0')}-01`)
        .lt('transaction_date', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)

      // Buscar contas dos últimos 3 meses para incluir na média
      const lastThreeMonthsStart = `${currentYear}-${Math.max(1, currentMonth - 2).toString().padStart(2, '0')}-01`
      const lastThreeMonthsEnd = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`

      // Contas pagas nos últimos 3 meses
      const { data: lastThreeMonthsPaidBills } = await supabase
        .from('bills')
        .select('amount, paid_at')
        .eq('couple_id', profile.couple_id)
        .eq('status', 'PAID')
        .gte('paid_at', lastThreeMonthsStart)
        .lt('paid_at', lastThreeMonthsEnd)

      // Contas que venceram nos últimos 3 meses (incluindo pendentes/vencidas)
      const { data: lastThreeMonthsDueBills } = await supabase
        .from('bills')
        .select('amount, due_date')
        .eq('couple_id', profile.couple_id)
        .gte('due_date', lastThreeMonthsStart)
        .lt('due_date', lastThreeMonthsEnd)

      // Calcular média dos últimos meses (incluindo contas pagas)
      const monthlyAverages = (lastThreeMonths || []).reduce(
        (acc, transaction) => {
          if (transaction.type === 'INCOME') {
            acc.avgIncome += transaction.amount
          } else {
            acc.avgExpenses += transaction.amount
          }
          return acc
        },
        { avgIncome: 0, avgExpenses: 0 }
      )

      // Adicionar contas à média de despesas (pagas + que venceram)
      const paidBillsAverage = (lastThreeMonthsPaidBills || []).reduce((sum, bill) => sum + bill.amount, 0)
      const dueBillsAverage = (lastThreeMonthsDueBills || []).reduce((sum, bill) => sum + bill.amount, 0)
      monthlyAverages.avgExpenses += Math.max(paidBillsAverage, dueBillsAverage)

      // Dividir pela quantidade de meses (máximo 3)
      const monthsCount = Math.min(3, currentMonth - 1) || 1
      monthlyAverages.avgIncome = monthlyAverages.avgIncome / monthsCount
      monthlyAverages.avgExpenses = monthlyAverages.avgExpenses / monthsCount

      // Buscar contas recorrentes para o próximo mês
      const { data: recurringBills } = await supabase
        .from('bills')
        .select('amount')
        .eq('couple_id', profile.couple_id)
        .eq('is_recurring', true)
        .eq('status', 'PENDING')

      const recurringBillsAmount = (recurringBills || []).reduce((sum, bill) => sum + bill.amount, 0)

      // Buscar contas que vencem no próximo mês
      const nextMonthStart = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`
      const nextMonthEnd = nextMonth === 12 
        ? `${nextYear + 1}-01-01` 
        : `${nextYear}-${(nextMonth + 1).toString().padStart(2, '0')}-01`

      const { data: upcomingBills } = await supabase
        .from('bills')
        .select('amount, due_date')
        .eq('couple_id', profile.couple_id)
        .eq('status', 'PENDING')
        .gte('due_date', nextMonthStart)
        .lt('due_date', nextMonthEnd)

      const upcomingBillsAmount = (upcomingBills || []).reduce((sum, bill) => sum + bill.amount, 0)

      // 6. Buscar dados dos cartões de crédito
      const { data: creditCardsData } = await supabase
        .from('credit_cards')
        .select('credit_limit, current_balance, is_active')
        .eq('couple_id', profile.couple_id)
        .eq('is_active', true)

      const creditCardsStats = (creditCardsData || []).reduce(
        (acc, card) => {
          acc.totalCards++
          acc.totalLimit += card.credit_limit
          acc.totalUsed += card.current_balance
          acc.totalAvailable += (card.credit_limit - card.current_balance)
          
          const usagePercentage = (card.current_balance / card.credit_limit) * 100
          if (usagePercentage >= 80) {
            acc.cardsNearLimit++
          }
          
          return acc
        },
        {
          totalCards: 0,
          totalLimit: 0,
          totalUsed: 0,
          totalAvailable: 0,
          cardsNearLimit: 0,
          averageUsage: 0,
        }
      )

      creditCardsStats.averageUsage = creditCardsStats.totalLimit > 0 
        ? (creditCardsStats.totalUsed / creditCardsStats.totalLimit) * 100 
        : 0

      // 7. Montar estatísticas finais
      const dashboardStats: DashboardStats = {
        currentMonth: {
          ...monthlyStats,
          balance: monthlyStats.totalIncome - monthlyStats.totalExpenses,
        },
        nextMonth: {
          projectedIncome: monthlyAverages.avgIncome,
          projectedExpenses: monthlyAverages.avgExpenses + upcomingBillsAmount,
          projectedBalance: monthlyAverages.avgIncome - (monthlyAverages.avgExpenses + upcomingBillsAmount),
          recurringBills: recurringBills?.length || 0,
          upcomingBills: upcomingBills?.length || 0,
          upcomingBillsAmount: upcomingBillsAmount,
        },
        bills: billsStats,
        creditCards: creditCardsStats,
      }

      setStats(dashboardStats)
    } catch (err: any) {
      setError(err.message)
      console.error('Erro ao carregar dados do dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profile?.couple_id) {
      loadDashboardData()
    }
  }, [profile?.couple_id])

  // Configurar subscription para atualizações em tempo real
  useEffect(() => {
    if (!profile?.couple_id) return

    const subscriptions: any[] = []

    // Subscription para transações
    const transactionSubscription = supabase
      .channel('dashboard-transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `couple_id=eq.${profile.couple_id}`,
        },
        () => {
          loadDashboardData()
        }
      )
      .subscribe()

    // Subscription para contas
    const billSubscription = supabase
      .channel('dashboard-bills')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bills',
          filter: `couple_id=eq.${profile.couple_id}`,
        },
        () => {
          loadDashboardData()
        }
      )
      .subscribe()

    subscriptions.push(transactionSubscription, billSubscription)

    // Cleanup
    return () => {
      subscriptions.forEach(subscription => {
        subscription.unsubscribe()
      })
    }
  }, [profile?.couple_id])

  return {
    stats,
    loading,
    error,
    refetch: loadDashboardData,
  }
}
