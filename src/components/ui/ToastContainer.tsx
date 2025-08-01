'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { Toast, ToastProps } from './Toast'

interface ToastContextType {
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void
  removeToast: (id: string) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: removeToast,
    }
    setToasts(prev => [...prev, newToast])
  }, [removeToast])

  const success = useCallback((message: string, title?: string) => {
    addToast({ message, title, type: 'success' })
  }, [addToast])

  const error = useCallback((message: string, title?: string) => {
    addToast({ message, title, type: 'error' })
  }, [addToast])

  const warning = useCallback((message: string, title?: string) => {
    addToast({ message, title, type: 'warning' })
  }, [addToast])

  const info = useCallback((message: string, title?: string) => {
    addToast({ message, title, type: 'info' })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}