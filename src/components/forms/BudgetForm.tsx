'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { BudgetFormData, BudgetWithCategories, Category } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface BudgetFormProps {
  budget?: BudgetWithCategories
  categories: Category[]
  onSubmit: (data: BudgetFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function BudgetForm({ budget, categories, onSubmit, onCancel, loading }: BudgetFormProps) {
  const [totalPlanned, setTotalPlanned] = useState(0)
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BudgetFormData>({
    defaultValues: {
      name: budget?.name || '',
      month: budget?.month || new Date().getMonth() + 1,
      year: budget?.year || new Date().getFullYear(),
      categories: budget?.categories.map(cat => ({
        category_id: cat.category_id,
        planned_amount: cat.planned_amount
      })) || []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'categories'
  })

  const watchedCategories = watch('categories')

  // Calcular total planejado
  useEffect(() => {
    const total = watchedCategories?.reduce((sum, cat) => sum + (cat.planned_amount || 0), 0) || 0
    setTotalPlanned(total)
  }, [watchedCategories])

  // Filtrar categorias de despesa disponíveis
  const expenseCategories = categories.filter(cat => 
    cat.type === 'EXPENSE' || cat.type === 'BOTH'
  )

  const availableCategories = expenseCategories.filter(cat => 
    !watchedCategories?.some(budgetCat => budgetCat.category_id === cat.id)
  )

  const addCategory = () => {
    if (availableCategories.length > 0) {
      append({
        category_id: availableCategories[0].id,
        planned_amount: 0
      })
    }
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || 'Categoria'
  }

  const getCategoryColor = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.color || '#6B7280'
  }

  const monthOptions = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ]

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear + i - 1,
    label: (currentYear + i - 1).toString()
  }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Informações básicas */}
      <div className="space-y-4">
        <Input
          label="Nome do orçamento"
          placeholder="Ex: Orçamento Familiar Janeiro 2024"
          error={errors.name?.message}
          {...register('name', {
            required: 'Nome é obrigatório',
            minLength: {
              value: 3,
              message: 'Nome deve ter pelo menos 3 caracteres'
            }
          })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Mês"
            options={monthOptions}
            error={errors.month?.message}
            {...register('month', {
              required: 'Mês é obrigatório',
              valueAsNumber: true
            })}
          />

          <Select
            label="Ano"
            options={yearOptions}
            error={errors.year?.message}
            {...register('year', {
              required: 'Ano é obrigatório',
              valueAsNumber: true
            })}
          />
        </div>
      </div>

      {/* Categorias do orçamento */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Categorias do Orçamento</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCategory}
            disabled={availableCategories.length === 0}
          >
            + Adicionar Categoria
          </Button>
        </div>

        {fields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma categoria adicionada ainda.</p>
            <p className="text-sm">Clique em "Adicionar Categoria" para começar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getCategoryColor(watchedCategories[index]?.category_id) }}
                />
                
                <div className="flex-1">
                  <Select
                    label=""
                    options={[
                      ...expenseCategories
                        .filter(cat => 
                          cat.id === watchedCategories[index]?.category_id ||
                          !watchedCategories?.some(budgetCat => budgetCat.category_id === cat.id)
                        )
                        .map(cat => ({ value: cat.id, label: cat.name }))
                    ]}
                    {...register(`categories.${index}.category_id`, {
                      required: 'Categoria é obrigatória'
                    })}
                  />
                </div>

                <div className="w-32">
                  <Input
                    label=""
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    {...register(`categories.${index}.planned_amount`, {
                      required: 'Valor é obrigatório',
                      valueAsNumber: true,
                      min: {
                        value: 0.01,
                        message: 'Valor deve ser maior que zero'
                      }
                    })}
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resumo */}
      {totalPlanned > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">Total Planejado:</span>
            <span className="text-lg font-bold text-blue-900">
              {formatCurrency(totalPlanned)}
            </span>
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="submit"
          loading={loading}
          disabled={fields.length === 0}
          className="flex-1"
        >
          {budget ? 'Atualizar Orçamento' : 'Criar Orçamento'}
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