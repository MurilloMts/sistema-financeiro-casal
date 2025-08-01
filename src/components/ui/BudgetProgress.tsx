'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/lib/utils'

interface BudgetProgressProps {
  budgetId: string
  month: number
  year: number
}

interface CategoryProgress {
  category_id: string
  category_name: string
  category_color: string
  budgeted_amount: number
  spent_amount: number
  percentage: number
  status: 'under' | 'near' | 'over'
}

interface BudgetSummary {
  total_budgeted: number
  total_spent: number
  categories: CategoryProgress[]
}

export function BudgetProgress({ budgetId, month, year }: BudgetProgressProps) {
  const [budgetData, setBudgetData] = useState<BudgetSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()

  useEffect(() => {
    const fetchBudgetProgress = async () => {
      if (!profile?.couple_id) return

      setLoading(true)
      try {
        // Buscar dados do orçamento
        const { data: budgetItems } = await supabase
          .from('budget_items')
          .select(`
            category_id,
            amount,
            categories(name, color)
          `)
          .eq('budget_id', budgetId)

        if (!budgetItems) {
          setLoading(false)
          return
        }

        // Buscar gastos do mês por categoria
        const startDate = new Date(year, month - 1, 1).toISOString()
        const endDate = new Date(year, month, 0, 23, 59, 59).toISOString()

        const { data: expenses } = await supabase
          .from('transactions')
          .select('category_id, amount')
          .eq('couple_id', profile.couple_id)
          .eq('type', 'expense')
          .gte('date', startDate)
          .lte('date', endDate)

        // Processar dados
        const categoryProgress: CategoryProgress[] = budgetItems.map(item => {
          const categoryExpenses = expenses?.filter(exp => exp.category_id === item.category_id) || []
          const spentAmount = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)
          const percentage = item.amount > 0 ? (spentAmount / item.amount) * 100 : 0
          
          let status: 'under' | 'near' | 'over' = 'under'
          if (percentage >= 100) status = 'over'
          else if (percentage >= 80) status = 'near'

          return {
            category_id: item.category_id,
            category_name: (item.categories as any).name,
            category_color: (item.categories as any).color,
            budgeted_amount: item.amount,
            spent_amount: spentAmount,
            percentage,
            status
          }
        })

        const totalBudgeted = budgetItems.reduce((sum, item) => sum + item.amount, 0)
        const totalSpent = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0

        setBudgetData({
          total_budgeted: totalBudgeted,
          total_spent: totalSpent,
          categories: categoryProgress
        })
      } catch (error) {
        console.error('Erro ao buscar progresso do orçamento:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBudgetProgress()
  }, [budgetId, month, year, profile?.couple_id])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!budgetData) {
    return (
      <div className="text-center text-gray-500 py-8">
        Nenhum dado de orçamento encontrado
      </div>
    )
  }

  const overallPercentage = budgetData.total_budgeted > 0 
    ? (budgetData.total_spent / budgetData.total_budgeted) * 100 
    : 0

  return (
    <div className="space-y-6">
      {/* Resumo geral */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Resumo do Orçamento
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(budgetData.total_budgeted)}
            </div>
            <div className="text-sm text-gray-500">Orçado</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(budgetData.total_spent)}
            </div>
            <div className="text-sm text-gray-500">Gasto</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              budgetData.total_spent <= budgetData.total_budgeted 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {formatCurrency(budgetData.total_budgeted - budgetData.total_spent)}
            </div>
            <div className="text-sm text-gray-500">
              {budgetData.total_spent <= budgetData.total_budgeted ? 'Restante' : 'Excedido'}
            </div>
          </div>
        </div>

        {/* Barra de progresso geral */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progresso geral</span>
            <span className={`font-medium ${
              overallPercentage <= 100 ? 'text-gray-900' : 'text-red-600'
            }`}>
              {overallPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all ${
                overallPercentage <= 80 ? 'bg-green-500' :
                overallPercentage <= 100 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Progresso por categoria */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Progresso por Categoria
        </h3>
        
        <div className="space-y-4">
          {budgetData.categories.map((category) => (
            <div key={category.category_id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.category_color }}
                  />
                  <span className="font-medium text-gray-900">
                    {category.category_name}
                  </span>
                  {category.status === 'over' && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Excedido
                    </span>
                  )}
                  {category.status === 'near' && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      Próximo do limite
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(category.spent_amount)} / {formatCurrency(category.budgeted_amount)}
                  </div>
                  <div className={`text-xs ${
                    category.status === 'over' ? 'text-red-600' :
                    category.status === 'near' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {category.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    category.status === 'over' ? 'bg-red-500' :
                    category.status === 'near' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(category.percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alertas */}
      {budgetData.categories.some(cat => cat.status !== 'under') && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Alertas de Orçamento
          </h3>
          
          <div className="space-y-3">
            {budgetData.categories
              .filter(cat => cat.status !== 'under')
              .map((category) => (
                <div 
                  key={category.category_id}
                  className={`p-3 rounded-lg border-l-4 ${
                    category.status === 'over' 
                      ? 'bg-red-50 border-red-400' 
                      : 'bg-yellow-50 border-yellow-400'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className={`font-medium ${
                        category.status === 'over' ? 'text-red-800' : 'text-yellow-800'
                      }`}>
                        {category.category_name}
                      </div>
                      <div className={`text-sm ${
                        category.status === 'over' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {category.status === 'over' 
                          ? `Excedeu o orçamento em ${formatCurrency(category.spent_amount - category.budgeted_amount)}`
                          : `Próximo do limite (${category.percentage.toFixed(1)}%)`
                        }
                      </div>
                    </div>
                    <div className={`text-sm font-medium ${
                      category.status === 'over' ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {formatCurrency(category.spent_amount)} / {formatCurrency(category.budgeted_amount)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
