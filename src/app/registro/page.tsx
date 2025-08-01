'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { isDemoMode } from '@/lib/demo-data'

interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { signUp } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>()

  const password = watch('password')

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    setError('')

    const { error: signUpError } = await signUp(data.email, data.password, data.name)

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    } else {
      router.push('/configurar-casal')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crie sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              faça login na sua conta existente
            </Link>
          </p>
          
          {isDemoMode() && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-center">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  🎭 Modo Demonstração Ativo
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Use qualquer dados para criar conta! Exemplo:
                </p>
                <div className="bg-blue-100 rounded p-2 text-sm font-mono text-blue-800 text-left">
                  <div>👤 Nome: João Silva</div>
                  <div>📧 Email: joao@demo.com</div>
                  <div>🔒 Senha: 123456</div>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  Qualquer informação funciona - é apenas simulação!
                </p>
              </div>
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Nome completo"
              type="text"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name', {
                required: 'Nome é obrigatório',
                minLength: {
                  value: 2,
                  message: 'Nome deve ter pelo menos 2 caracteres',
                },
              })}
            />

            <Input
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido',
                },
              })}
            />

            <Input
              label="Senha"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password', {
                required: 'Senha é obrigatória',
                minLength: {
                  value: 6,
                  message: 'Senha deve ter pelo menos 6 caracteres',
                },
              })}
            />

            <Input
              label="Confirmar senha"
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Confirmação de senha é obrigatória',
                validate: (value) =>
                  value === password || 'As senhas não coincidem',
              })}
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={loading}
            >
              Criar conta
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500">
            Ao criar uma conta, você concorda com nossos{' '}
            <Link href="/termos" className="text-blue-600 hover:text-blue-500">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link href="/privacidade" className="text-blue-600 hover:text-blue-500">
              Política de Privacidade
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}