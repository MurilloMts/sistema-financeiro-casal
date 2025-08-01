'use client'

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
}

export function Skeleton({ className = '', width = '100%', height = '1rem' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ width, height }}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="space-y-4">
        <Skeleton height="1.5rem" width="60%" />
        <Skeleton height="2rem" width="40%" />
        <div className="space-y-2">
          <Skeleton height="1rem" width="80%" />
          <Skeleton height="1rem" width="70%" />
        </div>
      </div>
    </div>
  )
}

export function TransactionSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <Skeleton width="2.5rem" height="2.5rem" className="rounded-full" />
        <div className="space-y-2">
          <Skeleton height="1rem" width="8rem" />
          <Skeleton height="0.75rem" width="6rem" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <Skeleton height="1rem" width="4rem" />
        <Skeleton height="0.75rem" width="3rem" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <Skeleton height="1.5rem" width="30%" />
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, index) => (
          <TransactionSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
      
      {/* Seções principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <CardSkeleton />
          <TableSkeleton rows={3} />
        </div>
        <div className="space-y-6">
          <CardSkeleton />
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Skeleton height="1.5rem" width="40%" className="mb-4" />
            <Skeleton height="200px" width="100%" />
          </div>
        </div>
      </div>
    </div>
  )
}