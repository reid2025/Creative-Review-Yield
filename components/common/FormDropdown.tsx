'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DropdownOption {
  label: string
  description?: string
  onClick: () => void
}

interface FormDropdownProps {
  trigger: React.ReactNode
  options: DropdownOption[]
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
  disabled?: boolean
}

export function FormDropdown({
  trigger,
  options,
  align = 'end',
  side = 'bottom',
  className = '',
  disabled = false
}: FormDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className={className}>
        {options.map((option, index) => (
          <DropdownMenuItem 
            key={index} 
            onClick={option.onClick}
            className={option.description ? "flex-col items-start gap-1 p-4" : ""}
          >
            <div className="">{option.label}</div>
            {option.description && (
              <div className="text-xs text-gray-500">
                {option.description}
              </div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}