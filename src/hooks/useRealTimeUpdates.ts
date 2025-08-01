'use client'

import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

interface RealTimeUpdateCallbacks {
  onTransactionChange?: () => void
  onBillChange?: () => void
  onCategoryChange?: () => void
  onProfileChange?: () => void
}

export function useRealTimeUpdates(callbacks: RealTimeUpdateCallbacks) {
  const { profile } = useAuth()

  const setupRealtimeSubscriptions = useCallback(() => {
    if (!profile?.couple_id) return

    const subscriptions: any[] = []

    // Subscription para transações
    if (callbacks.onTransactionChange) {
      const transactionSubscription = supabase
        .channel('transactions-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transactions',
            filter: `couple_id=eq.${profile.couple_id}`,
          },
          (payload) => {
            callbacks.onTransactionChange?.()
          }
        )
        .subscribe()

      subscriptions.push(transactionSubscription)
    }

    // Subscription para contas
    if (callbacks.onBillChange) {
      const billSubscription = supabase
        .channel('bills-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bills',
            filter: `couple_id=eq.${profile.couple_id}`,
          },
          (payload) => {
            callbacks.onBillChange?.()
          }
        )
        .subscribe()

      subscriptions.push(billSubscription)
    }

    // Subscription para categorias
    if (callbacks.onCategoryChange) {
      const categorySubscription = supabase
        .channel('categories-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'categories',
            filter: `couple_id=eq.${profile.couple_id}`,
          },
          (payload) => {
            callbacks.onCategoryChange?.()
          }
        )
        .subscribe()

      subscriptions.push(categorySubscription)
    }

    // Subscription para perfis (mudanças no casal)
    if (callbacks.onProfileChange) {
      const profileSubscription = supabase
        .channel('profiles-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `couple_id=eq.${profile.couple_id}`,
          },
          (payload) => {
            callbacks.onProfileChange?.()
          }
        )
        .subscribe()

      subscriptions.push(profileSubscription)
    }

    return () => {
      subscriptions.forEach(subscription => {
        subscription.unsubscribe()
      })
    }
  }, [profile?.couple_id, callbacks])

  useEffect(() => {
    const cleanup = setupRealtimeSubscriptions()
    return cleanup
  }, [setupRealtimeSubscriptions])

  // Função para mostrar notificação de mudança
  const showChangeNotification = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    // Verificar se o usuário quer receber notificações
    const showNotifications = localStorage.getItem('show-realtime-notifications') !== 'false'
    if (!showNotifications) return

    const colors = {
      info: 'bg-blue-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500'
    }

    const notification = document.createElement('div')
    notification.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all transform translate-y-0 opacity-100`
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span class="text-sm">${message}</span>
        <button class="ml-2 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `
    
    document.body.appendChild(notification)
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.transform = 'translateY(100%)'
        notification.style.opacity = '0'
        setTimeout(() => {
          if (notification.parentElement) {
            document.body.removeChild(notification)
          }
        }, 300)
      }
    }, 5000)
  }, [])

  // Funções de conveniência para notificações específicas
  const notifyTransactionChange = useCallback(() => {
    showChangeNotification('Dados financeiros atualizados', 'info')
  }, [showChangeNotification])

  const notifyBillChange = useCallback(() => {
    showChangeNotification('Contas atualizadas', 'info')
  }, [showChangeNotification])

  const notifyCategoryChange = useCallback(() => {
    showChangeNotification('Categorias atualizadas', 'info')
  }, [showChangeNotification])

  const notifyProfileChange = useCallback(() => {
    showChangeNotification('Informações do casal atualizadas', 'info')
  }, [showChangeNotification])

  return {
    showChangeNotification,
    notifyTransactionChange,
    notifyBillChange,
    notifyCategoryChange,
    notifyProfileChange,
  }
}

// Hook específico para o dashboard
export function useDashboardRealTime(onDataChange: () => void) {
  const { showChangeNotification } = useRealTimeUpdates({
    onTransactionChange: () => {
      onDataChange()
      showChangeNotification('Transações atualizadas pelo seu parceiro(a)', 'info')
    },
    onBillChange: () => {
      onDataChange()
      showChangeNotification('Contas atualizadas pelo seu parceiro(a)', 'info')
    },
    onCategoryChange: () => {
      onDataChange()
      showChangeNotification('Categorias atualizadas pelo seu parceiro(a)', 'info')
    }
  })

  return { showChangeNotification }
}