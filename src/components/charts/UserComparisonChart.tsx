'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { formatCurrency } from '@/lib/utils'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface UserData {
  userId: string
  userName: string
  income: number
  expenses: number
  balance: number
}

interface UserComparisonChartProps {
  data: UserData[]
  title?: string
  period?: string
}

export function UserComparisonChart({ 
  data, 
  title = 'Comparação por Membro', 
  period 
}: UserComparisonChartProps) {
  const chartData = {
    labels: data.map(user => user.userName),
    datasets: [
      {
        label: 'Receitas',
        data: data.map(user => user.income),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
      },
      {
        label: 'Despesas',
        data: data.map(user => user.expenses),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
      },
      {
        label: 'Saldo',
        data: data.map(user => user.balance),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      }
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: period ? `${title} - ${period}` : title,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y
            return `${context.dataset.label}: ${formatCurrency(value)}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value)
          }
        }
      }
    },
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nenhum dado disponível para comparação</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Bar data={chartData} options={options} />
      
      {/* Tabela de detalhes */}
      <div className="mt-6">
        <h4 className="font-medium text-gray-900 mb-3">Detalhamento</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Membro
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Receitas
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Despesas
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  Saldo
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  % Receitas
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                  % Despesas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((user, index) => {
                const totalIncome = data.reduce((sum, u) => sum + u.income, 0)
                const totalExpenses = data.reduce((sum, u) => sum + u.expenses, 0)
                const incomePercent = totalIncome > 0 ? (user.income / totalIncome) * 100 : 0
                const expensePercent = totalExpenses > 0 ? (user.expenses / totalExpenses) * 100 : 0
                
                return (
                  <tr key={user.userId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      {user.userName}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-green-600">
                      {formatCurrency(user.income)}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-red-600">
                      {formatCurrency(user.expenses)}
                    </td>
                    <td className={`px-4 py-2 text-sm text-right font-medium ${
                      user.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(user.balance)}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-gray-600">
                      {incomePercent.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-gray-600">
                      {expensePercent.toFixed(1)}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}