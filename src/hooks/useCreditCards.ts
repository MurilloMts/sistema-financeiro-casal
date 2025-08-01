'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  CreditCard, 
  CreditCardInsert, 
  CreditCardUpdate, 
  CreditCardWithDetails,
  CreditCardExpense,
  CreditCardExpenseInsert,
  CreditCardExpenseUpdate,
  CreditCardExpenseWithDetails
} from '@/types'
import { useAuth } from './useAuth'

export function useCreditCards() {
  const [creditCards, setCreditCards] = useState<CreditCardWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, profile } = useAuth()

  // Carregar cartões de crédito
  const fetchCreditCards = async () => {
    if (!profile?.couple_id) return

    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('credit_cards')
        .select(`
          *,
          profiles(id, name, email)
        `)
        .eq('couple_id', profile.couple_id)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error

      const cardsWithDetails = (data || []).map(card => ({
        ...card,
        user: card.profiles,
      })) as CreditCardWithDetails[]

      setCreditCards(cardsWithDetails)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Criar cartão de crédito
  const createCreditCard = async (cardData: Omit<CreditCardInsert, 'user_id' | 'couple_id'>) => {
    if (!user || !profile?.couple_id) throw new Error('Usuário não autenticado')

    const { data, error } = await supabase
      .from('credit_cards')
      .insert({
        ...cardData,
        user_id: user.id,
        couple_id: profile.couple_id,
      })
      .select(`
        *,
        profiles(id, name, email)
      `)
      .single()

    if (error) throw error

    const cardWithDetails = {
      ...data,
      user: data.profiles,
    } as CreditCardWithDetails

    setCreditCards(prev => [...prev, cardWithDetails].sort((a, b) => a.name.localeCompare(b.name)))
    
    return cardWithDetails
  }

  // Atualizar cartão de crédito
  const updateCreditCard = async (id: string, updates: CreditCardUpdate) => {
    const { data, error } = await supabase
      .from('credit_cards')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        profiles(id, name, email)
      `)
      .single()

    if (error) throw error

    const cardWithDetails = {
      ...data,
      user: data.profiles,
    } as CreditCardWithDetails

    setCreditCards(prev =>
      prev.map(card => 
        card.id === id ? cardWithDetails : card
      ).sort((a, b) => a.name.localeCompare(b.name))
    )
    
    return cardWithDetails
  }

  // Excluir cartão de crédito (desativar)
  const deleteCreditCard = async (id: string) => {
    const { error } = await supabase
      .from('credit_cards')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error

    setCreditCards(prev => prev.filter(card => card.id !== id))
  }

  // Atualizar saldo do cartão
  const updateCardBalance = async (id: string, newBalance: number) => {
    return await updateCreditCard(id, { current_balance: newBalance })
  }

  // Obter estatísticas dos cartões
  const getCreditCardsStats = () => {
    const stats = creditCards.reduce(
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

    stats.averageUsage = stats.totalLimit > 0 ? (stats.totalUsed / stats.totalLimit) * 100 : 0

    return stats
  }

  useEffect(() => {
    if (profile?.couple_id) {
      fetchCreditCards()
    }
  }, [profile?.couple_id])

  // Configurar real-time subscription
  useEffect(() => {
    if (!profile?.couple_id) return

    const subscription = supabase
      .channel('credit-cards-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credit_cards',
          filter: `couple_id=eq.${profile.couple_id}`,
        },
        () => {
          fetchCreditCards()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [profile?.couple_id])

  return {
    creditCards,
    loading,
    error,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    updateCardBalance,
    getCreditCardsStats,
    refetch: fetchCreditCards,
  }
}
