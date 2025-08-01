'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { CategoryFormData, Category } from '@/types'

interface CategoryFormProps {
  category?: Category
  onSubmit: (data: CategoryFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const TYPE_OPTIONS = [
  { value: 'INCOME', label: 'Receita' },
  { value: 'EXPENSE', label: 'Despesa' },
  { value: 'BOTH', label: 'Ambos' },
]

export function CategoryForm({ category, onSubmit, onCancel, loading }: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: category?.name || '',
      color: category?.color || '#6366f1',
      type: category?.type || 'EXPENSE',
    },
  })

  const watchedColor = watch('color')

  const handleFormSubmit = async (data: CategoryFormData) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Nome da categoria"
        placeholder="Ex: Alimentação, Transporte..."
        error={errors.name?.message}
        {...register('name', {
          required: 'Nome da categoria é obrigatório',
          minLength: {
            value: 2,
            message: 'Nome deve ter pelo menos 2 caracteres',
          },
          maxLength: {
            value: 50,
            message: 'Nome deve ter no máximo 50 caracteres',
          },
        })}
      />

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Cor da categoria
        </label>
        <ColorPicker
          value={watchedColor}
          onChange={(color) => setValue('color', color)}
        />
      </div>

      <Select
        label="Tipo da categoria"
        options={TYPE_OPTIONS}
        error={errors.type?.message}
        {...register('type', {
          required: 'Tipo da categoria é obrigatório',
        })}
      />

      <div className="flex space-x-3 pt-4">
        <Button
          type="submit"
          loading={loading}
          className="flex-1"
        >
          {category ? 'Atualizar' : 'Criar'} categoria
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
