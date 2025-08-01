'use client'

import { useDashboard } from '@/hooks/useDashboard'
import { formatCurrency } from '@/lib/utils'

export function DashboardCards() {
  const { stats, loading, error } = useDashboard()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-red-500 text-center">Erro ao carregar dados: {error}</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500 text-center">Nenhum dado disponível</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Cards do Mês Atual */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Mês Atual</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card de Receitas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Receitas do Mês</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.currentMonth.totalIncome)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.currentMonth.transactionCount} transações
                </p>
              </div>
            </div>
          </div>

          {/* Card de Despesas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Despesas do Mês</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.currentMonth.totalExpenses)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Este mês
                </p>
              </div>
            </div>
          </div>

          {/* Card de Saldo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stats.currentMonth.balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'
                }`}>
                  <svg className={`w-4 h-4 ${
                    stats.currentMonth.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Saldo do Mês</p>
                <p className={`text-2xl font-bold ${
                  stats.currentMonth.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  {formatCurrency(stats.currentMonth.balance)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.currentMonth.balance >= 0 ? 'Positivo' : 'Negativo'}
                </p>
              </div>
            </div>
          </div>

          {/* Card de Contas Pendentes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  (stats.bills?.overdueCount || 0) > 0 ? 'bg-red-100' : 
                  (stats.bills?.totalPending || 0) > 0 ? 'bg-yellow-100' : 'bg-green-100'
                }`}>
                  <svg className={`w-4 h-4 ${
                    (stats.bills?.overdueCount || 0) > 0 ? 'text-red-600' : 
                    (stats.bills?.totalPending || 0) > 0 ? 'text-yellow-600' : 'text-green-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">Contas Pendentes</p>
                <div className="flex items-baseline space-x-2">
                  <p className={`text-2xl font-bold ${
                    (stats.bills?.overdueCount || 0) > 0 ? 'text-red-600' : 
                    (stats.bills?.totalPending || 0) > 0 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {stats.bills?.totalPending || 0}
                  </p>
                  {(stats.bills?.overdueCount || 0) > 0 && (
                    <span className="text-sm text-red-600 font-medium">
                      ({stats.bills.overdueCount} vencidas)
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatCurrency(stats.bills?.pendingAmount || 0)} total
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Previsão do Próximo Mês */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Previsão Próximo Mês</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card de Receitas Previstas */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-green-700">Receitas Previstas</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency(stats.nextMonth.projectedIncome)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Baseado na média dos últimos meses
                </p>
              </div>
            </div>
          </div>

          {/* Card de Despesas Previstas */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg shadow-sm border border-red-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-red-700">Despesas Previstas</p>
                <p className="text-2xl font-bold text-red-800">
                  {formatCurrency(stats.nextMonth.projectedExpenses)}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Inclui {stats.nextMonth.upcomingBills} contas do próximo mês
                </p>
              </div>
            </div>
          </div>

          {/* Card de Saldo Previsto */}
          <div className={`bg-gradient-to-br rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${
            stats.nextMonth.projectedBalance >= 0 
              ? 'from-blue-50 to-blue-100 border-blue-200' 
              : 'from-orange-50 to-orange-100 border-orange-200'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stats.nextMonth.projectedBalance >= 0 ? 'bg-blue-200' : 'bg-orange-200'
                }`}>
                  <svg className={`w-4 h-4 ${
                    stats.nextMonth.projectedBalance >= 0 ? 'text-blue-700' : 'text-orange-700'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className={`text-sm font-medium ${
                  stats.nextMonth.projectedBalance >= 0 ? 'text-blue-700' : 'text-orange-700'
                }`}>
                  Saldo Previsto
                </p>
                <p className={`text-2xl font-bold ${
                  stats.nextMonth.projectedBalance >= 0 ? 'text-blue-800' : 'text-orange-800'
                }`}>
                  {formatCurrency(stats.nextMonth.projectedBalance)}
                </p>
                <p className={`text-xs mt-1 ${
                  stats.nextMonth.projectedBalance >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  {stats.nextMonth.projectedBalance >= 0 ? 'Previsão positiva' : 'Atenção: previsão negativa'}
                </p>
              </div>
            </div>
          </div>

          {/* Card de Contas a Pagar Próximo Mês */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-1 12a2 2 0 002 2h6a2 2 0 002-2L16 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-purple-700">Contas a Pagar</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-2xl font-bold text-purple-800">
                    {stats.nextMonth.upcomingBills}
                  </p>
                  <span className="text-sm text-purple-600 font-medium">
                    contas
                  </span>
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  {formatCurrency(stats.nextMonth.upcomingBillsAmount)} total
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards dos Cartões de Crédito */}
      {stats.creditCards && stats.creditCards.totalCards > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Cartões de Crédito</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card de Total de Cartões */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Total de Cartões</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.creditCards.totalCards}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    cartões ativos
                  </p>
                </div>
              </div>
            </div>

            {/* Card de Limite Total */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Limite Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.creditCards.totalLimit)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    disponível
                  </p>
                </div>
              </div>
            </div>

            {/* Card de Total Usado */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    stats.creditCards.averageUsage >= 80 ? 'bg-red-100' : 
                    stats.creditCards.averageUsage >= 60 ? 'bg-yellow-100' : 'bg-blue-100'
                  }`}>
                    <svg className={`w-4 h-4 ${
                      stats.creditCards.averageUsage >= 80 ? 'text-red-600' : 
                      stats.creditCards.averageUsage >= 60 ? 'text-yellow-600' : 'text-blue-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Usado</p>
                  <p className={`text-2xl font-bold ${
                    stats.creditCards.averageUsage >= 80 ? 'text-red-600' : 
                    stats.creditCards.averageUsage >= 60 ? 'text-yellow-600' : 'text-blue-600'
                  }`}>
                    {formatCurrency(stats.creditCards.totalUsed)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats.creditCards.averageUsage.toFixed(1)}% do limite
                  </p>
                </div>
              </div>
            </div>

            {/* Card de Cartões Próximos do Limite */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    stats.creditCards.cardsNearLimit > 0 ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    <svg className={`w-4 h-4 ${
                      stats.creditCards.cardsNearLimit > 0 ? 'text-red-600' : 'text-green-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">Próximo do Limite</p>
                  <p className={`text-2xl font-bold ${
                    stats.creditCards.cardsNearLimit > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {stats.creditCards.cardsNearLimit}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats.creditCards.cardsNearLimit > 0 ? 'cartões acima de 80%' : 'todos dentro do limite'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
