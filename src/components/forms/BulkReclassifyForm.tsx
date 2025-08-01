'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Category, TransactionWithDetails } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface BulkReclassifyFormProps {
  categories: Category[]
  onReclassify: (filters: ReclassifyFilters, newCategoryId: string) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

interface ReclassifyFilters {
  fromCategoryId?: string
  description?: string
  startDate?: string
  endDate?: string
  type?: 'INCOME' | 'EXPENSE'
}

interface ReclassifyFormData {
  fromCategoryId: string
  newCategoryId: string
  description: string
  startDate: string
  endDate: string
  type: string
}

export function BulkReclassifyForm({ 
  categories, 
  onReclassify, 
  onCancel, 
  loading 
}: BulkReclassifyFormProps) {
  const [previewTransactions, setPreviewTransactions] = useState<TransactionWithDetails[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ReclassifyFormData>({
    defaultValues: {
      fromCategoryId: '',
      newCategoryId: '',
      description: '',
      startDate: '',
      endDate: '',
      type: '',
    },
  })

  const watchedFilters = watch()

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name
  }))

  const typeOptions = [
    { value: '', label: 'Todos os tipos' },
    { value: 'INCOME', label: 'Receitas' },
    { value: 'EXPENSE', label: 'Despesas' },
  ]

  const handlePreview = async () => {
    // Aqui você implementaria a lógica para buscar as transações que seriam afetadas
    // Por simplicidade, vou simular uma resposta
    setPreviewLoading(true)
    
    try {
      // Simular busca de transações
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Em uma implementação real, você faria uma query no Supabase
      // const { data } = await supabase.from('transactions')...
      
      setPreviewTransactions([])
    } catch (error) {
      console.error('Erro ao buscar preview:', error)
    } finally {
      setPreviewLoading(false)
    }
  }

  const onSubmit = async (data: ReclassifyFormData) => {
    const filters: ReclassifyFilters = {
      fromCategoryId: data.fromCategoryId || undefined,
      description: data.description || undefined,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      type: data.type as 'INCOME' | 'EXPENSE' || undefined,
    }

    await onReclassify(filters, data.newCategoryId)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Categoria atual (opcional)"
            placeholder="Selecione a categoria atual"
            options={[{ value: '', label: 'Todas as categorias' }, ...categoryOptions]}
            {...register('fromCategoryId')}
          />

          <Select
            label="Nova categoria"
            placeholder="Selecione a nova categoria"
            options={categoryOptions}
            error={errors.newCategoryId?.message}
            {...register('newCategoryId', {
              required: 'Nova categoria é obrigatória'
            })}
          />
        </div>

        <Input
          label="Descrição contém (opcional)"
          placeholder="Ex: mercado, uber, etc."
          {...register('description')}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Data inicial (opcional)"
            type="date"
            {...register('startDate')}
          />

          <Input
            label="Data final (opcional)"
            type="date"
            {...register('endDate')}
          />

          <Select
            label="Tipo (opcional)"
            options={typeOptions}
            {...register('type')}
          />
        </div>

        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
            loading={previewLoading}
            className="flex-1"
          >
            Visualizar transações
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
            disabled={!watchedFilters.newCategoryId}
          >
            Reclassificar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        </div>
      </form>

      {/* Preview das transações */}
      {previewTransactions.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Transações que serão reclassificadas ({previewTransactions.length})
          </h3>
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {previewTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {transaction.description}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(transaction.transaction_date)} • {transaction.category.name}
                  </div>
                </div>
                <div className={`font-medium ${
                  transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {previewTransactions.length === 0 && !previewLoading && (
        <div className="text-center py-8 text-gray-500">
          <p>Clique em "Visualizar transações" para ver quais serão afetadas</p>
        </div>
      )}
    </div>
  )
}
