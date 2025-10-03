'use client'

import { useState } from 'react'
import { ChevronDown, CalendarDays } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Add styles directly to override global CSS
const pillSelectedStyle = {
  color: '#000000 !important',
  backgroundColor: '#ffffff'
} as React.CSSProperties

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

interface PerformanceFilters {
  dateRange: {
    from?: Date
    to?: Date
    preset: string
  }
  totalSpendMin: number | null
  totalSpendMax: number | null
  cplMin: number | null
  cplMax: number | null
  cpcMin: number | null
  cpcMax: number | null
  markedAsTopAd: 'yes' | 'no' | 'any'
  optimization: 'yes' | 'no' | 'any'
}

interface PerformanceAccordionProps {
  filters: PerformanceFilters
  onChange: (filters: Partial<PerformanceFilters>) => void
  isOpen?: boolean
  onToggle?: () => void
}

interface PillToggleProps {
  value: 'yes' | 'no' | 'any'
  onChange: (value: 'yes' | 'no' | 'any') => void
  label: string
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

const NumberRangeInput: React.FC<{
  label: string
  minValue: number | null
  maxValue: number | null
  onMinChange: (value: number | null) => void
  onMaxChange: (value: number | null) => void
  placeholder?: { min: string; max: string }
}> = ({ label, minValue, maxValue, onMinChange, onMaxChange, placeholder }) => {
  const handleMinChange = (value: number | null) => {
    if (value !== null && maxValue !== null && value > maxValue) {
      // If min is greater than max, reset max to null or set it to min
      onMaxChange(null)
    }
    onMinChange(value)
  }

  const handleMaxChange = (value: number | null) => {
    if (value !== null && minValue !== null && value < minValue) {
      // If max is less than min, reset min to null or set it to max
      onMinChange(null)
    }
    onMaxChange(value)
  }

  return (
    <div className="space-y-2">
      <Label className="text-white text-sm font-medium uppercase">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <WhiteInput
            type="number"
            placeholder={placeholder?.min || "Min"}
            value={minValue || ''}
            max={maxValue || undefined}
            onChange={(e) => handleMinChange(e.target.value ? parseFloat(e.target.value) : null)}
            style={{
              color: 'white !important',
              borderColor: minValue !== null && maxValue !== null && minValue > maxValue ? '#ef4444' : '#333333',
              '--tw-ring-color': '#333333'
            }}
          />
          {minValue !== null && maxValue !== null && minValue > maxValue && (
            <div className="absolute -bottom-5 left-0 text-xs text-red-400">
              Min cannot exceed max
            </div>
          )}
        </div>
        <div className="relative">
          <WhiteInput
            type="number"
            placeholder={placeholder?.max || "Max"}
            value={maxValue || ''}
            min={minValue || undefined}
            onChange={(e) => handleMaxChange(e.target.value ? parseFloat(e.target.value) : null)}
            style={{
              color: 'white !important',
              borderColor: minValue !== null && maxValue !== null && maxValue < minValue ? '#ef4444' : '#333333',
              '--tw-ring-color': '#333333'
            }}
          />
          {minValue !== null && maxValue !== null && maxValue < minValue && (
            <div className="absolute -bottom-5 left-0 text-xs text-red-400">
              Max cannot be less than min
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const DateRangePicker: React.FC<{
  value: { from?: Date; to?: Date; preset: string }
  onChange: (value: { from?: Date; to?: Date; preset: string }) => void
}> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false)
  
  const presets = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'this_week' },
    { label: 'This Month', value: 'this_month' },
    { label: 'This Year', value: 'this_year' },
  ]

  const getDisplayValue = () => {
    const preset = presets.find(p => p.value === value.preset)
    return preset ? preset.label : 'Select Date Range'
  }

  const handlePresetClick = (presetValue: string) => {
    const now = new Date()
    let from: Date | undefined
    let to: Date | undefined

    switch (presetValue) {
      case 'today':
        from = to = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'yesterday':
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        from = to = yesterday
        break
      case 'this_week':
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
        from = startOfWeek
        to = now
        break
      case 'this_month':
        from = new Date(now.getFullYear(), now.getMonth(), 1)
        to = now
        break
      case 'this_year':
        from = new Date(now.getFullYear(), 0, 1)
        to = now
        break
    }

    onChange({ from, to, preset: presetValue })
    setOpen(false)
  }

  return (
    <div className="space-y-2">
      <Label className="text-white text-sm font-medium uppercase">Date Range</Label>
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
            <span className="flex items-center text-white">
              <CalendarDays className="mr-2 h-4 w-4 text-white" />
              {getDisplayValue()}
            </span>
            <ChevronDown className="h-4 w-4 text-white" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2 bg-black text-white border-[#333333]" style={{ backgroundColor: '#141414', color: 'white' }}>
          <div className="space-y-1">
            {presets.map((preset) => (
              <Button
                key={preset.value}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white hover:bg-white/10 hover:text-white",
                  value.preset === preset.value && "bg-white/20 text-white"
                )}
                style={{ color: 'white' }}
                onClick={() => handlePresetClick(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export const PerformanceAccordion: React.FC<PerformanceAccordionProps> = ({
  filters,
  onChange,
  isOpen = false,
  onToggle
}) => {

  return (
    <div className="w-full" data-performance-accordion="true">
      {/* Accordion Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left rounded-t-[30px]"
      >
        <span className="text-white font-medium text-sm">Performance</span>
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
          <DateRangePicker
            value={filters.dateRange}
            onChange={(dateRange) => onChange({ dateRange })}
          />

          <NumberRangeInput
            label="Total Spend"
            minValue={filters.totalSpendMin}
            maxValue={filters.totalSpendMax}
            onMinChange={(min) => onChange({ totalSpendMin: min })}
            onMaxChange={(max) => onChange({ totalSpendMax: max })}
            placeholder={{ min: "Min $", max: "Max $" }}
          />

          <NumberRangeInput
            label="CPL (Cost per Lead)"
            minValue={filters.cplMin}
            maxValue={filters.cplMax}
            onMinChange={(min) => onChange({ cplMin: min })}
            onMaxChange={(max) => onChange({ cplMax: max })}
            placeholder={{ min: "Min $", max: "Max $" }}
          />

          <NumberRangeInput
            label="CPC (Cost per Click)"
            minValue={filters.cpcMin}
            maxValue={filters.cpcMax}
            onMinChange={(min) => onChange({ cpcMin: min })}
            onMaxChange={(max) => onChange({ cpcMax: max })}
            placeholder={{ min: "Min $", max: "Max $" }}
          />

          <PillToggle
            label="Marked as Top Ad"
            value={filters.markedAsTopAd}
            onChange={(value) => onChange({ markedAsTopAd: value })}
          />

          <PillToggle
            label="Optimization"
            value={filters.optimization}
            onChange={(value) => onChange({ optimization: value })}
          />
        </div>
      )}
    </div>
  )
}