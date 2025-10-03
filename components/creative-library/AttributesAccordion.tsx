'use client'

import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'
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

// Add styles directly to override global CSS
const pillSelectedStyle = {
  color: '#000000 !important',
  backgroundColor: '#ffffff'
} as React.CSSProperties

interface AttributesFilters {
  creativeLayoutType: string[]
  messagingStructure: string[]
  imageryType: string[]
  imageryBackground: string[]
  questionBasedHeadline: 'yes' | 'no' | 'any'
  clientBranding: 'yes' | 'no' | 'any'
  iconsUsed: 'yes' | 'no' | 'any'
  headlineTags: string[]
  copyAngle: string[]
  copyTone: string[]
  legalLanguage: 'yes' | 'no' | 'any'
  amountMentioned: 'yes' | 'no' | 'any'
  statMentioned: 'yes' | 'no' | 'any'
  emotionalStatement: 'yes' | 'no' | 'any'
  disclaimer: 'yes' | 'no' | 'any'
  conditionsListed: 'yes' | 'no' | 'any'
}

interface AttributesAccordionProps {
  filters: AttributesFilters
  onChange: (filters: Partial<AttributesFilters>) => void
  isOpen?: boolean
  onToggle?: () => void
  dynamicOptions?: {
    creativeLayoutType?: string[]
    messagingStructure?: string[]
    imageryType?: string[]
    imageryBackground?: string[]
    headlineTags?: string[]
    copyAngle?: string[]
    copyTone?: string[]
  }
}

interface MultiSelectProps {
  label: string
  options: string[]
  selectedValues: string[]
  onChange: (values: string[]) => void
}

interface PillToggleProps {
  value: 'yes' | 'no' | 'any'
  onChange: (value: 'yes' | 'no' | 'any') => void
  label: string
}

interface MultiSelectChipsProps {
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
                <span className="text-2xl mb-2">🥺</span>
                <span className="text-white text-sm">No data available</span>
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

const MultiSelectChips: React.FC<MultiSelectChipsProps> = ({ label, options, selectedValues, onChange }) => {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleToggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option))
    } else {
      onChange([...selectedValues, option])
    }
  }

  const handleRemoveChip = (value: string) => {
    onChange(selectedValues.filter(v => v !== value))
  }

  const handleAddCustom = () => {
    if (inputValue && !selectedValues.includes(inputValue) && !options.includes(inputValue)) {
      onChange([...selectedValues, inputValue])
      setInputValue('')
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-white text-sm font-medium uppercase">{label}</Label>
      
      {/* Selected chips display */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedValues.map((value) => (
            <div
              key={value}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white text-black text-xs rounded-full"
            >
              <span>{value}</span>
              <button
                onClick={() => handleRemoveChip(value)}
                className="hover:bg-white/10 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

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
            <span className="text-black truncate">
              {selectedValues.length === 0 ? `Add ${label}` : `${selectedValues.length} selected`}
            </span>
            <ChevronDown className="h-4 w-4 text-black flex-shrink-0" />
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
          <div className="space-y-2">
            {/* Custom input */}
            <div className="flex gap-1">
              <WhiteInput
                type="text"
                placeholder="Add custom tag..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="text-xs"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
              />
              <Button
                size="sm"
                className="bg-white text-black hover:bg-white/90"
                onClick={handleAddCustom}
              >
                Add
              </Button>
            </div>
            
            {/* Predefined options */}
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {options.map((option) => (
                <Button
                  key={option}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-white hover:bg-white/10 hover:text-white",
                    selectedValues.includes(option) && "bg-white/20 text-white"
                  )}
                  style={{ color: 'black' }}
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
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export const AttributesAccordion: React.FC<AttributesAccordionProps> = ({
  filters,
  onChange,
  isOpen = false,
  onToggle,
  dynamicOptions
}) => {

  // Use dynamic options if available, otherwise fall back to static options
  const creativeLayoutOptions = dynamicOptions?.creativeLayoutType || [
    'Single Image', 'Carousel', 'Video', 'Collection', 'Story', 'Reels', 'Static Post', 'Animated'
  ]

  const messagingStructureOptions = dynamicOptions?.messagingStructure || [
    'Problem-Solution', 'Before-After', 'Benefit-Focused', 'Feature-Focused', 'Testimonial', 'Question-Answer', 'Story-Based', 'Comparison'
  ]

  const imageryTypeOptions = dynamicOptions?.imageryType || [
    'Product Shot', 'Lifestyle', 'Abstract', 'Illustration', 'Photography', 'Graphic Design', 'Mixed Media', 'User-Generated'
  ]

  const imageryBackgroundOptions = dynamicOptions?.imageryBackground || [
    'White/Clean', 'Lifestyle Scene', 'Abstract', 'Branded', 'Natural', 'Studio', 'Textured', 'Gradient'
  ]

  const headlineTagOptions = dynamicOptions?.headlineTags || [
    'Urgent', 'Limited Time', 'New', 'Free', 'Sale', 'Exclusive', 'Best Seller', 'Popular', 'Trending', 'Premium'
  ]

  const copyAngleOptions = dynamicOptions?.copyAngle || [
    'Value-Focused', 'Quality-Focused', 'Convenience', 'Social Proof', 'Scarcity', 'Authority', 'Problem-Solving', 'Emotional Appeal'
  ]

  const copyToneOptions = dynamicOptions?.copyTone || [
    'Professional', 'Casual', 'Friendly', 'Urgent', 'Playful', 'Sophisticated', 'Conversational', 'Authoritative'
  ]

  return (
    <div className="w-full" data-attributes-accordion="true">
      {/* Accordion Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left rounded-t-[30px]"
        style={{ border: 'none !important' }}
      >
        <span className="text-white font-medium text-sm">Attributes & Content</span>
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
            label="Creative Layout Type"
            options={creativeLayoutOptions}
            selectedValues={filters.creativeLayoutType}
            onChange={(values) => onChange({ creativeLayoutType: values })}
          />

          <MultiSelect
            label="Messaging Structure"
            options={messagingStructureOptions}
            selectedValues={filters.messagingStructure}
            onChange={(values) => onChange({ messagingStructure: values })}
          />

          <MultiSelect
            label="Imagery Type"
            options={imageryTypeOptions}
            selectedValues={filters.imageryType}
            onChange={(values) => onChange({ imageryType: values })}
          />

          <MultiSelect
            label="Imagery Background"
            options={imageryBackgroundOptions}
            selectedValues={filters.imageryBackground}
            onChange={(values) => onChange({ imageryBackground: values })}
          />

          <PillToggle
            label="Question-Based Headline"
            value={filters.questionBasedHeadline}
            onChange={(value) => onChange({ questionBasedHeadline: value })}
          />

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

          <MultiSelect
            label="Copy Angle"
            options={copyAngleOptions}
            selectedValues={filters.copyAngle}
            onChange={(values) => onChange({ copyAngle: values })}
          />

          <MultiSelect
            label="Copy Tone"
            options={copyToneOptions}
            selectedValues={filters.copyTone}
            onChange={(values) => onChange({ copyTone: values })}
          />

          <PillToggle
            label="Legal Language"
            value={filters.legalLanguage}
            onChange={(value) => onChange({ legalLanguage: value })}
          />

          <PillToggle
            label="$ Amount Mentioned"
            value={filters.amountMentioned}
            onChange={(value) => onChange({ amountMentioned: value })}
          />

          <PillToggle
            label="Stat Mentioned"
            value={filters.statMentioned}
            onChange={(value) => onChange({ statMentioned: value })}
          />

          <PillToggle
            label="Emotional Statement"
            value={filters.emotionalStatement}
            onChange={(value) => onChange({ emotionalStatement: value })}
          />

          <PillToggle
            label="Disclaimer"
            value={filters.disclaimer}
            onChange={(value) => onChange({ disclaimer: value })}
          />

          <PillToggle
            label="Conditions Listed"
            value={filters.conditionsListed}
            onChange={(value) => onChange({ conditionsListed: value })}
          />
        </div>
      )}
    </div>
  )
}