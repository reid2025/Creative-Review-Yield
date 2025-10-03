'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Custom input component with forced white styling
const WhiteInput = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={cn(
      "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      "bg-transparent placeholder:text-gray-400",
      className
    )}
    style={{ 
      color: 'white !important',
      borderColor: '#333333',
      '--tw-ring-color': '#333333'
    }}
  />
)

interface CTAFilters {
  ctaVerb: string[]
  ctaStyleGroup: string[]
  ctaColor: string[]
  ctaPosition: string[]
}

interface CTAAccordionProps {
  filters: CTAFilters
  onChange: (filters: Partial<CTAFilters>) => void
  isOpen?: boolean
  onToggle?: () => void
  dynamicOptions?: {
    ctaVerb?: string[]
    ctaStyleGroup?: string[]
    ctaColor?: string[]
    ctaPosition?: string[]
  }
}

interface MultiSelectProps {
  label: string
  options: string[]
  selectedValues: string[]
  onChange: (values: string[]) => void
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
                <span className="text-2xl mb-2">😭</span>
                <span className="text-white text-sm">No options found</span>
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
                          <div className="w-2 h-2 bg-white rounded"></div>
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

export const CTAAccordion: React.FC<CTAAccordionProps> = ({
  filters,
  onChange,
  isOpen = false,
  onToggle,
  dynamicOptions
}) => {

  // Use dynamic options if available, otherwise fall back to static options
  const ctaVerbOptions = dynamicOptions?.ctaVerb || [
    'Get', 'Buy', 'Shop', 'Download', 'Try', 'Start', 'Join', 'Sign Up', 'Learn More', 'Contact'
  ]

  const ctaStyleGroupOptions = dynamicOptions?.ctaStyleGroup || [
    'Button', 'Text Link', 'Banner', 'Card', 'Popup', 'Inline', 'Floating', 'Sticky'
  ]

  const ctaColorOptions = dynamicOptions?.ctaColor || [
    'Primary', 'Secondary', 'Blue', 'Green', 'Red', 'Orange', 'Purple', 'Black', 'White', 'Gray'
  ]

  const ctaPositionOptions = dynamicOptions?.ctaPosition || [
    'Top', 'Bottom', 'Left', 'Right', 'Center', 'Header', 'Footer', 'Sidebar', 'Overlay'
  ]

  return (
    <div className="w-full" data-cta-accordion="true">
      {/* Accordion Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left rounded-t-[30px]"
        style={{ border: 'none !important' }}
      >
        <span className="text-white font-medium text-sm">CTA</span>
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
          <MultiSelect
            label="CTA Verb"
            options={ctaVerbOptions}
            selectedValues={filters.ctaVerb}
            onChange={(values) => onChange({ ctaVerb: values })}
          />

          <MultiSelect
            label="CTA Style Group"
            options={ctaStyleGroupOptions}
            selectedValues={filters.ctaStyleGroup}
            onChange={(values) => onChange({ ctaStyleGroup: values })}
          />

          <MultiSelect
            label="CTA Color"
            options={ctaColorOptions}
            selectedValues={filters.ctaColor}
            onChange={(values) => onChange({ ctaColor: values })}
          />

          <MultiSelect
            label="CTA Position"
            options={ctaPositionOptions}
            selectedValues={filters.ctaPosition}
            onChange={(values) => onChange({ ctaPosition: values })}
          />
        </div>
      )}
    </div>
  )
}