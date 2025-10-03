'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Add styles directly to override global CSS
const pillSelectedStyle = {
  color: '#000000 !important',
  backgroundColor: '#ffffff'
} as React.CSSProperties

interface BrandDesignFilters {
  clientBranding: 'yes' | 'no' | 'any'
  iconsUsed: 'yes' | 'no' | 'any'
  headlineTags: string[]
}

interface BrandDesignAccordionProps {
  filters: BrandDesignFilters
  onChange: (filters: Partial<BrandDesignFilters>) => void
  isOpen?: boolean
  onToggle?: () => void
  dynamicOptions?: {
    headlineTags?: string[]
  }
}

interface PillToggleProps {
  value: 'yes' | 'no' | 'any'
  onChange: (value: 'yes' | 'no' | 'any') => void
  label: string
}

interface MultiSelectProps {
  label: string
  options: string[]
  selectedValues: string[]
  onChange: (values: string[]) => void
}

const PillToggle: React.FC<PillToggleProps> = ({ value, onChange, label }) => {
  const options: Array<{ value: 'yes' | 'no' | 'any'; label: string }> = [
    { value: 'any', label: 'Any' },
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ]

  return (
    <div className="space-y-2">
      <Label className="text-white text-sm font-medium uppercase">{label}</Label>
      <div className="flex space-x-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              value === option.value
                ? "bg-white pill-selected"
                : "bg-transparent text-white hover:bg-white/10"
            )}
            style={
              value === option.value
                ? pillSelectedStyle
                : { borderColor: '#333333' }
            }
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selectedValues, onChange }) => {
  const [open, setOpen] = useState(false)

  const handleToggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option))
    } else {
      onChange([...selectedValues, option])
    }
  }

  const getDisplayValue = () => {
    if (selectedValues.length === 0) return `Select ${label}`
    if (selectedValues.length === 1) return selectedValues[0]
    return `${selectedValues.length} selected`
  }

  return (
    <div className="space-y-2">
      <Label className="text-white text-sm font-medium uppercase">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between text-white hover:bg-white/10 hover:text-white"
            )}
            style={{ 
              color: 'white !important',
              backgroundColor: 'transparent',
              border: '1px solid #333333 !important'
            }}
          >
            <span className="text-white truncate">
              {getDisplayValue()}
            </span>
            <ChevronDown className="h-4 w-4 text-white flex-shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="p-2 bg-black text-white border-[#333333]" 
          style={{ 
            backgroundColor: '#141414', 
            color: 'white',
            width: 'var(--radix-popover-trigger-width)'
          }}
          sideOffset={4}
        >
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <span className="text-2xl mb-2">😥</span>
                <span className="text-white text-sm">No branding options found</span>
              </div>
            ) : (
              options.map((option) => (
                <Button
                  key={option}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-white hover:bg-white/10 hover:text-white",
                    selectedValues.includes(option) && "bg-white/20 text-white"
                  )}
                  style={{ color: 'white' }}
                  onClick={() => handleToggleOption(option)}
                >
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      "w-4 h-4 border rounded",
                      selectedValues.includes(option) ? "bg-white border-white" : "border-gray-400"
                    )}>
                      {selectedValues.includes(option) && (
                        <div className="w-full h-full bg-white rounded flex items-center justify-center">
                          <div className="w-2 h-2 bg-black rounded"></div>
                        </div>
                      )}
                    </div>
                    <span style={{ color: '#ffffff' }}>{option}</span>
                  </div>
                </Button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export const BrandDesignAccordion: React.FC<BrandDesignAccordionProps> = ({
  filters,
  onChange,
  isOpen = false,
  onToggle,
  dynamicOptions
}) => {

  // Use dynamic options if available, otherwise fall back to static options
  const headlineTagOptions = dynamicOptions?.headlineTags || [
    'Offer', 'Eligibility', 'Legal', 'Benefit', 'Urgent', 'Limited Time', 'New', 'Free', 'Sale', 'Exclusive', 'Best Seller', 'Popular', 'Trending', 'Premium'
  ]

  return (
    <div className="w-full" data-brand-design-accordion="true">
      {/* Accordion Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left rounded-t-[30px]"
        style={{ border: 'none !important' }}
      >
        <span className="text-white font-medium text-sm">Brand & Design</span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-white transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 space-y-4">
          <PillToggle
            label="Client Branding"
            value={filters.clientBranding}
            onChange={(value) => onChange({ clientBranding: value })}
          />

          <PillToggle
            label="Icons Used"
            value={filters.iconsUsed}
            onChange={(value) => onChange({ iconsUsed: value })}
          />

          <MultiSelect
            label="Headline Tags"
            options={headlineTagOptions}
            selectedValues={filters.headlineTags}
            onChange={(values) => onChange({ headlineTags: values })}
          />
        </div>
      )}
    </div>
  )
}