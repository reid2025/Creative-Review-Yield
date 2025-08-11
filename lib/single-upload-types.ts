// Single Upload Field Types and Options
// Based on documentation requirements

export const LITIGATION_NAME_OPTIONS = [
  // SA (Sexual Abuse) Campaign Type
  { value: 'la-county-sa', label: 'LA County SA' },
  { value: 'il-juvie-sa', label: 'IL Juvie SA' },
  { value: 'tx-youth-sa', label: 'TX Youth SA' },
  { value: 'fl-adult-sa', label: 'FL Adult SA' },
  // Personal Injury Campaign Type
  { value: 'car-accident-miami', label: 'Car Accident - Miami' },
  { value: 'slip-fall-nyc', label: 'Slip & Fall - NYC' },
  { value: 'medical-malpractice-chicago', label: 'Medical Malpractice - Chicago' },
  // Mass Tort Campaign Type
  { value: 'ozempic-campaign', label: 'Ozempic Campaign' },
  { value: 'roundup-litigation', label: 'Roundup Litigation' },
  { value: 'talcum-powder-cases', label: 'Talcum Powder Cases' }
]

export const CAMPAIGN_TYPE_OPTIONS = [
  { value: 'sa', label: 'SA (Sexual Abuse)' },
  { value: 'personal-injury', label: 'Personal Injury' },
  { value: 'mass-tort', label: 'Mass Tort' },
  { value: 'lead-generation', label: 'Lead Generation' },
  { value: 'settlement', label: 'Settlement Campaign' },
  { value: 'awareness', label: 'Awareness Campaign' }
]

export const CREATIVE_LAYOUT_TYPE_OPTIONS = [
  { value: 'quiz', label: 'Quiz' },
  { value: 'banner', label: 'Banner' },
  { value: 'card', label: 'Card' },
  { value: 'video', label: 'Video' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'single-image', label: 'Single Image' },
  { value: 'collection', label: 'Collection' }
]

export const IMAGERY_TYPE_OPTIONS = [
  { value: 'photos', label: 'Photos' },
  { value: 'illustrations', label: 'Illustrations' },
  { value: 'graphics', label: 'Graphics' },
  { value: 'mixed-media', label: 'Mixed Media' },
  { value: 'people', label: 'People' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'product', label: 'Product' }
]

export const IMAGERY_BACKGROUND_OPTIONS = [
  { value: 'solid-colors', label: 'Solid Colors' },
  { value: 'gradients', label: 'Gradients' },
  { value: 'patterns', label: 'Patterns' },
  { value: 'transparent', label: 'Transparent' },
  { value: 'white', label: 'White' },
  { value: 'colored', label: 'Colored' }
]

export const MESSAGING_STRUCTURE_OPTIONS = [
  { value: 'problem-solution', label: 'Problem-Solution' },
  { value: 'before-after', label: 'Before-After' },
  { value: 'benefit-focused', label: 'Benefit-Focused' },
  { value: 'testimonial', label: 'Testimonial' },
  { value: 'question-based', label: 'Question-Based' },
  { value: 'educational', label: 'Educational' }
]

export const HEADLINE_TAGS_OPTIONS = [
  { value: 'urgency', label: 'Urgency' },
  { value: 'benefit', label: 'Benefit' },
  { value: 'question', label: 'Question' },
  { value: 'emotional', label: 'Emotional' },
  { value: 'feature', label: 'Feature' },
  { value: 'social-proof', label: 'Social Proof' }
]

export const HEADLINE_INTENT_OPTIONS = [
  { value: 'educate', label: 'Educate' },
  { value: 'convert', label: 'Convert' },
  { value: 'engage', label: 'Engage' },
  { value: 'inform', label: 'Inform' },
  { value: 'persuade', label: 'Persuade' },
  { value: 'inspire', label: 'Inspire' }
]

export const CTA_VERB_OPTIONS = [
  { value: 'click', label: 'Click' },
  { value: 'call', label: 'Call' },
  { value: 'download', label: 'Download' },
  { value: 'get', label: 'Get' },
  { value: 'start', label: 'Start' },
  { value: 'learn', label: 'Learn' },
  { value: 'discover', label: 'Discover' },
  { value: 'try', label: 'Try' },
  { value: 'shop', label: 'Shop' },
  { value: 'see', label: 'See' },
  { value: 'join', label: 'Join' },
  { value: 'sign-up', label: 'Sign Up' }
]

export const CTA_STYLE_GROUP_OPTIONS = [
  { value: 'button', label: 'Button' },
  { value: 'link', label: 'Link' },
  { value: 'banner', label: 'Banner' },
  { value: 'text-link', label: 'Text Link' },
  { value: 'floating', label: 'Floating' }
]

export const CTA_COLOR_OPTIONS = [
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'orange', label: 'Orange' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'purple', label: 'Purple' },
  { value: 'black', label: 'Black' },
  { value: 'white', label: 'White' },
  { value: 'urgency-red', label: 'Urgency Red' },
  { value: 'navy', label: 'Navy' }
]

export const CTA_POSITION_OPTIONS = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'center', label: 'Center' },
  { value: 'floating', label: 'Floating' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' }
]

export const COPY_ANGLE_OPTIONS = [
  { value: 'emotional', label: 'Emotional' },
  { value: 'logical', label: 'Logical' },
  { value: 'social-proof', label: 'Social Proof' },
  { value: 'urgency', label: 'Urgency' },
  { value: 'benefit-focused', label: 'Benefit-Focused' },
  { value: 'problem-solving', label: 'Problem-Solving' },
  { value: 'educational', label: 'Educational' }
]

export const COPY_TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'authoritative', label: 'Authoritative' },
  { value: 'empathetic', label: 'Empathetic' },
  { value: 'conversational', label: 'Conversational' }
]

export const AUDIENCE_PERSONA_OPTIONS = [
  { value: 'age-18-24', label: 'Age 18-24' },
  { value: 'age-25-34', label: 'Age 25-34' },
  { value: 'age-35-44', label: 'Age 35-44' },
  { value: 'age-45-54', label: 'Age 45-54' },
  { value: 'age-55-plus', label: 'Age 55+' },
  { value: 'families', label: 'Families' },
  { value: 'professionals', label: 'Professionals' },
  { value: 'seniors', label: 'Seniors' },
  { value: 'budget-conscious', label: 'Budget Conscious' },
  { value: 'premium-seeker', label: 'Premium Seeker' }
]

export const CAMPAIGN_TRIGGER_OPTIONS = [
  { value: 'holiday', label: 'Holiday' },
  { value: 'event', label: 'Event' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'promotional', label: 'Promotional' },
  { value: 'product-launch', label: 'Product Launch' },
  { value: 'brand-awareness', label: 'Brand Awareness' },
  { value: 'retention', label: 'Retention' },
  { value: 'crisis-response', label: 'Crisis Response' }
]

export const DESIGNER_OPTIONS = [
  { value: 'sarah', label: 'Sarah' },
  { value: 'mike', label: 'Mike' },
  { value: 'lisa', label: 'Lisa' },
  { value: 'john', label: 'John' },
  { value: 'jane', label: 'Jane' },
  { value: 'alex', label: 'Alex' }
]

// Form field categories for organization
export const FORM_SECTIONS = {
  metadata: {
    title: 'Metadata & Campaign Info',
    fields: [
      'image',
      'dateAdded',
      'designer',
      'startDate',
      'endDate',
      'creativeFilename',
      'litigationName',
      'campaignType',
      'markedAsTopAd',
      'optimization'
    ]
  },
  performance: {
    title: 'Performance Metrics',
    fields: [
      'amountSpent',
      'costPerWebsiteLead',
      'costPerClick'
    ]
  },
  messageTargeting: {
    title: 'Message & Targeting Insights',
    fields: [
      'creativeLayoutType',
      'imageryType',
      'imageryBackground',
      'messagingStructure',
      'questionBasedHeadline',
      'clientBranding',
      'iconsUsed'
    ]
  },
  headlineCTA: {
    title: 'Headline & CTA Details',
    fields: [
      'preheadlineText',
      'headlineText',
      'headlineTags',
      'headlineIntent',
      'ctaLabel',
      'ctaVerb',
      'ctaStyleGroup',
      'ctaColor',
      'ctaPosition'
    ]
  },
  copyConversion: {
    title: 'Copy & Conversion Drivers',
    fields: [
      'bodyCopySummary',
      'copyAngle',
      'copyTone',
      'audiencePersona',
      'conditionsListed',
      'campaignTrigger',
      'legalLanguagePresent',
      'statMentioned',
      'emotionalStatementPresent',
      'disclaimerAdded',
      'dollarAmountMentioned'
    ]
  },
  additional: {
    title: 'Additional',
    fields: [
      'designerRemarks',
      'internalNotes',
      'uploadGoogleDocLink',
      'pinNoteForStrategySync'
    ]
  }
}

// Required fields for form validation
export const REQUIRED_FIELDS = [
  'designer',
  'startDate',
  'endDate',
  'creativeFilename',
  'litigationName',
  'campaignType',
  'amountSpent',
  'costPerWebsiteLead',
  'costPerClick'
]