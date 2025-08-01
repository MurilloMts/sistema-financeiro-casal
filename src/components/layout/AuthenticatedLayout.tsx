'use client'

import { useAuth } from '@/hooks/useAuth'
import { Navigation } from './Navigation'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Navigation />
      
      {/* Desktop Layout */}
      <div className="lg:pl-64">
        <main className="flex-1">
          {children}
        </main>
      </div>
      
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
