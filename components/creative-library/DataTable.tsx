'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Eye, FileText, ChevronDown } from 'lucide-react'
import { EmptyState } from './EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { formatCT, fromFirebaseTimestamp } from '@/lib/timezone-utils'

interface Creative {
  id: string
  imageUrl?: string
  accountName?: string
  campaignName?: string
  headlineTags?: string[]
  tags?: string[]
  performance?: {
    cpl?: number
    cpc?: number
    totalSpend?: number
    updatedAt?: any
    source?: string
  }
  updatedAt?: any
  // Content attributes for table filtering
  preheadline?: string
  headline?: string
  ctaLabel?: string
  ctaVerb?: string
  ctaStyleGroup?: string
  ctaColor?: string
  ctaPosition?: string
  copyAngle?: string[]
  copyTone?: string[]
  legalLanguage?: boolean
  dollarAmount?: boolean
  statMentioned?: boolean
  emotionalStatement?: boolean
  conditionsListed?: boolean
  designerRemarks?: string
  internalNotes?: string
  uploadGoogleDocLink?: string
}

interface TableFilters {
  // Performance filters
  totalSpendMin: number | null
  totalSpendMax: number | null
  cplMin: number | null
  cplMax: number | null
  cpcMin: number | null
  cpcMax: number | null
  performanceSources: string[]
  
  // Text search filters
  preheadlineText: string
  headlineText: string
  ctaLabelText: string
  designerRemarksText: string
  internalNotesText: string
  
  // Multi-select filters
  copyAngles: string[]
  copyTones: string[]
  ctaVerbs: string[]
  ctaStyleGroups: string[]
  ctaColors: string[]
  ctaPositions: string[]
  
  // Boolean filters (tri-state: null = any, true = yes, false = no)
  legalLanguage: boolean | null
  dollarAmount: boolean | null
  statMentioned: boolean | null
  emotionalStatement: boolean | null
  conditionsListed: boolean | null
  hasGoogleDocLink: boolean | null
}

interface DataTableProps {
  creatives: Creative[]
  filters: TableFilters
  onChange: (filters: Partial<TableFilters>) => void
  sort: string
  onSortChange: (sort: string) => void
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onEditCreative: (creativeId: string) => void
  onResetFilters?: () => void
}

interface TriStateSwitchProps {
  label: string
  value: boolean | null
  onChange: (value: boolean | null) => void
}

const formatCTTime = (date: Date | any | null | undefined): string => {
  if (!date) return 'Never'
  
  // Handle Firebase timestamps
  if (date.toDate && typeof date.toDate === 'function') {
    return formatCT(fromFirebaseTimestamp(date), 'MMM d, yyyy')
  }
  
  return formatCT(date, 'MMM d, yyyy')
}

const TriStateSwitch: React.FC<TriStateSwitchProps> = ({ label, value, onChange }) => {
  const handleClick = () => {
    if (value === null) onChange(true)
    else if (value === true) onChange(false)
    else onChange(null)
  }

  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm">{label}</Label>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className={cn(
          "h-6 px-2 text-xs",
          value === null && "text-gray-500",
          value === true && "text-green-600 bg-green-50",
          value === false && "text-red-600 bg-red-50"
        )}
      >
        {value === null ? 'Any' : value ? 'Yes' : 'No'}
      </Button>
    </div>
  )
}

const MultiSelectFilter: React.FC<{
  title: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
}> = ({ title, options, selected, onChange }) => {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start h-7 text-xs px-2">
          {selected.length === 0 ? title : `${title} (${selected.length})`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <div className="p-3 border-b">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="max-h-48 overflow-y-auto p-2">
          {filteredOptions.map((option) => (
            <div key={option} className="flex items-center space-x-2 py-1.5">
              <Checkbox
                checked={selected.includes(option)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...selected, option])
                  } else {
                    onChange(selected.filter(s => s !== option))
                  }
                }}
              />
              <label className="text-sm cursor-pointer flex-1">{option}</label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const DataTable: React.FC<DataTableProps> = () => {
  return null
}