'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { useDebounce } from './useDebounce'
import { queryKeys } from '@/lib/react-query'
import { Transaction, TransactionFilters } from '@/types'

const ITEMS_PER_PAGE = 20

export function useTransactionsOptimized() {
  const { profile } = useAuth()
  const queryClient = useQueryClient()
  
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    category: '',
    type: '',
    dateFrom: '',
    dateTo: '',
    createdBy: ''
  })
  
  const [currentPage, setCurrentPage] = useState(1)
  
  // Debounce da busca para evitar muitas queries
  const debouncedSearch = useDebounce(filters.search, 300)
  
  // Memoizar filtros para evitar re-renders desnecessários
  const memoizedFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearch
  }), [filters.category, filters.type, filters.dateFrom, filters.dateTo, filters.createdBy, debouncedSearch])

  // Query para lista de transações com cache
  const {
    data: transactionsData,
    isLoading,
    error,
    isFetching
  } = useQuery({
    queryKey: queryKeys.transactionsList({ 
      ...memoizedFilters, 
      page: currentPage,
      coupleId: profile?.couple_id 
    }),
    queryFn: async () => {
      if (!profile?.couple_id) throw new Error('No couple ID')

      let query = supabase
        .from('transactions')
        .select(`
          id,
          description,
          amount,
          type,
          date,
          created_at,
          created_by,
          categories(id, name, color),
          profiles(name)
        `, { count: 'exact' })
        .eq('couple_id', profile.couple_id)

      // Aplicar filtros
      if (memoizedFilters.search) {
        query = query.ilike('description', `%${memoizedFilters.search}%`)
      }
      
      if (memoizedFilters.category) {
        query = query.eq('category_id', memoizedFilters.category)
      }
      
      if (memoizedFilters.type) {
        query = query.eq('type', memoizedFilters.type)
      }
      
      if (memoizedFilters.dateFrom) {
        query = query.gte('transaction_date', memoizedFilters.dateFrom)
      }
      
      if (memoizedFilters.dateTo) {
        query = query.lte('transaction_date', memoizedFilters.dateTo)
      }
      
      if (memoizedFilters.createdBy) {
        query = query.eq('created_by', memoizedFilters.createdBy)
      }

      // Paginação
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data, count, error } = await query
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      return {
        transactions: data as Transaction[],
        total: count || 0,
        totalPages: Math.ceil((count || 0) / ITEMS_PER_PAGE)
      }
    },
    enabled: !!profile?.couple_id,
    staleTime: 30 * 1000, // 30 segundos para lista de transações
    keepPreviousData: true, // Manter dados anteriores durante loading
  })

  // Query para resumo das transações
  const { data: summary } = useQuery({
    queryKey: queryKeys.transactionsSummary({ 
      ...memoizedFilters,
      coupleId: profile?.couple_id 
    }),
    queryFn: async () => {
      if (!profile?.couple_id) throw new Error('No couple ID')

      let query = supabase
        .from('transactions')
        .select('amount, type')
        .eq('couple_id', profile.couple_id)

      // Aplicar os mesmos filtros
      if (memoizedFilters.search) {
        query = query.ilike('description', `%${memoizedFilters.search}%`)
      }
      
      if (memoizedFilters.category) {
        query = query.eq('category_id', memoizedFilters.category)
      }
      
      if (memoizedFilters.type) {
        query = query.eq('type', memoizedFilters.type)
      }
      
      if (memoizedFilters.dateFrom) {
        query = query.gte('transaction_date', memoizedFilters.dateFrom)
      }
      
      if (memoizedFilters.dateTo) {
        query = query.lte('transaction_date', memoizedFilters.dateTo)
      }
      
      if (memoizedFilters.createdBy) {
        query = query.eq('created_by', memoizedFilters.createdBy)
      }

      const { data } = await query

      const income = data?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) || 0
      
      const expenses = data?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) || 0

      return {
        income,
        expenses,
        balance: income - expenses,
        count: data?.length || 0
      }
    },
    enabled: !!profile?.couple_id,
    staleTime: 1 * 60 * 1000, // 1 minuto para resumo
  })

  // Mutation para criar transação com cache otimizado
  const createTransactionMutation = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transaction,
          couple_id: profile?.couple_id,
          created_by: profile?.id
        }])
        .select(`
          id,
          description,
          amount,
          type,
          date,
          created_at,
          created_by,
          categories(id, name, color),
          profiles(name)
        `)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (newTransaction) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.financialSummary(profile?.couple_id || '')
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.recentTransactions(profile?.couple_id || '')
      })

      // Atualização otimista da lista atual
      queryClient.setQueryData(
        queryKeys.transactionsList({ 
          ...memoizedFilters, 
          page: currentPage,
          coupleId: profile?.couple_id 
        }),
        (old: any) => {
          if (!old) return old
          return {
            ...old,
            transactions: [newTransaction, ...old.transactions.slice(0, ITEMS_PER_PAGE - 1)],
            total: old.total + 1
          }
        }
      )
    }
  })

  // Mutation para atualizar transação
  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select(`
          id,
          description,
          amount,
          type,
          date,
          created_at,
          created_by,
          categories(id, name, color),
          profiles(name)
        `)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (updatedTransaction) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.financialSummary(profile?.couple_id || '')
      })

      // Atualização otimista da lista atual
      queryClient.setQueryData(
        queryKeys.transactionsList({ 
          ...memoizedFilters, 
          page: currentPage,
          coupleId: profile?.couple_id 
        }),
        (old: any) => {
          if (!old) return old
          return {
            ...old,
            transactions: old.transactions.map((t: Transaction) => 
              t.id === updatedTransaction.id ? updatedTransaction : t
            )
          }
        }
      )
    }
  })

  // Mutation para deletar transação
  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) throw error
      return id
    },
    onSuccess: (deletedId) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.financialSummary(profile?.couple_id || '')
      })

      // Atualização otimista da lista atual
      queryClient.setQueryData(
        queryKeys.transactionsList({ 
          ...memoizedFilters, 
          page: currentPage,
          coupleId: profile?.couple_id 
        }),
        (old: any) => {
          if (!old) return old
          return {
            ...old,
            transactions: old.transactions.filter((t: Transaction) => t.id !== deletedId),
            total: old.total - 1
          }
        }
      )
    }
  })

  return {
    // Data
    transactions: transactionsData?.transactions || [],
    total: transactionsData?.total || 0,
    totalPages: transactionsData?.totalPages || 0,
    summary,
    
    // Loading states
    isLoading,
    isFetching,
    
    // Error
    error,
    
    // Pagination
    currentPage,
    setCurrentPage,
    
    // Filters
    filters,
    setFilters,
    
    // Mutations
    createTransaction: createTransactionMutation.mutate,
    updateTransaction: updateTransactionMutation.mutate,
    deleteTransaction: deleteTransactionMutation.mutate,
    
    // Mutation states
    isCreating: createTransactionMutation.isPending,
    isUpdating: updateTransactionMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,
    
    // Utils
    refetch: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.transactions
      })
    }
  }
}
