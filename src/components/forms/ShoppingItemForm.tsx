'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ShoppingItemFormData, ShoppingItem } from '@/types'
interface ShoppingItemFormProps {
  item?: ShoppingItem
  onSubmit: (data: ShoppingItemFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  suggestedItems?: string[]
}

export function ShoppingItemForm({ 
  item, 
  onSubmit, 
  onCancel, 
  loading,
  suggestedItems = []
}: ShoppingItemFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ShoppingItemFormData>({
    defaultValues: {
      name: item?.name || '',
      quantity: item?.quantity || 1,
      estimated_price: item?.estimated_price || 0,
    },
  })

  const watchedQuantity = watch('quantity')
  const watchedPrice = watch('estimated_price')

  const handleFormSubmit = async (data: ShoppingItemFormData) => {
    await onSubmit(data)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setValue('name', suggestion)
  }

  const totalEstimated = watchedQuantity * watchedPrice

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Input
          label="Nome do item"
          placeholder="Ex: Arroz, Leite, Pão..."
          error={errors.name?.message}
          {...register('name', {
            required: 'Nome do item é obrigatório',
            minLength: {
              value: 2,
              message: 'Nome deve ter pelo menos 2 caracteres',
            },
            maxLength: {
              value: 100,
              message: 'Nome deve ter no máximo 100 caracteres',
            },
          })}
        />

        {/* Sugestões de itens */}
        {suggestedItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Itens frequentes:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedItems.slice(0, 6).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Quantidade"
          type="number"
          min="1"
          step="1"
          error={errors.quantity?.message}
          {...register('quantity', {
            required: 'Quantidade é obrigatória',
            min: {
              value: 1,
              message: 'Quantidade deve ser pelo menos 1',
            },
            max: {
              value: 999,
              message: 'Quantidade deve ser no máximo 999',
            },
            valueAsNumber: true,
          })}
        />

        <Input
          label="Preço estimado (unidade)"
          type="number"
          min="0"
          step="0.01"
          placeholder="0,00"
          error={errors.estimated_price?.message}
          {...register('estimated_price', {
            required: 'Preço estimado é obrigatório',
            min: {
              value: 0,
              message: 'Preço deve ser maior ou igual a zero',
            },
            valueAsNumber: true,
          })}
        />
      </div>



      {/* Informações calculadas */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium text-gray-900">Resumo do item</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Quantidade:</span>
            <span className="font-medium">{watchedQuantity}</span>
          </div>
          <div className="flex justify-between">
            <span>Preço unitário:</span>
            <span className="font-medium">R$ {watchedPrice.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-1">
            <span>Total estimado:</span>
            <span className="font-medium text-blue-600">
              R$ {totalEstimated.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <Button
          type="submit"
          loading={loading}
          className="flex-1"
        >
          {item ? 'Atualizar' : 'Adicionar'} item
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