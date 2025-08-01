'use client'

import { useState, useEffect } from 'react'
import { Category } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { useCategorySuggestions } from '@/hooks/useCategorySuggestions'

interface CategoryStatsProps {
  category: Category
  period?: {
    startDate: string
    endDate: string
  }
}

export function CategoryStats({ category, period }: CategoryStatsProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { getCategoryStatsByPeriod } = useCategorySuggestions()

  useEffect(() => {
    loadStats()
  }, [category.id, period])

  const loadStats = async () => {
    setLoading(true)
    try {
      const currentDate = new Date()
      const startDate = period?.startDate || `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-01`
      const endDate = period?.endDate || `${currentDate.getFullYear()}-${(currentDate.getMonth() + 2).toString().padStart(2, '0')}-01`

      const categoryStats = await getCategoryStatsByPeriod(startDate, endDate)
      const categoryData = categoryStats.find(stat => stat.category.id === category.id)
      
      setStats(categoryData || {
        category,
        totalIncome: 0,
        totalExpense: 0,
        transactionCount: 0
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-sm text-gray-500">
        Erro ao carregar estatísticas
      </div>
    )
  }

  const total = stats.totalIncome + stats.totalExpense
  const hasData = stats.transactionCount > 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Estatísticas do período</h4>
        <button
          onClick={loadStats}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Atualizar
        </button>
      </div>

      {hasData ? (
        <div className="space-y-2 text-sm">
          {stats.totalIncome > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Receitas:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(stats.totalIncome)}
              </span>
            </div>
          )}
          
          {stats.totalExpense > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Despesas:</span>
              <span className="font-medium text-red-600">
                {formatCurrency(stats.totalExpense)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-600">Total movimentado:</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(total)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Transações:</span>
            <span className="font-medium text-gray-900">
              {stats.transactionCount}
            </span>
          </div>

          {/* Barra de progresso visual */}
          {stats.totalIncome > 0 && stats.totalExpense > 0 && (
            <div className="pt-2">
              <div className="text-xs text-gray-500 mb-1">Distribuição</div>
              <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="bg-green-500"
                  style={{
                    width: `${(stats.totalIncome / total) * 100}%`
                  }}
                />
                <div
                  className="bg-red-500"
                  style={{
                    width: `${(stats.totalExpense / total) * 100}%`
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Receitas ({Math.round((stats.totalIncome / total) * 100)}%)</span>
                <span>Despesas ({Math.round((stats.totalExpense / total) * 100)}%)</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-500 text-center py-4">
          Nenhuma transação encontrada neste período
        </div>
      )}
    </div>
  )
}