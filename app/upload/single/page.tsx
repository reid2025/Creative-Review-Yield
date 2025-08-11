'use client'

import { useState, useCallback, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useDropzone } from 'react-dropzone'
import { format, addDays } from 'date-fns'
import { Upload, X, Save, FileText, Sparkles, ZoomIn, ZoomOut, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

// Custom imports
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAutoSaveTimer } from '@/hooks/useAutoSaveTimer'
import { useAIFields } from '@/hooks/useAIFields'
import { useFirebaseDrafts } from '@/hooks/useFirebaseDrafts'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

// Field options
import {
  LITIGATION_NAME_OPTIONS,
  CAMPAIGN_TYPE_OPTIONS,
  CREATIVE_LAYOUT_TYPE_OPTIONS,
  IMAGERY_TYPE_OPTIONS,
  IMAGERY_BACKGROUND_OPTIONS,
  MESSAGING_STRUCTURE_OPTIONS,
  HEADLINE_TAGS_OPTIONS,
  HEADLINE_INTENT_OPTIONS,
  CTA_VERB_OPTIONS,
  CTA_STYLE_GROUP_OPTIONS,
  CTA_COLOR_OPTIONS,
  CTA_POSITION_OPTIONS,
  COPY_ANGLE_OPTIONS,
  COPY_TONE_OPTIONS,
  AUDIENCE_PERSONA_OPTIONS,
  CAMPAIGN_TRIGGER_OPTIONS,
  DESIGNER_OPTIONS,
  FORM_SECTIONS,
  REQUIRED_FIELDS
} from '@/lib/single-upload-types'

// Form validation schema based on documentation
const formSchema = z.object({
  // File & Image
  uploadedImage: z.any().optional(),
  
  // CATEGORY: Metadata & Campaign Info
  dateAdded: z.string().default(format(new Date(), 'yyyy-MM-dd')),
  designer: z.string().min(1, 'Designer is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  creativeFilename: z.string().min(1, 'Creative filename is required'),
  litigationName: z.string().min(1, 'Litigation name is required'),
  campaignType: z.string().min(1, 'Campaign type is required'),
  markedAsTopAd: z.boolean().default(false),
  optimization: z.boolean().default(false),
  
  // CATEGORY: Performance Metrics
  amountSpent: z.string().min(1, 'Amount spent is required'),
  costPerWebsiteLead: z.string().min(1, 'Cost per website lead is required'),
  costPerClick: z.string().min(1, 'Cost per click is required'),
  
  // CATEGORY: Message & Targeting Insights
  creativeLayoutType: z.string().optional(),
  imageryType: z.array(z.string()).default([]),
  imageryBackground: z.array(z.string()).default([]),
  messagingStructure: z.string().optional(),
  questionBasedHeadline: z.boolean().default(false),
  clientBranding: z.boolean().default(false),
  iconsUsed: z.boolean().default(false),
  
  // CATEGORY: Headline & CTA Details
  preheadlineText: z.string().optional(),
  headlineText: z.string().optional(),
  headlineTags: z.array(z.string()).default([]),
  headlineIntent: z.array(z.string()).default([]),
  ctaLabel: z.string().optional(),
  ctaVerb: z.string().optional(),
  ctaStyleGroup: z.string().optional(),
  ctaColor: z.string().optional(),
  ctaPosition: z.string().optional(),
  
  // CATEGORY: Copy & Conversion Drivers
  bodyCopySummary: z.string().optional(),
  copyAngle: z.array(z.string()).default([]),
  copyTone: z.array(z.string()).default([]),
  audiencePersona: z.string().optional(),
  conditionsListed: z.boolean().default(false),
  campaignTrigger: z.string().optional(),
  legalLanguagePresent: z.boolean().default(false),
  statMentioned: z.boolean().default(false),
  emotionalStatementPresent: z.boolean().default(false),
  disclaimerAdded: z.boolean().default(false),
  dollarAmountMentioned: z.boolean().default(false),
  
  // CATEGORY: Additional
  designerRemarks: z.string().optional(),
  internalNotes: z.string().optional(),
  uploadGoogleDocLink: z.string().optional(),
  pinNoteForStrategySync: z.boolean().default(false)
}).superRefine((data, ctx) => {
  // Validate end date is after start date
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    if (end < start) {
      ctx.addIssue({
        code: 'custom',
        message: 'End date must be after start date',
        path: ['endDate']
      })
    }
  }
})

type FormData = z.infer<typeof formSchema>

export default function SingleUploadPage() {
  const { user } = useAuth()
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)

  // AI fields management
  const {
    aiFields,
    aiFieldsSet,
    isFieldAIFilled,
    markFieldAsAI,
    removeAITag,
    setMultipleAITags,
    clearAllAITags
  } = useAIFields()

  // Firebase drafts
  const {
    drafts: firebaseDrafts,
    isLoading: draftsLoading,
    saveDraft: saveFirebaseDraft,
    isOnline
  } = useFirebaseDrafts({
    userId: user?.uid || 'anonymous',
    enableRealTime: true
  })

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateAdded: format(new Date(), 'yyyy-MM-dd'),
      designer: '',
      startDate: '',
      endDate: '',
      creativeFilename: '',
      litigationName: '',
      campaignType: '',
      markedAsTopAd: false,
      optimization: false,
      amountSpent: '',
      costPerWebsiteLead: '',
      costPerClick: '',
      creativeLayoutType: '',
      imageryType: [],
      imageryBackground: [],
      messagingStructure: '',
      questionBasedHeadline: false,
      clientBranding: false,
      iconsUsed: false,
      preheadlineText: '',
      headlineText: '',
      headlineTags: [],
      headlineIntent: [],
      ctaLabel: '',
      ctaVerb: '',
      ctaStyleGroup: '',
      ctaColor: '',
      ctaPosition: '',
      bodyCopySummary: '',
      copyAngle: [],
      copyTone: [],
      audiencePersona: '',
      conditionsListed: false,
      campaignTrigger: '',
      legalLanguagePresent: false,
      statMentioned: false,
      emotionalStatementPresent: false,
      disclaimerAdded: false,
      dollarAmountMentioned: false,
      designerRemarks: '',
      internalNotes: '',
      uploadGoogleDocLink: '',
      pinNoteForStrategySync: false
    }
  })

  // Auto-save functionality
  const handleAutoSave = useCallback(async () => {
    if (!user?.uid || !isOnline) return
    
    try {
      const formData = form.getValues()
      const filename = formData.creativeFilename
      
      if (!filename && !uploadedImageFile) {
        console.log('No filename or image - skipping auto-save')
        return
      }

      await saveFirebaseDraft({
        creativeFilename: filename || 'Untitled',
        autoSaved: true,
        formData: formData,
        aiPopulatedFields: Array.from(aiFieldsSet)
      }, uploadedImageFile || undefined)

      setLastSavedTime(new Date())
      console.log('Draft auto-saved successfully')
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }, [user?.uid, isOnline, form, uploadedImageFile, aiFieldsSet, saveFirebaseDraft])

  const {
    countdown,
    isCountingDown,
    isSaving,
    startCountdown,
    resetCountdown,
    triggerManualSave
  } = useAutoSaveTimer({
    onSave: handleAutoSave,
    enabled: isOnline && (hasUserInteracted || uploadedImageFile !== null),
    delay: 30
  })

  // Image upload handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }

      setUploadedImageFile(file)
      setImagePreviewUrl(URL.createObjectURL(file))

      // Extract filename without extension for creative filename
      const filenameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      form.setValue('creativeFilename', filenameWithoutExt)

      // Start 30-second countdown
      if (!hasUserInteracted) {
        setHasUserInteracted(true)
        setTimeout(() => {
          startCountdown()
        }, 100)
      }

      toast.success('Image uploaded successfully')
    }
  }, [form, hasUserInteracted, startCountdown])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
  })

  // Handle form field changes
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    form.setValue(fieldName as any, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })

    // Remove AI tag if user manually changes field
    if (isFieldAIFilled(fieldName)) {
      removeAITag(fieldName)
    }

    // Reset countdown on user interaction
    if (!hasUserInteracted) {
      setHasUserInteracted(true)
    }
    resetCountdown()
  }, [form, isFieldAIFilled, removeAITag, hasUserInteracted, resetCountdown])

  // AI Auto-populate functions
  const handleAIFillEmpty = async () => {
    toast.info('AI is analyzing your creative...')
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const currentValues = form.getValues()
      const aiSuggestions: Partial<FormData> = {}
      
      // Only fill empty fields
      if (!currentValues.designer) aiSuggestions.designer = 'ai-designer'
      if (!currentValues.creativeLayoutType) aiSuggestions.creativeLayoutType = 'quiz'
      if (!currentValues.headlineText) aiSuggestions.headlineText = 'AI-Generated Headline'
      if (!currentValues.ctaLabel) aiSuggestions.ctaLabel = 'Get Started Now'
      if (!currentValues.ctaColor) aiSuggestions.ctaColor = 'blue'
      if (!currentValues.bodyCopySummary) aiSuggestions.bodyCopySummary = 'AI-generated compelling copy that drives action'
      
      // Apply AI suggestions
      Object.entries(aiSuggestions).forEach(([field, value]) => {
        form.setValue(field as any, value)
        markFieldAsAI(field)
      })

      resetCountdown()
      toast.success('AI filled empty fields successfully')
      
    } catch (error) {
      toast.error('AI analysis failed')
    }
  }

  const handleAIOverwrite = async () => {
    if (!confirm('Are you sure you want to overwrite existing fields? This action cannot be undone.')) {
      return
    }
    
    toast.info('AI is analyzing and overwriting fields...')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Clear all AI tags first
      clearAllAITags()
      
      // Overwrite all fields
      const aiOverwriteData: Partial<FormData> = {
        designer: 'ai-designer',
        creativeLayoutType: 'banner',
        headlineText: 'AI-Generated Compelling Headline',
        ctaLabel: 'Discover More',
        ctaColor: 'red',
        ctaPosition: 'bottom-center',
        bodyCopySummary: 'Revolutionary AI-powered solution that transforms business outcomes',
        copyAngle: ['benefit-focused', 'educational'],
        copyTone: ['professional'],
        audiencePersona: 'professionals'
      }
      
      // Apply overwrite data
      Object.entries(aiOverwriteData).forEach(([field, value]) => {
        form.setValue(field as any, value)
        markFieldAsAI(field)
      })

      resetCountdown()
      toast.success('AI overwrite completed')
      
    } catch (error) {
      toast.error('AI overwrite failed')
    }
  }

  // Form submission
  const onSubmit = async (data: FormData) => {
    if (!uploadedImageFile) {
      toast.error('Please upload an image first')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Here you would submit to your backend
      console.log('Submitting form data:', data)
      console.log('AI populated fields:', Array.from(aiFieldsSet))
      
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Creative uploaded successfully!')
      
      // Reset form after successful submission
      form.reset()
      setImagePreviewUrl(null)
      setUploadedImageFile(null)
      clearAllAITags()
      setHasUserInteracted(false)
      
    } catch (error) {
      toast.error('Upload failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if required fields are filled
  const requiredFieldsCompleted = REQUIRED_FIELDS.every(field => {
    const value = form.watch(field as any)
    return value && value !== ''
  })

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Single Upload</h1>
            <p className="text-muted-foreground">Upload and analyze your creative assets</p>
          </div>
          <div className="flex items-center space-x-4">
            {isCountingDown && (
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>Auto-save in {countdown}s</span>
              </div>
            )}
            {isSaving && (
              <Badge variant="secondary">
                <Save className="h-3 w-3 mr-1" />
                Saving...
              </Badge>
            )}
            {lastSavedTime && (
              <span className="text-xs text-muted-foreground">
                Last saved: {format(lastSavedTime, 'HH:mm:ss')}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left side - Image Upload & Preview (40%) */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Image Upload</CardTitle>
                <CardDescription>Upload your creative image (max 10MB)</CardDescription>
              </CardHeader>
              <CardContent>
                {!imagePreviewUrl ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg font-medium mb-2">
                      {isDragActive ? 'Drop image here' : 'Drag & drop image'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
                    <p className="text-xs text-muted-foreground">
                      Supported: JPG, PNG, GIF, WebP • Max size: 10MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={imagePreviewUrl}
                        alt="Creative preview"
                        className="w-full rounded-lg"
                        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setImagePreviewUrl(null)
                          setUploadedImageFile(null)
                          form.setValue('creativeFilename', '')
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  AI Auto-populate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleAIFillEmpty}
                  disabled={!imagePreviewUrl}
                >
                  Fill Blank Fields
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleAIOverwrite}
                  disabled={!imagePreviewUrl}
                >
                  Overwrite All Fields
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Form Fields (60%) */}
          <div className="lg:col-span-3">
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Form sections */}
                {Object.entries(FORM_SECTIONS).map(([sectionKey, section]) => (
                  <Card key={sectionKey}>
                    <Collapsible defaultOpen>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50">
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="space-y-4">
                          {section.fields.map(fieldName => (
                            <FormFieldComponent
                              key={fieldName}
                              fieldName={fieldName}
                              form={form}
                              isAIFilled={isFieldAIFilled(fieldName)}
                              onChange={handleFieldChange}
                            />
                          ))}
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}

                {/* Submit buttons */}
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => triggerManualSave()}
                      disabled={!hasUserInteracted}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPreviewModal(true)}
                      disabled={!requiredFieldsCompleted}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      type="submit"
                      disabled={!requiredFieldsCompleted || isSubmitting}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Uploading...' : 'Upload Creative'}
                    </Button>
                  </div>
                </div>

                {/* Required fields indicator */}
                {!requiredFieldsCompleted && (
                  <div className="flex items-center space-x-2 text-sm text-amber-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>Please complete all required fields to upload</span>
                  </div>
                )}
              </form>
            </FormProvider>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

// Form field component
function FormFieldComponent({
  fieldName,
  form,
  isAIFilled,
  onChange
}: {
  fieldName: string
  form: any
  isAIFilled: boolean
  onChange: (fieldName: string, value: any) => void
}) {
  const value = form.watch(fieldName)
  const isRequired = REQUIRED_FIELDS.includes(fieldName)

  // Get field options based on field name
  const getFieldOptions = (fieldName: string) => {
    switch (fieldName) {
      case 'designer': return DESIGNER_OPTIONS
      case 'litigationName': return LITIGATION_NAME_OPTIONS
      case 'campaignType': return CAMPAIGN_TYPE_OPTIONS
      case 'creativeLayoutType': return CREATIVE_LAYOUT_TYPE_OPTIONS
      case 'imageryType': return IMAGERY_TYPE_OPTIONS
      case 'imageryBackground': return IMAGERY_BACKGROUND_OPTIONS
      case 'messagingStructure': return MESSAGING_STRUCTURE_OPTIONS
      case 'headlineTags': return HEADLINE_TAGS_OPTIONS
      case 'headlineIntent': return HEADLINE_INTENT_OPTIONS
      case 'ctaVerb': return CTA_VERB_OPTIONS
      case 'ctaStyleGroup': return CTA_STYLE_GROUP_OPTIONS
      case 'ctaColor': return CTA_COLOR_OPTIONS
      case 'ctaPosition': return CTA_POSITION_OPTIONS
      case 'copyAngle': return COPY_ANGLE_OPTIONS
      case 'copyTone': return COPY_TONE_OPTIONS
      case 'audiencePersona': return AUDIENCE_PERSONA_OPTIONS
      case 'campaignTrigger': return CAMPAIGN_TRIGGER_OPTIONS
      default: return []
    }
  }

  const fieldOptions = getFieldOptions(fieldName)

  // Field labels
  const getFieldLabel = (fieldName: string) => {
    const labels: Record<string, string> = {
      dateAdded: 'Date Added to Sheet',
      designer: 'Designer',
      startDate: 'Start Date',
      endDate: 'End Date',
      creativeFilename: 'Creative Filename',
      litigationName: 'Litigation Name',
      campaignType: 'Campaign Type',
      markedAsTopAd: 'Marked as Top Ad?',
      optimization: 'Optimization?',
      amountSpent: 'Amount Spent',
      costPerWebsiteLead: 'Cost Per Website Lead',
      costPerClick: 'Cost Per Click',
      creativeLayoutType: 'Creative Layout Type',
      imageryType: 'Imagery Type',
      imageryBackground: 'Imagery Background',
      messagingStructure: 'Messaging Structure',
      questionBasedHeadline: 'Question-Based Headline?',
      clientBranding: 'Client Branding?',
      iconsUsed: 'Icons Used?',
      preheadlineText: 'Preheadline Text',
      headlineText: 'Headline Text',
      headlineTags: 'Headline Tags',
      headlineIntent: 'Headline Intent',
      ctaLabel: 'CTA Label',
      ctaVerb: 'CTA Verb',
      ctaStyleGroup: 'CTA Style Group',
      ctaColor: 'CTA Color',
      ctaPosition: 'CTA Position',
      bodyCopySummary: 'Body Copy Summary',
      copyAngle: 'Copy Angle',
      copyTone: 'Copy Tone',
      audiencePersona: 'Audience Persona',
      conditionsListed: 'Conditions Listed?',
      campaignTrigger: 'Campaign Trigger',
      legalLanguagePresent: 'Legal Language Present?',
      statMentioned: 'Stat Mentioned?',
      emotionalStatementPresent: 'Emotional Statement Present?',
      disclaimerAdded: 'Disclaimer Added?',
      dollarAmountMentioned: '$ Amount Mentioned?',
      designerRemarks: 'Designer Remarks',
      internalNotes: 'Internal Notes',
      uploadGoogleDocLink: 'Upload Google Doc Link',
      pinNoteForStrategySync: 'Pin Note for Strategy Sync'
    }
    return labels[fieldName] || fieldName
  }

  const label = getFieldLabel(fieldName)
  
  // Skip the image field as it's handled separately
  if (fieldName === 'image') return null

  // Auto-filled date field (read-only)
  if (fieldName === 'dateAdded') {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Input value={value} disabled />
      </div>
    )
  }

  // Boolean fields (switches)
  if (typeof form.getValues()[fieldName] === 'boolean') {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label htmlFor={fieldName}>{label}</Label>
          {isRequired && <span className="text-red-500">*</span>}
          {isAIFilled && <Badge variant="secondary" className="text-xs">AI</Badge>}
        </div>
        <Switch
          id={fieldName}
          checked={value}
          onCheckedChange={(checked) => onChange(fieldName, checked)}
        />
      </div>
    )
  }

  // Date fields
  if (fieldName.includes('Date')) {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
          {isAIFilled && <Badge variant="secondary" className="text-xs ml-2">AI</Badge>}
        </Label>
        <Input
          id={fieldName}
          type="date"
          value={value}
          onChange={(e) => onChange(fieldName, e.target.value)}
        />
      </div>
    )
  }

  // Number fields
  if (fieldName.includes('amount') || fieldName.includes('cost') || fieldName.includes('Cost')) {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
          {isAIFilled && <Badge variant="secondary" className="text-xs ml-2">AI</Badge>}
        </Label>
        <Input
          id={fieldName}
          type="number"
          step="0.01"
          value={value}
          onChange={(e) => onChange(fieldName, e.target.value)}
        />
      </div>
    )
  }

  // Multi-select fields
  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        <Label>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
          {isAIFilled && <Badge variant="secondary" className="text-xs ml-2">AI</Badge>}
        </Label>
        <div className="space-y-2">
          {fieldOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${fieldName}-${option.value}`}
                checked={value.includes(option.value)}
                onCheckedChange={(checked) => {
                  const newValue = checked
                    ? [...value, option.value]
                    : value.filter((v: string) => v !== option.value)
                  onChange(fieldName, newValue)
                }}
              />
              <Label htmlFor={`${fieldName}-${option.value}`}>{option.label}</Label>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Large text fields
  if (fieldName.includes('Remarks') || fieldName.includes('Notes') || fieldName.includes('Summary')) {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
          {isAIFilled && <Badge variant="secondary" className="text-xs ml-2">AI</Badge>}
        </Label>
        <Textarea
          id={fieldName}
          value={value}
          onChange={(e) => onChange(fieldName, e.target.value)}
          rows={3}
        />
      </div>
    )
  }

  // Single select fields with options
  if (fieldOptions.length > 0) {
    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName}>
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
          {isAIFilled && <Badge variant="secondary" className="text-xs ml-2">AI</Badge>}
        </Label>
        <Select value={value} onValueChange={(newValue) => onChange(fieldName, newValue)}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {fieldOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  // Default text input
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldName}>
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
        {isAIFilled && <Badge variant="secondary" className="text-xs ml-2">AI</Badge>}
      </Label>
      <Input
        id={fieldName}
        value={value}
        onChange={(e) => onChange(fieldName, e.target.value)}
      />
    </div>
  )
}