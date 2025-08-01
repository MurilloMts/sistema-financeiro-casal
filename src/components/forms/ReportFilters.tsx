'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ReportFilters as ReportFiltersType } from '@/hooks/useReports'
import { useAuth } from '@/hooks/useAuth'
import { format } from 'date-fns'

interface ReportFiltersProps {
  filters: ReportFiltersType
  onFiltersChange: (filters: Partial<ReportFiltersType>) => void
  onExport: (format: 'csv' | 'json' | 'pdf') => void
  loading?: boolean
}

interface FilterFormData {
  startDate: string
  endDate: string
  userId: string
}

export function ReportFilters({ filters, onFiltersChange, onExport, loading }: ReportFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { profile, couple } = useAuth()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FilterFormData>({
    defaultValues: {
      startDate: format(filters.startDate, 'yyyy-MM-dd'),
      endDate: format(filters.endDate, 'yyyy-MM-dd'),
      userId: filters.userId || '',
    },
  })

  const watchedValues = watch()

  const handleFormSubmit = (data: FilterFormData) => {
    onFiltersChange({
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      userId: data.userId || undefined,
    })
  }

  const setQuickPeriod = (months: number) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    
    onFiltersChange({
      startDate,
      endDate
    })
  }

  const userOptions = [
    { value: '', label: 'Todos os membros' },
    ...(couple?.profiles || []).map(p => ({
      value: p.id,
      label: p.name || p.email
    }))
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Filtros do Relatório</h3>
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onExport('csv')}
            disabled={loading}
          >
            📊 CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onExport('json')}
            disabled={loading}
          >
            📄 JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onExport('pdf')}
            disabled={loading}
          >
            📑 PDF
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Período rápido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período rápido
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickPeriod(1)}
            >
              Último mês
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickPeriod(3)}
            >
              Últimos 3 meses
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickPeriod(6)}
            >
              Últimos 6 meses
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickPeriod(12)}
            >
              Último ano
            </Button>
          </div>
        </div>

        {/* Período personalizado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Data inicial"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate', {
              required: 'Data inicial é obrigatória'
            })}
          />
          
          <Input
            label="Data final"
            type="date"
            error={errors.endDate?.message}
            {...register('endDate', {
              required: 'Data final é obrigatória',
              validate: (value) => {
                if (new Date(value) < new Date(watchedValues.startDate)) {
                  return 'Data final deve ser posterior à data inicial'
                }
                return true
              }
            })}
          />
        </div>

        {/* Filtros avançados */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <span>{showAdvanced ? 'Ocultar' : 'Mostrar'} filtros avançados</span>
            <svg 
              className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <Select
              label="Filtrar por membro"
              placeholder="Selecione um membro"
              options={userOptions}
              {...register('userId')}
            />
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            loading={loading}
          >
            Aplicar filtros
          </Button>
        </div>
      </form>
    </div>
  )
}