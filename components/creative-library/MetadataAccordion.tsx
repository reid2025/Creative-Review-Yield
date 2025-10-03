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

interface MetadataAccordionProps {
  selectedAccount: string[]
  setSelectedAccount: (value: string[]) => void
  selectedCampaign: string[]
  setSelectedCampaign: (value: string[]) => void
  selectedCampaignType: string[]
  setSelectedCampaignType: (value: string[]) => void
  selectedLitigation: string[]
  setSelectedLitigation: (value: string[]) => void
  selectedDesigner: string[]
  setSelectedDesigner: (value: string[]) => void
  selectedStatus: string[]
  setSelectedStatus: (value: string[]) => void
  selectedTags: string[]
  setSelectedTags: (value: string[]) => void
  isOpen?: boolean
  onToggle?: () => void
  dynamicOptions?: {
    account?: string[]
    campaign?: string[]
    campaignType?: string[]
    litigation?: string[]
    designer?: string[]
    status?: string[]
    tags?: string[]
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
      <Label className="text-white text-sm font-medium uppercase" style={{ color: '#ffffff !important' }}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between bg-black text-white hover:bg-black/90 hover:text-white"
            )}
            style={{ 
              color: 'white !important',
              backgroundColor: '#141414',
              border: '1px solid #333333 !important',
              borderColor: 'rgb(51, 51, 51)',
              '--tw-ring-color': '#333333'
            }}
          >
            <span className="text-white truncate" style={{ color: '#ffffff !important' }}>
              {getDisplayValue()}
            </span>
            <ChevronDown className="h-4 w-4 text-white flex-shrink-0" style={{ color: '#ffffff !important' }} />
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
                <span className="text-2xl mb-2">😢</span>
                <span className="text-white text-sm">No creatives available</span>
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

export default function MetadataAccordion({
  selectedAccount,
  setSelectedAccount,
  selectedCampaign,
  setSelectedCampaign,
  selectedCampaignType,
  setSelectedCampaignType,
  selectedLitigation,
  setSelectedLitigation,
  selectedDesigner,
  setSelectedDesigner,
  selectedStatus,
  setSelectedStatus,
  selectedTags,
  setSelectedTags,
  isOpen = false,
  onToggle,
  dynamicOptions = {}
}: MetadataAccordionProps) {
  
  // Use dynamic options if available, otherwise fall back to default options
  const accountOptions = dynamicOptions?.account || ['Bursor & Fisher', 'Other Account']
  const campaignOptions = dynamicOptions?.campaign || ['Campaign 1', 'Campaign 2']
  const campaignTypeOptions = dynamicOptions?.campaignType || ['Search', 'Display', 'Video']
  const litigationOptions = dynamicOptions?.litigation || ['Litigation A', 'Litigation B']
  const designerOptions = dynamicOptions?.designer || ['Designer 1', 'Designer 2']
  const statusOptions = dynamicOptions?.status || ['Active', 'Paused', 'Ended']
  const tagsOptions = dynamicOptions?.tags || ['Tag 1', 'Tag 2']

  return (
    <div className="w-full" data-metadata-accordion="true">
      {/* Accordion Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left rounded-t-[30px]"
        style={{ border: 'none !important' }}
      >
        <span className="text-white font-medium text-sm" style={{ color: '#ffffff !important' }}>Metadata</span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-white transition-transform",
            isOpen && "transform rotate-180"
          )}
          style={{ color: '#ffffff !important' }}
        />
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-4 space-y-4">
          <MultiSelect
            label="Account Name"
            options={accountOptions}
            selectedValues={selectedAccount}
            onChange={setSelectedAccount}
          />

          <MultiSelect
            label="Campaign Name"
            options={campaignOptions}
            selectedValues={selectedCampaign}
            onChange={setSelectedCampaign}
          />

          <MultiSelect
            label="Campaign Type"
            options={campaignTypeOptions}
            selectedValues={selectedCampaignType}
            onChange={setSelectedCampaignType}
          />

          <MultiSelect
            label="Litigation Name"
            options={litigationOptions}
            selectedValues={selectedLitigation}
            onChange={setSelectedLitigation}
          />

          <MultiSelect
            label="Designer"
            options={designerOptions}
            selectedValues={selectedDesigner}
            onChange={setSelectedDesigner}
          />

          <MultiSelect
            label="Status"
            options={statusOptions}
            selectedValues={selectedStatus}
            onChange={setSelectedStatus}
          />

          <MultiSelect
            label="Tags"
            options={tagsOptions}
            selectedValues={selectedTags}
            onChange={setSelectedTags}
          />
        </div>
      )}
    </div>
  )
}