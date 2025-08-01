'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { DashboardCards } from '@/components/ui/DashboardCards'
import { QuickActions } from '@/components/ui/QuickActions'
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout'
import { useDashboard } from '@/hooks/useDashboard'

export default function DashboardPage() {
  const { user, profile, signOut } = useAuth()
  const { refetch } = useDashboard()

  const handleSignOut = async () => {
    await signOut()
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Carregando...
          </h1>
        </div>
      </div>
    )
  }

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Financeiro
              </h1>
              <p className="text-gray-600 mt-1">
                Olá, {profile.name}! Acompanhe suas finanças em tempo real.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={refetch} 
                variant="outline" 
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                🔄 Atualizar
              </Button>
              <Button onClick={handleSignOut} variant="outline">
                Sair
              </Button>
            </div>
          </div>

          {/* Informação do Casal */}
          {profile.couple_id && (
            <div className="mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  ✅ Sistema configurado para o casal
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Código do casal: <code className="bg-green-100 px-2 py-1 rounded font-mono">{profile.couple_id}</code>
                </p>
              </div>
            </div>
          )}

          {/* Cards Principais */}
          <div className="mb-8">
            <DashboardCards />
          </div>

          {/* Ações Rápidas */}
          <div className="mb-8">
            <QuickActions />
          </div>

          {/* Links de Navegação */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Acesso Rápido às Funcionalidades
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a
                href="/transacoes"
                className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Transações</p>
                  <p className="text-sm text-gray-500">Receitas e despesas</p>
                </div>
              </a>
              
              <a
                href="/contas"
                className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Contas a Pagar</p>
                  <p className="text-sm text-gray-500">Controle de vencimentos</p>
                </div>
              </a>

              <a
                href="/cartoes"
                className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Cartões de Crédito</p>
                  <p className="text-sm text-gray-500">Controle de limites e gastos</p>
                </div>
              </a>
              
              <a
                href="/categorias"
                className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Categorias</p>
                  <p className="text-sm text-gray-500">Organizar gastos</p>
                </div>
              </a>
              
              <a
                href="/orcamentos"
                className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Orçamentos</p>
                  <p className="text-sm text-gray-500">Planejamento mensal</p>
                </div>
              </a>
              
              <a
                href="/relatorios"
                className="flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Relatórios</p>
                  <p className="text-sm text-gray-500">Análises detalhadas</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}