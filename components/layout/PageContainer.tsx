// Shared Page Container for consistent layout across the app

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full" | "none"
  withBackground?: boolean
  withShadow?: boolean
  withBorder?: boolean
  spacing?: "sm" | "md" | "lg" | "xl"
}

export function PageContainer({
  children,
  className,
  maxWidth = "6xl",
  withBackground = true,
  withShadow = true,
  withBorder = true,
  spacing = "lg"
}: PageContainerProps) {
  const maxWidthClasses = {
    xl: "max-w-xl",
    "2xl": "max-w-2xl", 
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
    none: ""
  }

  const spacingClasses = {
    sm: "space-y-4",
    md: "space-y-6", 
    lg: "space-y-8",
    xl: "space-y-12"
  }

  return (
    <div className={cn(
      "w-full mx-auto",
      maxWidth !== "none" && maxWidthClasses[maxWidth],
      className
    )}>
      <div className={cn(
        "w-full",
        withBackground && "bg-white",
        withShadow && "shadow-sm",
        withBorder && "border border-gray-200",
        "rounded-xl",
        "p-6 md:p-8",
        spacingClasses[spacing]
      )}>
        {children}
      </div>
    </div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  className?: string
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      {description && (
        <p className="text-gray-600">{description}</p>
      )}
    </div>
  )
}