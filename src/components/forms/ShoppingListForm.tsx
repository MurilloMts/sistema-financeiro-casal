'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ShoppingListFormData, ShoppingList } from '@/types'

interface ShoppingListFormProps {
  shoppingList?: ShoppingList
  onSubmit: (data: ShoppingListFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function ShoppingListForm({ shoppingList, onSubmit, onCancel, loading }: ShoppingListFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShoppingListFormData>({
    defaultValues: {
      name: shoppingList?.name || '',
    },
  })

  const handleFormSubmit = async (data: ShoppingListFormData) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Nome da lista"
        placeholder="Ex: Compras do mês, Lista do supermercado..."
        error={errors.name?.message}
        {...register('name', {
          required: 'Nome da lista é obrigatório',
          minLength: {
            value: 3,
            message: 'Nome deve ter pelo menos 3 caracteres',
          },
          maxLength: {
            value: 100,
            message: 'Nome deve ter no máximo 100 caracteres',
          },
        })}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Dica:</p>
            <p>Após criar a lista, você poderá adicionar itens com quantidades e preços estimados. Durante as compras, marque os itens como comprados e registre os preços reais.</p>
          </div>
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <Button
          type="submit"
          loading={loading}
          className="flex-1"
        >
          {shoppingList ? 'Atualizar' : 'Criar'} lista
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