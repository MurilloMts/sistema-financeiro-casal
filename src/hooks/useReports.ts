'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns'

export interface MonthlyData {
  month: string
  income: number
  expenses: number
  balance: number
}

export interface CategoryData {
  name: string
  amount: number
  color: string
  percentage: number
}

export interface ReportFilters {
  startDate: Date
  endDate: Date
  userId?: string
  categoryIds?: string[]
}

export function useReports() {
  const [loading, setLoading] = useState(false)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [userComparisonData, setUserComparisonData] = useState<any[]>([])
  const [trendData, setTrendData] = useState<any[]>([])
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: subMonths(new Date(), 5),
    endDate: new Date()
  })
  const { profile } = useAuth()

  const fetchMonthlyData = async () => {
    if (!profile?.couple_id) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          type,
          transaction_date,
          user_id
        `)
        .eq('couple_id', profile.couple_id)
        .gte('transaction_date', format(filters.startDate, 'yyyy-MM-dd'))
        .lte('transaction_date', format(filters.endDate, 'yyyy-MM-dd'))
        .order('transaction_date', { ascending: true })

      if (error) throw error

      // Agrupar por mês
      const monthlyMap: Record<string, { income: number, expenses: number }> = {}
      
      data?.forEach(transaction => {
        // Filtrar por usuário se especificado
        if (filters.userId && transaction.user_id !== filters.userId) return

        const monthKey = format(new Date(transaction.transaction_date), 'yyyy-MM')
        
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = { income: 0, expenses: 0 }
        }

        if (transaction.type === 'INCOME') {
          monthlyMap[monthKey].income += transaction.amount
        } else {
          monthlyMap[monthKey].expenses += transaction.amount
        }
      })

      // Converter para array e calcular saldo
      const monthlyArray = Object.entries(monthlyMap).map(([month, data]) => ({
        month: format(new Date(month + '-01'), 'MMM yyyy'),
        income: data.income,
        expenses: data.expenses,
        balance: data.income - data.expenses
      }))

      setMonthlyData(monthlyArray)
    } catch (error) {
      console.error('Erro ao buscar dados mensais:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoryData = async () => {
    if (!profile?.couple_id) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          type,
          user_id,
          categories (
            name,
            color
          )
        `)
        .eq('couple_id', profile.couple_id)
        .eq('type', 'EXPENSE')
        .gte('transaction_date', format(filters.startDate, 'yyyy-MM-dd'))
        .lte('transaction_date', format(filters.endDate, 'yyyy-MM-dd'))

      if (error) throw error

      // Agrupar por categoria
      const categoryMap: Record<string, { amount: number, color: string }> = {}
      let totalExpenses = 0

      data?.forEach(transaction => {
        // Filtrar por usuário se especificado
        if (filters.userId && transaction.user_id !== filters.userId) return

        const categoryName = transaction.categories?.name || 'Sem categoria'
        const categoryColor = transaction.categories?.color || '#6B7280'
        
        if (!categoryMap[categoryName]) {
          categoryMap[categoryName] = { amount: 0, color: categoryColor }
        }

        categoryMap[categoryName].amount += transaction.amount
        totalExpenses += transaction.amount
      })

      // Converter para array e calcular percentuais
      const categoryArray = Object.entries(categoryMap)
        .map(([name, data]) => ({
          name,
          amount: data.amount,
          color: data.color,
          percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount)

      setCategoryData(categoryArray)
    } catch (error) {
      console.error('Erro ao buscar dados por categoria:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFilters = (newFilters: Partial<ReportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const fetchUserComparisonData = async () => {
    if (!profile?.couple_id) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          type,
          user_id,
          profiles (
            name,
            email
          )
        `)
        .eq('couple_id', profile.couple_id)
        .gte('transaction_date', format(filters.startDate, 'yyyy-MM-dd'))
        .lte('transaction_date', format(filters.endDate, 'yyyy-MM-dd'))

      if (error) throw error

      // Agrupar por usuário
      const userMap: Record<string, { income: number, expenses: number, name: string }> = {}
      
      data?.forEach(transaction => {
        const userId = transaction.user_id
        const userName = transaction.profiles?.name || transaction.profiles?.email || 'Usuário'
        
        if (!userMap[userId]) {
          userMap[userId] = { income: 0, expenses: 0, name: userName }
        }

        if (transaction.type === 'INCOME') {
          userMap[userId].income += transaction.amount
        } else {
          userMap[userId].expenses += transaction.amount
        }
      })

      // Converter para array
      const userArray = Object.entries(userMap).map(([userId, data]) => ({
        userId,
        userName: data.name,
        income: data.income,
        expenses: data.expenses,
        balance: data.income - data.expenses
      }))

      setUserComparisonData(userArray)
    } catch (error) {
      console.error('Erro ao buscar dados de comparação por usuário:', error)
    }
  }

  const fetchTrendData = async () => {
    if (!profile?.couple_id) return

    try {
      // Buscar dados dos últimos 12 meses para análise de tendência
      const trendStartDate = subMonths(new Date(), 11)
      
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type, transaction_date')
        .eq('couple_id', profile.couple_id)
        .gte('transaction_date', format(trendStartDate, 'yyyy-MM-dd'))
        .lte('transaction_date', format(new Date(), 'yyyy-MM-dd'))
        .order('transaction_date', { ascending: true })

      if (error) throw error

      // Agrupar por mês
      const monthlyMap: Record<string, { income: number, expenses: number }> = {}
      
      data?.forEach(transaction => {
        const monthKey = format(new Date(transaction.transaction_date), 'yyyy-MM')
        
        if (!monthlyMap[monthKey]) {
          monthlyMap[monthKey] = { income: 0, expenses: 0 }
        }

        if (transaction.type === 'INCOME') {
          monthlyMap[monthKey].income += transaction.amount
        } else {
          monthlyMap[monthKey].expenses += transaction.amount
        }
      })

      // Converter para array de tendência
      const trendArray = Object.entries(monthlyMap)
        .map(([month, data], index, array) => {
          const balance = data.income - data.expenses
          const prevBalance = index > 0 ? array[index - 1][1].income - array[index - 1][1].expenses : balance
          const change = balance - prevBalance
          const changePercent = prevBalance !== 0 ? (change / Math.abs(prevBalance)) * 100 : 0
          
          return {
            period: format(new Date(month + '-01'), 'MMM yyyy'),
            value: balance,
            trend: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'stable' as const,
            change,
            changePercent
          }
        })

      setTrendData(trendArray)
    } catch (error) {
      console.error('Erro ao buscar dados de tendência:', error)
    }
  }

  const exportData = async (format: 'csv' | 'json' | 'pdf') => {
    const data = {
      monthly: monthlyData,
      categories: categoryData,
      userComparison: userComparisonData,
      trend: trendData,
      filters,
      generatedAt: new Date().toISOString()
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-financeiro-${format(new Date(), 'yyyy-MM-dd')}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      // CSV para dados mensais
      const csvHeader = 'Mês,Receitas,Despesas,Saldo\n'
      const csvData = monthlyData
        .map(row => `${row.month},${row.income},${row.expenses},${row.balance}`)
        .join('\n')
      
      const blob = new Blob([csvHeader + csvData], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-financeiro-${format(new Date(), 'yyyy-MM-dd')}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } else if (format === 'pdf') {
      // Para PDF, vamos criar um HTML simples e usar window.print()
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        const htmlContent = generatePDFContent(data)
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const generatePDFContent = (data: any) => {
    const totalIncome = monthlyData.reduce((sum, month) => sum + month.income, 0)
    const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0)
    const totalBalance = totalIncome - totalExpenses

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório Financeiro</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { display: flex; justify-content: space-around; margin-bottom: 30px; }
          .summary-item { text-align: center; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f2f2f2; }
          .positive { color: green; }
          .negative { color: red; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório Financeiro</h1>
          <p>Período: ${format(filters.startDate, 'dd/MM/yyyy')} - ${format(filters.endDate, 'dd/MM/yyyy')}</p>
          <p>Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
        </div>
        
        <div class="summary">
          <div class="summary-item">
            <h3>Total de Receitas</h3>
            <p class="positive">R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div class="summary-item">
            <h3>Total de Despesas</h3>
            <p class="negative">R$ ${totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div class="summary-item">
            <h3>Saldo do Período</h3>
            <p class="${totalBalance >= 0 ? 'positive' : 'negative'}">R$ ${totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        
        <h2>Evolução Mensal</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Mês</th>
              <th>Receitas</th>
              <th>Despesas</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyData.map(month => `
              <tr>
                <td>${month.month}</td>
                <td class="positive">R$ ${month.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="negative">R$ ${month.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td class="${month.balance >= 0 ? 'positive' : 'negative'}">R$ ${month.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h2>Gastos por Categoria</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Valor</th>
              <th>Percentual</th>
            </tr>
          </thead>
          <tbody>
            ${categoryData.map(category => `
              <tr>
                <td>${category.name}</td>
                <td class="negative">R$ ${category.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>${category.percentage.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `
  }

  useEffect(() => {
    if (profile?.couple_id) {
      fetchMonthlyData()
      fetchCategoryData()
      fetchUserComparisonData()
      fetchTrendData()
    }
  }, [profile?.couple_id, filters])

  return {
    loading,
    monthlyData,
    categoryData,
    userComparisonData,
    trendData,
    filters,
    updateFilters,
    exportData,
    refetch: () => {
      fetchMonthlyData()
      fetchCategoryData()
      fetchUserComparisonData()
      fetchTrendData()
    }
  }
}
