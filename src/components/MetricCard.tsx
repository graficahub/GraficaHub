'use client'

import { ReactNode } from 'react'
import Card from '@/components/ui/Card'

interface MetricCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  onClick?: () => void
  className?: string
}

export default function MetricCard({
  label,
  value,
  icon,
  onClick,
  className = '',
}: MetricCardProps) {
  return (
    <Card
      className={`
        p-4 md:p-5
        ${onClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-600 mb-1.5">{label}</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 truncate">{value}</p>
        </div>
        {icon && (
          <div className="text-xl md:text-2xl opacity-60 flex-shrink-0 ml-2">{icon}</div>
        )}
      </div>
    </Card>
  )
}

