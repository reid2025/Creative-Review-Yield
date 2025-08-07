'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface FormCardSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormCardSection({ 
  title, 
  description, 
  children, 
  className = "bg-white border-gray-200 shadow-lg rounded-2xl" 
}: FormCardSectionProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}