"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface FloatingSelectProps {
  label: string
  icon?: React.ReactNode
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
  placeholder?: string
}

const FloatingSelect = React.forwardRef<HTMLButtonElement, FloatingSelectProps>(
  ({ className, label, icon, value, onValueChange, children, placeholder, ...props }, ref) => {
    return (
      <div className="relative">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger
            ref={ref}
            className={cn(
              "h-11 border-gray-300 focus:ring-1 focus:ring-gray-500 focus:border-gray-500 rounded-md hover:border-gray-400 [&>svg]:hidden font-medium font-['DM_Sans'] leading-5",
              icon && "pl-10 pr-12",
              !icon && "pl-3 pr-12",
              className
            )}
            {...props}
          >
            {icon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black">
                {icon}
              </div>
            )}
            <SelectValue placeholder={placeholder || label} className="whitespace-nowrap" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 pointer-events-none">
              <ChevronDown className="h-4 w-4 text-black" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {children}
          </SelectContent>
        </Select>
      </div>
    )
  }
)
FloatingSelect.displayName = "FloatingSelect"

export { FloatingSelect }