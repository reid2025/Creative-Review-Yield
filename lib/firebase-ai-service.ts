// Firebase AI Service - Image Analysis with Gemini
import { getVertexAI, getGenerativeModel } from '@firebase/vertexai'
import app from './firebase' // Changed to default import
import { tagService } from './firebase-tag-service'
import { getAuth } from 'firebase/auth'
import { env } from './env'

let vertexAI: ReturnType<typeof getVertexAI> | null = null
let model: ReturnType<typeof getGenerativeModel> | null = null

// Initialize Vertex AI if enabled
if (env.vertexAI.enabled) {
  try {
    console.log('🔄 Initializing Vertex AI...')
    console.log('   Project:', 'creative-review-yield')
    console.log('   Model:', 'gemini-1.5-pro')
    
    // Initialize Vertex AI following official Firebase documentation
    try {
      // Initialize Vertex AI with default settings
      vertexAI = getVertexAI(app)
      console.log('   ✅ Vertex AI initialized with default settings')
      
      // App Check is handled in firebase.ts
      console.log('   ℹ️ App Check configuration handled in firebase.ts')
    } catch (err) {
      console.error('   ❌ Failed to initialize Vertex AI:', (err as Error).message)
      throw err
    }

    // Initialize the generative model
    // Try different models based on availability (2025 models)
    const modelOptions = [
      'gemini-2.0-flash-exp',      // EXPERIMENTAL - Most advanced Flash model
      'gemini-2.0-pro',            // PRO version - Higher quality than Flash
      'gemini-2.0-flash',          // Latest stable 2.0 Flash
      'gemini-2.0-flash-001',      // Specific version
      'gemini-exp-1206',           // Experimental December model
      'gemini-1.5-pro-002',        // Latest 1.5 Pro if available
      'gemini-1.5-flash',          // Older Flash (may not work)
      'gemini-pro-vision'          // Fallback vision model
    ]
    
    let modelInitialized = false
    for (const modelName of modelOptions) {
      try {
        console.log(`   Trying model: ${modelName}...`)
        model = getGenerativeModel(vertexAI, {
          model: modelName,
          generationConfig: {
            maxOutputTokens: 8192,    // Increased for better responses
            temperature: 0.3,         // Lower for more accurate analysis
            topP: 0.95,
            topK: 40
          }
        })
        console.log(`   ✅ Successfully initialized with ${modelName}`)
        modelInitialized = true
        break
      } catch {
        console.log(`   ❌ ${modelName} not available`)
      }
    }
    
    if (!modelInitialized) {
      throw new Error('No Gemini models available')
    }
    console.log('✅ Vertex AI initialized successfully!')
    console.log('   Ready to analyze real images with Gemini Pro')
  } catch (error) {
    console.error('❌ Failed to initialize Vertex AI:', (error as Error).message || error)
    if ((error as Error).message?.includes('404')) {
      console.error('   🔧 Fix: Enable Vertex AI API in Google Cloud Console')
      console.error('   📖 See VERTEX_AI_SETUP_GUIDE.md for instructions')
    } else if ((error as Error).message?.includes('403') || (error as Error).message?.includes('permission')) {
      console.error('   💳 Fix: Enable billing (Blaze plan) in Firebase Console')
      console.error('   📖 See VERTEX_AI_SETUP_GUIDE.md for instructions')
    }
    console.error('   ❌ AI service will not be available')
    model = null
  }
} else {
  console.log('⚠️ Vertex AI not enabled (set vertexAI.enabled=true in env.ts)')
}

export interface CreativeAnalysisResult {
  // Metadata fields
  designer?: string
  litigationName?: string
  campaignType?: string
  
  // Creative details
  creativeLayoutType?: string
  imageryType?: string[]
  imageryBackground?: string[]
  messagingStructure?: string
  
  // Headline & CTA
  preheadlineText?: string
  headlineText?: string
  headlineTags?: string[]
  headlineIntent?: string[]
  ctaLabel?: string
  ctaVerb?: string
  ctaStyleGroup?: string
  ctaColor?: string
  ctaPosition?: string
  
  // Copy details
  copyAngle?: string[]
  copyTone?: string[]
  audiencePersona?: string
  campaignTrigger?: string
  
  // Boolean flags
  questionBasedHeadline?: boolean
  clientBranding?: boolean
  iconsUsed?: boolean
  markedAsTopAd?: boolean
  needsOptimization?: boolean
  
  // AI metadata
  confidence?: number
  suggestedReview?: string[]
}

class FirebaseAIService {
  private availableTags: Record<string, { value: string; label: string }[]> = {}
  private tagsLoaded = false
  private retryAttempts = 0
  private maxRetries = 3
  private retryDelay = 1000 // Start with 1 second delay

  /**
   * Load all available tags from the tag glossary
   */
  async loadAvailableTags() {
    if (this.tagsLoaded) return this.availableTags

    try {
      const allTags = await tagService.getAllTags()
      
      // Group tags by fieldName for easier access
      allTags.forEach(tag => {
        if (!this.availableTags[tag.fieldName]) {
          this.availableTags[tag.fieldName] = []
        }
        this.availableTags[tag.fieldName].push({
          value: tag.value,
          label: tag.label
        })
      })

      this.tagsLoaded = true
      console.log('✅ Loaded tag glossary for AI analysis:', Object.keys(this.availableTags))
      return this.availableTags
    } catch (error) {
      console.error('Failed to load tags for AI:', error)
      return this.availableTags
    }
  }

  /**
   * Convert image file to base64 for Gemini API
   */
  private async fileToGenerativePart(file: File): Promise<{inlineData: {data: string, mimeType: string}}> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        // Remove the data URL prefix to get just the base64 string
        const base64Data = base64.split(',')[1]
        resolve({
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        })
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
* Build the analysis prompt with available tags
*/
private async buildAnalysisPrompt(): Promise<string> {
   const tagsJson = JSON.stringify(this.availableTags, null, 2)
   
   return `You are an expert legal marketing creative analyst. Your task is to:

1. ANALYZE the uploaded creative thoroughly (read all text, scan all visual elements)
2. UNDERSTAND the context, messaging, and purpose
3. For each field, CHECK the available dropdown options 
4. CHOOSE from existing options if there's a good match (exact or close)
5. SUGGEST new options if none of the existing ones fit well

CURRENT AVAILABLE OPTIONS FOR EACH FIELD:
${tagsJson}

ANALYSIS INSTRUCTIONS:

STEP 1: READ AND UNDERSTAND THE CREATIVE
- Extract ALL visible text (headlines, body copy, CTA buttons, disclaimers)
- Analyze imagery (people, objects, settings, style)
- Understand the legal/medical context
- Identify target audience and messaging strategy

STEP 2: FIELD-BY-FIELD ANALYSIS
For each field, follow this process:
1. Analyze what the creative shows for this field
2. Look at the available options for this field
3. Decide: use existing option OR suggest new option

FIELD ANALYSIS LOGIC:

DESIGNER: Look for style patterns, if detectable from available designers

LITIGATION NAME: 
- Look for specific product names (Ozempic, Paraquat, AFFF, etc.)
- Look for medical conditions mentioned
- Look for legal case types
- Check against available options, if no exact match, suggest new one

CAMPAIGN TYPE:
- Understand the broad category (Medical, SA, Personal Injury, etc.)
- Match to available options or suggest new category

CREATIVE LAYOUT TYPE:
- Analyze the visual structure
- Is it a quiz, checklist, before/after, news style, etc.?
- Match to available options or describe new layout type

IMAGERY TYPE & BACKGROUND:
- What type of imagery is used?
- What's the background style?
- Select multiple from available options if applicable

CTA ANALYSIS:
- Extract EXACT CTA button text for ctaLabel
- Analyze CTA verb, style, color, position
- Match to available options or suggest new ones

COPY ANALYSIS:
- What's the emotional tone? (empathetic, urgent, direct, etc.)
- What's the persuasion angle? (fear-based, benefit-focused, etc.)
- Match to available options or suggest new descriptors

AUDIENCE ANALYSIS:
- Who is this targeting based on imagery and messaging?
- Match to available personas or suggest new ones

OUTPUT FORMAT:
{
   "designer": {
       "selectedOption": "exact value from available options OR null",
       "suggestedNewOption": "new option if no good match OR null",
       "reasoning": "why this choice was made"
   },
   "litigationName": {
       "selectedOption": "exact value from available options OR null", 
       "suggestedNewOption": "new option if no good match OR null",
       "reasoning": "why this choice was made"
   },
   "campaignType": {
       "selectedOption": "exact value from available options OR null",
       "suggestedNewOption": "new option if no good match OR null", 
       "reasoning": "why this choice was made"
   },
   "creativeLayoutType": {
       "selectedOption": "exact value from available options OR null",
       "suggestedNewOption": "new option if no good match OR null",
       "reasoning": "why this choice was made"
   },
   "imageryType": {
       "selectedOptions": ["array of exact values from available options"],
       "suggestedNewOptions": ["array of new options if needed"],
       "reasoning": "why these choices were made"
   },
   "imageryBackground": {
       "selectedOptions": ["array of exact values from available options"],
       "suggestedNewOptions": ["array of new options if needed"], 
       "reasoning": "why these choices were made"
   },
   "messagingStructure": {
       "selectedOption": "exact value from available options OR null",
       "suggestedNewOption": "new option if no good match OR null",
       "reasoning": "why this choice was made"
   },
   "headlineTags": {
       "selectedOptions": ["array of exact values from available options"],
       "suggestedNewOptions": ["array of new options if needed"],
       "reasoning": "why these choices were made"
   },
   "headlineIntent": {
       "selectedOptions": ["array of exact values from available options"],
       "suggestedNewOptions": ["array of new options if needed"],
       "reasoning": "why these choices were made"
   },
   "ctaVerb": {
       "selectedOption": "exact value from available options OR null",
       "suggestedNewOption": "new option if no good match OR null",
       "reasoning": "why this choice was made"
   },
   "ctaStyleGroup": {
       "selectedOption": "exact value from available options OR null",
       "suggestedNewOption": "new option if no good match OR null",
       "reasoning": "why this choice was made"
   },
   "ctaColor": {
       "selectedOption": "exact value from available options OR null",
       "suggestedNewOption": "new option if no good match OR null",
       "reasoning": "why this choice was made"
   },
   "ctaPosition": {
       "selectedOption": "exact value from available options OR null",
       "suggestedNewOption": "new option if no good match OR null",
       "reasoning": "why this choice was made"
   },
   "copyAngle": {
       "selectedOptions": ["array of exact values from available options"],
       "suggestedNewOptions": ["array of new options if needed"],
       "reasoning": "why these choices were made"
   },
   "copyTone": {
       "selectedOptions": ["array of exact values from available options"],
       "suggestedNewOptions": ["array of new options if needed"],
       "reasoning": "why these choices were made"
   },
   "audiencePersona": {
       "selectedOption": "exact value from available options OR null",
       "suggestedNewOption": "new option if no good match OR null",
       "reasoning": "why this choice was made"
   },
   "campaignTrigger": {
       "selectedOption": "exact value from available options OR null",
       "suggestedNewOption": "new option if no good match OR null",
       "reasoning": "why this choice was made"
   },
   "extractedText": {
       "preheadlineText": "exact text from image OR null",
       "headlineText": "exact text from image OR null",
       "ctaLabel": "exact CTA button text OR null",
       "bodyCopySummary": "summary of main copy OR null"
   },
   "booleanFields": {
       "questionBasedHeadline": true/false,
       "clientBranding": true/false, 
       "iconsUsed": true/false,
       "conditionsListed": true/false,
       "legalLanguagePresent": true/false,
       "statMentioned": true/false,
       "emotionalStatementPresent": true/false,
       "disclaimerAdded": true/false,
       "dollarAmountMentioned": true/false
   },
   "overallAnalysis": {
       "confidence": 0.0-1.0,
       "mainContext": "brief description of what this creative is about",
       "targetAudience": "who this is targeting",
       "keyMessages": ["main messages in the creative"]
   }
}

IMPORTANT RULES:
- Use "selectedOption" ONLY if there's a good match in available options
- Use "suggestedNewOption" when existing options don't fit well
- Always provide reasoning for your choices
- Extract exact text for headlines and CTAs (word-for-word)
- Be specific and accurate in your analysis
- For multi-select fields, use "selectedOptions" and "suggestedNewOptions" arrays

Return ONLY the JSON object, no additional text or explanation.`
}


  /**
   * Retry helper with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries = this.maxRetries,
    delay = this.retryDelay
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (retries <= 0) {
        throw error
      }
      
      // Check if error is retryable
      const isRetryable = 
        (error as Error).message?.includes('503') || // Service unavailable
        (error as Error).message?.includes('500') || // Internal server error
        (error as Error).message?.includes('429') || // Rate limited
        (error as Error).message?.includes('timeout') || // Timeout
        (error as Error).message?.includes('ECONNRESET') // Connection reset
      
      if (!isRetryable) {
        throw error
      }
      
      console.log(`⏳ Retrying in ${delay}ms... (${this.maxRetries - retries + 1}/${this.maxRetries})`)
      await new Promise(resolve => setTimeout(resolve, delay))
      return this.retryWithBackoff(fn, retries - 1, delay * 2) // Exponential backoff
    }
  }

  /**
   * Analyze a creative image and extract form data
   */
  async analyzeCreativeImage(imageFile: File): Promise<CreativeAnalysisResult> {
    console.log('═══════════════════════════════════════════════')
    console.log('🚀 IMAGE ANALYSIS STARTING')
    console.log('═══════════════════════════════════════════════')
    console.log('📊 Current Settings:')
    console.log('   VERTEX_AI_ENABLED:', env.vertexAI.enabled)
    console.log('   Model Status:', model ? '✅ LOADED' : '❌ NOT LOADED')
    console.log('   Model Type:', model?._modelParams?.model || 'N/A')
    console.log('📁 Image Details:')
    console.log('   Name:', imageFile.name)
    console.log('   Size:', (imageFile.size / 1024).toFixed(2), 'KB')
    console.log('   Type:', imageFile.type)
    console.log('═══════════════════════════════════════════════')
    
    try {
      // Load available tags if not already loaded
      await this.loadAvailableTags()

      // Check if AI is available
      if (!model) {
        console.error('⚠️ ═══════════════════════════════════════════')
        console.error('❌ AI SERVICE NOT AVAILABLE')
        console.error('   Reason: Model not initialized')
        console.error('   User must fill form manually')
        console.error('═══════════════════════════════════════════════')
        
        // Provide helpful error with specific reason
        const errorMessage = !env.vertexAI.enabled 
          ? 'AI service is disabled. Enable it by setting vertexAI.enabled=true in env.ts'
          : 'AI model failed to initialize. Check console for setup instructions.'
        throw new Error(errorMessage)
      }
      
      console.log('✅ ═══════════════════════════════════════════')
      console.log('🤖 REAL AI MODE ACTIVATED!')
      console.log('   Using Vertex AI / Gemini')
      console.log('   This is ACTUAL image analysis')
      console.log('═══════════════════════════════════════════════')

      // Convert image to format required by Gemini
      console.log('🔄 Converting image to Gemini format...')
      const imagePart = await this.fileToGenerativePart(imageFile)

      // Build the prompt with available tags
      const prompt = await this.buildAnalysisPrompt()

      // Send to Gemini for analysis
      console.log('═══════════════════════════════════════════════')
      console.log('📡 CALLING VERTEX AI / GEMINI API')
      console.log('   Model:', model._modelParams?.model || 'unknown')
      console.log('   Project:', 'creative-review-yield')
      console.log('   Timestamp:', new Date().toISOString())
      console.log('═══════════════════════════════════════════════')
      
      let text
      try {
        console.log('⏳ Sending request to Gemini...')
        console.log('   Attempting to bypass App Check...')
        const startTime = Date.now()
        
        // Try to get auth token for authenticated requests
        const auth = getAuth(app)
        if (auth.currentUser) {
          console.log('   Using authenticated user:', auth.currentUser.email)
        }
        
        // Use retry mechanism for API calls
        const generateContent = async () => {
          const result = await model.generateContent([
            {
              text: prompt
            },
            imagePart
          ])
          const response = await result.response
          return response.text()
        }
        
        text = await this.retryWithBackoff(generateContent)
        
        const endTime = Date.now()
        console.log('✅ ═══════════════════════════════════════════')
        console.log('🎉 GEMINI RESPONDED SUCCESSFULLY!')
        console.log('   Response time:', (endTime - startTime) / 1000, 'seconds')
        console.log('   Response length:', text.length, 'characters')
        console.log('   This is REAL AI analysis from Google Gemini')
        console.log('═══════════════════════════════════════════════')
        
      } catch (apiError) {
        console.error('❌ ═══════════════════════════════════════════')
        console.error('❌ GEMINI API ERROR!')
        console.error('   Error:', (apiError as Error).message)
        console.error('═══════════════════════════════════════════════')
        
        // Enhanced error handling with specific messages
        if (apiError.message?.includes('404')) {
          console.error('   Model not available in your region')
          console.error('   Trying with simpler prompt...')
          
          // Try with a simpler prompt
          const simplePrompt = `Analyze this legal marketing creative image. Extract visible text including headlines, body copy, and call-to-action buttons. Identify the type of legal case (litigation) and visual elements.`
          const fallbackGenerate = async () => {
            const result = await model.generateContent([
              { text: simplePrompt },
              imagePart
            ])
            const response = await result.response
            return response.text()
          }
          text = await this.retryWithBackoff(fallbackGenerate, 2, 500) // Fewer retries for fallback
        } else if (apiError.message?.includes('403') || apiError.message?.includes('permission')) {
          throw new Error('Permission denied. Please check your Firebase billing plan (Blaze plan required).')
        } else if (apiError.message?.includes('401')) {
          throw new Error('Authentication failed. Please check your Firebase configuration.')
        } else if (apiError.message?.includes('429')) {
          throw new Error('Rate limit exceeded. Please try again in a few moments.')
        } else if (apiError.message?.includes('timeout')) {
          throw new Error('Request timed out. Please try again with a smaller image.')
        } else {
          throw apiError
        }
      }
      
      // Parse the JSON response
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
          throw new Error('No JSON found in response')
        }
        
        const rawAnalysis = JSON.parse(jsonMatch[0])
        
        // Log 1: Image Description - What AI sees in the image
        console.log('👁️ ========== AI IMAGE DESCRIPTION ==========')
        console.log('📷 What AI sees in the image:')
        if (rawAnalysis.overallAnalysis) {
          console.log('   Context:', rawAnalysis.overallAnalysis.mainContext)
          console.log('   Target Audience:', rawAnalysis.overallAnalysis.targetAudience)
          console.log('   Key Messages:', rawAnalysis.overallAnalysis.keyMessages)
        }
        if (rawAnalysis.extractedText) {
          console.log('📝 Text found in image:')
          console.log('   Pre-headline:', rawAnalysis.extractedText.preheadlineText || 'None')
          console.log('   Headline:', rawAnalysis.extractedText.headlineText || 'None')
          console.log('   CTA:', rawAnalysis.extractedText.ctaLabel || 'None')
          console.log('   Body Copy:', rawAnalysis.extractedText.bodyCopySummary || 'None')
        }
        console.log('🎨 Visual Elements:')
        console.log('   Imagery Type:', rawAnalysis.imageryType?.reasoning || 'Not detected')
        console.log('   Background:', rawAnalysis.imageryBackground?.reasoning || 'Not detected')
        console.log('   Layout:', rawAnalysis.creativeLayoutType?.reasoning || 'Not detected')
        console.log('=========================================\n')
        
        // Convert to our format
        const analysisResult: CreativeAnalysisResult = {
          designer: rawAnalysis.designer?.selectedOption || rawAnalysis.designer?.suggestedNewOption || null,
          litigationName: rawAnalysis.litigationName?.selectedOption || rawAnalysis.litigationName?.suggestedNewOption || null,
          campaignType: rawAnalysis.campaignType?.selectedOption || rawAnalysis.campaignType?.suggestedNewOption || null,
          creativeLayoutType: rawAnalysis.creativeLayoutType?.selectedOption || rawAnalysis.creativeLayoutType?.suggestedNewOption || null,
          messagingStructure: rawAnalysis.messagingStructure?.selectedOption || rawAnalysis.messagingStructure?.suggestedNewOption || null,
          imageryType: rawAnalysis.imageryType?.selectedOptions || rawAnalysis.imageryType?.suggestedNewOptions || [],
          imageryBackground: rawAnalysis.imageryBackground?.selectedOptions || rawAnalysis.imageryBackground?.suggestedNewOptions || [],
          preheadlineText: rawAnalysis.extractedText?.preheadlineText || null,
          headlineText: rawAnalysis.extractedText?.headlineText || null,
          headlineTags: rawAnalysis.headlineTags?.selectedOptions || rawAnalysis.headlineTags?.suggestedNewOptions || [],
          headlineIntent: rawAnalysis.headlineIntent?.selectedOptions || rawAnalysis.headlineIntent?.suggestedNewOptions || [],
          ctaLabel: rawAnalysis.extractedText?.ctaLabel || null,
          ctaVerb: rawAnalysis.ctaVerb?.selectedOption || rawAnalysis.ctaVerb?.suggestedNewOption || null,
          ctaStyleGroup: rawAnalysis.ctaStyleGroup?.selectedOption || rawAnalysis.ctaStyleGroup?.suggestedNewOption || null,
          ctaColor: rawAnalysis.ctaColor?.selectedOption || rawAnalysis.ctaColor?.suggestedNewOption || null,
          ctaPosition: rawAnalysis.ctaPosition?.selectedOption || rawAnalysis.ctaPosition?.suggestedNewOption || null,
          copyAngle: rawAnalysis.copyAngle?.selectedOptions || rawAnalysis.copyAngle?.suggestedNewOptions || [],
          copyTone: rawAnalysis.copyTone?.selectedOptions || rawAnalysis.copyTone?.suggestedNewOptions || [],
          audiencePersona: rawAnalysis.audiencePersona?.selectedOption || rawAnalysis.audiencePersona?.suggestedNewOption || null,
          campaignTrigger: rawAnalysis.campaignTrigger?.selectedOption || rawAnalysis.campaignTrigger?.suggestedNewOption || null,
          questionBasedHeadline: rawAnalysis.booleanFields?.questionBasedHeadline || false,
          clientBranding: rawAnalysis.booleanFields?.clientBranding || false,
          iconsUsed: rawAnalysis.booleanFields?.iconsUsed || false,
          markedAsTopAd: false,
          needsOptimization: false,
          confidence: rawAnalysis.overallAnalysis?.confidence || 0.8,
          suggestedReview: []
        }
        
        // Log 2: Form Values - What will be populated
        console.log('📋 ========== AI FORM VALUES ==========')
        console.log('✅ REAL AI Analysis result for form:')
        console.log(JSON.stringify(analysisResult, null, 2))
        console.log('======================================\n')
        
        console.log('🏆 ═══════════════════════════════════════════')
        console.log('🏆 REAL AI ANALYSIS COMPLETE!')
        console.log('🏆 Successfully analyzed with Google Gemini')
        console.log('🏆 This was NOT mock data')
        console.log('═══════════════════════════════════════════════')
        
        return analysisResult
      } catch {
        console.error('Failed to parse AI response:', text?.substring(0, 500))
        
        // Try to extract partial data even if JSON is malformed
        try {
          const partialResult = this.extractPartialData(text)
          if (partialResult && Object.keys(partialResult).length > 0) {
            console.log('📊 Recovered partial data from malformed response')
            return partialResult
          }
        } catch {
          console.error('Could not recover partial data')
        }
        
        throw new Error('Invalid response format from AI. The image analysis could not be parsed.')
      }
    } catch (error) {
      console.error('❌ AI Analysis failed:', error)
      
      // Don't fallback to mock - throw error to let user know
      console.error('═══════════════════════════════════════════════')
      console.error('❌ AI SERVICE IS NOT WORKING')
      console.error('   Please fill the form manually')
      console.error('═══════════════════════════════════════════════')
      
      throw error
    }
  }

  /**
   * Validate AI suggestions against available tags
   */
  validateSuggestions(suggestions: CreativeAnalysisResult): CreativeAnalysisResult {
    const validated = { ...suggestions }
    const needsReview: string[] = []

    // Validate single-value fields
    const singleValueFields = [
      'designer', 'litigationName', 'campaignType', 'creativeLayoutType',
      'messagingStructure', 'ctaVerb', 'ctaStyleGroup', 'ctaColor',
      'ctaPosition', 'audiencePersona', 'campaignTrigger'
    ]

    singleValueFields.forEach(field => {
      const value = validated[field as keyof CreativeAnalysisResult]
      if (value && typeof value === 'string') {
        const availableValues = this.availableTags[field] || []
        const isValid = availableValues.some(tag => tag.value === value)
        if (!isValid && availableValues.length > 0) {
          // Find closest match
          const closestMatch = this.findClosestMatch(value, availableValues)
          if (closestMatch) {
            needsReview.push(`${field}: AI suggested "${value}", using closest match "${closestMatch.label}"`)
            ;(validated as Record<string, string | string[]>)[field] = closestMatch.value
          } else {
            needsReview.push(`${field}: "${value}" not in tag glossary`)
          }
        }
      }
    })

    // Validate array fields
    const arrayFields = [
      'imageryType', 'imageryBackground', 'headlineTags', 
      'headlineIntent', 'copyAngle', 'copyTone'
    ]

    arrayFields.forEach(field => {
      const values = validated[field as keyof CreativeAnalysisResult]
      if (Array.isArray(values)) {
        const availableValues = this.availableTags[field] || []
        const validatedValues: string[] = []
        
        values.forEach(value => {
          const isValid = availableValues.some(tag => tag.value === value)
          if (isValid) {
            validatedValues.push(value)
          } else if (availableValues.length > 0) {
            const closestMatch = this.findClosestMatch(value, availableValues)
            if (closestMatch) {
              validatedValues.push(closestMatch.value)
              needsReview.push(`${field}: Replaced "${value}" with "${closestMatch.label}"`)
            }
          }
        })
        
        ;(validated as Record<string, string | string[]>)[field] = validatedValues
      }
    })

    // Add review suggestions
    if (needsReview.length > 0) {
      validated.suggestedReview = [
        ...(validated.suggestedReview || []),
        ...needsReview
      ]
    }

    return validated
  }

  /**
   * Find closest matching tag using simple string similarity
   */
  private findClosestMatch(
    value: string, 
    availableTags: { value: string; label: string }[]
  ): { value: string; label: string } | null {
    if (!value || availableTags.length === 0) return null

    const valueLower = value.toLowerCase()
    
    // First try exact match (case-insensitive)
    const exactMatch = availableTags.find(
      tag => tag.value.toLowerCase() === valueLower || 
             tag.label.toLowerCase() === valueLower
    )
    if (exactMatch) return exactMatch

    // Then try partial match
    const partialMatch = availableTags.find(
      tag => tag.value.toLowerCase().includes(valueLower) || 
             tag.label.toLowerCase().includes(valueLower) ||
             valueLower.includes(tag.value.toLowerCase()) ||
             valueLower.includes(tag.label.toLowerCase())
    )
    if (partialMatch) return partialMatch

    // No good match found
    return null
  }

  /**
   * Extract partial data from malformed AI response
   */
  private extractPartialData(text: string): CreativeAnalysisResult | null {
    if (!text) return null
    
    const result: Partial<CreativeAnalysisResult> = {}
    
    // Try to extract text fields using regex patterns
    const patterns = {
      headlineText: /"headlineText"\s*:\s*"([^"]+)"/,
      preheadlineText: /"preheadlineText"\s*:\s*"([^"]+)"/,
      ctaLabel: /"ctaLabel"\s*:\s*"([^"]+)"/,
      litigationName: /"litigationName"[^}]*"selectedOption"\s*:\s*"([^"]+)"/,
      campaignType: /"campaignType"[^}]*"selectedOption"\s*:\s*"([^"]+)"/,
    }
    
    for (const [field, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern)
      if (match && match[1]) {
        (result as Record<string, string>)[field] = match[1]
      }
    }
    
    // Set defaults for missing fields
    result.confidence = 0.3 // Low confidence for partial data
    result.suggestedReview = ['Partial data recovery - please review all fields']
    
    return result as CreativeAnalysisResult
  }

  /**
   * Clear cached tags (useful when tags are updated)
   */
  clearTagCache() {
    this.availableTags = {}
    this.tagsLoaded = false
  }

  /**
   * Check if AI service is available and healthy
   */
  async checkHealth(): Promise<{ 
    available: boolean
    model: string | null
    error?: string 
  }> {
    try {
      // Check if Vertex AI is enabled
      if (!env.vertexAI.enabled) {
        return {
          available: false,
          model: null,
          error: 'AI service is disabled in configuration'
        }
      }

      // Check if model is initialized
      if (!model) {
        return {
          available: false,
          model: null,
          error: 'AI model failed to initialize'
        }
      }

      // Get model info
      const modelName = (model as {_modelParams?: {model?: string}})?._modelParams?.model || 'unknown'

      return {
        available: true,
        model: modelName
      }
    } catch (error) {
      return {
        available: false,
        model: null,
        error: (error as Error).message || 'Unknown error'
      }
    }
  }

  /**
   * Get current retry status
   */
  getRetryStatus(): { attempts: number; maxRetries: number } {
    return {
      attempts: this.retryAttempts,
      maxRetries: this.maxRetries
    }
  }
}

// Export singleton instance
export const firebaseAIService = new FirebaseAIService()

// Export types
export type { CreativeAnalysisResult }