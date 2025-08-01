'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      <div className="relative">
        <div className={cn(
          'animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700',
          sizeClasses[size]
        )}>
          <div className={cn(
            'absolute top-0 left-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin',
            sizeClasses[size]
          )} />
        </div>
      </div>
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

export function LoadingOverlay({ children, loading, text }: {
  children: React.ReactNode
  loading: boolean
  text?: string
}) {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10 animate-fade-in">
          <LoadingSpinner size="lg" text={text} />
        </div>
      )}
    </div>
  )
}
