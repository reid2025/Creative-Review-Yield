'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Save, FileText, Sparkles, Image as ImageIcon, ZoomIn, ZoomOut, Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react'
import { format, addDays } from 'date-fns'
import { DraftStorageV2 } from '@/utils/draftStorage.v2'
import { useAIFields } from '@/hooks/useAIFields'
import { useFirebaseDrafts } from '@/hooks/useFirebaseDrafts'
import { FirebaseDraftData } from '@/lib/firebase-draft-service'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'

// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'


// Custom form components
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormSwitch,
  FormGrid,
} from '@/components/input'

// Common reusable components
import {
  FormCardSection,
  FormDialog,
  FormDropdown
} from '@/components/common'

// Form validation schema
const formSchema = z.object({
  // File & Image
  uploadedImage: z.any().nullable(),
  skipImage: z.boolean().default(false),

  // Metadata Section
  creativeFilename: z.string().min(1, 'Filename is required'),
  dateAdded: z.string(),
  designer: z.string().min(1, 'Designer is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  campaignName: z.string().optional(),

  // Performance Metrics
  spend: z.string().optional(),
  revenue: z.string().optional(),
  roas: z.string().optional(),
  // Performance Metrics (actual form fields)
  amountSpent: z.string().optional(),
  costPerWebsiteLead: z.string().optional(),
  costPerClick: z.string().optional(),

  // Message & Targeting Insights
  imageryType: z.array(z.string()).default([]),
  background: z.array(z.string()).default([]),
  questionBasedHeadline: z.boolean().default(false),
  clientBranding: z.boolean().default(false),
  iconsUsed: z.boolean().default(false),
  markedAsTopAd: z.boolean().default(false),
  needsOptimization: z.boolean().default(false),
  // Message & Targeting Insights (actual form fields)
  creativeLayoutType: z.string().optional(),
  messagingStructure: z.string().optional(),
  imageryBackground: z.string().optional(),

  // Headline & CTA
  preheadline: z.string().optional(),
  headline: z.string().min(1, 'Headline is required'),
  headlineTags: z.array(z.string()).default([]),
  ctaVerb: z.string().optional(),
  ctaStyle: z.string().optional(),
  ctaPosition: z.string().optional(),
  ctaColor: z.string().optional(),
  // Headline & CTA (actual form fields)
  preheadlineText: z.string().optional(),
  headlineText: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaStyleGroup: z.string().optional(),
  headlineIntent: z.string().optional(),

  // Copy Drivers & Content Elements
  bodyCopySummary: z.string().optional(),
  copyAngle: z.array(z.string()).default([]),
  tone: z.array(z.string()).default([]),
  legalLanguage: z.boolean().default(false),
  emotionalStatement: z.boolean().default(false),
  dollarAmount: z.boolean().default(false),
  statMentioned: z.boolean().default(false),
  disclaimer: z.boolean().default(false),
  conditionsListed: z.boolean().default(false),
  audiencePersona: z.string().optional(),
  campaignTrigger: z.string().optional(),

  // Additional Information
  designerRemarks: z.string().optional(),
  googleDocLink: z.string().url().optional().or(z.literal('')),
  internalNotes: z.string().optional(),
  pinNote: z.boolean().default(false),
  // Additional Information (actual form fields)
  uploadGoogleDocLink: z.string().optional(),
  pinNoteForStrategySync: z.boolean().default(false),
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

// Options for multi-select fields
const CREATIVE_LAYOUT_TYPE_OPTIONS = [
  { value: 'single-image', label: 'Single Image' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'video', label: 'Video' },
  { value: 'collection', label: 'Collection' }
]
const MESSAGING_STRUCTURE_OPTIONS = [
  { value: 'problem-solution', label: 'Problem-Solution' },
  { value: 'benefit-focused', label: 'Benefit-Focused' },
  { value: 'testimonial', label: 'Testimonial' },
  { value: 'question-based', label: 'Question-Based' }
]
const IMAGERY_TYPE_OPTIONS = [
  { value: 'product', label: 'Product' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'people', label: 'People' },
  { value: 'illustration', label: 'Illustration' }
]
const IMAGERY_BACKGROUND_OPTIONS = [
  { value: 'white', label: 'White' },
  { value: 'transparent', label: 'Transparent' },
  { value: 'colored', label: 'Colored' },
  { value: 'gradient', label: 'Gradient' }
]
const HEADLINE_TEXT_OPTIONS = [
  { value: 'question', label: 'Question' },
  { value: 'benefit', label: 'Benefit' },
  { value: 'feature', label: 'Feature' },
  { value: 'emotional', label: 'Emotional' }
]
const HEADLINE_INTENT_OPTIONS = [
  { value: 'informational', label: 'Informational' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'emotional', label: 'Emotional' },
  { value: 'urgency', label: 'Urgency' }
]
const CTA_STYLE_GROUP_OPTIONS = [
  { value: 'button', label: 'Button' },
  { value: 'text-link', label: 'Text Link' },
  { value: 'banner', label: 'Banner' }
]
const COPY_ANGLE_OPTIONS = [
  { value: 'benefit-focused', label: 'Benefit-Focused' },
  { value: 'problem-solving', label: 'Problem-Solving' },
  { value: 'social-proof', label: 'Social Proof' },
  { value: 'urgency', label: 'Urgency' }
]
const COPY_TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'urgent', label: 'Urgent' }
]

const CTA_VERB_OPTIONS = [
  { value: 'get', label: 'Get' },
  { value: 'start', label: 'Start' },
  { value: 'learn', label: 'Learn' },
  { value: 'discover', label: 'Discover' },
  { value: 'try', label: 'Try' },
  { value: 'download', label: 'Download' },
  { value: 'shop', label: 'Shop' },
  { value: 'see', label: 'See' },
]

const CTA_POSITION_OPTIONS = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'center', label: 'Center' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
]
const CTA_COLOR_OPTIONS = [
  { value: 'green', label: 'Green (#89DA1A)' },
  { value: 'blue', label: 'Blue' },
  { value: 'red', label: 'Red' },
  { value: 'orange', label: 'Orange' },
  { value: 'black', label: 'Black' },
  { value: 'white', label: 'White' },
]
const AUDIENCE_PERSONA_OPTIONS = [
  { value: 'budget-conscious', label: 'Budget Conscious' },
  { value: 'premium-seeker', label: 'Premium Seeker' },
  { value: 'tech-savvy', label: 'Tech Savvy' },
  { value: 'traditional', label: 'Traditional' },
  { value: 'young-professional', label: 'Young Professional' },
  { value: 'family-oriented', label: 'Family Oriented' },
]
const CAMPAIGN_TRIGGER_OPTIONS = [
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'product-launch', label: 'Product Launch' },
  { value: 'brand-awareness', label: 'Brand Awareness' },
  { value: 'retention', label: 'Retention' },
]
const DESIGNER_OPTIONS = [
  { value: 'john-doe', label: 'John Doe' },
  { value: 'jane-smith', label: 'Jane Smith' },
  { value: 'alex-johnson', label: 'Alex Johnson' },
]
const CAMPAIGN_OPTIONS = [
  { value: 'summer-2024', label: 'Summer 2024' },
  { value: 'fall-2024', label: 'Fall 2024' },
  { value: 'holiday-2024', label: 'Holiday 2024' },
]

export default function SingleUploadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [showImage, setShowImage] = useState(false)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [isAIPopulating, setIsAIPopulating] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showDrafts, setShowDrafts] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(30)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [hasTypedInField, setHasTypedInField] = useState(false)
  
  // Firebase drafts integration
  const {
    drafts: firebaseDrafts,
    isLoading: draftsLoading,
    saveDraft: saveFirebaseDraft,
    deleteDraft: deleteFirebaseDraft,
    getDraft: getFirebaseDraft,
    isOnline,
    lastSyncTime,
    trackingStats
  } = useFirebaseDrafts({ 
    userId: user?.uid || 'anonymous',
    enableRealTime: true 
  })
  
  // Use the new AI fields hook for clean state management
  const {
    aiFields,
    aiFieldsSet,
    aiFieldCount,
    isFieldAIFilled,
    markFieldAsAI,
    removeAITag,
    setMultipleAITags,
    clearAllAITags
  } = useAIFields()
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewField, setReviewField] = useState<{ field: string, aiValue: string, suggestedValue: string } | null>(null)
  const [pendingReviews, setPendingReviews] = useState<Array<{ field: string, aiValue: string, suggestedValue: string }>>([])
  const [reviewNotifications, setReviewNotifications] = useState<Set<string>>(new Set())
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false)
  const [pendingAIMode, setPendingAIMode] = useState<'empty' | 'all' | null>(null)
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  // The AI field functions are now provided by the useAIFields hook

  // Handle dropdown changes and remove AI tags
  const handleDropdownChange = useCallback((fieldName: string, value: string) => {
    if (isFieldAIFilled(fieldName)) {
      removeAITag(fieldName)
    }

    form.setValue(fieldName as any, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })

    setHasTypedInField(true)
  }, [isFieldAIFilled, removeAITag])

  // Available designers and campaigns - in production, these would come from an API
  const [designers, setDesigners] = useState(DESIGNER_OPTIONS)
  const [campaigns, setCampaigns] = useState(CAMPAIGN_OPTIONS)

  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // File & Image
      skipImage: false,
      uploadedImage: null,

      // Metadata Section
      creativeFilename: '',
      dateAdded: format(new Date(), 'yyyy-MM-dd'),
      designer: '',
      startDate: '',
      endDate: '',
      campaignName: '',

      // Performance Metrics
      spend: '',
      revenue: '',
      roas: '',
      // Performance Metrics (actual form fields)
      amountSpent: '',
      costPerWebsiteLead: '',
      costPerClick: '',

      // Message & Targeting Insights
      imageryType: [],
      background: [],
      questionBasedHeadline: false,
      clientBranding: false,
      iconsUsed: false,
      markedAsTopAd: false,
      needsOptimization: false,
      // Message & Targeting Insights (actual form fields)
      creativeLayoutType: '',
      messagingStructure: '',
      imageryBackground: '',

      // Headline & CTA
      preheadline: '',
      headline: '',
      headlineTags: [],
      ctaVerb: '',
      ctaStyle: '',
      ctaPosition: '',
      ctaColor: '',
      // Headline & CTA (actual form fields)
      preheadlineText: '',
      headlineText: '',
      ctaLabel: '',
      ctaStyleGroup: '',
      headlineIntent: '',

      // Copy Drivers & Content Elements
      bodyCopySummary: '',
      copyAngle: [],
      tone: [],
      legalLanguage: false,
      emotionalStatement: false,
      dollarAmount: false,
      statMentioned: false,
      disclaimer: false,
      conditionsListed: false,
      audiencePersona: '',
      campaignTrigger: '',

      // Additional Information
      designerRemarks: '',
      googleDocLink: '',
      internalNotes: '',
      pinNote: false,
      // Additional Information (actual form fields)
      uploadGoogleDocLink: '',
      pinNoteForStrategySync: false,
    },
  })

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }

      form.setValue('uploadedImage', file)
      setUploadedImageFile(file) // Store for Firebase upload

      // Extract filename without extension
      const filenameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      form.setValue('creativeFilename', filenameWithoutExt)

      setImagePreviewUrl(URL.createObjectURL(file))
      setShowImage(true)

      // Start 30-second countdown for auto-save
      startAutoSaveCountdown()
    }
  }, [form])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
  })

  // Handle skip image
  const handleSkipImage = () => {
    form.setValue('skipImage', true)
    setShowImage(true)
    setHasChanges(true)
  }

  // Firebase Draft management
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const [currentFirebaseDocId, setCurrentFirebaseDocId] = useState<string | null>(null)
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null)

  const handleSaveDraft = async () => {
    const filename = form.getValues('creativeFilename')
    if (!filename) {
      toast.error('Please enter a filename before saving draft')
      return
    }

    if (!isOnline) {
      toast.error('Cannot save draft - you are offline')
      return
    }

    const draftData: Partial<FirebaseDraftData> = {
      id: currentFirebaseDocId || undefined,
      draftId: currentDraftId || undefined,
      creativeFilename: filename,
      autoSaved: false,
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
    }
  }

  const handleLoadDraft = async (docId: string) => {
    const draft = await getFirebaseDraft(docId)

    if (draft) {
      form.reset(draft.formData)
      setCurrentFirebaseDocId(draft.id || docId)
      setCurrentDraftId(draft.draftId)

      // Set AI fields from loaded draft
      if (draft.aiPopulatedFields) {
        setMultipleAITags(draft.aiPopulatedFields)
      }

      if (draft.imageUrl) {
        setImagePreviewUrl(draft.imageUrl)
        setShowImage(true)
      } else if (draft.formData.uploadedImage) {
        setShowImage(true)
      }

      toast.success('Draft loaded successfully')
      setShowDrafts(false)
    } else {
      toast.error('Failed to load draft')
    }
  }

  const getAllDrafts = () => {
    return firebaseDrafts.map(draft => ({
      id: draft.id || draft.draftId,
      filename: draft.creativeFilename,
      savedAt: draft.lastSaved?.toDate?.()?.toISOString() || draft.lastSaved,
      autoSaved: draft.autoSaved || false,
      aiFieldsCount: draft.aiPopulatedFields?.length || 0
    })).sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
  }

  // AI Autopopulate
  const handleAIAutopopulate = async (mode: 'empty' | 'all') => {
    // Show confirmation modal for overwrite mode
    if (mode === 'all') {
      setPendingAIMode(mode)
      setShowOverwriteConfirm(true)
      return
    }

    executeAIAutopopulate(mode)
  }

  // Helper function to detect similar values
  const findSimilarValue = (value: string, options: { value: string; label: string }[]): string | null => {
    const valueLower = value.toLowerCase()
    for (const option of options) {
      const optionLower = option.label.toLowerCase()
      // Check for very similar strings (e.g., "John Smith" vs "Jane Smith")
      if (optionLower !== valueLower &&
        (optionLower.includes(valueLower.split(' ')[1] || '') ||
          valueLower.includes(optionLower.split(' ')[1] || '') ||
          levenshteinDistance(valueLower, optionLower) <= 3)) {
        return option.label
      }
    }
    return null
  }

  // Helper: Levenshtein distance for string similarity
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = []
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    return matrix[str2.length][str1.length]
  }

  const executeAIAutopopulate = async (mode: 'empty' | 'all') => {
    setAiLoading(true)
    setIsAIPopulating(true)

    try {
      // For override mode, clear all existing AI tags immediately
      if (mode === 'all') {
        clearAllAITags()
      }

      // Simulate AI response - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      const currentValues = form.getValues()
      // AI populate starting
      let aiResponse: Partial<FormData> = {}

      if (mode === 'all') {
        // Using OVERRIDE mode - filling all fields
        // Override mode: Replace ALL fields
        aiResponse = {
          // Metadata & Campaign Info
          creativeFilename: 'AI-creative-uber-business-transformation',
          dateAdded: format(new Date(), 'yyyy-MM-dd'),
          startDate: format(new Date(), 'yyyy-MM-dd'),
          endDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
          designer: 'ai-designer',
          campaignName: 'ai-campaign',
          litigation: 'none',
          markedAsTopAd: true,
          needsOptimization: false,
          
          // Performance Metrics (schema fields)
          spend: '15000',
          revenue: '75000',
          roas: '5.0',
          // Performance Metrics (actual form fields)
          amountSpent: '15000',
          costPerWebsiteLead: '25.50',
          costPerClick: '2.75',
          
          // Message & Targeting Insights (schema fields)
          imageryType: ['abstract', 'people'],
          background: ['gradient', 'solid-color'],
          questionBasedHeadline: true,
          clientBranding: true,
          iconsUsed: false,
          // Message & Targeting Insights (actual form fields)
          creativeLayoutType: 'single-image',
          messagingStructure: 'problem-solution',
          imageryBackground: 'gradient',
          
          // Headlines & CTA (schema fields)
          preheadline: 'AI: Revolutionary Business Solutions',
          headline: 'AI: Transform Your Business Today',
          headlineTags: ['urgent', 'benefit-focused'],
          ctaVerb: 'discover',
          ctaStyle: 'button',
          ctaPosition: 'bottom-center',
          ctaColor: 'blue',
          // Headlines & CTA (actual form fields)
          preheadlineText: 'AI: Revolutionary Business Solutions',
          headlineText: 'AI: Transform Your Business Today',
          ctaLabel: 'Get Started Now',
          ctaStyleGroup: 'button',
          headlineIntent: 'benefit-focused',
          
          // Copy Drivers & Content Elements (schema fields)
          bodyCopySummary: 'AI: Revolutionary solutions designed for modern businesses seeking growth and efficiency.',
          copyAngle: ['educational', 'problem-solution'],
          tone: ['professional', 'authoritative'],
          audiencePersona: 'tech-savvy',
          campaignTrigger: 'brand-awareness',
          legalLanguage: true,
          emotionalStatement: true,
          dollarAmount: true,
          starMentioned: false,
          disclaimer: true,
          complianceListed: true,
          
          // Additional Information (schema fields)
          designerRemarks: 'AI-generated creative with focus on business transformation messaging',
          internalNotes: 'AI autopopulated fields - review and adjust as needed',
          googleDocLink: 'https://docs.google.com/document/ai-generated',
          pinNote: true,
          // Additional Information (actual form fields)
          uploadGoogleDocLink: 'https://docs.google.com/document/ai-generated',
          pinNoteForStrategySync: true
        }
      } else {
        // Using FILL EMPTY mode - only filling empty fields
        if (!currentValues.creativeFilename) aiResponse.creativeFilename = 'AI-creative-business-growth'
        if (!currentValues.dateAdded) aiResponse.dateAdded = format(new Date(), 'yyyy-MM-dd')
        if (!currentValues.startDate) aiResponse.startDate = format(new Date(), 'yyyy-MM-dd')
        if (!currentValues.endDate) aiResponse.endDate = format(addDays(new Date(), 30), 'yyyy-MM-dd')
        if (!currentValues.designer) aiResponse.designer = 'john-smith'
        if (!currentValues.campaignName) aiResponse.campaignName = 'ai-campaign'
        if (!currentValues.litigation) aiResponse.litigation = 'none'
        if (!currentValues.markedAsTopAd) aiResponse.markedAsTopAd = true
        if (!currentValues.needsOptimization) aiResponse.needsOptimization = false
        
        // Performance Metrics (schema fields)
        if (!currentValues.spend) aiResponse.spend = '5000'
        if (!currentValues.revenue) aiResponse.revenue = '25000'
        if (!currentValues.roas) aiResponse.roas = '5.0'
        // Performance Metrics (actual form fields)
        if (!currentValues.amountSpent) aiResponse.amountSpent = '5000'
        if (!currentValues.costPerWebsiteLead) aiResponse.costPerWebsiteLead = '15.00'
        if (!currentValues.costPerClick) aiResponse.costPerClick = '1.25'
        
        // Message & Targeting Insights (schema fields)
        if (!currentValues.imageryType || currentValues.imageryType.length === 0) aiResponse.imageryType = ['people', 'product']
        if (!currentValues.background || currentValues.background.length === 0) aiResponse.background = ['solid-color']
        if (!currentValues.questionBasedHeadline) aiResponse.questionBasedHeadline = true
        if (!currentValues.clientBranding) aiResponse.clientBranding = true
        if (!currentValues.iconsUsed) aiResponse.iconsUsed = true
        // Message & Targeting Insights (actual form fields)
        if (!currentValues.creativeLayoutType) aiResponse.creativeLayoutType = 'single-image'
        if (!currentValues.messagingStructure) aiResponse.messagingStructure = 'problem-solution'
        if (!currentValues.imageryBackground) aiResponse.imageryBackground = 'solid-color'
        
        // Headlines & CTA (schema fields)
        if (!currentValues.preheadline) aiResponse.preheadline = 'AI: Exclusive Offer'
        if (!currentValues.headline) aiResponse.headline = 'AI: Transform Your Business'
        if (!currentValues.headlineTags || currentValues.headlineTags.length === 0) aiResponse.headlineTags = ['benefit-focused']
        if (!currentValues.ctaVerb) aiResponse.ctaVerb = 'get'
        if (!currentValues.ctaStyle) aiResponse.ctaStyle = 'button'
        if (!currentValues.ctaPosition) aiResponse.ctaPosition = 'bottom-center'
        if (!currentValues.ctaColor) aiResponse.ctaColor = 'green'
        // Headlines & CTA (actual form fields)
        if (!currentValues.preheadlineText) aiResponse.preheadlineText = 'AI: Exclusive Offer'
        if (!currentValues.headlineText) aiResponse.headlineText = 'AI: Transform Your Business'
        if (!currentValues.ctaLabel) aiResponse.ctaLabel = 'Learn More'
        if (!currentValues.ctaStyleGroup) aiResponse.ctaStyleGroup = 'button'
        if (!currentValues.headlineIntent) aiResponse.headlineIntent = 'benefit-focused'
        
        // Copy Drivers & Content Elements (schema fields)
        if (!currentValues.bodyCopySummary) aiResponse.bodyCopySummary = 'AI: Innovative solutions for business growth and success.'
        if (!currentValues.copyAngle || currentValues.copyAngle.length === 0) aiResponse.copyAngle = ['problem-solution']
        if (!currentValues.tone || currentValues.tone.length === 0) aiResponse.tone = ['professional']
        if (!currentValues.audiencePersona) aiResponse.audiencePersona = 'budget-conscious'
        if (!currentValues.campaignTrigger) aiResponse.campaignTrigger = 'promotional'
        if (!currentValues.legalLanguage) aiResponse.legalLanguage = true
        if (!currentValues.emotionalStatement) aiResponse.emotionalStatement = true
        if (!currentValues.dollarAmount) aiResponse.dollarAmount = true
        if (!currentValues.starMentioned) aiResponse.starMentioned = false
        if (!currentValues.disclaimer) aiResponse.disclaimer = true
        if (!currentValues.complianceListed) aiResponse.complianceListed = false
        
        // Additional Information (schema fields)
        if (!currentValues.designerRemarks) aiResponse.designerRemarks = 'AI-generated creative concept'
        if (!currentValues.internalNotes) aiResponse.internalNotes = 'AI populated empty fields'
        if (!currentValues.googleDocLink) aiResponse.googleDocLink = 'https://docs.google.com/document/ai-draft'
        if (!currentValues.pinNote) aiResponse.pinNote = true
        // Additional Information (actual form fields)
        if (!currentValues.uploadGoogleDocLink) aiResponse.uploadGoogleDocLink = 'https://docs.google.com/document/ai-draft'
        if (!currentValues.pinNoteForStrategySync) aiResponse.pinNoteForStrategySync = true
      }

      // Apply AI values and set tags
      const fieldsToUpdate = Object.keys(aiResponse)
      // AI Autopopulate - updating fields
      
      Object.entries(aiResponse).forEach(([fieldName, value]) => {
        // Setting field: ${fieldName}
        form.setValue(fieldName as any, value)
      })

      // Setting AI tags for fields
      setMultipleAITags(fieldsToUpdate)
      
      // Log current form values after update
      setTimeout(() => {
        const currentValues = form.getValues()
        // AI populate complete
        // Note: aiFields state might not be updated yet due to React's async state updates
      }, 100)

      // Reset auto-save timer
      if (fieldsToUpdate.length > 0) {
        setHasChanges(true)
        setHasTypedInField(false)
        startAutoSaveCountdown()
        toast.success(`AI ${mode === 'empty' ? 'filled empty fields' : 'overrode all fields'} (${fieldsToUpdate.length} fields)`)
      }
    } catch (error) {
      toast.error('Failed to generate AI content')
    } finally {
      setAiLoading(false)
      // Reset the AI populating flag after a short delay to ensure all setValue operations complete
      setTimeout(() => {
        setIsAIPopulating(false)
        // Form watcher re-enabled
      }, 200)
    }
  }

  // Form submission with Firebase cleanup
  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Remove draft from Firebase upon successful upload
      if (currentFirebaseDocId) {
        await deleteFirebaseDraft(currentFirebaseDocId)
        // Draft removed from Firebase after successful upload
      }

      toast.success('Creative uploaded successfully')
      form.reset()
      setShowImage(false)
      setImagePreviewUrl(null)
      setUploadedImageFile(null)
      setHasTypedInField(false)
      setCurrentDraftId(null)
      setCurrentFirebaseDocId(null)
      clearAllAITags()
      
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
    } catch (error) {
      toast.error('Failed to upload creative')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check for resume parameter (Firebase or legacy)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const resumeId = params.get('resumeId') // Firebase document ID
    const resumeFilename = params.get('resume') // Legacy filename
    
    if (resumeId) {
      handleLoadDraft(resumeId)
    } else if (resumeFilename) {
      // Legacy support - try to find by filename in Firebase drafts
      const legacyDraft = firebaseDrafts.find(d => d.creativeFilename === resumeFilename)
      if (legacyDraft && legacyDraft.id) {
        handleLoadDraft(legacyDraft.id)
      }
    }

    // Set current date as dateAdded
    form.setValue('dateAdded', format(new Date(), 'yyyy-MM-dd'))

    // Cleanup countdown on unmount
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
    }
  }, [firebaseDrafts])

  // Removed debug logging that was causing infinite loop

  // Countdown effect for auto-save
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return 30 // Reset to 30 seconds
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])


  // Check if all required fields are filled
  const isFormValid = () => {
    const values = form.getValues()
    return (
      values.creativeFilename &&
      values.designer &&
      values.startDate &&
      values.endDate &&
      values.headline
    )
  }

  // Start auto-save countdown (30 seconds)
  const startAutoSaveCountdown = () => {
    if (hasTypedInField) return

    // Clear existing countdown
    if (countdownInterval) {
      clearInterval(countdownInterval)
    }

    let seconds = 30

    const interval = setInterval(() => {
      seconds--

      if (seconds === 0) {
        performAutoSave()
        clearInterval(interval)
        setCountdownInterval(null)
      }
    }, 1000)

    setCountdownInterval(interval)
  }

  // Perform Firebase auto-save
  const performAutoSave = async () => {
    
    if (hasTypedInField) {
      // Auto-save skipped - user has typed in field
      return
    }
    
    if (!isOnline) {
      // Auto-save skipped - offline
      return
    }

    // Starting auto-save process
    setIsSaving(true)
    
    try {
      const filename = form.getValues('creativeFilename')
      // Form filename ready

      const draftData: Partial<FirebaseDraftData> = {
        id: currentFirebaseDocId || undefined,
        draftId: currentDraftId || undefined,
        creativeFilename: filename,
        autoSaved: true,
        formData: form.getValues(),
        aiPopulatedFields: Array.from(aiFieldsSet)
      }

      // Auto-save draft data prepared

      const docId = await saveFirebaseDraft(draftData, uploadedImageFile || undefined)
      // Document ID received
      
      if (docId) {
        setCurrentFirebaseDocId(docId)
        if (!currentDraftId) {
          setCurrentDraftId(draftData.draftId || `draft_${Date.now()}`)
        }
        setLastSaved(new Date())
        setHasChanges(false)
        // Auto-save completed via Firebase
      } else {
        // Auto-save failed - no document ID returned
      }
    } catch (error) {
      console.error('❌ Firebase auto-save failed:', error)
      if (isOnline) {
        toast.error('Auto-save failed - will retry')
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Watch form changes
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // Track if user has typed in any field
      if (type === 'change' && name && !hasTypedInField) {
        setHasTypedInField(true)

        // Cancel auto-save countdown if it's running
        if (countdownInterval) {
          clearInterval(countdownInterval)
          setCountdownInterval(null)
        }
      }

      // Remove AI tag if user manually edits an AI-filled field (but not during AI populate)
      if (name && isFieldAIFilled(name) && !isAIPopulating) {
        // Removing AI tag for field (user edited)
        removeAITag(name)
      }

      // If user types after initial auto-save, update the existing draft
      if (lastSaved && type === 'change' && name) {
        setHasChanges(true)
        // Update timestamps immediately
        setLastSaved(new Date())

        // Save changes after a short delay
        const timer = setTimeout(() => {
          performManualSave()
        }, 2000)
        return () => clearTimeout(timer)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, lastSaved, hasTypedInField, countdownInterval, isAIPopulating, isFieldAIFilled, removeAITag])

  // Manual save (for user changes) via Firebase
  const performManualSave = async () => {
    if (!isOnline) return

    setIsSaving(true)
    try {
      const filename = form.getValues('creativeFilename')

      const draftData: Partial<FirebaseDraftData> = {
        id: currentFirebaseDocId || undefined,
        draftId: currentDraftId || undefined,
        creativeFilename: filename,
        autoSaved: false,
        formData: form.getValues(),
        aiPopulatedFields: Array.from(aiFieldsSet),
        userId: user?.uid
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
      console.error('Manual save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Image upload section
  if (!showImage) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
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
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-lg">Drop the image here</p>
              ) : (
                <>
                  <p className="text-lg mb-2">Drag & drop an image here, or click to select</p>
                  <p className="text-sm text-gray-500">PNG, JPG, JPEG, GIF, WEBP up to 10MB</p>
                </>
              )}
            </div>
            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={handleSkipImage}>
                Skip Image Upload
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main form layout
  return (
    <ProtectedRoute>
      <div className="min-h-screen ">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex">

            {/* side  */}
            {showImage && imagePreviewUrl && (
              <div className="w-80 min-h-screen">
                <div className="sticky top-0 bg-white border border-gray-200 shadow-lg rounded-2xl p-6">
                  <div className="relative rounded-lg overflow-hidden mb-4 aspect-video bg-gray-100">
                    <img
                      src={imagePreviewUrl}
                      alt="Creative preview"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 mb-4">
                    <p className="font-medium truncate">{form.watch('uploadedImage')?.name || 'Uploaded image-name-uber-underpaid-question-carnival-whistling-reflex'}</p>
                    <p className="text-xs text-gray-500">
                      {form.watch('uploadedImage') ?
                        `${(form.watch('uploadedImage').size / 1024 / 1024).toFixed(2)} MB` :
                        '6.93 MB'
                      }
                    </p>
                  </div>

                  <Button
                    type="button"
                    className="w-full mb-6 bg-yellow-400 hover:bg-yellow-500 text-black border-0 text-sm font-medium"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    Replace Image
                  </Button>

                  {/* Creative Snapshot Section */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Creative Snapshot
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Campaign:</span>
                        <span className="text-gray-900">
                          {form.watch('campaignName') ? 
                            campaigns.find(c => c.value === form.watch('campaignName'))?.label || '—' 
                            : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Designer:</span>
                        <span className="text-gray-900">
                          {form.watch('designer') ? 
                            designers.find(d => d.value === form.watch('designer'))?.label || '—' 
                            : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="text-gray-900">
                          {lastSaved ? format(lastSaved, 'MMM d, h:mm a') : '—'}
                        </span>
                      </div>
                      {isOnline && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Firebase:</span>
                          <span className="text-green-600 text-xs">
                            ✓ Synced
                          </span>
                        </div>
                      )}
                      {!isOnline && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="text-red-600 text-xs">
                            ⚠ Offline
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Current Tags */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Current Tags
                    </h3>
                    <p className="text-sm text-gray-500">No tags available</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Form Content */}
            <div className="flex-1 min-h-screen">
              <div className="max-w-6xl mx-auto px-8">
                {/* Action Bar */}
                <div className="sticky top-0 z-10 flex items-center mb-8 justify-between bg-white border-gray-200 shadow-lg rounded-2xl p-5">
                  <div className="flex items-center gap-4">
                    {/* Auto-save Status */}
                    <div className="bg-blue-50 px-3 py-1.5 rounded-full">
                      <span className="flex items-center gap-2 text-sm text-blue-700">
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                        Auto-save active ({countdown}s)
                      </span>
                    </div>
                    
                    {/* Firebase Connection Status */}
                    <div className={`px-3 py-1.5 rounded-full ${isOnline ? 'bg-green-50' : 'bg-red-50'}`}>
                      <span className={`flex items-center gap-2 text-sm ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
                        {isOnline ? <Cloud className="h-3 w-3" /> : <CloudOff className="h-3 w-3" />}
                        {isOnline ? 'Connected' : 'Offline'}
                      </span>
                    </div>
                    
                    {/* Sync Status */}
                    {lastSyncTime && isOnline && (
                      <div className="bg-gray-50 px-3 py-1.5 rounded-full">
                        <span className="text-xs text-gray-600">
                          Last sync: {format(lastSyncTime, 'h:mm a')}
                        </span>
                      </div>
                    )}
                    
                    {/* Tracking Stats */}
                    {trackingStats.totalDrafts > 0 && (
                      <div className="bg-purple-50 px-3 py-1.5 rounded-full">
                        <span className="text-xs text-purple-700">
                          {trackingStats.totalDrafts} drafts • {trackingStats.aiPopulatedCount} AI
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Auto-save Status */}


                    {/* AI Autopopulate */}
                    <FormDropdown
                      trigger={
                        <Button variant="outline" disabled={aiLoading} size="sm">
                          <Sparkles className="h-4 w-4 mr-2" />
                          AI Autopopulate
                        </Button>
                      }
                      options={[
                        {
                          label: 'Fill Empty Fields Only',
                          description: 'AI will only populate fields that are currently empty',
                          onClick: () => handleAIAutopopulate('empty')
                        },
                        {
                          label: 'Override All Fields',
                          description: 'AI will replace all fields, including ones with existing values',
                          onClick: () => handleAIAutopopulate('all')
                        }
                      ]}
                      className="w-64"
                      disabled={aiLoading}
                    />

                    {/* Clear Form */}
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => {
                        if (confirm('Are you sure you want to clear all form data?')) {
                          form.reset()
                          clearAllAITags()
                          setShowImage(false)
                          setImagePreviewUrl(null)
                          setHasChanges(false)
                          toast.success('Form cleared')
                        }
                      }}
                    >
                      Clear Form
                    </Button>

                    {/* Test Firebase Button - Debug only */}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        // Manual test Firebase save triggered
                        await performAutoSave()
                      }}
                      className="text-purple-600 border-purple-300 hover:bg-purple-50"
                    >
                      Test Save
                    </Button>

                    {/* Submit Button */}
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (isFormValid()) {
                          setShowPreviewModal(true)
                        }
                      }}
                      disabled={isSubmitting || !isFormValid()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSubmitting ? 'Uploading...' : 'Preview & Upload'}
                    </Button>
                  </div>
                </div>

                {/* Form Sections */}
                <div className="space-y-8">
                  {/* Metadata & Campaign Info */}
                  <FormCardSection
                    title="Metadata & Campaign Info"
                    description="Basic information about the creative and campaign"
                  >
                    <FormGrid cols={2}>
                      <FormInput
                        name="creativeFilename"
                        label="Creative Filename"
                        placeholder="Auto-populated from image"
                        required
                        isAIFilled={aiFieldsSet.has('creativeFilename')}
                      />
                      <FormInput
                        name="dateAdded"
                        label="Date Added to Sheet"
                        type="date"
                        readOnly
                        isAIFilled={aiFieldsSet.has('dateAdded')}
                      />
                    </FormGrid>

                    <FormGrid cols={2}>
                      <FormInput
                        name="startDate"
                        label="Start Date"
                        type="date"
                        required
                        isAIFilled={aiFieldsSet.has('startDate')}
                      />
                      <FormInput
                        name="endDate"
                        label="End Date"
                        type="date"
                        required
                        isAIFilled={aiFieldsSet.has('endDate')}
                      />
                    </FormGrid>

                    <FormGrid cols={2}>
                      <div className="relative">
                        <FormSelect
                          name="designer"
                          label="Designer"
                          placeholder="Select designer"
                          options={designers}
                          required
                          allowAddNew
                          onAddNew={(value) => {
                            const newDesigner = { value: value.toLowerCase().replace(/\s+/g, '-'), label: value }
                            setDesigners([...designers, newDesigner])
                          }}
                          onChange={(value) => handleDropdownChange('designer', value)}
                          isAIFilled={aiFieldsSet.has('designer')}
                        />
                        {reviewNotifications.has('designer') && (
                          <button
                            type="button"
                            className="text-xs text-blue-600 hover:text-blue-700 mt-1 cursor-pointer"
                            onClick={() => {
                              const review = pendingReviews.find(r => r.field === 'designer')
                              if (review) {
                                setReviewField(review)
                                setShowReviewModal(true)
                              }
                            }}
                          >
                            Review
                          </button>
                        )}
                      </div>
                      <FormSelect
                        name="litigation"
                        label="Litigation"
                        placeholder="Select litigation type"
                        options={[
                          { value: 'none', label: 'None' },
                          { value: 'pending', label: 'Pending' },
                          { value: 'resolved', label: 'Resolved' }
                        ]}
                        isAIFilled={aiFieldsSet.has('litigation')}
                      />
                    </FormGrid>

                    <FormSelect
                      name="campaignName"
                      label="Campaign Name"
                      placeholder="Select or add campaign name"
                      options={campaigns}
                      allowAddNew
                      onAddNew={(value) => {
                        const newCampaign = { value: value.toLowerCase().replace(/\s+/g, '-'), label: value }
                        setCampaigns([...campaigns, newCampaign])
                      }}
                      isAIFilled={aiFieldsSet.has('campaignName')}
                    />

                    <FormGrid cols={2}>
                      <FormSwitch
                        name="markedAsTopAd"
                        label="Marked as Top Ad?"
                        isAIFilled={aiFieldsSet.has('markedAsTopAd')}
                      />
                      <FormSwitch
                        name="needsOptimization"
                        label="Needs Optimization?"
                        isAIFilled={aiFieldsSet.has('needsOptimization')}
                      />
                    </FormGrid>
                  </FormCardSection>

                  {/* Performance Metrics */}
                  <FormCardSection
                    title="Performance Metrics"
                    description="Analytics and performance data for tracking success"
                  >
                    <FormGrid cols={3}>
                      <FormInput
                        name="amountSpent"
                        label="Amount Spent"
                        type="number"
                        placeholder="$ 0.00"
                        prefix="$"
                        isAIFilled={aiFieldsSet.has('amountSpent')}
                      />
                      <FormInput
                        name="costPerWebsiteLead"
                        label="Cost per Website Lead"
                        type="number"
                        placeholder="$ 0.00"
                        prefix="$"
                        isAIFilled={aiFieldsSet.has('costPerWebsiteLead')}
                      />
                      <FormInput
                        name="costPerClick"
                        label="Cost per Click"
                        type="number"
                        placeholder="$ 0.00"
                        prefix="$"
                        isAIFilled={aiFieldsSet.has('costPerClick')}
                      />
                    </FormGrid>
                  </FormCardSection>

                  {/* Message & Targeting Insights */}
                  <FormCardSection
                    title="Message & Targeting Insights"
                    description="Audience targeting and message conditioning details"
                  >
                    <FormGrid cols={2}>
                      <FormSelect
                        name="creativeLayoutType"
                        label="Creative Layout Type"
                        placeholder="Select or add layout type"
                        options={CREATIVE_LAYOUT_TYPE_OPTIONS}
                        allowAddNew
                        isAIFilled={aiFieldsSet.has('creativeLayoutType')}
                      />
                      <FormSelect
                        name="messagingStructure"
                        label="Messaging Structure"
                        placeholder="Select or add messaging structure"
                        options={MESSAGING_STRUCTURE_OPTIONS}
                        allowAddNew
                        isAIFilled={aiFieldsSet.has('messagingStructure')}
                      />
                    </FormGrid>

                    <FormGrid cols={2}>
                      <FormSelect
                        name="imageryType"
                        label="Imagery Type"
                        placeholder="Select or add imagery type"
                        options={IMAGERY_TYPE_OPTIONS}
                        allowAddNew
                        isAIFilled={aiFieldsSet.has('imageryType')}
                      />
                      <FormSelect
                        name="imageryBackground"
                        label="Imagery Background"
                        placeholder="Select or add imagery background"
                        options={IMAGERY_BACKGROUND_OPTIONS}
                        allowAddNew
                        isAIFilled={aiFieldsSet.has('imageryBackground')}
                      />
                    </FormGrid>

                    <FormGrid cols={3}>
                      <FormSwitch
                        name="questionBasedHeadline"
                        label="Question-Based Headline?"
                        isAIFilled={aiFieldsSet.has('questionBasedHeadline')}
                      />
                      <FormSwitch
                        name="clientBranding"
                        label="Client Branding?"
                        isAIFilled={aiFieldsSet.has('clientBranding')}
                      />
                      <FormSwitch
                        name="iconsUsed"
                        label="Icons Used?"
                        isAIFilled={aiFieldsSet.has('iconsUsed')}
                      />
                    </FormGrid>
                  </FormCardSection>

                  {/* Headline & CTA */}
                  <FormCardSection
                    title="Headline & CTA"
                    description="Main headline and call-to-action configuration"
                  >
                    <FormGrid cols={2}>
                      <FormInput
                        name="preheadlineText"
                        label="Preheadline Text"
                        placeholder="Enter preheadline text"
                        isAIFilled={aiFieldsSet.has('preheadlineText')}
                      />
                      <FormInput
                        name="headlineText"
                        label="Headline Text"
                        placeholder="Enter headline text"
                        required
                        isAIFilled={aiFieldsSet.has('headlineText')}
                      />
                    </FormGrid>

                    <FormGrid cols={2}>
                      <FormInput
                        name="ctaLabel"
                        label="CTA Label"
                        placeholder="Enter CTA label"
                        isAIFilled={aiFieldsSet.has('ctaLabel')}
                      />
                      <FormSelect
                        name="ctaVerb"
                        label="CTA Verb"
                        placeholder="Select or add CTA verb"
                        options={CTA_VERB_OPTIONS}
                        allowAddNew
                        onChange={(value) => handleDropdownChange('ctaVerb', value)}
                        isAIFilled={aiFieldsSet.has('ctaVerb')}
                      />
                    </FormGrid>

                    <FormGrid cols={2}>
                      <FormSelect
                        name="ctaStyleGroup"
                        label="CTA Style Group"
                        placeholder="Select or add CTA style"
                        options={CTA_STYLE_GROUP_OPTIONS}
                        allowAddNew
                        isAIFilled={aiFieldsSet.has('ctaStyleGroup')}
                      />
                      <FormSelect
                        name="ctaPosition"
                        label="CTA Position"
                        placeholder="Select or add CTA position"
                        options={CTA_POSITION_OPTIONS}
                        allowAddNew
                        isAIFilled={aiFieldsSet.has('ctaPosition')}
                      />
                    </FormGrid>

                    <FormGrid cols={2}>
                      <FormSelect
                        name="headlineIntent"
                        label="Headline Intent"
                        placeholder="Select or add headline intent"
                        options={HEADLINE_INTENT_OPTIONS}
                        allowAddNew
                        isAIFilled={aiFieldsSet.has('headlineIntent')}
                      />
                      <FormSelect
                        name="ctaColor"
                        label="CTA Color"
                        placeholder="Select or add CTA color"
                        options={CTA_COLOR_OPTIONS}
                        allowAddNew
                        isAIFilled={aiFieldsSet.has('ctaColor')}
                      />
                    </FormGrid>

                    <FormSelect
                      name="headlineTags"
                      label="Headline Tags"
                      placeholder="Select or add headline tags"
                      options={HEADLINE_TEXT_OPTIONS}
                      allowAddNew
                      isAIFilled={aiFieldsSet.has('headlineTags')}
                    />
                  </FormCardSection>

                  {/* Copy Drivers & Content Elements */}
                  <FormCardSection
                    title="Copy Drivers & Content Elements"
                    description="Content copy elements and creative categorization"
                  >
                    <FormTextarea
                      name="bodyCopySummary"
                      label="Body Copy Summary"
                      placeholder="Summarize the main body copy and key messages"
                      rows={4}
                      isAIFilled={aiFieldsSet.has('bodyCopySummary')}
                    />

                    <FormGrid cols={2}>
                      <FormSelect
                        name="copyAngle"
                        label="Copy Angle"
                        placeholder="Select or add copy angle"
                        options={COPY_ANGLE_OPTIONS}
                        allowAddNew
                        isAIFilled={aiFieldsSet.has('copyAngle')}
                      />
                      <FormSelect
                        name="copyTone"
                        label="Copy Tone"
                        placeholder="Select or add copy tone"
                        options={COPY_TONE_OPTIONS}
                        allowAddNew
                        isAIFilled={aiFieldsSet.has('copyTone')}
                      />
                    </FormGrid>

                    <FormGrid cols={2}>
                      <FormSelect
                        name="audiencePersona"
                        label="Audience Persona"
                        placeholder="Select or add audience persona"
                        options={AUDIENCE_PERSONA_OPTIONS}
                        allowAddNew
                        onChange={(value) => handleDropdownChange('audiencePersona', value)}
                        isAIFilled={aiFieldsSet.has('audiencePersona')}
                      />
                      <FormSelect
                        name="campaignTrigger"
                        label="Campaign Trigger"
                        placeholder="Select or add campaign trigger"
                        options={CAMPAIGN_TRIGGER_OPTIONS}
                        allowAddNew
                        isAIFilled={aiFieldsSet.has('campaignTrigger')}
                      />
                    </FormGrid>

                    <FormGrid cols={2}>
                      <FormSwitch name="legalLanguage" label="Legal Language?" isAIFilled={aiFieldsSet.has('legalLanguage')} />
                      <FormSwitch name="emotionalStatement" label="Emotional Statement?" isAIFilled={aiFieldsSet.has('emotionalStatement')} />
                      <FormSwitch name="dollarAmount" label="Dollar Amount?" isAIFilled={aiFieldsSet.has('dollarAmount')} />
                      <FormSwitch name="starMentioned" label="Star Mentioned?" isAIFilled={aiFieldsSet.has('starMentioned')} />
                      <FormSwitch name="disclaimer" label="Disclaimer?" isAIFilled={aiFieldsSet.has('disclaimer')} />
                      <FormSwitch name="complianceListed" label="Compliance Listed?" isAIFilled={aiFieldsSet.has('complianceListed')} />
                    </FormGrid>
                  </FormCardSection>

                  {/* Additional Information */}
                  <FormCardSection
                    title="Additional Information"
                    description="Designer notes and additional documentation"
                  >
                    <FormTextarea
                      name="designerRemarks"
                      label="Designer Remarks"
                      placeholder="Add any designer notes or remarks"
                      rows={4}
                      isAIFilled={aiFieldsSet.has('designerRemarks')}
                    />

                    <FormTextarea
                      name="internalNotes"
                      label="Internal Notes"
                      placeholder="Add internal notes or team communication"
                      rows={4}
                      isAIFilled={aiFieldsSet.has('internalNotes')}
                    />

                    <FormInput
                      name="uploadGoogleDocLink"
                      label="Upload Google Doc Link"
                      type="url"
                      placeholder="https://docs.google.com/..."
                      isAIFilled={aiFieldsSet.has('uploadGoogleDocLink')}
                    />

                    <FormSwitch
                      name="pinNoteForStrategySync"
                      label="Pin Note for Strategy Sync"
                      isAIFilled={aiFieldsSet.has('pinNoteForStrategySync')}
                    />
                  </FormCardSection>
                </div>
              </div>
            </div>
          </div>

          {/* Review Modal for Similar Values */}
          <FormDialog
            isOpen={showReviewModal}
            onOpenChange={setShowReviewModal}
            title="Review AI Suggestion"
            description="The AI suggested a value similar to an existing option. Please choose:"
            maxWidth="sm"
          >
            {reviewField && (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <span className="font-medium">Field: </span>
                  <span className="text-gray-600">
                    {reviewField.field === 'designer' ? 'Designer' :
                      reviewField.field === 'audiencePersona' ? 'Audience Persona' :
                        reviewField.field}
                  </span>
                </div>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-purple-50 border-purple-200"
                    onClick={() => {
                      // Use AI value and add to dropdown
                      if (reviewField.field === 'designer') {
                        const newDesigner = {
                          value: reviewField.aiValue.toLowerCase().replace(/\s+/g, '-'),
                          label: reviewField.aiValue
                        }
                        setDesigners([...designers, newDesigner])
                        form.setValue('designer', newDesigner.value)
                        markFieldAsAI('designer')
                      } else if (reviewField.field === 'audiencePersona') {
                        // Add new audience persona option
                        const newPersona = {
                          value: reviewField.aiValue.toLowerCase().replace(/\s+/g, '-'),
                          label: reviewField.aiValue
                        }
                        AUDIENCE_PERSONA_OPTIONS.push(newPersona)
                        form.setValue('audiencePersona', newPersona.value)
                        markFieldAsAI('audiencePersona')
                      }

                      // Remove from review notifications
                      setReviewNotifications(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(reviewField.field)
                        return newSet
                      })

                      // Check if there are more reviews pending
                      const remainingReviews = pendingReviews.filter(r => r.field !== reviewField.field)
                      if (remainingReviews.length > 0) {
                        setReviewField(remainingReviews[0])
                        setPendingReviews(remainingReviews)
                      } else {
                        setShowReviewModal(false)
                        setReviewField(null)
                        setPendingReviews([])
                      }

                      toast.success(`Added "${reviewField.aiValue}" as new option`)
                    }}
                  >
                    <div className="text-left">
                      <div className="font-medium flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">AI</span>
                        {reviewField.aiValue}
                      </div>
                      <div className="text-sm text-gray-500">Add as new option to tag glossary</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start hover:bg-blue-50 border-blue-200"
                    onClick={() => {
                      // Use existing value from tag glossary
                      if (reviewField.field === 'designer') {
                        const existing = designers.find(d => d.label === reviewField.suggestedValue)
                        if (existing) {
                          form.setValue('designer', existing.value)
                          // Don't add AI tag for glossary selection
                        }
                      } else if (reviewField.field === 'audiencePersona') {
                        const existing = AUDIENCE_PERSONA_OPTIONS.find(p => p.label === reviewField.suggestedValue)
                        if (existing) {
                          form.setValue('audiencePersona', existing.value)
                        }
                      }

                      // Remove from review notifications
                      setReviewNotifications(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(reviewField.field)
                        return newSet
                      })

                      // Check if there are more reviews pending
                      const remainingReviews = pendingReviews.filter(r => r.field !== reviewField.field)
                      if (remainingReviews.length > 0) {
                        setReviewField(remainingReviews[0])
                        setPendingReviews(remainingReviews)
                      } else {
                        setShowReviewModal(false)
                        setReviewField(null)
                        setPendingReviews([])
                      }

                      toast.success(`Using existing option "${reviewField.suggestedValue}"`)
                    }}
                  >
                    <div className="text-left">
                      <div className="font-medium flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Tag</span>
                        {reviewField.suggestedValue}
                      </div>
                      <div className="text-sm text-gray-500">Use existing option from tag glossary</div>
                    </div>
                  </Button>
                </div>

                {pendingReviews.length > 1 && (
                  <div className="text-xs text-gray-500 text-center">
                    {pendingReviews.length - 1} more field{pendingReviews.length - 1 > 1 ? 's' : ''} to review
                  </div>
                )}
              </div>
            )}
          </FormDialog>

          {/* Overwrite Confirmation Modal */}
          <FormDialog
            isOpen={showOverwriteConfirm}
            onOpenChange={setShowOverwriteConfirm}
            title="Confirm Overwrite"
            description="Are you sure you want to overwrite existing fields?"
            maxWidth="sm"
            footer={
              <>
                <Button variant="outline" onClick={() => {
                  setShowOverwriteConfirm(false)
                  setPendingAIMode(null)
                }}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => {
                  if (pendingAIMode) {
                    executeAIAutopopulate(pendingAIMode)
                  }
                  setPendingAIMode(null)
                  setShowOverwriteConfirm(false)
                }}>
                  Confirm
                </Button>
              </>
            }
          >
            <div className="font-semibold text-red-600">This action cannot be undone.</div>
          </FormDialog>

          {/* Preview Modal */}
          <FormDialog
            isOpen={showPreviewModal}
            onOpenChange={setShowPreviewModal}
            title="Preview Creative Upload"
            description="Review all information before uploading"
            maxWidth="4xl"
            className="max-h-[80vh] overflow-y-auto"
            footer={
              <>
                <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
                  Back to Edit
                </Button>
                <Button
                  onClick={() => {
                    setShowPreviewModal(false)
                    form.handleSubmit(handleSubmit)()
                  }}
                  disabled={isSubmitting}
                  className="bg-[#89DA1A] hover:bg-[#7BC515] text-white"
                >
                  {isSubmitting ? 'Uploading...' : 'Confirm Upload'}
                </Button>
              </>
            }
          >

            <div className="space-y-6 mt-4">
              {/* Preview Image */}
              {imagePreviewUrl && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Image Preview</h3>
                  <img
                    src={imagePreviewUrl}
                    alt="Creative preview"
                    className="max-w-full h-auto max-h-64 object-contain mx-auto"
                  />
                </div>
              )}

              {/* Metadata */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold mb-2">Metadata & Campaign Info</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Filename:</span>
                    <span className="ml-2">{form.getValues('creativeFilename')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Designer:</span>
                    <span className="ml-2">{designers.find(d => d.value === form.getValues('designer'))?.label}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Start Date:</span>
                    <span className="ml-2">{form.getValues('startDate')}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">End Date:</span>
                    <span className="ml-2">{form.getValues('endDate')}</span>
                  </div>
                  {form.getValues('campaignName') && (
                    <div>
                      <span className="font-medium text-gray-600">Campaign:</span>
                      <span className="ml-2">{campaigns.find(c => c.value === form.getValues('campaignName'))?.label}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              {(form.getValues('spend') || form.getValues('revenue') || form.getValues('roas')) && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold mb-2">Performance Metrics</h3>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    {form.getValues('spend') && (
                      <div>
                        <span className="font-medium text-gray-600">Spend:</span>
                        <span className="ml-2">${form.getValues('spend')}</span>
                      </div>
                    )}
                    {form.getValues('revenue') && (
                      <div>
                        <span className="font-medium text-gray-600">Revenue:</span>
                        <span className="ml-2">${form.getValues('revenue')}</span>
                      </div>
                    )}
                    {form.getValues('roas') && (
                      <div>
                        <span className="font-medium text-gray-600">ROAS:</span>
                        <span className="ml-2">${form.getValues('roas')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Headline & Copy */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold mb-2">Headline & Copy</h3>
                <div className="space-y-2 text-sm">
                  {form.getValues('preheadline') && (
                    <div>
                      <span className="font-medium text-gray-600">Preheadline:</span>
                      <p className="mt-1">{form.getValues('preheadline')}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-600">Headline:</span>
                    <p className="mt-1 font-medium">{form.getValues('headline')}</p>
                  </div>
                  {form.getValues('bodyCopySummary') && (
                    <div>
                      <span className="font-medium text-gray-600">Body Copy Summary:</span>
                      <p className="mt-1">{form.getValues('bodyCopySummary')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags & Categories */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold mb-2">Tags & Categories</h3>
                <div className="space-y-2">
                  {form.getValues('imageryType').length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-sm font-medium text-gray-600 mr-2">Imagery:</span>
                      {form.getValues('imageryType').map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  {form.getValues('headlineTags').length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-sm font-medium text-gray-600 mr-2">Headline Tags:</span>
                      {form.getValues('headlineTags').map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}
                  {form.getValues('tone').length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-sm font-medium text-gray-600 mr-2">Tone:</span>
                      {form.getValues('tone').map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center gap-4 text-sm">
                {form.getValues('markedAsTopAd') && (
                  <Badge className="bg-green-100 text-green-800">Top Ad</Badge>
                )}
                {form.getValues('needsOptimization') && (
                  <Badge className="bg-yellow-100 text-yellow-800">Needs Optimization</Badge>
                )}
                {form.getValues('pinNote') && (
                  <Badge className="bg-blue-100 text-blue-800">Pinned</Badge>
                )}
              </div>
            </div>

          </FormDialog>

          {/* Load Draft Dialog */}
          <FormDialog
            isOpen={showDrafts}
            onOpenChange={setShowDrafts}
            title="Load Draft"
            description="Select a draft to load"
          >
            <ScrollArea className="max-h-96">
              <div className="space-y-2">
                {getAllDrafts().map((draft) => (
                  <Button
                    key={draft.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleLoadDraft(draft.id)}
                  >
                    <div className="text-left flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {draft.filename}
                        {draft.autoSaved && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Auto</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(draft.savedAt), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  </Button>
                ))}
                {getAllDrafts().length === 0 && (
                  <p className="text-center text-gray-500 py-4">No drafts found</p>
                )}
              </div>
            </ScrollArea>
          </FormDialog>



        </form>
      </FormProvider>
    </div>
    </ProtectedRoute>
  )
}