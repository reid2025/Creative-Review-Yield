"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface InnerMenuItem {
  id: string
  label: string
}

interface InnerMenuProps {
  items: InnerMenuItem[]
  activeItem: string
  onItemChange: (itemId: string) => void
  className?: string
}

export function InnerMenu({ items, activeItem, onItemChange, className }: InnerMenuProps) {
  return (
    <Tabs value={activeItem} onValueChange={onItemChange} className="w-full">
      <TabsList className={`w-[440px] grid ${getGridCols(items.length)} ${className || ''}`}>
        {items.map((item) => (
          <TabsTrigger key={item.id} value={item.id}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

function getGridCols(count: number): string {
  switch (count) {
    case 2:
      return 'grid-cols-2'
    case 3:
      return 'grid-cols-3'
    case 4:
      return 'grid-cols-4'
    case 5:
      return 'grid-cols-5'
    default:
      return 'grid-cols-2'
  }
}