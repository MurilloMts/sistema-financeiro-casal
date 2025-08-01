'use client'

import { useBudgets } from '@/hooks/useBudgets'
import { BudgetWithCategories } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface BudgetAdherenceProps {
  budget?: BudgetWithCategories
  showComparison?: boolean
}

export function BudgetAdherence({ budget, showComparison = true }: BudgetAdherenceProps) {
  const { budgets, getCurrentMonthBudget } = useBudgets()
  
  const currentBudget = budget || getCurrentMonthBudget()
  
  if (!currentBudget) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Aderência ao Orçamento</h3>
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum orçamento ativo</h3>
          <p className="mt-1 text-sm text-gray-500">
            Crie um orçamento para acompanhar sua aderência.
          </p>
        </div>
      </div>
    )
  }

  const totalSpent = currentBudget.categories.reduce((sum, cat) => sum + (cat.spent_amount || 0), 0)
  const totalPlanned = currentBudget.total_planned
  const adherencePercentage = totalPlanned > 0 ? Math.min((totalSpent / totalPlanned) * 100, 100) : 0
  const isOverBudget = totalSpent > totalPlanned

  // Calcular aderência por categoria
  const categoryAdherence = currentBudget.categories.map(budgetCategory => {
    const spent = budgetCategory.spent_amount || 0
    const planned = budgetCategory.planned_amount
    const percentage = planned > 0 ? (spent / planned) * 100 : 0
    
    return {
      ...budgetCategory,
      adherencePercentage: Math.min(percentage, 100),
      isOverBudget: spent > planned,
      variance: spent - planned,
      variancePercentage: planned > 0 ? ((spent - planned) / planned) * 100 : 0
    }
  }).sort((a, b) => b.adherencePercentage - a.adherencePercentage)

  // Estatísticas gerais
  const categoriesOverBudget = categoryAdherence.filter(cat => cat.isOverBudget).length
  const categoriesOnTrack = categoryAdherence.filter(cat => !cat.isOverBudget && cat.adherencePercentage <= 80).length
  const categoriesAtRisk = categoryAdherence.filter(cat => !cat.isOverBudget && cat.adherencePercentage > 80).length

  // Comparação com mês anterior (se disponível)
  let previousMonthComparison = null
  if (showComparison) {
    const previousMonth = currentBudget.month === 1 ? 12 : currentBudget.month - 1
    const previousYear = currentBudget.month === 1 ? currentBudget.year - 1 : currentBudget.year
    
    const previousBudget = budgets.find(b => b.month === previousMonth && b.year === previousYear)
    if (previousBudget) {
      const prevTotalSpent = previousBudget.categories.reduce((sum, cat) => sum + (cat.spent_amount || 0), 0)
      const prevAdherence = previousBudget.total_planned > 0 ? (prevTotalSpent / previousBudget.total_planned) * 100 : 0
      
      previousMonthComparison = {
        adherence: prevAdherence,
        difference: adherencePercentage - prevAdherence,
        isImprovement: adherencePercentage < prevAdherence
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Aderência ao Orçamento</h3>
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
          isOverBudget ? 'bg-red-100 text-red-800' :
          adherencePercentage > 80 ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {adherencePercentage.toFixed(1)}%
        </span>
      </div>

      {/* Resumo geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {adherencePercentage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500">Aderência Geral</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {categoriesOnTrack}
          </div>
          <div className="text-sm text-gray-500">No Controle</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {categoriesAtRisk}
          </div>
          <div className="text-sm text-gray-500">Em Risco</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {categoriesOverBudget}
          </div>
          <div className="text-sm text-gray-500">Excedidas</div>
        </div>
      </div>

      {/* Comparação com mês anterior */}
      {previousMonthComparison && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Comparação com mês anterior:
            </span>
            <div className={`flex items-center space-x-1 text-sm font-medium ${
              previousMonthComparison.isImprovement ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>
                {previousMonthComparison.isImprovement ? '↓' : '↑'} 
                {Math.abs(previousMonthComparison.difference).toFixed(1)}%
              </span>
              <span>
                {previousMonthComparison.isImprovement ? 'Melhor' : 'Pior'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Aderência por categoria */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Aderência por Categoria</h4>
        
        <div className="space-y-3">
          {categoryAdherence.map((category) => (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.category?.color || '#6B7280' }}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {category.category?.name}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-gray-600">
                    {formatCurrency(category.spent_amount || 0)} / {formatCurrency(category.planned_amount)}
                  </span>
                  <span className={`font-medium ${
                    category.isOverBudget ? 'text-red-600' :
                    category.adherencePercentage > 80 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {category.adherencePercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    category.isOverBudget ? 'bg-red-500' :
                    category.adherencePercentage > 80 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${category.adherencePercentage}%` }}
                />
              </div>
              
              {category.variance !== 0 && (
                <div className={`text-xs ${
                  category.variance > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {category.variance > 0 ? '+' : ''}{formatCurrency(category.variance)} 
                  ({category.variancePercentage > 0 ? '+' : ''}{category.variancePercentage.toFixed(1)}%)
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Insights e recomendações */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-900 mb-2">💡 Insights</h5>
        <div className="space-y-1 text-sm text-blue-800">
          {isOverBudget ? (
            <p>• Orçamento excedido em {formatCurrency(totalSpent - totalPlanned)}. Considere revisar os gastos.</p>
          ) : adherencePercentage > 80 ? (
            <p>• Você está próximo do limite do orçamento. Monitore os gastos restantes do mês.</p>
          ) : (
            <p>• Orçamento sob controle! Continue mantendo os gastos dentro do planejado.</p>
          )}
          
          {categoriesOverBudget > 0 && (
            <p>• {categoriesOverBudget} categoria(s) excederam o orçamento. Foque em controlá-las.</p>
          )}
          
          {categoriesAtRisk > 0 && (
            <p>• {categoriesAtRisk} categoria(s) estão em risco de exceder o orçamento.</p>
          )}
          
          {previousMonthComparison && previousMonthComparison.isImprovement && (
            <p>• Boa! Sua aderência melhorou {Math.abs(previousMonthComparison.difference).toFixed(1)}% em relação ao mês anterior.</p>
          )}
        </div>
      </div>
    </div>
  )
}