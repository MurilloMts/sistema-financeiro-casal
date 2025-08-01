'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CreditCardFormData, CreditCard } from '@/types'

interface CreditCardFormProps {
  creditCard?: CreditCard
  onSubmit: (data: CreditCardFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const CARD_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6B7280', // Gray
]

export function CreditCardForm({ creditCard, onSubmit, onCancel, loading }: CreditCardFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreditCardFormData>({
    defaultValues: {
      name: creditCard?.name || '',
      last_four_digits: creditCard?.last_four_digits || '',
      credit_limit: creditCard?.credit_limit || 0,
      due_date: creditCard?.due_date || 10,
      closing_date: creditCard?.closing_date || 5,
      color: creditCard?.color || CARD_COLORS[0],
    },
  })

  const watchedColor = watch('color')
  const watchedName = watch('name')
  const watchedLastFour = watch('last_four_digits')
  const watchedLimit = watch('credit_limit')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Preview do cartão */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{ backgroundColor: watchedColor }}
        />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div className="text-sm opacity-75">Cartão de Crédito</div>
            <div className="w-8 h-6 bg-white rounded opacity-75" />
          </div>
          
          <div className="mb-6">
            <div className="text-lg font-mono tracking-wider">
              •••• •••• •••• {watchedLastFour || '0000'}
            </div>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs opacity-75 mb-1">Nome do Cartão</div>
              <div className="font-medium">
                {watchedName || 'Meu Cartão'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-75 mb-1">Limite</div>
              <div className="font-medium">
                R$ {(watchedLimit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nome do cartão"
          placeholder="Ex: Nubank, Itaú, Bradesco..."
          error={errors.name?.message}
          {...register('name', {
            required: 'Nome do cartão é obrigatório',
            minLength: {
              value: 2,
              message: 'Nome deve ter pelo menos 2 caracteres'
            },
            maxLength: {
              value: 50,
              message: 'Nome deve ter no máximo 50 caracteres'
            }
          })}
        />

        <Input
          label="Últimos 4 dígitos"
          placeholder="0000"
          maxLength={4}
          error={errors.last_four_digits?.message}
          {...register('last_four_digits', {
            required: 'Últimos 4 dígitos são obrigatórios',
            pattern: {
              value: /^\d{4}$/,
              message: 'Digite exatamente 4 números'
            }
          })}
        />
      </div>

      <Input
        label="Limite do cartão"
        type="number"
        step="0.01"
        min="0"
        placeholder="0,00"
        error={errors.credit_limit?.message}
        {...register('credit_limit', {
          required: 'Limite é obrigatório',
          min: {
            value: 0.01,
            message: 'Limite deve ser maior que zero'
          },
          valueAsNumber: true
        })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Dia do vencimento"
          type="number"
          min="1"
          max="31"
          placeholder="10"
          error={errors.due_date?.message}
          {...register('due_date', {
            required: 'Dia do vencimento é obrigatório',
            min: {
              value: 1,
              message: 'Dia deve ser entre 1 e 31'
            },
            max: {
              value: 31,
              message: 'Dia deve ser entre 1 e 31'
            },
            valueAsNumber: true
          })}
        />

        <Input
          label="Dia do fechamento"
          type="number"
          min="1"
          max="31"
          placeholder="5"
          error={errors.closing_date?.message}
          {...register('closing_date', {
            required: 'Dia do fechamento é obrigatório',
            min: {
              value: 1,
              message: 'Dia deve ser entre 1 e 31'
            },
            max: {
              value: 31,
              message: 'Dia deve ser entre 1 e 31'
            },
            valueAsNumber: true
          })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Cor do cartão
        </label>
        <div className="grid grid-cols-5 gap-3">
          {CARD_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue('color', color)}
              className={`w-12 h-12 rounded-lg border-2 transition-all ${
                watchedColor === color 
                  ? 'border-gray-900 scale-110' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <Button
          type="submit"
          loading={loading}
          className="flex-1"
        >
          {creditCard ? 'Atualizar' : 'Criar'} cartão
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
