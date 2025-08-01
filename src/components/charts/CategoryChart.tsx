'use client'

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Pie, Doughnut } from 'react-chartjs-2'
import { CategoryData } from '@/hooks/useReports'
import { formatCurrency } from '@/lib/utils'

ChartJS.register(ArcElement, Tooltip, Legend)

interface CategoryChartProps {
  data: CategoryData[]
  type?: 'pie' | 'doughnut'
  title?: string
}

export function CategoryChart({ data, type = 'doughnut', title = 'Gastos por Categoria' }: CategoryChartProps) {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.amount),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          generateLabels: function(chart: any) {
            const data = chart.data
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i]
                const percentage = ((value / data.datasets[0].data.reduce((a: number, b: number) => a + b, 0)) * 100).toFixed(1)
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: data.datasets[0].borderWidth,
                  hidden: false,
                  index: i
                }
              })
            }
            return []
          }
        }
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${context.label}: ${formatCurrency(value)} (${percentage}%)`
          }
        }
      }
    },
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Nenhum dado disponível para o período selecionado</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {type === 'pie' ? (
        <Pie data={chartData} options={options} />
      ) : (
        <Doughnut data={chartData} options={options} />
      )}
      
      {/* Lista de categorias com valores */}
      <div className="mt-6 space-y-2">
        <h4 className="font-medium text-gray-900">Detalhamento</h4>
        <div className="space-y-1">
          {data.slice(0, 5).map((category, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-gray-700">{category.name}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatCurrency(category.amount)}</div>
                <div className="text-gray-500">{category.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
          {data.length > 5 && (
            <div className="text-sm text-gray-500 pt-1">
              +{data.length - 5} outras categorias
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
