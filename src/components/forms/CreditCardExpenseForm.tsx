'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { CreditCardExpenseFormData, CreditCardExpense, CreditCardWithDetails } from '@/types'
import { useCategories } from '@/hooks/useCategories'
import { formatDateInput } from '@/lib/utils'

interface CreditCardExpenseFormProps {
  expense?: CreditCardExpense
  creditCards: CreditCardWithDetails[]
  selectedCardId?: string
  onSubmit: (data: CreditCardExpenseFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function CreditCardExpenseForm({ 
  expense, 
  creditCards, 
  selectedCardId,
  onSubmit, 
  onCancel, 
  loading 
}: CreditCardExpenseFormProps) {
  const { categories } = useCategories()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreditCardExpenseFormData>({
    defaultValues: {
      credit_card_id: expense?.credit_card_id || selectedCardId || '',
      description: expense?.description || '',
      amount: expense?.amount || 0,
      expense_date: expense?.expense_date 
        ? expense.expense_date
        : formatDateInput(new Date()),
      category_id: expense?.category_id || '',
      installments: expense?.installments || 1,
    },
  })

  // Filtrar apenas categorias de despesa
  const expenseCategories = categories.filter(category => 
    category.type === 'EXPENSE' || category.type === 'BOTH'
  )

  const categoryOptions = [
    { value: '', label: 'Sem categoria' },
    ...expenseCategories.map(category => ({
      value: category.id,
      label: category.name
    }))
  ]

  const cardOptions = creditCards.map(card => ({
    value: card.id,
    label: `${card.name} (••••${card.last_four_digits})`
  }))

  const watchedAmount = watch('amount')
  const watchedInstallments = watch('installments')
  const watchedCardId = watch('credit_card_id')
  const watchedCategoryId = watch('category_id')

  const selectedCard = creditCards.find(card => card.id === watchedCardId)
  const selectedCategory = categories.find(cat => cat.id === watchedCategoryId)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Cartão de crédito"
        placeholder="Selecione um cartão"
        options={cardOptions}
        error={errors.credit_card_id?.message}
        {...register('credit_card_id', {
          required: 'Cartão é obrigatório'
        })}
      />

      <Input
        label="Descrição do gasto"
        placeholder="Ex: Supermercado, Restaurante, Combustível..."
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
          label="Data do gasto"
          type="date"
          error={errors.expense_date?.message}
          {...register('expense_date', {
            required: 'Data do gasto é obrigatória'
          })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Categoria (opcional)"
          placeholder="Selecione uma categoria"
          options={categoryOptions}
          error={errors.category_id?.message}
          {...register('category_id')}
        />

        <Input
          label="Parcelas"
          type="number"
          min="1"
          max="24"
          placeholder="1"
          error={errors.installments?.message}
          {...register('installments', {
            min: {
              value: 1,
              message: 'Mínimo 1 parcela'
            },
            max: {
              value: 24,
              message: 'Máximo 24 parcelas'
            },
            valueAsNumber: true
          })}
        />
      </div>

      {/* Informações do gasto */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium text-gray-900">Resumo do gasto</h4>
        <div className="text-sm text-gray-600 space-y-1">
          {watchedAmount > 0 && (
            <div className="flex justify-between">
              <span>Valor total:</span>
              <span className="font-medium text-red-600">
                R$ {watchedAmount.toFixed(2).replace('.', ',')}
              </span>
            </div>
          )}
          
          {watchedInstallments > 1 && watchedAmount > 0 && (
            <div className="flex justify-between">
              <span>Valor por parcela:</span>
              <span className="font-medium">
                R$ {(watchedAmount / watchedInstallments).toFixed(2).replace('.', ',')}
              </span>
            </div>
          )}

          {selectedCard && (
            <div className="flex justify-between">
              <span>Cartão:</span>
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedCard.color }}
                />
                <span className="font-medium">
                  {selectedCard.name} (••••{selectedCard.last_four_digits})
                </span>
              </div>
            </div>
          )}

          {selectedCategory && (
            <div className="flex justify-between">
              <span>Categoria:</span>
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedCategory.color }}
                />
                <span className="font-medium">{selectedCategory.name}</span>
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
          {expense ? 'Atualizar' : 'Adicionar'} gasto
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
