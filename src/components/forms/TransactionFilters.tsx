'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { TransactionFilters as ITransactionFilters, Category, Profile } from '@/types'
import { useCategories } from '@/hooks/useCategories'
import { useAuth } from '@/hooks/useAuth'
import { formatDateInput } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface TransactionFiltersProps {
  onFiltersChange: (filters: ITransactionFilters) => void
  initialFilters?: ITransactionFilters
}

interface FilterFormData {
  search: string
  type: string
  category_id: string
  user_id: string
  start_date: string
  end_date: string
}

export function TransactionFilters({ onFiltersChange, initialFilters }: TransactionFiltersProps) {
  const [coupleMembers, setCoupleMembers] = useState<Profile[]>([])
  const { categories } = useCategories()
  const { profile } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
  } = useForm<FilterFormData>({
    defaultValues: {
      search: initialFilters?.search || '',
      type: initialFilters?.type || '',
      category_id: initialFilters?.category_id || '',
      user_id: initialFilters?.user_id || '',
      start_date: initialFilters?.start_date || '',
      end_date: initialFilters?.end_date || '',
    },
  })

  // Carregar membros do casal
  useEffect(() => {
    const loadCoupleMembers = async () => {
      if (!profile?.couple_id) return

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('couple_id', profile.couple_id)

        if (error) throw error
        setCoupleMembers(data || [])
      } catch (error) {
        console.error('Erro ao carregar membros do casal:', error)
      }
    }

    loadCoupleMembers()
  }, [profile?.couple_id])

  // Observar mudanças nos filtros
  const watchedValues = watch()

  useEffect(() => {
    const filters: ITransactionFilters = {}
    
    if (watchedValues.search) filters.search = watchedValues.search
    if (watchedValues.type) filters.type = watchedValues.type as 'INCOME' | 'EXPENSE'
    if (watchedValues.category_id) filters.category_id = watchedValues.category_id
    if (watchedValues.user_id) filters.user_id = watchedValues.user_id
    if (watchedValues.start_date) filters.start_date = watchedValues.start_date
    if (watchedValues.end_date) filters.end_date = watchedValues.end_date

    onFiltersChange(filters)
  }, [watchedValues, onFiltersChange])

  const typeOptions = [
    { value: '', label: 'Todos os tipos' },
    { value: 'INCOME', label: 'Receitas' },
    { value: 'EXPENSE', label: 'Despesas' },
  ]

  const categoryOptions = [
    { value: '', label: 'Todas as categorias' },
    ...categories.map(category => ({
      value: category.id,
      label: category.name
    }))
  ]

  const userOptions = [
    { value: '', label: 'Todos os usuários' },
    ...coupleMembers.map(member => ({
      value: member.id,
      label: member.name
    }))
  ]

  const handleClearFilters = () => {
    reset({
      search: '',
      type: '',
      category_id: '',
      user_id: '',
      start_date: '',
      end_date: '',
    })
  }

  const setQuickDateFilter = (days: number) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    setValue('start_date', formatDateInput(startDate))
    setValue('end_date', formatDateInput(endDate))
  }

  const setCurrentMonth = () => {
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    setValue('start_date', formatDateInput(startDate))
    setValue('end_date', formatDateInput(endDate))
  }

  const setLastMonth = () => {
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0)

    setValue('start_date', formatDateInput(startDate))
    setValue('end_date', formatDateInput(endDate))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        <Button
          type="button"
          variant="ghost"
          onClick={handleClearFilters}
          className="text-sm"
        >
          Limpar filtros
        </Button>
      </div>

      <div className="space-y-4">
        {/* Busca por texto */}
        <Input
          placeholder="Buscar por descrição..."
          {...register('search')}
        />

        {/* Filtros principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Tipo"
            options={typeOptions}
            {...register('type')}
          />

          <Select
            label="Categoria"
            options={categoryOptions}
            {...register('category_id')}
          />

          <Select
            label="Responsável"
            options={userOptions}
            {...register('user_id')}
          />
        </div>

        {/* Filtros de data */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Data inicial"
              type="date"
              {...register('start_date')}
            />

            <Input
              label="Data final"
              type="date"
              {...register('end_date')}
            />
          </div>

          {/* Filtros rápidos de data */}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickDateFilter(7)}
            >
              Últimos 7 dias
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickDateFilter(30)}
            >
              Últimos 30 dias
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={setCurrentMonth}
            >
              Este mês
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={setLastMonth}
            >
              Mês passado
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}