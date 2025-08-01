'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { formatCurrency } from '@/lib/utils'

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

interface TrendData {
  period: string
  value: number
  trend: 'up' | 'down' | 'stable'
  change: number
  changePercent: number
}

interface TrendChartProps {
  data: TrendData[]
  title?: string
  metric?: 'income' | 'expenses' | 'balance'
  showTrendLine?: boolean
}

export function TrendChart({ 
  data, 
  title = 'Análise de Tendência', 
  metric = 'balance',
  showTrendLine = true 
}: TrendChartProps) {
  const getColor = () => {
    switch (metric) {
      case 'income': return { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 1)' }
      case 'expenses': return { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 1)' }
      default: return { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 1)' }
    }
  }

  const colors = getColor()

  // Calcular linha de tendência usando regressão linear simples
  const calculateTrendLine = (values: number[]) => {
    const n = values.length
    const sumX = values.reduce((sum, _, i) => sum + i, 0)
    const sumY = values.reduce((sum, val) => sum + val, 0)
    const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0)
    const sumXX = values.reduce((sum, _, i) => sum + (i * i), 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    return values.map((_, i) => slope * i + intercept)
  }

  const trendLineData = showTrendLine ? calculateTrendLine(data.map(d => d.value)) : []

  const chartData = {
    labels: data.map(item => item.period),
    datasets: [
      {
        label: title,
        data: data.map(item => item.value),
        backgroundColor: colors.bg,
        borderColor: colors.border,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colors.border,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
      ...(showTrendLine ? [{
        label: 'Tendência',
        data: trendLineData,
        borderColor: 'rgba(156, 163, 175, 0.8)',
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
        tension: 0,
      }] : [])
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
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y
            const dataPoint = data[context.dataIndex]
            
            if (context.datasetIndex === 0 && dataPoint) {
              const trendIcon = dataPoint.trend === 'up' ? '↗️' : dataPoint.trend === 'down' ? '↘️' : '➡️'
              const changeText = dataPoint.change !== 0 
                ? ` (${dataPoint.change > 0 ? '+' : ''}${formatCurrency(dataPoint.change)}, ${dataPoint.changePercent > 0 ? '+' : ''}${dataPoint.changePercent.toFixed(1)}%)`
                : ''
              
              return `${context.dataset.label}: ${formatCurrency(value)} ${trendIcon}${changeText}`
            }
            
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
        <p className="text-gray-500">Nenhum dado disponível para análise de tendência</p>
      </div>
    )
  }

  // Calcular estatísticas da tendência
  const totalChange = data.length > 1 ? data[data.length - 1].value - data[0].value : 0
  const avgChange = data.length > 1 ? totalChange / (data.length - 1) : 0
  const overallTrend = totalChange > 0 ? 'up' : totalChange < 0 ? 'down' : 'stable'

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Line data={chartData} options={options} />
      
      {/* Estatísticas de tendência */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Tendência Geral</div>
          <div className={`text-lg font-semibold flex items-center space-x-2 ${
            overallTrend === 'up' ? 'text-green-600' : 
            overallTrend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            <span>
              {overallTrend === 'up' ? '↗️' : overallTrend === 'down' ? '↘️' : '➡️'}
            </span>
            <span>
              {overallTrend === 'up' ? 'Crescimento' : 
               overallTrend === 'down' ? 'Declínio' : 'Estável'}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Variação Total</div>
          <div className={`text-lg font-semibold ${
            totalChange >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {totalChange >= 0 ? '+' : ''}{formatCurrency(totalChange)}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Variação Média</div>
          <div className={`text-lg font-semibold ${
            avgChange >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {avgChange >= 0 ? '+' : ''}{formatCurrency(avgChange)}
          </div>
        </div>
      </div>
    </div>
  )
}