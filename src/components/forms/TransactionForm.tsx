'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { CategorySuggestions } from '@/components/ui/CategorySuggestions'
import { RecurrenceConfig } from './RecurrenceConfig'
import { TransactionFormData, Transaction, Category, RecurrenceConfig as IRecurrenceConfig } from '@/types'
import { useCategories } from '@/hooks/useCategories'
import { useCategorySuggestions } from '@/hooks/useCategorySuggestions'
import { formatDateInput } from '@/lib/utils'

interface TransactionFormProps {
  transaction?: Transaction
  onSubmit: (data: TransactionFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  defaultType?: 'INCOME' | 'EXPENSE'
}

export function TransactionForm({ 
  transaction, 
  onSubmit, 
  onCancel, 
  loading,
  defaultType = 'EXPENSE'
}: TransactionFormProps) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // Estado para configuração de recorrência
  const [recurrenceConfig, setRecurrenceConfig] = useState<IRecurrenceConfig>({
    is_recurring: (transaction as any)?.is_recurring || false,
    recurrence_type: (transaction as any)?.recurrence_type,
    recurrence_interval: (transaction as any)?.recurrence_interval || 1,
    recurrence_end_date: (transaction as any)?.recurrence_end_date,
  })
  
  const { categories } = useCategories()
  const { suggestCategory } = useCategorySuggestions()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    defaultValues: {
      type: transaction?.type || defaultType,
      amount: transaction?.amount || 0,
      description: transaction?.description || '',
      category_id: transaction?.category_id || '',
      transaction_date: transaction?.transaction_date 
        ? formatDateInput(transaction.transaction_date)
        : formatDateInput(new Date()),
    },
  })

  const watchedType = watch('type')
  const watchedDescription = watch('description')
  const watchedCategoryId = watch('category_id')

  // Filtrar categorias por tipo
  const availableCategories = categories.filter(category => 
    category.type === watchedType || category.type === 'BOTH'
  )

  const categoryOptions = availableCategories.map(category => ({
    value: category.id,
    label: category.name
  }))

  const typeOptions = [
    { value: 'EXPENSE', label: 'Despesa' },
    { value: 'INCOME', label: 'Receita' },
  ]

  // Sugerir categorias baseado na descrição
  useEffect(() => {
    const getSuggestions = async () => {
      if (watchedDescription && watchedDescription.length > 3 && !watchedCategoryId) {
        try {
          const categorySuggestions = await suggestCategory(watchedDescription, availableCategories)
          setSuggestions(categorySuggestions)
          setShowSuggestions(categorySuggestions.length > 0)
        } catch (error) {
          console.error('Erro ao obter sugestões:', error)
        }
      } else {
        setShowSuggestions(false)
      }
    }

    const timeoutId = setTimeout(getSuggestions, 500)
    return () => clearTimeout(timeoutId)
  }, [watchedDescription, watchedCategoryId, availableCategories.length])

  // Limpar sugestões quando tipo muda
  useEffect(() => {
    setShowSuggestions(false)
    setSuggestions([])
    if (watchedCategoryId) {
      const selectedCategory = categories.find(cat => cat.id === watchedCategoryId)
      if (selectedCategory && selectedCategory.type !== watchedType && selectedCategory.type !== 'BOTH') {
        setValue('category_id', '')
      }
    }
  }, [watchedType])

  const handleSuggestionSelect = (category: Category) => {
    setValue('category_id', category.id)
    setShowSuggestions(false)
  }

  const handleFormSubmit = async (data: TransactionFormData) => {
    // Combinar dados do formulário com configuração de recorrência
    const formDataWithRecurrence = {
      ...data,
      ...recurrenceConfig,
    }
    await onSubmit(formDataWithRecurrence)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Tipo"
          options={typeOptions}
          error={errors.type?.message}
          {...register('type', {
            required: 'Tipo é obrigatório'
          })}
        />

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
      </div>

      <Input
        label="Descrição"
        placeholder="Ex: Compras no supermercado, Salário, etc."
        error={errors.description?.message}
        {...register('description', {
          required: 'Descrição é obrigatória',
          minLength: {
            value: 3,
            message: 'Descrição deve ter pelo menos 3 caracteres'
          },
          maxLength: {
            value: 255,
            message: 'Descrição deve ter no máximo 255 caracteres'
          }
        })}
      />

      {/* Sugestões de categoria */}
      {showSuggestions && (
        <CategorySuggestions
          suggestions={suggestions}
          onSelect={handleSuggestionSelect}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Categoria"
          placeholder="Selecione uma categoria"
          options={categoryOptions}
          error={errors.category_id?.message}
          {...register('category_id', {
            required: 'Categoria é obrigatória'
          })}
        />

        <Input
          label="Data"
          type="date"
          error={errors.transaction_date?.message}
          {...register('transaction_date', {
            required: 'Data é obrigatória'
          })}
        />
      </div>

      {/* Configuração de recorrência */}
      <RecurrenceConfig
        value={recurrenceConfig}
        onChange={setRecurrenceConfig}
        type="transaction"
      />

      {/* Informações adicionais */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium text-gray-900">Informações</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Tipo:</span>
            <span className={`font-medium ${
              watchedType === 'INCOME' ? 'text-green-600' : 'text-red-600'
            }`}>
              {watchedType === 'INCOME' ? 'Receita' : 'Despesa'}
            </span>
          </div>
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
          {transaction ? 'Atualizar' : 'Criar'} transação
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