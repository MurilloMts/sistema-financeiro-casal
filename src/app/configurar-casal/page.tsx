'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import { isDemoMode } from '@/lib/demo-data'

interface CoupleSetupForm {
  action: 'create' | 'join'
  coupleName?: string
  inviteCode?: string
}

export default function CoupleSetupPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [action, setAction] = useState<'create' | 'join'>('create')
  const router = useRouter()
  const { user, updateProfile } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CoupleSetupForm>()

  const onSubmit = async (data: CoupleSetupForm) => {
    if (!user) return

    setLoading(true)
    setError('')

    try {
      // Se estiver em modo demo, simular criação/junção
      if (isDemoMode()) {
        // Simular carregamento
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Simular sucesso
        router.push('/dashboard')
        return
      }

      if (action === 'create') {
        // Criar novo casal
        const { data: couple, error: coupleError } = await supabase
          .from('couples')
          .insert({
            name: data.coupleName!,
          })
          .select()
          .single()

        if (coupleError) throw coupleError

        // Atualizar perfil do usuário
        const { error: profileError } = await updateProfile({
          couple_id: couple.id,
        })

        if (profileError) throw profileError

      } else {
        // Juntar-se a casal existente
        const { data: couple, error: coupleError } = await supabase
          .from('couples')
          .select('id')
          .eq('id', data.inviteCode!)
          .single()

        if (coupleError) {
          throw new Error('Código de convite inválido')
        }

        // Verificar se já não há 2 pessoas no casal
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id')
          .eq('couple_id', couple.id)

        if (profilesError) throw profilesError

        if (profiles.length >= 2) {
          throw new Error('Este casal já está completo')
        }

        // Atualizar perfil do usuário
        const { error: profileError } = await updateProfile({
          couple_id: couple.id,
        })

        if (profileError) throw profileError
      }

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Configure seu casal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Crie um novo casal ou junte-se a um existente
          </p>
          
          {isDemoMode() && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 text-center">
                🎭 <strong>Modo Demo:</strong> Qualquer nome funciona! Isso é apenas uma simulação.
              </p>
            </div>
          )}
        </div>

        <div className="flex space-x-4 mb-6">
          <Button
            variant={action === 'create' ? 'primary' : 'outline'}
            onClick={() => setAction('create')}
            className="flex-1"
          >
            Criar casal
          </Button>
          <Button
            variant={action === 'join' ? 'primary' : 'outline'}
            onClick={() => setAction('join')}
            className="flex-1"
          >
            Juntar-se
          </Button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {action === 'create' ? (
            <Input
              label="Nome do casal"
              type="text"
              placeholder="Ex: João e Maria"
              error={errors.coupleName?.message}
              {...register('coupleName', {
                required: 'Nome do casal é obrigatório',
                minLength: {
                  value: 3,
                  message: 'Nome deve ter pelo menos 3 caracteres',
                },
              })}
            />
          ) : (
            <div className="space-y-4">
              <Input
                label="Código de convite"
                type="text"
                placeholder="Cole o código de convite aqui"
                error={errors.inviteCode?.message}
                {...register('inviteCode', {
                  required: 'Código de convite é obrigatório',
                })}
              />
              <div className="text-sm text-gray-600">
                <p>Peça para seu parceiro(a) compartilhar o código de convite.</p>
                <p>O código está disponível no dashboard após criar o casal.</p>
              </div>
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={loading}
            >
              {action === 'create' ? 'Criar casal' : 'Juntar-se ao casal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
