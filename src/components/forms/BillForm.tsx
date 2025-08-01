'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { RecurrenceConfig } from './RecurrenceConfig'
import { BillFormData, Bill, RecurrenceConfig as IRecurrenceConfig } from '@/types'
import { useCategories } from '@/hooks/useCategories'
import { formatDateInput } from '@/lib/utils'

interface BillFormProps {
  bill?: Bill
  onSubmit: (data: BillFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function BillForm({ bill, onSubmit, onCancel, loading }: BillFormProps) {
  const { categories } = useCategories()
  
  // Estado para configuração de recorrência
  const [recurrenceConfig, setRecurrenceConfig] = useState<IRecurrenceConfig>({
    is_recurring: (bill as any)?.is_recurring || false,
    recurrence_type: (bill as any)?.recurrence_type,
    recurrence_interval: (bill as any)?.recurrence_interval || 1,
    recurrence_end_date: (bill as any)?.recurrence_end_date,
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BillFormData>({
    defaultValues: {
      title: bill?.title || '',
      amount: bill?.amount || 0,
      due_date: bill?.due_date 
        ? bill.due_date
        : formatDateInput(new Date()),
      category_id: bill?.category_id || '',
      notes: bill?.notes || '',
    },
  })

  // Filtrar apenas categorias de despesa
  const expenseCategories = categories.filter(category => 
    category.type === 'EXPENSE' || category.type === 'BOTH'
  )

  const categoryOptions = expenseCategories.map(category => ({
    value: category.id,
    label: category.name
  }))

  const watchedAmount = watch('amount')
  const watchedDueDate = watch('due_date')
  const watchedCategoryId = watch('category_id')

  // Calcular dias até o vencimento
  const getDaysUntilDue = () => {
    if (!watchedDueDate) return null
    
    const dueDate = new Date(watchedDueDate)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const daysUntilDue = getDaysUntilDue()

  const handleFormSubmit = async (data: BillFormData) => {
    // Combinar dados do formulário com configuração de recorrência
    const formDataWithRecurrence = {
      ...data,
      ...recurrenceConfig,
    }
    await onSubmit(formDataWithRecurrence)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Título da conta"
        placeholder="Ex: Conta de luz, Financiamento do carro..."
        error={errors.title?.message}
        {...register('title', {
          required: 'Título é obrigatório',
          minLength: {
            value: 3,
            message: 'Título deve ter pelo menos 3 caracteres'
          },
          maxLength: {
            value: 255,
            message: 'Título deve ter no máximo 255 caracteres'
          }
        })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Valor"
          type="number"
          step="0.01"
          min="0"
          placeholder="0,00"
          error={errors.amount?.message}
          {...register('amount', {
            required: 'Valor é obrigatório',
            min: {
              value: 0.01,
              message: 'Valor deve ser maior que zero'
            },
            valueAsNumber: true
          })}
        />

        <Input
          label="Data de vencimento"
          type="date"
          error={errors.due_date?.message}
          {...register('due_date', {
            required: 'Data de vencimento é obrigatória'
          })}
        />
      </div>

      <Select
        label="Categoria"
        placeholder="Selecione uma categoria"
        options={categoryOptions}
        error={errors.category_id?.message}
        {...register('category_id', {
          required: 'Categoria é obrigatória'
        })}
      />

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Observações (opcional)
        </label>
        <textarea
          className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
          placeholder="Observações adicionais sobre esta conta..."
          {...register('notes', {
            maxLength: {
              value: 500,
              message: 'Observações devem ter no máximo 500 caracteres'
            }
          })}
        />
        {errors.notes && (
          <p className="text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      {/* Configuração de recorrência */}
      <RecurrenceConfig
        value={recurrenceConfig}
        onChange={setRecurrenceConfig}
        type="bill"
      />

      {/* Informações da conta */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium text-gray-900">Informações da conta</h4>
        <div className="text-sm text-gray-600 space-y-1">
          {watchedAmount > 0 && (
            <div className="flex justify-between">
              <span>Valor:</span>
              <span className="font-medium text-red-600">
                R$ {watchedAmount.toFixed(2).replace('.', ',')}
              </span>
            </div>
          )}
          
          {daysUntilDue !== null && (
            <div className="flex justify-between">
              <span>Vencimento:</span>
              <span className={`font-medium ${
                daysUntilDue < 0 ? 'text-red-600' :
                daysUntilDue <= 7 ? 'text-orange-600' :
                daysUntilDue <= 15 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {daysUntilDue < 0 
                  ? `${Math.abs(daysUntilDue)} dias em atraso`
                  : daysUntilDue === 0 
                  ? 'Vence hoje'
                  : daysUntilDue === 1
                  ? 'Vence amanhã'
                  : `${daysUntilDue} dias`
                }
              </span>
            </div>
          )}

          {watchedCategoryId && (
            <div className="flex justify-between">
              <span>Categoria:</span>
              <div className="flex items-center space-x-2">
                {(() => {
                  const selectedCategory = categories.find(cat => cat.id === watchedCategoryId)
                  return selectedCategory ? (
                    <>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: selectedCategory.color }}
                      />
                      <span className="font-medium">{selectedCategory.name}</span>
                    </>
                  ) : null
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <Button
          type="submit"
          loading={loading}
          className="flex-1"
        >
          {bill ? 'Atualizar' : 'Criar'} conta
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}