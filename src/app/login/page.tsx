'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { isDemoMode } from '@/lib/demo-data'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { signIn } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setError('')

    const { error: signInError } = await signIn(data.email, data.password)

    if (signInError) {
      setError('Email ou senha incorretos')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Faça login na sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link
              href="/registro"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              crie uma nova conta
            </Link>
          </p>
          
          {isDemoMode() && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-center">
                <h3 className="text-sm font-medium text-green-800 mb-2">
                  🎭 Modo Demonstração Ativo
                </h3>
                <p className="text-sm text-green-700 mb-3">
                  Use qualquer email e senha para entrar! Exemplo:
                </p>
                <div className="bg-green-100 rounded p-2 text-sm font-mono text-green-800">
                  <div>📧 Email: demo@teste.com</div>
                  <div>🔒 Senha: 123456</div>
                </div>
                <p className="text-xs text-green-600 mt-2">
                  Qualquer combinação funciona - é apenas simulação!
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
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password', {
                required: 'Senha é obrigatória',
                minLength: {
                  value: 6,
                  message: 'Senha deve ter pelo menos 6 caracteres',
                },
              })}
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              loading={loading}
            >
              Entrar
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/esqueci-senha"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Esqueceu sua senha?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}