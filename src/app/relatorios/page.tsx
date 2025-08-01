'use client'

import { useState } from 'react'
import { useReports } from '@/hooks/useReports'
import { MonthlyChart } from '@/components/charts/MonthlyChart'
import { CategoryChart } from '@/components/charts/CategoryChart'
import { UserComparisonChart } from '@/components/charts/UserComparisonChart'
import { TrendChart } from '@/components/charts/TrendChart'
import { ReportFilters } from '@/components/forms/ReportFilters'
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout'
import { formatCurrency } from '@/lib/utils'

export default function RelatoriosPage() {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')
  const [categoryChartType, setCategoryChartType] = useState<'pie' | 'doughnut'>('doughnut')
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'trends'>('overview')
  
  const {
    loading,
    monthlyData,
    categoryData,
    userComparisonData,
    trendData,
    filters,
    updateFilters,
    exportData
  } = useReports()

  // Calcular totais do período
  const totalIncome = monthlyData.reduce((sum, month) => sum + month.income, 0)
  const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0)
  const totalBalance = totalIncome - totalExpenses

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Financeiros</h1>
          <p className="text-gray-600">Análise detalhada das suas finanças</p>
        </div>
      </div>

      {/* Filtros */}
      <ReportFilters
        filters={filters}
        onFiltersChange={updateFilters}
        onExport={exportData}
        loading={loading}
      />

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total de Receitas</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total de Despesas</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Saldo do Período</p>
              <p className={`text-2xl font-bold ${
                totalBalance >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {formatCurrency(totalBalance)}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              totalBalance >= 0 ? 'bg-blue-100' : 'bg-red-100'
            }`}>
              <svg className={`w-6 h-6 ${
                totalBalance >= 0 ? 'text-blue-600' : 'text-red-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de navegação */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'comparison'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              👥 Comparação
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trends'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📈 Tendências
            </button>
          </nav>
        </div>
      </div>

      {/* Conteúdo das tabs */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Gráfico mensal */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Evolução Mensal</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    chartType === 'bar'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Barras
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    chartType === 'line'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Linha
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <MonthlyChart data={monthlyData} type={chartType} />
            )}
          </div>

          {/* Gráfico de categorias */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Gastos por Categoria</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCategoryChartType('doughnut')}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    categoryChartType === 'doughnut'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Rosca
                </button>
                <button
                  onClick={() => setCategoryChartType('pie')}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    categoryChartType === 'pie'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Pizza
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <CategoryChart data={categoryData} type={categoryChartType} />
            )}
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Comparação por Membro do Casal</h2>
            
            {loading ? (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <UserComparisonChart 
                data={userComparisonData} 
                period={`${filters.startDate.toLocaleDateString('pt-BR')} - ${filters.endDate.toLocaleDateString('pt-BR')}`}
              />
            )}
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Análise de Tendências</h2>
            
            {loading ? (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <TrendChart 
                data={trendData} 
                title="Evolução do Saldo Mensal"
                metric="balance"
                showTrendLine={true}
              />
            )}
          </div>
        </div>
      )}

      {/* Insights */}
      {!loading && monthlyData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Insights</h3>
          <div className="space-y-3 text-sm text-gray-600">
            {totalBalance > 0 && (
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p>
                  Parabéns! Vocês tiveram um saldo positivo de {formatCurrency(totalBalance)} no período analisado.
                </p>
              </div>
            )}
            
            {categoryData.length > 0 && (
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p>
                  A categoria que mais consome o orçamento é "{categoryData[0].name}" com {formatCurrency(categoryData[0].amount)} ({categoryData[0].percentage.toFixed(1)}% do total).
                </p>
              </div>
            )}
            
            {monthlyData.length >= 2 && (
              <div className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <p>
                  {(() => {
                    const lastMonth = monthlyData[monthlyData.length - 1]
                    const previousMonth = monthlyData[monthlyData.length - 2]
                    const expenseChange = lastMonth.expenses - previousMonth.expenses
                    const changePercent = previousMonth.expenses > 0 
                      ? (expenseChange / previousMonth.expenses) * 100 
                      : 0
                    
                    if (Math.abs(changePercent) < 5) {
                      return `As despesas se mantiveram estáveis no último mês (${changePercent.toFixed(1)}% de variação).`
                    } else if (expenseChange > 0) {
                      return `As despesas aumentaram ${changePercent.toFixed(1)}% no último mês (${formatCurrency(expenseChange)} a mais).`
                    } else {
                      return `As despesas diminuíram ${Math.abs(changePercent).toFixed(1)}% no último mês (${formatCurrency(Math.abs(expenseChange))} a menos).`
                    }
                  })()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </AuthenticatedLayout>
  )
}
