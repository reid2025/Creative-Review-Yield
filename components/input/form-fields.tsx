'use client'

import { useState, useRef, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Plus, Check, X, ChevronDown, Search } from 'lucide-react'
import { useDropdownSpellcheck } from '@/utils/dropdownSpellcheck'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Types
interface BaseFieldProps {
  name: string
  label?: string
  placeholder?: string
  description?: string
  required?: boolean
}

interface FormInputProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'number' | 'date' | 'url' | 'password'
  prefix?: string
  readOnly?: boolean
  isAIFilled?: boolean
}

interface FormSelectProps extends BaseFieldProps {
  options: { value: string; label: string }[]
  allowAddNew?: boolean
  onAddNew?: (value: string) => void
  addNewText?: string
  isAIFilled?: boolean
  onChange?: (value: string) => void
}

interface FormTextareaProps extends BaseFieldProps {
  rows?: number
  isAIFilled?: boolean
}

interface FormSwitchProps extends BaseFieldProps {
  labelPosition?: 'left' | 'right'
  isAIFilled?: boolean
}

interface FormCheckboxGroupProps extends BaseFieldProps {
  options: string[]
  isAIFilled?: boolean
}

// FormInput Component - for text, number, date, etc.
export function FormInput({ 
  name, 
  label, 
  placeholder, 
  description, 
  type = 'text', 
  required = false,
  prefix,
  readOnly = false,
  isAIFilled = false
}: FormInputProps) {
  const form = useFormContext()
  
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel className="flex items-center gap-2">
              {label} {required && <span className="text-red-500">*</span>}
              {isAIFilled && (
                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">AI</span>
              )}
            </FormLabel>
          )}
          <FormControl>
            <div className="relative">
              {prefix && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {prefix}
                </span>
              )}
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                readOnly={readOnly}
                className={`${
                  prefix ? 'pl-7' : ''
                } ${
                  isAIFilled ? 'ring-1 ring-purple-200' : ''
                } ${
                  readOnly ? 'bg-gray-50' : ''
                }`}
              />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// FormSelect Component with Spellcheck
export function FormSelect({ 
  name, 
  label, 
  placeholder = 'Select an option', 
  description, 
  options, 
  required = false,
  allowAddNew = false,
  onAddNew,
  addNewText = '+ Add New',
  isAIFilled = false,
  onChange
}: FormSelectProps) {
  const form = useFormContext()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newOption, setNewOption] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // Initialize spellcheck hook
  const spellcheck = useDropdownSpellcheck(options.map(opt => opt.label), { threshold: 0.6, maxSuggestions: 3 })
  
  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowAddForm(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])
  
  const handleSelect = (value: string) => {
    form.setValue(name, value, { 
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true 
    })
    
    // Call custom onChange handler if provided
    if (onChange) {
      onChange(value)
    }
    
    setIsOpen(false)
    setSearchTerm('')
    setShowAddForm(false)
  }
  
  const handleAddNew = () => {
    if (newOption.trim() && onAddNew) {
      const value = newOption.trim().toLowerCase().replace(/\s+/g, '-')
      const label = newOption.trim()
      onAddNew(label)
      form.setValue(name, value, { 
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true 
      })
      setNewOption('')
      setShowAddForm(false)
      setIsOpen(false)
      setSearchTerm('')
    }
  }
  
  const handleUseSuggestion = (suggestion: string) => {
    const option = options.find(opt => opt.label === suggestion)
    if (option) {
      handleSelect(option.value)
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (showAddForm) {
        handleAddNew()
      } else if (filteredOptions.length === 0 && searchTerm.trim()) {
        setShowAddForm(true)
        setNewOption(searchTerm)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setShowAddForm(false)
      setSearchTerm('')
    }
  }
  
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const currentOption = options.find(opt => opt.value === field.value)
        
        return (
        <FormItem>
          {label && (
            <FormLabel className="flex items-center gap-2">
              {label} {required && <span className="text-red-500">*</span>}
              {isAIFilled && (
                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">AI</span>
              )}
            </FormLabel>
          )}
          <FormControl>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full border rounded-md px-3 py-2 pr-10 text-sm text-left focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  isAIFilled ? 'ring-1 ring-purple-200 border-purple-300' : 'border-gray-300'
                }`}
              >
                <span className={field.value ? "text-gray-900" : "text-gray-500"}>
                  {currentOption?.label || placeholder}
                </span>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </button>
              
              {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {/* Search Input */}
                  <div className="p-2 border-b border-gray-200">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search or type to add new..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="pl-8 text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Options List */}
                  <div className="py-1">
                    {/* Regular filtered options */}
                    {filteredOptions.map((option) => {
                      const isSelected = field.value === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSelect(option.value)}
                          className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center justify-between ${
                            isSelected ? 'bg-blue-50 text-blue-700' : ''
                          }`}
                        >
                          <span>{option.label}</span>
                          {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                        </button>
                      )
                    })}
                    
                    {/* Show spell check suggestions inline */}
                    {searchTerm.trim() && (() => {
                      const spellcheckResult = spellcheck.checkSpelling(searchTerm)
                      
                      // Get suggestions that aren't already shown in filtered options
                      const filteredLabels = filteredOptions.map(opt => opt.label.toLowerCase())
                      const uniqueSuggestions = spellcheckResult.suggestions.filter(
                        suggestion => !filteredLabels.includes(suggestion.toLowerCase())
                      )
                      
                      if (uniqueSuggestions.length > 0) {
                        return (
                          <>
                            {filteredOptions.length > 0 && (
                              <div className="my-1 border-t border-gray-200" />
                            )}
                            <div className="px-3 py-1 text-xs text-gray-500">
                              Did you mean:
                            </div>
                            {uniqueSuggestions.map((suggestion) => {
                              const suggestionOption = options.find(opt => opt.label === suggestion)
                              if (!suggestionOption) return null
                              
                              return (
                                <button
                                  key={suggestion}
                                  type="button"
                                  onClick={() => handleSelect(suggestionOption.value)}
                                  className="w-full px-3 py-2 text-sm text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none flex items-center justify-between group"
                                >
                                  <span className="text-blue-600">{suggestion}</span>
                                  <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">click to select</span>
                                </button>
                              )
                            })}
                          </>
                        )
                      }
                      return null
                    })()}
                    
                    {/* Add new option button - only show when no matches and no suggestions */}
                    {searchTerm.trim() && allowAddNew && !showAddForm && (() => {
                      const spellcheckResult = spellcheck.checkSpelling(searchTerm)
                      const filteredLabels = filteredOptions.map(opt => opt.label.toLowerCase())
                      const uniqueSuggestions = spellcheckResult.suggestions.filter(
                        suggestion => !filteredLabels.includes(suggestion.toLowerCase())
                      )
                      
                      // Only show add button if there are no options and no suggestions
                      if (filteredOptions.length === 0 && uniqueSuggestions.length === 0 && searchTerm.length >= 2) {
                        return (
                          <>
                            <div className="my-1 border-t border-gray-200" />
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddForm(true)
                                setNewOption(searchTerm)
                              }}
                              className="w-full px-3 py-2 text-sm text-left hover:bg-green-50 focus:bg-green-50 focus:outline-none flex items-center gap-2 text-green-700"
                            >
                              <Plus className="h-4 w-4" />
                              Add "{searchTerm}" as new option
                            </button>
                          </>
                        )
                      }
                      return null
                    })()}
                    
                    {/* Add Form */}
                    {showAddForm && (
                      <div className="p-2 border-t border-gray-200">
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Enter new option"
                            value={newOption}
                            onChange={(e) => setNewOption(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="text-sm flex-1"
                            autoFocus
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddNew}
                            disabled={!newOption.trim()}
                          >
                            Add
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowAddForm(false)
                              setNewOption('')
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
        )
      }}
    />
  )
}

// FormTextarea Component
export function FormTextarea({ 
  name, 
  label, 
  placeholder, 
  description, 
  rows = 4, 
  required = false,
  isAIFilled = false
}: FormTextareaProps) {
  const form = useFormContext()
  
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel className="flex items-center gap-2">
              {label} {required && <span className="text-red-500">*</span>}
              {isAIFilled && (
                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">AI</span>
              )}
            </FormLabel>
          )}
          <FormControl>
            <Textarea 
              {...field} 
              placeholder={placeholder} 
              rows={rows}
              className={isAIFilled ? 'ring-1 ring-purple-200' : ''}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// FormSwitch Component
export function FormSwitch({ 
  name, 
  label, 
  description,
  isAIFilled = false
}: FormSwitchProps) {
  const form = useFormContext()
  
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex gap-3 items-center">
          <FormControl>
            <Switch
              className="mt-2.5"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>

          <div>
            {label && (
              <FormLabel className="flex items-center gap-2">
                {label}
                {isAIFilled && (
                  <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">AI</span>
                )}
              </FormLabel>
            )}
            {description && <FormDescription>{description}</FormDescription>}
          </div>
        </FormItem>
      )}
    />
  )
}

// FormCheckboxGroup Component - for multiple checkboxes
export function FormCheckboxGroup({ 
  name, 
  label, 
  options, 
  description,
  isAIFilled = false
}: FormCheckboxGroupProps) {
  const form = useFormContext()
  
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel className="flex items-center gap-2">
              {label}
              {isAIFilled && (
                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">AI</span>
              )}
            </FormLabel>
          )}
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <label key={option} className="flex items-center">
                <Checkbox
                  checked={field.value?.includes(option)}
                  onCheckedChange={(checked) => {
                    const updatedValue = checked
                      ? [...(field.value || []), option]
                      : field.value?.filter((v: string) => v !== option) || []
                    field.onChange(updatedValue)
                  }}
                />
                <span className="ml-2 text-sm">{option}</span>
              </label>
            ))}
          </div>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Grid Layout Helper Components
export function FormGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  const gridClasses = {
    1: 'grid grid-cols-1 gap-4',
    2: 'grid grid-cols-2 gap-4',
    3: 'grid grid-cols-3 gap-4',
    4: 'grid grid-cols-4 gap-4',
  }
  
  return (
    <div className={gridClasses[cols as keyof typeof gridClasses] || gridClasses[2]}>
      {children}
    </div>
  )
}

// Section Helper Component
export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  )
}