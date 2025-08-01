'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/lib/utils'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface BudgetAdherenceReportProps {
  budgetId: string
  month: number
  year: number
}

interface AdherenceData {
  category_name: string
  category_color: string
  budgeted: number
  spent: number
  adherence: number
  variance: number
}

interface MonthlyComparison {
  month: string
  budgeted: number
  spent: number
  adherence: number
}

export function BudgetAdherenceReport({ budgetId, month, year }: BudgetAdherenceReportProps) {
  const [adherenceData, setAdherenceData] = useState<AdherenceData[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyComparison[]>([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()

  useEffect(() => {
    const fetchAdherenceData = async () => {
      if (!profile?.couple_id) return

      setLoading(true)
      try {
        // Buscar dados do orçamento atual
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

        // Buscar gastos do mês atual
        const startDate = new Date(year, month - 1, 1).toISOString()
        const endDate = new Date(year, month, 0, 23, 59, 59).toISOString()

        const { data: currentExpenses } = await supabase
          .from('transactions')
          .select('category_id, amount')
          .eq('couple_id', profile.couple_id)
          .eq('type', 'expense')
          .gte('date', startDate)
          .lte('date', endDate)

        // Processar dados de aderência
        const adherence: AdherenceData[] = budgetItems.map(item => {
          const categoryExpenses = currentExpenses?.filter(exp => exp.category_id === item.category_id) || []
          const spent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)
          const adherencePercentage = item.amount > 0 ? Math.min((spent / item.amount) * 100, 100) : 0
          const variance = spent - item.amount

          return {
            category_name: (item.categories as any).name,
            category_color: (item.categories as any).color,
            budgeted: item.amount,
            spent,
            adherence: adherencePercentage,
            variance
          }
        })

        setAdherenceData(adherence)

        // Buscar dados dos últimos 6 meses para comparação
        const monthlyComparisons: MonthlyComparison[] = []
        
        for (let i = 5; i >= 0; i--) {
          const compareDate = new Date(year, month - 1 - i, 1)
          const compareMonth = compareDate.getMonth() + 1
          const compareYear = compareDate.getFullYear()
          
          const monthStart = new Date(compareYear, compareMonth - 1, 1).toISOString()
          const monthEnd = new Date(compareYear, compareMonth, 0, 23, 59, 59).toISOString()

          // Buscar orçamento do mês
          const { data: monthBudget } = await supabase
            .from('budgets')
            .select(`
              budget_items(amount)
            `)
            .eq('couple_id', profile.couple_id)
            .eq('month', compareMonth)
            .eq('year', compareYear)
            .single()

          // Buscar gastos do mês
          const { data: monthExpenses } = await supabase
            .from('transactions')
            .select('amount')
            .eq('couple_id', profile.couple_id)
            .eq('type', 'expense')
            .gte('date', monthStart)
            .lte('date', monthEnd)

          const totalBudgeted = monthBudget?.budget_items?.reduce((sum: number, item: any) => sum + item.amount, 0) || 0
          const totalSpent = monthExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0
          const adherencePercentage = totalBudgeted > 0 ? Math.min((totalSpent / totalBudgeted) * 100, 100) : 0

          monthlyComparisons.push({
            month: compareDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
            budgeted: totalBudgeted,
            spent: totalSpent,
            adherence: adherencePercentage
          })
        }

        setMonthlyData(monthlyComparisons)
      } catch (error) {
        console.error('Erro ao buscar dados de aderência:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdherenceData()
  }, [budgetId, month, year, profile?.couple_id])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  // Dados para o gráfico de comparação mensal
  const chartData = {
    labels: monthlyData.map(data => data.month),
    datasets: [
      {
        label: 'Orçado',
        data: monthlyData.map(data => data.budgeted),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Gasto',
        data: monthlyData.map(data => data.spent),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Evolução Orçamento vs Gastos (Últimos 6 meses)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value)
          }
        }
      }
    }
  }

  // Calcular estatísticas gerais
  const totalBudgeted = adherenceData.reduce((sum, item) => sum + item.budgeted, 0)
  const totalSpent = adherenceData.reduce((sum, item) => sum + item.spent, 0)
  const overallAdherence = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0
  const categoriesOverBudget = adherenceData.filter(item => item.spent > item.budgeted).length
  const categoriesUnderBudget = adherenceData.filter(item => item.spent <= item.budgeted).length

  return (
    <div className="space-y-6">
      {/* Estatísticas gerais */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Relatório de Aderência ao Orçamento
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {overallAdherence.toFixed(1)}%
            </div>
            <div className="text-sm text-blue-800">Aderência Geral</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {categoriesUnderBudget}
            </div>
            <div className="text-sm text-green-800">Categorias no Orçamento</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {categoriesOverBudget}
            </div>
            <div className="text-sm text-red-800">Categorias Excedidas</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">
              {formatCurrency(totalBudgeted - totalSpent)}
            </div>
            <div className="text-sm text-gray-800">
              {totalSpent <= totalBudgeted ? 'Economia' : 'Excesso'}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de evolução mensal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Detalhamento por categoria */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Aderência por Categoria
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orçado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gasto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aderência
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adherenceData
                .sort((a, b) => b.adherence - a.adherence)
                .map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: item.category_color }}
                        />
                        <div className="text-sm font-medium text-gray-900">
                          {item.category_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.budgeted)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.spent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              item.adherence <= 80 ? 'bg-green-500' :
                              item.adherence <= 100 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(item.adherence, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-900">
                          {item.adherence.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        item.variance <= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.variance > 0 ? '+' : ''}{formatCurrency(item.variance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.spent <= item.budgeted * 0.8 
                          ? 'bg-green-100 text-green-800'
                          : item.spent <= item.budgeted
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.spent <= item.budgeted * 0.8 
                          ? 'Excelente'
                          : item.spent <= item.budgeted
                          ? 'No limite'
                          : 'Excedido'
                        }
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recomendações */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Recomendações
        </h3>
        
        <div className="space-y-3">
          {overallAdherence > 100 && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded">
              <div className="flex">
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-red-800">
                    Orçamento excedido
                  </h4>
                  <p className="text-sm text-red-700">
                    Você gastou {formatCurrency(totalSpent - totalBudgeted)} a mais que o planejado. 
                    Considere revisar suas categorias de maior gasto.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {categoriesOverBudget > 0 && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <div className="flex">
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">
                    Categorias com excesso
                  </h4>
                  <p className="text-sm text-yellow-700">
                    {categoriesOverBudget} categoria(s) excederam o orçamento. 
                    Foque em controlar os gastos nessas áreas no próximo mês.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {overallAdherence <= 80 && (
            <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded">
              <div className="flex">
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-green-800">
                    Excelente controle!
                  </h4>
                  <p className="text-sm text-green-700">
                    Você está gastando bem menos que o orçado. 
                    Considere aumentar sua reserva de emergência ou investimentos.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
