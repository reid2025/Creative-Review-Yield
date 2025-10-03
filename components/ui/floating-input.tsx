"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: React.ReactNode
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, icon, value, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          className={cn(
            "h-11 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-500 focus-visible:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50 hover:border-gray-400",
            icon && "pl-10",
            className
          )}
          placeholder={label}
          value={value}
          ref={ref}
          {...props}
        />
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black">
            {icon}
          </div>
        )}
      </div>
    )
  }
)
FloatingInput.displayName = "FloatingInput"

export { FloatingInput }