'use client'

import { useState } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'
import { TransactionForm } from '@/components/forms/TransactionForm'
import { BillForm } from '@/components/forms/BillForm'
import { useTransactions } from '@/hooks/useTransactions'
import { useBills } from '@/hooks/useBills'
import { TransactionFormData, BillFormData } from '@/types'

export function QuickActions() {
  const [activeModal, setActiveModal] = useState<'income' | 'expense' | 'bill' | null>(null)
  const [loading, setLoading] = useState(false)
  
  const { createTransaction } = useTransactions()
  const { createBill } = useBills()

  const handleCreateTransaction = async (data: TransactionFormData) => {
    setLoading(true)
    try {
      await createTransaction(data)
      setActiveModal(null)
      // Mostrar notificação de sucesso
      showSuccessNotification('Transação criada com sucesso!')
    } catch (err: any) {
      alert('Erro ao criar transação: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBill = async (data: BillFormData) => {
    setLoading(true)
    try {
      await createBill(data)
      setActiveModal(null)
      // Mostrar notificação de sucesso
      showSuccessNotification('Conta criada com sucesso!')
    } catch (err: any) {
      alert('Erro ao criar conta: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const showSuccessNotification = (message: string) => {
    // Criar notificação temporária
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity'
    notification.textContent = message
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.style.opacity = '0'
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  const quickActionButtons = [
    {
      id: 'income',
      title: 'Nova Receita',
      description: 'Adicionar entrada de dinheiro',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: 'bg-green-600 hover:bg-green-700 text-white',
      action: () => setActiveModal('income')
    },
    {
      id: 'expense',
      title: 'Nova Despesa',
      description: 'Registrar um gasto',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      ),
      color: 'bg-red-600 hover:bg-red-700 text-white',
      action: () => setActiveModal('expense')
    },
    {
      id: 'bill',
      title: 'Nova Conta',
      description: 'Adicionar conta a pagar',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      action: () => setActiveModal('bill')
    },
    {
      id: 'categories',
      title: 'Categorias',
      description: 'Gerenciar categorias',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      color: 'bg-purple-600 hover:bg-purple-700 text-white',
      action: () => window.location.href = '/categorias'
    }
  ]

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Ações Rápidas
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActionButtons.map((button) => (
            <button
              key={button.id}
              onClick={button.action}
              className={`p-4 rounded-lg transition-colors ${button.color} group`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-2 bg-white bg-opacity-20 rounded-full group-hover:bg-opacity-30 transition-colors">
                  {button.icon}
                </div>
                <div>
                  <h3 className="font-medium text-sm">{button.title}</h3>
                  <p className="text-xs opacity-90">{button.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modais para formulários */}
      <Modal
        isOpen={activeModal === 'income'}
        onClose={() => setActiveModal(null)}
        title="Nova Receita"
        size="lg"
      >
        <TransactionForm
          onSubmit={handleCreateTransaction}
          onCancel={() => setActiveModal(null)}
          loading={loading}
          defaultType="INCOME"
        />
      </Modal>

      <Modal
        isOpen={activeModal === 'expense'}
        onClose={() => setActiveModal(null)}
        title="Nova Despesa"
        size="lg"
      >
        <TransactionForm
          onSubmit={handleCreateTransaction}
          onCancel={() => setActiveModal(null)}
          loading={loading}
          defaultType="EXPENSE"
        />
      </Modal>

      <Modal
        isOpen={activeModal === 'bill'}
        onClose={() => setActiveModal(null)}
        title="Nova Conta a Pagar"
        size="lg"
      >
        <BillForm
          onSubmit={handleCreateBill}
          onCancel={() => setActiveModal(null)}
          loading={loading}
        />
      </Modal>
    </>
  )
}
