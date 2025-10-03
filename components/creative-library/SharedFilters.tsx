'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, Calendar, Users, Tag, X, ChevronDown, User, Building } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface FilterState {
  search: string
  dateMode: 'added' | 'updated'
  datePreset: string
  dateRange: { start: Date | null; end: Date | null }
  accounts: string[]
  campaigns: string[]
  designers: string[]
  litigationNames: string[]
  // Performance filters
  totalSpendMin: number | null
  totalSpendMax: number | null
  cplMin: number | null
  cplMax: number | null
  cpcMin: number | null
  cpcMax: number | null
  // Status and tags
  status: string[]
  tags: string[]
  // Advanced filters - Copy related
  preheadlineText: string
  headlineText: string
  ctaLabelText: string
  copyAngles: string[]
  copyTones: string[]
  ctaVerbs: string[]
  ctaStyleGroups: string[]
  ctaColors: string[]
  ctaPositions: string[]
  // Advanced filters - Flags
  legalLanguage: boolean | null
  dollarAmount: boolean | null
  statMentioned: boolean | null
  emotionalStatement: boolean | null
  conditionsListed: boolean | null
  hasGoogleDocLink: boolean | null
  designerRemarksText: string
  internalNotesText: string
}

interface SharedFiltersProps {
  filters: FilterState
  onChange: (filters: Partial<FilterState>) => void
  availableAccounts: string[]
  availableCampaigns: string[]
  availableDesigners: string[]
  availableLitigationNames: string[]
  availableTags?: string[]
  availableCopyAngles?: string[]
  availableCopyTones?: string[]
  availableCtaVerbs?: string[]
  availableCtaStyleGroups?: string[]
  availableCtaColors?: string[]
  availableCtaPositions?: string[]
  className?: string
}

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder: string
  icon: React.ComponentType<{ className?: string }>
  disabled?: boolean
}

interface TriStateSelectProps {
  value: boolean | null
  onChange: (value: boolean | null) => void
  placeholder: string
  className?: string
}

const TriStateSelect: React.FC<TriStateSelectProps> = ({
  value,
  onChange,
  placeholder,
  className
}) => {
  const getDisplayValue = () => {
    if (value === null) return 'Any'
    return value ? 'Yes' : 'No'
  }

  return (
    <Select 
      value={value === null ? 'any' : value.toString()} 
      onValueChange={(val) => onChange(val === 'any' ? null : val === 'true')}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">Any</SelectItem>
        <SelectItem value="true">Yes</SelectItem>
        <SelectItem value="false">No</SelectItem>
      </SelectContent>
    </Select>
  )
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder,
  icon: Icon,
  disabled = false
}) => {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  const handleSearchChange = useCallback((value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(value)
    }, 150)
  }, [])

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedOptions = options.filter(option => selected.includes(option))
  const unselectedOptions = filteredOptions.filter(option => !selected.includes(option))

  const handleToggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option))
    } else {
      onChange([...selected, option])
    }
  }

  const handleSelectAll = () => {
    onChange(filteredOptions)
  }

  const handleClearAll = () => {
    onChange([])
  }

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-7 justify-start text-xs px-2",
            selected.length > 0 ? "border-blue-500 bg-blue-50" : "border-gray-200"
          )}
        >
          <Icon className="h-3.5 w-3.5 text-gray-500 mr-2" />
          <span className="text-left flex-1">
            {selected.length === 0 
              ? placeholder
              : selected.length === 1 
                ? selected[0]
                : `${selected.length} selected`
            }
          </span>
          <ChevronDown className="h-3.5 w-3.5 ml-2 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <Input
            placeholder="Search..."
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-7"
          />
        </div>
        
        <div className="p-2">
          <div className="flex justify-between mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              disabled={filteredOptions.length === 0}
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={selected.length === 0}
            >
              Clear All
            </Button>
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto">
          {selectedOptions.length > 0 && (
            <>
              <div className="px-3 py-1 text-xs text-gray-500 bg-gray-50">
                Selected ({selectedOptions.length})
              </div>
              {selectedOptions.map((option) => (
                <div
                  key={`selected-${option}`}
                  className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50"
                >
                  <Checkbox
                    checked={true}
                    onCheckedChange={() => handleToggleOption(option)}
                  />
                  <label className="text-sm cursor-pointer flex-1">
                    {option}
                  </label>
                </div>
              ))}
              {unselectedOptions.length > 0 && (
                <div className="border-t mx-3 my-1" />
              )}
            </>
          )}

          {unselectedOptions.length > 0 ? (
            unselectedOptions.map((option) => (
              <div
                key={`unselected-${option}`}
                className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50"
              >
                <Checkbox
                  checked={false}
                  onCheckedChange={() => handleToggleOption(option)}
                />
                <label className="text-sm cursor-pointer flex-1">
                  {option}
                </label>
              </div>
            ))
          ) : selectedOptions.length === 0 && searchTerm ? (
            <div className="px-3 py-6 text-center text-gray-500">
              <p>No results for "{searchTerm}"</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  handleSearchChange('')
                }}
                className="mt-2"
              >
                Clear search
              </Button>
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const SharedFilters: React.FC<SharedFiltersProps> = () => {
  return null
}