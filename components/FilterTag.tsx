'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterTagProps {
  label: string
  type: 'search' | 'date' | 'account' | 'campaign' | 'status' | 'history'
  onRemove: () => void
  className?: string
}

export function FilterTag({ label, type, onRemove, className }: FilterTagProps) {
  // Color coding based on filter type
  const getTagStyles = (type: string) => {
    switch (type) {
      case 'search':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'date':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'account':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'campaign':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'status':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'history':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-[13px] font-medium border',
        getTagStyles(type),
        className
      )}
    >
      <span className="truncate max-w-[200px]">{label}</span>
      <button
        onClick={onRemove}
        className="ml-1 bg-white hover:bg-gray-100 rounded-full p-1 transition-colors shadow-sm"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3 text-gray-600" />
      </button>
    </div>
  )
}