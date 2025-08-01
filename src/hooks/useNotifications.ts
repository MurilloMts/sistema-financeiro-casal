'use client'

import { useState, useEffect, useCallback } from 'react'
import { useBills } from './useBills'

interface Notification {
  id: string
  type: 'bill_due_today' | 'bill_due_tomorrow' | 'bill_overdue' | 'bill_due_soon'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  timestamp: Date
  read: boolean
  data?: any
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { getUpcomingBills, getOverdueBills } = useBills()

  // Gerar notificações baseadas nas contas
  const generateBillNotifications = useCallback(async () => {
    try {
      const [upcomingBills, overdueBills] = await Promise.all([
        getUpcomingBills(15),
        getOverdueBills()
      ])

      const newNotifications: Notification[] = []

      // Contas vencidas
      overdueBills.forEach((bill) => {
        const daysOverdue = Math.abs(bill.days_until_due)
        newNotifications.push({
          id: `overdue-${bill.id}`,
          type: 'bill_overdue',
          title: 'Conta Vencida',
          message: `${bill.title} está ${daysOverdue} dia${daysOverdue > 1 ? 's' : ''} em atraso`,
          priority: 'urgent',
          timestamp: new Date(),
          read: false,
          data: bill
        })
      })

      // Contas que vencem hoje
      const dueTodayBills = upcomingBills.filter(bill => bill.days_until_due === 0)
      dueTodayBills.forEach((bill) => {
        newNotifications.push({
          id: `due-today-${bill.id}`,
          type: 'bill_due_today',
          title: 'Conta Vence Hoje',
          message: `${bill.title} vence hoje`,
          priority: 'high',
          timestamp: new Date(),
          read: false,
          data: bill
        })
      })

      // Contas que vencem amanhã
      const dueTomorrowBills = upcomingBills.filter(bill => bill.days_until_due === 1)
      dueTomorrowBills.forEach((bill) => {
        newNotifications.push({
          id: `due-tomorrow-${bill.id}`,
          type: 'bill_due_tomorrow',
          title: 'Conta Vence Amanhã',
          message: `${bill.title} vence amanhã`,
          priority: 'medium',
          timestamp: new Date(),
          read: false,
          data: bill
        })
      })

      // Contas que vencem em breve (2-7 dias)
      const dueSoonBills = upcomingBills.filter(bill => 
        bill.days_until_due >= 2 && bill.days_until_due <= 7
      )
      dueSoonBills.forEach((bill) => {
        newNotifications.push({
          id: `due-soon-${bill.id}`,
          type: 'bill_due_soon',
          title: 'Conta Vence em Breve',
          message: `${bill.title} vence em ${bill.days_until_due} dias`,
          priority: 'low',
          timestamp: new Date(),
          read: false,
          data: bill
        })
      })

      // Atualizar notificações (evitar duplicatas)
      setNotifications(prev => {
        const existingIds = prev.map(n => n.id)
        const filteredNew = newNotifications.filter(n => !existingIds.includes(n.id))
        return [...prev, ...filteredNew].sort((a, b) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        )
      })

    } catch (error) {
      console.error('Erro ao gerar notificações:', error)
    }
  }, [getUpcomingBills, getOverdueBills])

  // Marcar notificação como lida
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
  }, [])

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }, [])

  // Remover notificação
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    )
  }, [])

  // Limpar todas as notificações
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Obter notificações por prioridade
  const getNotificationsByPriority = useCallback((priority: Notification['priority']) => {
    return notifications.filter(n => n.priority === priority)
  }, [notifications])

  // Obter notificações não lidas
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read)
  }, [notifications])

  // Solicitar permissão para notificações do browser
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }, [])

  // Enviar notificação do browser
  const sendBrowserNotification = useCallback((notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent'
      })

      browserNotification.onclick = () => {
        window.focus()
        markAsRead(notification.id)
        browserNotification.close()
        
        // Navegar para a página de contas se for uma notificação de conta
        if (notification.type.startsWith('bill_')) {
          window.location.href = '/contas'
        }
      }

      // Auto-fechar após 5 segundos (exceto urgentes)
      if (notification.priority !== 'urgent') {
        setTimeout(() => {
          browserNotification.close()
        }, 5000)
      }
    }
  }, [markAsRead])

  // Atualizar contador de não lidas
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length
    setUnreadCount(unread)
  }, [notifications])

  // Gerar notificações periodicamente
  useEffect(() => {
    generateBillNotifications()
    
    // Atualizar a cada 30 minutos
    const interval = setInterval(generateBillNotifications, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, []) // Remove generateBillNotifications from dependencies

  // Enviar notificações do browser para novas notificações urgentes
  useEffect(() => {
    const urgentNotifications = notifications.filter(n => 
      !n.read && (n.priority === 'urgent' || n.priority === 'high')
    )
    
    urgentNotifications.forEach(notification => {
      // Verificar se já foi enviada (usando localStorage para persistir)
      const sentKey = `notification-sent-${notification.id}`
      if (!localStorage.getItem(sentKey)) {
        sendBrowserNotification(notification)
        localStorage.setItem(sentKey, 'true')
      }
    })
  }, [notifications, sendBrowserNotification])

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getNotificationsByPriority,
    getUnreadNotifications,
    requestNotificationPermission,
    generateBillNotifications,
  }
}
