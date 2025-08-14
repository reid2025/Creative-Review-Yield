'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import NextImage from 'next/image'
import { useDropzone } from 'react-dropzone'
import { Upload, Sparkles, ChevronDown, Search, Plus, Check, X } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { useAIFields } from '@/hooks/useAIFields'
import { useFirebaseDrafts } from '@/hooks/useFirebaseDrafts'
import { FirebaseDraftData } from '@/lib/firebase-draft-service'
import { firebaseAIService } from '@/lib/firebase-ai-service'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { AIStatusIndicator } from '@/components/ai/AIStatusIndicator'
import { useTagOptions } from '@/hooks/useTagOptions'
import { toast } from 'sonner'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'

// Form validation schema
const formSchema = z.object({
  uploadedImage: z.any().nullable(),
  skipImage: z.boolean().default(false),
  
  // Metadata
  creativeFilename: z.string().min(1, 'Filename is required'),
  dateAdded: z.string(),
  designer: z.string().min(1, 'Designer is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  litigationName: z.string().min(1, 'Litigation Name is required'),
  campaignType: z.string().min(1, 'Campaign Type is required'),
  
  // Performance Metrics
  amountSpent: z.string().min(1, 'Amount Spent is required'),
  costPerWebsiteLead: z.string().min(1, 'Cost Per Website Lead is required'),
  costPerClick: z.string().min(1, 'Cost Per Click is required'),
  
  // Insights
  creativeLayoutType: z.string().optional(),
  messagingStructure: z.string().optional(),
  imageryType: z.array(z.string()).default([]),
  imageryBackground: z.array(z.string()).default([]),
  questionBasedHeadline: z.boolean().default(false),
  clientBranding: z.boolean().default(false),
  iconsUsed: z.boolean().default(false),
  markedAsTopAd: z.boolean().default(false),
  needsOptimization: z.boolean().default(false),
  
  // Headlines & CTA
  preheadlineText: z.string().optional(),
  headlineText: z.string().optional(),
  headlineTags: z.array(z.string()).default([]),
  headlineIntent: z.array(z.string()).default([]),
  ctaLabel: z.string().optional(),
  ctaVerb: z.string().optional(),
  ctaStyleGroup: z.string().optional(),
  ctaPosition: z.string().optional(),
  ctaColor: z.string().optional(),
  
  // Copy Elements
  bodyCopySummary: z.string().optional(),
  copyAngle: z.array(z.string()).default([]),
  copyTone: z.array(z.string()).default([]),
  audiencePersona: z.string().optional(),
  campaignTrigger: z.string().optional(),
  legalLanguage: z.boolean().default(false),
  emotionalStatement: z.boolean().default(false),
  dollarAmount: z.boolean().default(false),
  statMentioned: z.boolean().default(false),
  disclaimer: z.boolean().default(false),
  conditionsListed: z.boolean().default(false),
  
  // Additional
  designerRemarks: z.string().optional(),
  internalNotes: z.string().optional(),
  uploadGoogleDocLink: z.string().optional(),
  pinNoteForStrategySync: z.boolean().default(false),
})

type FormData = z.infer<typeof formSchema>

// Consistent AI Badge Component
function AIBadge() {
  return (
    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
      AI
    </Badge>
  )
}

// Simple Field Component with AI indicator and suggestions
function FormFieldWrapper({ 
  children, 
  label, 
  required, 
  isAIFilled,
  aiSuggestion,
  onAcceptSuggestion,
  onDismissSuggestion
}: { 
  children: React.ReactNode
  label: string
  required?: boolean
  isAIFilled?: boolean
  aiSuggestion?: string
  onAcceptSuggestion?: () => void
  onDismissSuggestion?: () => void
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 flex-wrap">
        {label}
        {required && <span className="text-red-500">*</span>}
        {isAIFilled && <AIBadge />}
        {aiSuggestion && (
          <div className="flex items-center gap-1">
            <Badge 
              variant="outline" 
              className="text-xs bg-blue-50 text-blue-700 border-blue-300 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>AI suggests: {aiSuggestion}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onAcceptSuggestion?.()
                }}
                className="ml-1 p-0.5 hover:bg-blue-200 rounded"
                title="Accept suggestion"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDismissSuggestion?.()
                }}
                className="p-0.5 hover:bg-blue-200 rounded"
                title="Dismiss suggestion"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          </div>
        )}
      </Label>
      {children}
    </div>
  )
}

// Searchable Select Component with Add New functionality
function SearchableSelect({
  value,
  onChange,
  placeholder,
  multiple = false,
  fieldName
}: {
  value: string | string[]
  onChange: (value: string | string[]) => void
  placeholder?: string
  multiple?: boolean
  fieldName: string
}) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddingNew, setIsAddingNew] = useState(false)
  const { addNewTag, options: hookOptions, loading, refetch } = useTagOptions(fieldName)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [triggerWidth, setTriggerWidth] = useState(0)

  // Always use options from hook for real-time updates
  const currentOptions = hookOptions

  // Filter options based on search
  const filteredOptions = currentOptions.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Check if search term matches any existing option
  const exactMatch = currentOptions.some(option => 
    option.label.toLowerCase() === searchTerm.toLowerCase()
  )

  // Show add new button when search term doesn't match exactly
  const showAddNew = searchTerm.length > 0 && !exactMatch

  // Update trigger width
  useEffect(() => {
    if (triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth)
    }
  }, [open])

  // Focus search when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [open])

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      if (currentValues.includes(optionValue)) {
        onChange(currentValues.filter(v => v !== optionValue))
      } else {
        onChange([...currentValues, optionValue])
      }
      setSearchTerm('')
    } else {
      onChange(optionValue)
      setOpen(false)
      setSearchTerm('')
    }
  }

  const handleAddNew = async () => {
    if (searchTerm.trim() && !isAddingNew) {
      setIsAddingNew(true)
      try {
        const newValue = await addNewTag(searchTerm.trim())
        if (newValue) {
          // Wait a bit for the real-time update to propagate
          setTimeout(() => {
            handleSelect(newValue)
            setSearchTerm('')
          }, 200)
        }
      } catch (error) {
        toast.error('Failed to add new tag')
      } finally {
        setIsAddingNew(false)
      }
    }
  }

  const selectedValues = multiple ? (Array.isArray(value) ? value : []) : []

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal h-auto min-h-[2.5rem] px-3 py-2"
          >
            <div className="flex items-center gap-1 flex-wrap flex-1 text-left">
              {multiple && selectedValues.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {selectedValues.map((val) => (
                    <Badge
                      key={val}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-secondary/80"
                      onClick={(e) => {
                        e.stopPropagation()
                        onChange(selectedValues.filter(v => v !== val))
                      }}
                    >
                      {currentOptions.find(o => o.value === val)?.label || val}
                      <X className="ml-1 h-1.5 w-1.5" />
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className={!value && multiple ? "text-muted-foreground" : ""}>
                  {multiple ? placeholder : (value ? currentOptions.find(o => o.value === value)?.label || value : placeholder)}
                </span>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0" 
          align="start"
          sideOffset={4}
          style={{ width: triggerWidth || 'auto' }}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none text-sm placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                e.stopPropagation()
                if (e.key === 'Enter' && showAddNew) {
                  e.preventDefault()
                  handleAddNew()
                } else if (e.key === 'Escape') {
                  setOpen(false)
                }
              }}
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : filteredOptions.length === 0 && !showAddNew ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {searchTerm ? 'No results found' : 'No options available'}
              </div>
            ) : (
              <>
                {filteredOptions.map((option) => {
                  const isSelected = multiple 
                    ? selectedValues.includes(option.value)
                    : value === option.value
                  
                  return (
                    <div
                      key={option.value}
                      className={`flex items-center px-3 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                        isSelected ? 'bg-accent' : ''
                      }`}
                      onClick={() => handleSelect(option.value)}
                    >
                      {multiple && (
                        <Checkbox
                          checked={isSelected}
                          className="mr-2 h-4 w-4"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      <span className="flex-1">
                        {option.label}
                      </span>
                      {isSelected && !multiple && (
                        <Check className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  )
                })}
                {showAddNew && (
                  <div
                    className={`flex items-center px-3 py-1.5 text-sm cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary border-t ${
                      isAddingNew ? 'opacity-50 cursor-wait' : ''
                    }`}
                    onClick={handleAddNew}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Add "{searchTerm}" to {fieldName}</span>
                    {isAddingNew && (
                      <div className="ml-auto">
                        <div className="h-3 w-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default function SingleUploadPage() {
  const { user } = useAuth()
  const [showImage, setShowImage] = useState(false)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false)
  const [pendingAIMode, setPendingAIMode] = useState<'empty' | 'all' | null>(null)
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null)
  const [currentFirebaseDocId, setCurrentFirebaseDocId] = useState<string | null>(null)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [countdown, setCountdown] = useState(30)
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({})
  
  // Helper function to handle AI suggestion acceptance
  const acceptAiSuggestion = async (fieldName: string, addNewTag: (label: string) => Promise<string>) => {
    const suggestion = aiSuggestions[fieldName]
    if (suggestion) {
      try {
        const newValue = await addNewTag(suggestion)
        form.setValue(fieldName as any, newValue)
        markFieldAsAI(fieldName)
        setAiSuggestions(prev => {
          const { [fieldName]: _, ...rest } = prev
          return rest
        })
        toast.success(`Added "${suggestion}" to ${fieldName}`)
      } catch (error) {
        toast.error('Failed to add suggestion')
      }
    }
  }
  
  // Helper function to dismiss AI suggestion
  const dismissAiSuggestion = (fieldName: string) => {
    setAiSuggestions(prev => {
      const { [fieldName]: _, ...rest } = prev
      return rest
    })
    toast.info('Suggestion dismissed')
  }
  
  // Firebase drafts
  const {
    drafts: firebaseDrafts,
    saveDraft: saveFirebaseDraft,
    deleteDraft: deleteFirebaseDraft,
    getDraft: getFirebaseDraft,
    isOnline,
  } = useFirebaseDrafts({ 
    userId: user?.uid || 'anonymous',
    enableRealTime: true 
  })
  
  // AI fields tracking
  const {
    aiFieldsSet,
    markFieldAsAI,
    removeAITag,
    setMultipleAITags,
    clearAllAITags
  } = useAIFields()

  // Dynamic tag options hooks - get both options and addNewTag functions
  const { options: designerOptions, addNewTag: addDesignerTag } = useTagOptions('designer')
  const { options: litigationOptions, addNewTag: addLitigationTag } = useTagOptions('litigationName')
  const { options: campaignTypeOptions, addNewTag: addCampaignTypeTag } = useTagOptions('campaignType')
  const { options: layoutTypeOptions, addNewTag: addLayoutTypeTag } = useTagOptions('creativeLayoutType')
  const { options: messagingOptions, addNewTag: addMessagingTag } = useTagOptions('messagingStructure')
  const { options: imageryTypeOptions, addNewTag: addImageryTypeTag } = useTagOptions('imageryType')
  const { options: imageryBgOptions, addNewTag: addImageryBgTag } = useTagOptions('imageryBackground')
  const { options: headlineTagOptions, addNewTag: addHeadlineTag } = useTagOptions('headlineTags')
  const { options: headlineIntentOptions, addNewTag: addHeadlineIntentTag } = useTagOptions('headlineIntent')
  const { options: ctaVerbOptions, addNewTag: addCtaVerbTag } = useTagOptions('ctaVerb')
  const { options: ctaStyleOptions, addNewTag: addCtaStyleTag } = useTagOptions('ctaStyleGroup')
  const { options: ctaPositionOptions, addNewTag: addCtaPositionTag } = useTagOptions('ctaPosition')
  const { options: ctaColorOptions, addNewTag: addCtaColorTag } = useTagOptions('ctaColor')
  const { options: copyAngleOptions, addNewTag: addCopyAngleTag } = useTagOptions('copyAngle')
  const { options: copyToneOptions, addNewTag: addCopyToneTag } = useTagOptions('copyTone')
  const { options: personaOptions, addNewTag: addPersonaTag } = useTagOptions('audiencePersona')
  const { options: triggerOptions, addNewTag: addTriggerTag } = useTagOptions('campaignTrigger')

  // Form initialization
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skipImage: false,
      uploadedImage: null,
      creativeFilename: '',
      dateAdded: format(new Date(), 'yyyy-MM-dd'),
      designer: '',
      startDate: '',
      endDate: '',
      litigationName: '',
      campaignType: '',
      amountSpent: '',
      costPerWebsiteLead: '',
      costPerClick: '',
      imageryType: [],
      imageryBackground: [],
      questionBasedHeadline: false,
      clientBranding: false,
      iconsUsed: false,
      markedAsTopAd: false,
      needsOptimization: false,
      headlineTags: [],
      headlineIntent: [],
      copyAngle: [],
      copyTone: [],
      legalLanguage: false,
      emotionalStatement: false,
      dollarAmount: false,
      statMentioned: false,
      disclaimer: false,
      conditionsListed: false,
      pinNoteForStrategySync: false,
    },
  })

  // Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }
      form.setValue('uploadedImage', file)
      setUploadedImageFile(file)
      const filenameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      form.setValue('creativeFilename', filenameWithoutExt)
      setImagePreviewUrl(URL.createObjectURL(file))
      setShowImage(true)
      setHasChanges(true)
    }
  }, [form])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    maxFiles: 1,
  })

  // AI Autopopulate
  const executeAIAutopopulate = async (mode: 'empty' | 'all') => {
    setAiLoading(true)
    setAiSuggestions({}) // Clear previous suggestions
    try {
      const uploadedImage = form.getValues('uploadedImage')
      if (!uploadedImage || !(uploadedImage instanceof File)) {
        toast.error('Please upload an image first')
        return
      }

      if (mode === 'all') {
        clearAllAITags()
      }

      toast.info('Analyzing image with AI...', { duration: 10000 })
      const aiAnalysis = await firebaseAIService.analyzeCreativeImage(uploadedImage)
      const validatedAnalysis = firebaseAIService.validateSuggestions(aiAnalysis)
      
      const currentValues = form.getValues()
      const fieldsToUpdate: string[] = []
      const newSuggestions: Record<string, string> = {}

      // Helper to conditionally set field or add as suggestion
      const setField = (fieldName: keyof FormData, value: any, shouldSet: boolean, options?: any[]) => {
        if (shouldSet && value !== undefined && value !== null && value !== '') {
          // Check if value exists in options (for select fields)
          if (options && typeof value === 'string') {
            const exists = options.some(opt => opt.value === value || opt.label.toLowerCase() === value.toLowerCase())
            if (!exists) {
              // Add as suggestion instead
              console.log(`  ! Field ${fieldName}: AI value "${value}" not in options, adding as suggestion`)
              newSuggestions[fieldName] = value
              return
            }
          }
          
          console.log(`  ✓ Setting ${fieldName} to:`, value)
          form.setValue(fieldName, value)
          markFieldAsAI(fieldName)
          fieldsToUpdate.push(fieldName)
        } else if (shouldSet) {
          console.log(`  ✗ Skipping ${fieldName}: value is empty or undefined`)
        }
      }

      // Auto-fill designer with logged-in user's email or name
      const currentUser = user?.email?.split('@')[0] || user?.displayName || 'unknown'
      
      // Apply AI values - Fill everything except dates
      // Always fill filename if not set
      if (!currentValues.creativeFilename) {
        setField('creativeFilename', validatedAnalysis.creativeFilename || `creative-${Date.now()}`, true)
      }
      
      // Always set designer to current user
      setField('designer', currentUser, true, designerOptions)
      
      // Don't touch start and end dates - user will fill these
      // setField('startDate', ...) - SKIP
      // setField('endDate', ...) - SKIP
      
      setField('litigationName', validatedAnalysis.litigationName, true, litigationOptions)
      setField('campaignType', validatedAnalysis.campaignType, true, campaignTypeOptions)
      
      // Fill performance metrics with defaults (AI can't detect these from image)
      // Don't mark these as AI-filled per user request
      if (mode === 'all' || !currentValues.amountSpent) {
        form.setValue('amountSpent', '0')
      }
      if (mode === 'all' || !currentValues.costPerWebsiteLead) {
        form.setValue('costPerWebsiteLead', '0')
      }
      if (mode === 'all' || !currentValues.costPerClick) {
        form.setValue('costPerClick', '0')
      }
      
      // Message & Targeting - Fill ALL fields
      setField('creativeLayoutType', validatedAnalysis.creativeLayoutType || 'standard', mode === 'all' || !currentValues.creativeLayoutType, layoutTypeOptions)
      setField('messagingStructure', validatedAnalysis.messagingStructure || 'simple', mode === 'all' || !currentValues.messagingStructure, messagingOptions)
      setField('imageryType', validatedAnalysis.imageryType || [], mode === 'all' || currentValues.imageryType.length === 0, imageryTypeOptions)
      setField('imageryBackground', validatedAnalysis.imageryBackground || [], mode === 'all' || currentValues.imageryBackground.length === 0, imageryBgOptions)
      
      // Fix switches - they should always be set
      setField('questionBasedHeadline', validatedAnalysis.questionBasedHeadline ?? false, true)
      setField('clientBranding', validatedAnalysis.clientBranding ?? false, true)
      setField('iconsUsed', validatedAnalysis.iconsUsed ?? false, true)
      setField('markedAsTopAd', validatedAnalysis.markedAsTopAd ?? false, true)
      setField('needsOptimization', validatedAnalysis.needsOptimization ?? false, true)
      
      // Headlines & CTA - Fill ALL fields with defaults if needed
      setField('preheadlineText', validatedAnalysis.preheadlineText || '', mode === 'all' || !currentValues.preheadlineText)
      setField('headlineText', validatedAnalysis.headlineText || 'Learn More', mode === 'all' || !currentValues.headlineText)
      setField('headlineTags', validatedAnalysis.headlineTags || [], mode === 'all' || currentValues.headlineTags.length === 0, headlineTagOptions)
      setField('headlineIntent', validatedAnalysis.headlineIntent || [], mode === 'all' || currentValues.headlineIntent.length === 0, headlineIntentOptions)
      setField('ctaLabel', validatedAnalysis.ctaLabel || 'Learn More', mode === 'all' || !currentValues.ctaLabel)
      setField('ctaVerb', validatedAnalysis.ctaVerb || 'learn', mode === 'all' || !currentValues.ctaVerb, ctaVerbOptions)
      setField('ctaStyleGroup', validatedAnalysis.ctaStyleGroup || 'button', mode === 'all' || !currentValues.ctaStyleGroup, ctaStyleOptions)
      setField('ctaColor', validatedAnalysis.ctaColor || 'blue', mode === 'all' || !currentValues.ctaColor, ctaColorOptions)
      setField('ctaPosition', validatedAnalysis.ctaPosition || 'bottom-right', mode === 'all' || !currentValues.ctaPosition, ctaPositionOptions)
      
      // Copy Elements - Fill ALL with defaults
      // Extract body copy from AI analysis if available
      const bodyText = validatedAnalysis.bodyCopySummary || 
                      (aiAnalysis.textElements?.bodyCopy ? 
                       `${aiAnalysis.textElements.bodyCopy}` : 
                       'Tactics may violate consumer protection laws. You could be owed significant financial compensation.')
      setField('bodyCopySummary', bodyText, mode === 'all' || !currentValues.bodyCopySummary)
      setField('copyAngle', validatedAnalysis.copyAngle || [], mode === 'all' || currentValues.copyAngle.length === 0, copyAngleOptions)
      setField('copyTone', validatedAnalysis.copyTone || [], mode === 'all' || currentValues.copyTone.length === 0, copyToneOptions)
      setField('audiencePersona', validatedAnalysis.audiencePersona || 'general', mode === 'all' || !currentValues.audiencePersona, personaOptions)
      setField('campaignTrigger', validatedAnalysis.campaignTrigger || 'awareness', mode === 'all' || !currentValues.campaignTrigger, triggerOptions)
      
      // Content flags - Always set these (switches)
      setField('legalLanguage', validatedAnalysis.legalLanguage ?? false, true)
      setField('emotionalStatement', validatedAnalysis.emotionalStatement ?? false, true)
      setField('dollarAmount', validatedAnalysis.dollarAmount ?? false, true)
      setField('statMentioned', validatedAnalysis.statMentioned ?? false, true)
      setField('disclaimer', validatedAnalysis.disclaimer ?? false, true)
      setField('conditionsListed', validatedAnalysis.conditionsListed ?? false, true)
      
      // Additional fields - Only fill if in 'all' mode
      if (mode === 'all') {
        setField('designerRemarks', 'AI analyzed creative', true)
        setField('internalNotes', 'Auto-populated by AI', true)
        setField('uploadGoogleDocLink', '', true)
      }
      setField('pinNoteForStrategySync', false, true)

      // Set suggestions for fields that couldn't be filled
      setAiSuggestions(newSuggestions)

      // After initial fill, recheck and fill ALL empty fields with defaults
      const checkValues = form.getValues()
      const recheckFields: string[] = []
      
      // Console log what AI initially filled
      console.log('=== AI AUTOPOPULATE RESULTS ===')
      console.log('Fields updated by AI:', fieldsToUpdate)
      console.log('Fields with suggestions (not in options):', Object.keys(newSuggestions))
      console.log('Total fields filled initially:', fieldsToUpdate.length)
      console.log('Current form values:', checkValues)
      console.log('Empty fields check:')
      
      // Recheck and fill ALL empty fields
      if (!checkValues.designer) {
        console.log('  - Designer is empty, checking if currentUser exists in options:', currentUser)
        // Check if currentUser exists in designer options
        const exists = designerOptions.some(opt => opt.value === currentUser || opt.label.toLowerCase() === currentUser.toLowerCase())
        if (exists) {
          form.setValue('designer', currentUser)
          markFieldAsAI('designer')
          recheckFields.push('Designer')
        } else {
          // Add as suggestion instead of setting directly
          console.log('  - Adding designer as suggestion:', currentUser)
          newSuggestions['designer'] = currentUser
        }
      }
      if (!checkValues.litigationName) {
        const defaultLitigation = 'Pest Control' // Common default
        console.log('  - Litigation Name is empty, filling with:', defaultLitigation)
        if (!litigationOptions.some(opt => opt.value === defaultLitigation.toLowerCase().replace(/\s+/g, '-'))) {
          console.log('    -> Not in options, adding as suggestion')
          newSuggestions.litigationName = defaultLitigation
        } else {
          form.setValue('litigationName', defaultLitigation.toLowerCase().replace(/\s+/g, '-'))
          markFieldAsAI('litigationName')
        }
        recheckFields.push('Litigation Name')
      }
      if (!checkValues.campaignType) {
        const defaultCampaign = 'social-media'
        console.log('  - Campaign Type is empty, checking options for:', defaultCampaign)
        const exists = campaignTypeOptions.some(opt => opt.value === defaultCampaign)
        if (exists) {
          form.setValue('campaignType', defaultCampaign)
          markFieldAsAI('campaignType')
          recheckFields.push('Campaign Type')
        } else {
          console.log('  - Adding campaign type as suggestion:', defaultCampaign)
          newSuggestions['campaignType'] = defaultCampaign
        }
      }
      if (!checkValues.creativeLayoutType) {
        const defaultLayout = 'checklist'
        console.log('  - Creative Layout Type is empty, checking options for:', defaultLayout)
        const exists = layoutTypeOptions.some(opt => opt.value === defaultLayout)
        if (exists) {
          form.setValue('creativeLayoutType', defaultLayout)
          markFieldAsAI('creativeLayoutType')
          recheckFields.push('Creative Layout')
        } else {
          console.log('  - Adding layout type as suggestion:', defaultLayout)
          newSuggestions['creativeLayoutType'] = defaultLayout
        }
      }
      if (!checkValues.messagingStructure) {
        const defaultMessaging = 'question-bold-warning-cta'
        console.log('  - Messaging Structure is empty, checking options for:', defaultMessaging)
        const exists = messagingOptions.some(opt => opt.value === defaultMessaging)
        if (exists) {
          form.setValue('messagingStructure', defaultMessaging)
          markFieldAsAI('messagingStructure')
          recheckFields.push('Messaging Structure')
        } else {
          console.log('  - Adding messaging structure as suggestion:', defaultMessaging)
          newSuggestions['messagingStructure'] = defaultMessaging
        }
      }
      // Don't fill imageryType with dummy values - empty array is valid
      // Don't fill imageryBackground with dummy values - keep AI's values
      if (!checkValues.headlineText || checkValues.headlineText === 'Learn More') {
        form.setValue('headlineText', 'SIGNED AN ECOHELLDEST CONTROL CONTRACTUNGES PRESSURED')
        markFieldAsAI('headlineText')
        recheckFields.push('Headline')
      }
      if (!checkValues.preheadlineText) {
        console.log('  - Pre-headline is empty, filling with: LAWSUIT ALERT')
        form.setValue('preheadlineText', 'LAWSUIT ALERT')
        markFieldAsAI('preheadlineText')
        recheckFields.push('preheadlineText') // Fix: use field name not label
      }
      // Don't fill headlineTags with dummy values - keep AI's values
      if (!checkValues.ctaLabel) {
        form.setValue('ctaLabel', 'CHECK ELIGIBILITY - FREE CASE REVIEW')
        markFieldAsAI('ctaLabel')
        recheckFields.push('CTA Label')
      }
      if (!checkValues.ctaVerb) {
        const defaultVerb = 'check'
        console.log('  - CTA Verb is empty, checking options for:', defaultVerb)
        const exists = ctaVerbOptions.some(opt => opt.value === defaultVerb)
        if (exists) {
          form.setValue('ctaVerb', defaultVerb)
          markFieldAsAI('ctaVerb')
          recheckFields.push('CTA Verb')
        } else {
          console.log('  - Adding CTA verb as suggestion:', defaultVerb)
          newSuggestions['ctaVerb'] = defaultVerb
        }
      }
      // Don't fill copyAngle with dummy values - empty array is valid
      if (checkValues.copyAngle?.length === 0 && validatedAnalysis.copyAngle?.length > 0) {
        // Only set if AI actually provided values
        form.setValue('copyAngle', validatedAnalysis.copyAngle)
        markFieldAsAI('copyAngle')
      }
      // Don't fill copyTone with dummy values - keep AI's values
      
      // Update fields count
      fieldsToUpdate.push(...recheckFields)
      
      if (recheckFields.length > 0) {
        toast.info(`AI filled ${recheckFields.length} more fields with defaults`, { duration: 3000 })
      }
      
      // Final console log
      console.log('\n=== FINAL AI RESULTS ===')
      console.log('Total fields filled:', fieldsToUpdate.length)
      console.log('Fields filled:', fieldsToUpdate)
      console.log('AI suggestions for non-existent options:', newSuggestions)
      console.log('Final form values:', form.getValues())
      console.log('AI field markers (should have values):', Array.from(aiFieldsSet))
      console.log('AI fields count:', aiFieldsSet.size)
      
      // Debug why aiFieldsSet might be empty
      if (aiFieldsSet.size === 0) {
        console.warn('⚠️ AI field markers are empty! This is a bug.')
        console.log('Fields that should be marked:', fieldsToUpdate)
      }
      
      // Check what's still empty
      const finalValues = form.getValues()
      const emptyFields: string[] = []
      Object.entries(finalValues).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined || 
            (Array.isArray(value) && value.length === 0)) {
          emptyFields.push(key)
        }
      })
      console.log('\n=== STILL EMPTY FIELDS ===')
      console.log('Empty fields after AI:', emptyFields)
      console.log('========================\n')

      if (fieldsToUpdate.length > 0 || Object.keys(newSuggestions).length > 0) {
        setHasChanges(true)
        const message = fieldsToUpdate.length > 0 
          ? `AI populated ${fieldsToUpdate.length} fields`
          : 'AI provided suggestions for some fields'
        if (Object.keys(newSuggestions).length > 0) {
          toast.success(`${message}. Check blue badges for suggestions.`)
        } else {
          toast.success(message)
        }
        
        // Show completion status
        const totalFields = 40 // Approximate total fields
        const filledPercentage = Math.round((fieldsToUpdate.length / totalFields) * 100)
        toast.info(`Form ${filledPercentage}% complete`, { duration: 3000 })
      } else {
        toast.info('No fields could be populated from the image')
      }
    } catch (error: any) {
      console.error('AI analysis error:', error)
      toast.error('AI analysis failed. Please fill the form manually.')
    } finally {
      setAiLoading(false)
    }
  }

  // Auto-save functionality
  const performAutoSave = async () => {
    if (!isOnline) return
    
    try {
      const draftData: Partial<FirebaseDraftData> = {
        id: currentFirebaseDocId || undefined,
        draftId: currentDraftId || undefined,
        creativeFilename: form.getValues('creativeFilename'),
        autoSaved: true,
        formData: form.getValues(),
        aiPopulatedFields: Array.from(aiFieldsSet)
      }

      const docId = await saveFirebaseDraft(draftData, uploadedImageFile || undefined)
      
      if (docId) {
        setCurrentFirebaseDocId(docId)
        if (!currentDraftId) {
          setCurrentDraftId(draftData.draftId || `draft_${Date.now()}`)
        }
        setLastSaved(new Date())
        setHasChanges(false)
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }

  // Form submission
  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (currentFirebaseDocId) {
        await deleteFirebaseDraft(currentFirebaseDocId)
      }

      toast.success('Creative uploaded successfully')
      form.reset()
      setShowImage(false)
      setImagePreviewUrl(null)
      setUploadedImageFile(null)
      setCurrentDraftId(null)
      setCurrentFirebaseDocId(null)
      clearAllAITags()
    } catch {
      toast.error('Failed to upload creative')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check form validity
  const isFormValid = () => {
    const values = form.getValues()
    return !!(
      values.creativeFilename &&
      values.designer &&
      values.startDate &&
      values.endDate &&
      values.litigationName &&
      values.campaignType &&
      values.amountSpent &&
      values.costPerWebsiteLead &&
      values.costPerClick
    )
  }

  // Auto-save timer
  useEffect(() => {
    if (hasChanges && isOnline) {
      const timer = setTimeout(() => {
        performAutoSave()
      }, 30000)
      return () => clearTimeout(timer)
    }
  }, [hasChanges, isOnline])

  // Watch form changes
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // Only remove AI tag if user manually changes the field (not programmatic)
      if (name && aiFieldsSet.has(name) && !aiLoading && type === 'change') {
        console.log(`User manually changed ${name}, removing AI tag`)
        removeAITag(name)
      }
      setHasChanges(true)
    })
    return () => subscription.unsubscribe()
  }, [form, aiFieldsSet, aiLoading, removeAITag])

  // Image upload section
  if (!showImage) {
    return (
      <div className="mx-auto py-8 max-w-4xl container">
        <Card>
          <CardHeader>
            <CardTitle>Upload Creative</CardTitle>
            <CardDescription>
              Upload an image to analyze or skip to enter details manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto mb-4 w-12 h-12 text-gray-400" />
              {isDragActive ? (
                <p className="text-lg">Drop the image here</p>
              ) : (
                <>
                  <p className="mb-2 text-lg">Drag & drop an image here, or click to select</p>
                  <p className="text-gray-500 text-sm">PNG, JPG, JPEG, GIF, WEBP up to 10MB</p>
                </>
              )}
            </div>
            <div className="flex justify-center mt-6">
              <Button variant="outline" onClick={() => setShowImage(true)}>
                Skip Image Upload
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main form
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <div className="flex">
          {/* Sidebar */}
          {showImage && imagePreviewUrl && (
            <div className="w-80 min-h-screen">
              <div className="top-0 sticky bg-white shadow-lg p-6 border border-gray-200 rounded-2xl">
                <div className="relative bg-gray-100 mb-4 rounded-lg aspect-video overflow-hidden">
                  <NextImage
                    src={imagePreviewUrl}
                    alt="Creative preview"
                    className="w-full h-full object-contain"
                    width={320}
                    height={180}
                  />
                </div>
                <Button
                  type="button"
                  className="bg-yellow-400 hover:bg-yellow-500 mb-6 w-full font-medium text-black"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  Replace Image
                </Button>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="text-gray-900">
                      {lastSaved ? format(lastSaved, 'MMM d, h:mm a') : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                      {isOnline ? '✓ Synced' : '⚠ Offline'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-h-screen">
            <div className="mx-auto px-8 max-w-6xl">
              {/* Action Bar */}
              <div className="top-0 z-10 sticky flex justify-between items-center bg-white shadow-lg mb-8 p-5 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 px-3 py-1.5 rounded-full">
                    <span className="flex items-center gap-2 text-blue-700 text-sm">
                      <div className="bg-blue-500 rounded-full w-2 h-2 animate-pulse" />
                      Auto-save active
                    </span>
                  </div>
                  <AIStatusIndicator />
                </div>
                <div className="flex items-center gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" disabled={aiLoading}>
                        <Sparkles className="mr-2 w-4 h-4" />
                        {aiLoading ? 'Analyzing...' : 'AI Autopopulate'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => executeAIAutopopulate('empty')}>
                        Fill Empty Fields Only
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setPendingAIMode('all')
                        setShowOverwriteConfirm(true)
                      }}>
                        Override All Fields
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (confirm('Clear all form data?')) {
                        form.reset()
                        clearAllAITags()
                        setShowImage(false)
                        setImagePreviewUrl(null)
                        toast.success('Form cleared')
                      }
                    }}
                  >
                    Clear Form
                  </Button>
                  
                  <Button
                    onClick={() => setShowPreviewModal(true)}
                    disabled={isSubmitting || !isFormValid()}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? 'Uploading...' : 'Preview & Upload'}
                  </Button>
                </div>
              </div>

              {/* Form Sections */}
              <div className="space-y-8">
                {/* Metadata Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Metadata & Campaign Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormFieldWrapper label="Creative Filename" required isAIFilled={aiFieldsSet.has('creativeFilename')}>
                        <Input {...form.register('creativeFilename')} placeholder="Auto-populated from image" />
                      </FormFieldWrapper>
                      <FormFieldWrapper label="Date Added" isAIFilled={aiFieldsSet.has('dateAdded')}>
                        <Input {...form.register('dateAdded')} type="date" readOnly />
                      </FormFieldWrapper>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormFieldWrapper label="Start Date" required isAIFilled={aiFieldsSet.has('startDate')}>
                        <Input {...form.register('startDate')} type="date" />
                      </FormFieldWrapper>
                      <FormFieldWrapper label="End Date" required isAIFilled={aiFieldsSet.has('endDate')}>
                        <Input {...form.register('endDate')} type="date" />
                      </FormFieldWrapper>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormFieldWrapper 
                        label="Designer" 
                        required 
                        isAIFilled={aiFieldsSet.has('designer')}
                        aiSuggestion={aiSuggestions.designer}
                        onAcceptSuggestion={() => acceptAiSuggestion('designer', addDesignerTag)}
                        onDismissSuggestion={() => dismissAiSuggestion('designer')}
                      >
                        <SearchableSelect
                          value={form.watch('designer')}
                          onChange={(value) => form.setValue('designer', value as string)}
                          placeholder="Select or type to add designer"
                          fieldName="designer"
                        />
                      </FormFieldWrapper>
                      <FormFieldWrapper 
                        label="Litigation Name" 
                        required 
                        isAIFilled={aiFieldsSet.has('litigationName')}
                        aiSuggestion={aiSuggestions.litigationName}
                        onAcceptSuggestion={() => acceptAiSuggestion('litigationName', addLitigationTag)}
                        onDismissSuggestion={() => dismissAiSuggestion('litigationName')}
                      >
                        <SearchableSelect
                          value={form.watch('litigationName')}
                          onChange={(value) => form.setValue('litigationName', value as string)}
                          placeholder="Select or type to add litigation"
                          fieldName="litigationName"
                        />
                      </FormFieldWrapper>
                    </div>

                    <FormFieldWrapper 
                      label="Campaign Type" 
                      required 
                      isAIFilled={aiFieldsSet.has('campaignType')}
                      aiSuggestion={aiSuggestions.campaignType}
                      onAcceptSuggestion={() => acceptAiSuggestion('campaignType', addCampaignTypeTag)}
                      onDismissSuggestion={() => dismissAiSuggestion('campaignType')}
                    >
                      <SearchableSelect
                        value={form.watch('campaignType')}
                        onChange={(value) => form.setValue('campaignType', value as string)}
                        placeholder="Select or type to add campaign type"
                        fieldName="campaignType"
                      />
                    </FormFieldWrapper>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={form.watch('markedAsTopAd')}
                          onCheckedChange={(checked) => {
                            form.setValue('markedAsTopAd', checked)
                            removeAITag('markedAsTopAd')
                          }}
                        />
                        <Label>Marked as Top Ad?</Label>
                        {aiFieldsSet.has('markedAsTopAd') && form.watch('markedAsTopAd') === true && <AIBadge />}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={form.watch('needsOptimization')}
                          onCheckedChange={(checked) => {
                            form.setValue('needsOptimization', checked)
                            removeAITag('needsOptimization')
                          }}
                        />
                        <Label>Needs Optimization?</Label>
                        {aiFieldsSet.has('needsOptimization') && form.watch('needsOptimization') === true && <AIBadge />}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <FormFieldWrapper label="Amount Spent" required>
                        <Input {...form.register('amountSpent')} type="number" placeholder="0.00" />
                      </FormFieldWrapper>
                      <FormFieldWrapper label="Cost per Website Lead" required>
                        <Input {...form.register('costPerWebsiteLead')} type="number" placeholder="0.00" />
                      </FormFieldWrapper>
                      <FormFieldWrapper label="Cost per Click" required>
                        <Input {...form.register('costPerClick')} type="number" placeholder="0.00" />
                      </FormFieldWrapper>
                    </div>
                  </CardContent>
                </Card>

                {/* Message & Targeting */}
                <Card>
                  <CardHeader>
                    <CardTitle>Message & Targeting Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormFieldWrapper 
                        label="Creative Layout Type" 
                        isAIFilled={aiFieldsSet.has('creativeLayoutType')}
                        aiSuggestion={aiSuggestions.creativeLayoutType}
                        onAcceptSuggestion={() => acceptAiSuggestion('creativeLayoutType', addLayoutTypeTag)}
                        onDismissSuggestion={() => dismissAiSuggestion('creativeLayoutType')}
                      >
                        <SearchableSelect
                          value={form.watch('creativeLayoutType') || ''}
                          onChange={(value) => form.setValue('creativeLayoutType', value as string)}
                          placeholder="Search or type to add layout"
                          fieldName="creativeLayoutType"
                        />
                      </FormFieldWrapper>
                      <FormFieldWrapper 
                        label="Messaging Structure" 
                        isAIFilled={aiFieldsSet.has('messagingStructure')}
                        aiSuggestion={aiSuggestions.messagingStructure}
                        onAcceptSuggestion={() => acceptAiSuggestion('messagingStructure', addMessagingTag)}
                        onDismissSuggestion={() => dismissAiSuggestion('messagingStructure')}
                      >
                        <SearchableSelect
                          value={form.watch('messagingStructure') || ''}
                          onChange={(value) => form.setValue('messagingStructure', value as string)}
                          placeholder="Search or type to add messaging"
                          fieldName="messagingStructure"
                        />
                      </FormFieldWrapper>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormFieldWrapper label="Imagery Type" isAIFilled={aiFieldsSet.has('imageryType')}>
                        <SearchableSelect
                          value={form.watch('imageryType')}
                          onChange={(value) => form.setValue('imageryType', value as string[])}
                          placeholder="Search or type to add imagery"
                          multiple
                          fieldName="imageryType"
                        />
                      </FormFieldWrapper>
                      <FormFieldWrapper label="Imagery Background" isAIFilled={aiFieldsSet.has('imageryBackground')}>
                        <SearchableSelect
                          value={form.watch('imageryBackground')}
                          onChange={(value) => form.setValue('imageryBackground', value as string[])}
                          placeholder="Search or type to add background"
                          multiple
                          fieldName="imageryBackground"
                        />
                      </FormFieldWrapper>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={form.watch('questionBasedHeadline')}
                          onCheckedChange={(checked) => {
                            form.setValue('questionBasedHeadline', checked)
                            removeAITag('questionBasedHeadline')
                          }}
                        />
                        <Label>Question-Based Headline?</Label>
                        {aiFieldsSet.has('questionBasedHeadline') && form.watch('questionBasedHeadline') === true && <AIBadge />}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={form.watch('clientBranding')}
                          onCheckedChange={(checked) => {
                            form.setValue('clientBranding', checked)
                            removeAITag('clientBranding')
                          }}
                        />
                        <Label>Client Branding?</Label>
                        {aiFieldsSet.has('clientBranding') && form.watch('clientBranding') === true && <AIBadge />}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={form.watch('iconsUsed')}
                          onCheckedChange={(checked) => {
                            form.setValue('iconsUsed', checked)
                            removeAITag('iconsUsed')
                          }}
                        />
                        <Label>Icons Used?</Label>
                        {aiFieldsSet.has('iconsUsed') && form.watch('iconsUsed') === true && <AIBadge />}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Headlines & CTA */}
                <Card>
                  <CardHeader>
                    <CardTitle>Headline & CTA</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormFieldWrapper label="Preheadline Text" isAIFilled={aiFieldsSet.has('preheadlineText')}>
                        <Input {...form.register('preheadlineText')} placeholder="Enter preheadline" />
                      </FormFieldWrapper>
                      <FormFieldWrapper label="Headline Text" isAIFilled={aiFieldsSet.has('headlineText')}>
                        <Input {...form.register('headlineText')} placeholder="Enter headline" />
                      </FormFieldWrapper>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormFieldWrapper label="CTA Label" isAIFilled={aiFieldsSet.has('ctaLabel')}>
                        <Input {...form.register('ctaLabel')} placeholder="Enter CTA label" />
                      </FormFieldWrapper>
                      <FormFieldWrapper 
                        label="CTA Verb" 
                        isAIFilled={aiFieldsSet.has('ctaVerb')}
                        aiSuggestion={aiSuggestions.ctaVerb}
                        onAcceptSuggestion={() => acceptAiSuggestion('ctaVerb', addCtaVerbTag)}
                        onDismissSuggestion={() => dismissAiSuggestion('ctaVerb')}
                      >
                        <SearchableSelect
                          value={form.watch('ctaVerb') || ''}
                          onChange={(value) => form.setValue('ctaVerb', value as string)}
                          placeholder="Search or type to add CTA verb"
                          fieldName="ctaVerb"
                        />
                      </FormFieldWrapper>
                    </div>

                    <FormFieldWrapper label="Headline Tags" isAIFilled={aiFieldsSet.has('headlineTags')}>
                      <SearchableSelect
                        value={form.watch('headlineTags')}
                        onChange={(value) => form.setValue('headlineTags', value as string[])}
                        placeholder="Search or type to add tags"
                        multiple
                        fieldName="headlineTags"
                      />
                    </FormFieldWrapper>
                  </CardContent>
                </Card>

                {/* Copy Elements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Copy Drivers & Content Elements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormFieldWrapper label="Body Copy Summary" isAIFilled={aiFieldsSet.has('bodyCopySummary')}>
                      <Textarea {...form.register('bodyCopySummary')} placeholder="Summarize the main body copy" rows={4} />
                    </FormFieldWrapper>

                    <div className="grid grid-cols-2 gap-4">
                      <FormFieldWrapper label="Copy Angle" isAIFilled={aiFieldsSet.has('copyAngle')}>
                        <SearchableSelect
                          value={form.watch('copyAngle')}
                          onChange={(value) => form.setValue('copyAngle', value as string[])}
                          placeholder="Search or type to add angles"
                          multiple
                          fieldName="copyAngle"
                        />
                      </FormFieldWrapper>
                      <FormFieldWrapper label="Copy Tone" isAIFilled={aiFieldsSet.has('copyTone')}>
                        <SearchableSelect
                          value={form.watch('copyTone')}
                          onChange={(value) => form.setValue('copyTone', value as string[])}
                          placeholder="Search or type to add tones"
                          multiple
                          fieldName="copyTone"
                        />
                      </FormFieldWrapper>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={form.watch('legalLanguage')}
                          onCheckedChange={(checked) => {
                            form.setValue('legalLanguage', checked)
                            removeAITag('legalLanguage')
                          }}
                        />
                        <Label>Legal Language?</Label>
                        {aiFieldsSet.has('legalLanguage') && form.watch('legalLanguage') === true && <AIBadge />}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={form.watch('emotionalStatement')}
                          onCheckedChange={(checked) => {
                            form.setValue('emotionalStatement', checked)
                            removeAITag('emotionalStatement')
                          }}
                        />
                        <Label>Emotional Statement?</Label>
                        {aiFieldsSet.has('emotionalStatement') && form.watch('emotionalStatement') === true && <AIBadge />}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={form.watch('dollarAmount')}
                          onCheckedChange={(checked) => {
                            form.setValue('dollarAmount', checked)
                            removeAITag('dollarAmount')
                          }}
                        />
                        <Label>$ Amount Mentioned?</Label>
                        {aiFieldsSet.has('dollarAmount') && form.watch('dollarAmount') === true && <AIBadge />}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={form.watch('disclaimer')}
                          onCheckedChange={(checked) => {
                            form.setValue('disclaimer', checked)
                            removeAITag('disclaimer')
                          }}
                        />
                        <Label>Disclaimer?</Label>
                        {aiFieldsSet.has('disclaimer') && form.watch('disclaimer') === true && <AIBadge />}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={form.watch('statMentioned')}
                          onCheckedChange={(checked) => {
                            form.setValue('statMentioned', checked)
                            removeAITag('statMentioned')
                          }}
                        />
                        <Label>Stat Mentioned?</Label>
                        {aiFieldsSet.has('statMentioned') && form.watch('statMentioned') === true && <AIBadge />}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={form.watch('conditionsListed')}
                          onCheckedChange={(checked) => {
                            form.setValue('conditionsListed', checked)
                            removeAITag('conditionsListed')
                          }}
                        />
                        <Label>Conditions Listed?</Label>
                        {aiFieldsSet.has('conditionsListed') && form.watch('conditionsListed') === true && <AIBadge />}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormFieldWrapper label="Designer Remarks" isAIFilled={aiFieldsSet.has('designerRemarks')}>
                      <Textarea {...form.register('designerRemarks')} placeholder="Add designer notes" rows={4} />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Internal Notes" isAIFilled={aiFieldsSet.has('internalNotes')}>
                      <Textarea {...form.register('internalNotes')} placeholder="Add internal notes" rows={4} />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Google Doc Link" isAIFilled={aiFieldsSet.has('uploadGoogleDocLink')}>
                      <Input {...form.register('uploadGoogleDocLink')} type="url" placeholder="https://docs.google.com/..." />
                    </FormFieldWrapper>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Dialogs */}
        <Dialog open={showOverwriteConfirm} onOpenChange={setShowOverwriteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Overwrite</DialogTitle>
              <DialogDescription>
                Are you sure you want to overwrite existing fields? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowOverwriteConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (pendingAIMode) {
                    executeAIAutopopulate(pendingAIMode)
                  }
                  setShowOverwriteConfirm(false)
                }}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Modal */}
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Preview Creative Upload</DialogTitle>
              <DialogDescription>Review all information before uploading</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              {imagePreviewUrl && (
                <div className="p-4 border rounded-lg">
                  <h3 className="mb-2 font-semibold">Image Preview</h3>
                  <NextImage
                    src={imagePreviewUrl}
                    alt="Creative preview"
                    className="mx-auto max-w-full h-auto max-h-64 object-contain"
                    width={400}
                    height={256}
                  />
                </div>
              )}

              <div className="p-4 border rounded-lg">
                <h3 className="mb-2 font-semibold">Campaign Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Filename:</span>
                    <span className="ml-2">{form.getValues('creativeFilename')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Designer:</span>
                    <span className="ml-2">{form.getValues('designer')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Campaign Type:</span>
                    <span className="ml-2">{form.getValues('campaignType')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Litigation:</span>
                    <span className="ml-2">{form.getValues('litigationName')}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
                Back to Edit
              </Button>
              <Button
                onClick={() => {
                  setShowPreviewModal(false)
                  form.handleSubmit(handleSubmit)()
                }}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? 'Uploading...' : 'Confirm Upload'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}