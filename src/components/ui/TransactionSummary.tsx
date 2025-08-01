'use client'

import { TransactionWithDetails } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface TransactionSummaryProps {
  transactions: TransactionWithDetails[]
  loading?: boolean
}

export function TransactionSummary({ transactions, loading }: TransactionSummaryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const incomeTransactions = transactions.filter(t => t.type === 'INCOME')
  const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE')

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpenses
  const totalTransactions = transactions.length

  const averageIncome = incomeTransactions.length > 0 ? totalIncome / incomeTransactions.length : 0
  const averageExpense = expenseTransactions.length > 0 ? totalExpenses / expenseTransactions.length : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Total de Receitas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Receitas</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-gray-400">{incomeTransactions.length} transações</p>
          </div>
        </div>
      </div>

      {/* Total de Despesas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Despesas</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-gray-400">{expenseTransactions.length} transações</p>
          </div>
        </div>
      </div>

      {/* Saldo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'
            }`}>
              <svg className={`w-4 h-4 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Saldo</p>
            <p className={`text-lg font-bold ${
              balance >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`}>
              {formatCurrency(balance)}
            </p>
            <p className="text-xs text-gray-400">
              {balance >= 0 ? 'Positivo' : 'Negativo'}
            </p>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900">{totalTransactions}</p>
            <p className="text-xs text-gray-400">transações</p>
          </div>
        </div>
      </div>
    </div>
  )
}
