'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { BillInsert, BillUpdate, BillWithDetails, BillFilters } from '@/types'
import { useAuth } from './useAuth'
import { formatDateInput } from '@/lib/utils'

export function useBills() {
  const [bills, setBills] = useState<BillWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, profile } = useAuth()

  // Carregar contas
  const fetchBills = async (filters?: BillFilters, limit = 50, offset = 0) => {
    if (!profile?.couple_id) return { data: [], count: 0 }

    try {
      setLoading(true)
      
      let query = supabase
        .from('bills')
        .select(`
          *,
          categories(id, name, color, type),
          profiles(id, name, email)
        `, { count: 'exact' })
        .eq('couple_id', profile.couple_id)
        .order('due_date', { ascending: true })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      // Aplicar filtros
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id)
      }
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id)
      }
      if (filters?.due_date_start) {
        query = query.gte('due_date', filters.due_date_start)
      }
      if (filters?.due_date_end) {
        query = query.lte('due_date', filters.due_date_end)
      }

      const { data, error, count } = await query

      if (error) throw error

      const billsWithDetails = (data || []).map(bill => ({
        ...bill,
        category: bill.categories,
        user: bill.profiles,
      })) as BillWithDetails[]

      if (offset === 0) {
        setBills(billsWithDetails)
      }

      return { data: billsWithDetails, count: count || 0 }
    } catch (err: any) {
      setError(err.message)
      return { data: [], count: 0 }
    } finally {
      setLoading(false)
    }
  }

  // Criar conta
  const createBill = async (billData: Omit<BillInsert, 'user_id' | 'couple_id'>) => {
    if (!user || !profile?.couple_id) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('bills')
      .insert({
        ...billData,
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

    const billWithDetails = {
      ...data,
      category: data.categories,
      user: data.profiles,
    } as BillWithDetails

    setBills(prev => [billWithDetails, ...prev.sort((a, b) => 
      new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    )])
    
    return billWithDetails
  }

  // Atualizar conta
  const updateBill = async (id: string, updates: BillUpdate) => {
    const { data, error } = await supabase
      .from('bills')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        categories(id, name, color, type),
        profiles(id, name, email)
      `)
      .single()

    if (error) throw error

    const billWithDetails = {
      ...data,
      category: data.categories,
      user: data.profiles,
    } as BillWithDetails

    setBills(prev =>
      prev.map(bill => 
        bill.id === id ? billWithDetails : bill
      ).sort((a, b) => 
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      )
    )
    
    return billWithDetails
  }

  // Marcar conta como paga
  const markAsPaid = async (id: string) => {
    const updates: BillUpdate = {
      status: 'PAID',
      paid_at: formatDateInput(new Date()),
    }
    
    return await updateBill(id, updates)
  }

  // Marcar conta como pendente
  const markAsPending = async (id: string) => {
    const updates: BillUpdate = {
      status: 'PENDING',
      paid_at: null,
    }
    
    return await updateBill(id, updates)
  }

  // Excluir conta
  const deleteBill = async (id: string) => {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id)

    if (error) throw error

    setBills(prev => prev.filter(bill => bill.id !== id))
  }

  // Duplicar conta
  const duplicateBill = async (bill: BillWithDetails, newDueDate: string) => {
    if (!user || !profile?.couple_id) throw new Error('Usuário não autenticado')

    const duplicateData = {
      title: bill.title,
      amount: bill.amount,
      due_date: newDueDate,
      category_id: bill.category_id,
      status: 'PENDING' as const,
      user_id: user.id,
      couple_id: profile.couple_id,
      notes: bill.notes,
    }

    const { data, error } = await supabase
      .from('bills')
      .insert(duplicateData)
      .select(`
        *,
        categories(id, name, color, type),
        profiles(id, name, email)
      `)
      .single()

    if (error) throw error

    const billWithDetails = {
      ...data,
      category: data.categories,
      user: data.profiles,
    } as BillWithDetails

    setBills(prev => [billWithDetails, ...prev.sort((a, b) => 
      new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    )])
    
    return billWithDetails
  }

  // Obter contas próximas do vencimento
  const getUpcomingBills = async (daysAhead = 15) => {
    if (!profile?.couple_id) return []

    try {
      const today = new Date()
      const futureDate = new Date()
      futureDate.setDate(today.getDate() + daysAhead)
      
      const todayStr = formatDateInput(today)
      const futureDateStr = formatDateInput(futureDate)

      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          categories(id, name, color, type),
          profiles(id, name, email)
        `)
        .eq('couple_id', profile.couple_id)
        .eq('status', 'PENDING')
        .gte('due_date', todayStr)
        .lte('due_date', futureDateStr)
        .order('due_date', { ascending: true })

      if (error) throw error

      return (data || []).map(bill => ({
        ...bill,
        category: bill.categories,
        category_name: bill.categories?.name,
        category_color: bill.categories?.color,
        user: bill.profiles,
      })) as BillWithDetails[]
    } catch (err) {
      console.error('Erro ao obter contas próximas do vencimento:', err)
      return []
    }
  }

  // Obter contas vencidas
  const getOverdueBills = async () => {
    if (!profile?.couple_id) return []

    try {
      const today = formatDateInput(new Date())
      
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          categories(id, name, color, type),
          profiles(id, name, email)
        `)
        .eq('couple_id', profile.couple_id)
        .or(`status.eq.OVERDUE,and(status.eq.PENDING,due_date.lt.${today})`)
        .order('due_date', { ascending: true })

      if (error) throw error

      return (data || []).map(bill => ({
        ...bill,
        category: bill.categories,
        category_name: bill.categories?.name,
        category_color: bill.categories?.color,
        user: bill.profiles,
      })) as BillWithDetails[]
    } catch (err) {
      console.error('Erro ao obter contas vencidas:', err)
      return []
    }
  }

  // Obter estatísticas de contas
  const getBillsStats = async () => {
    if (!profile?.couple_id) return null

    try {
      const { data, error } = await supabase
        .from('bills')
        .select('status, amount, due_date')
        .eq('couple_id', profile.couple_id)

      if (error) throw error

      const today = formatDateInput(new Date())

      const stats = (data || []).reduce(
        (acc, bill) => {
          acc.total++
          acc.totalAmount += bill.amount
          
          if (bill.status === 'PENDING' || bill.status === 'OVERDUE') {
            acc.pending++
            acc.pendingAmount += bill.amount
          }
          
          if (bill.status === 'OVERDUE' || (bill.status === 'PENDING' && bill.due_date < today)) {
            acc.overdue++
            acc.overdueAmount += bill.amount
          }
          
          if (bill.status === 'PAID') {
            acc.paid++
            acc.paidAmount += bill.amount
          }
          
          return acc
        },
        {
          total: 0,
          totalAmount: 0,
          pending: 0,
          pendingAmount: 0,
          paid: 0,
          paidAmount: 0,
          overdue: 0,
          overdueAmount: 0,
        }
      )

      return stats
    } catch (err) {
      console.error('Erro ao obter estatísticas:', err)
      return null
    }
  }

  useEffect(() => {
    if (profile?.couple_id) {
      fetchBills()
    }
  }, [profile?.couple_id])

  // Configurar real-time subscription
  useEffect(() => {
    if (!profile?.couple_id) return

    const subscription = supabase
      .channel('bills-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bills',
          filter: `couple_id=eq.${profile.couple_id}`,
        },
        () => {
          fetchBills()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [profile?.couple_id])

  return {
    bills,
    loading,
    error,
    createBill,
    updateBill,
    deleteBill,
    duplicateBill,
    markAsPaid,
    markAsPending,
    fetchBills,
    getUpcomingBills,
    getOverdueBills,
    getBillsStats,
    refetch: () => fetchBills(),
  }
}
