import { TagOption, CategoryConfig } from './TGTypes';

// Usage Badge Deciles (Color Intensity)
export const USAGE_DECILE_COLORS = [
  'bg-gray-100 text-gray-600',     // 0: Unused
  'bg-red-100 text-red-700',       // 1: Bottom 10%
  'bg-red-100 text-red-700',       // 2
  'bg-orange-100 text-orange-700', // 3
  'bg-yellow-100 text-yellow-700', // 4: Medium usage
  'bg-yellow-100 text-yellow-700', // 5
  'bg-blue-100 text-blue-700',     // 6: Good usage
  'bg-blue-100 text-blue-700',     // 7
  'bg-green-100 text-green-700',   // 8: High usage
  'bg-green-200 text-green-800',   // 9: Top 10%
];

// Feature Flag
export const FEATURE_TAG_GLOSSARY = process.env.NEXT_PUBLIC_FEATURE_TAG_GLOSSARY === 'true';

// Sort Options
export const SORT_OPTIONS = [
  { value: 'usage-desc', label: 'Usage (High to Low)' },
  { value: 'usage-asc', label: 'Usage (Low to High)' },
  { value: 'label-az', label: 'Label (A-Z)' },
  { value: 'label-za', label: 'Label (Z-A)' },
];

// View Options
export const VIEW_OPTIONS = [
  { value: 'grid', label: 'Grid', icon: 'grid-3x3' },
  { value: 'table', label: 'Table', icon: 'table' },
];

// Tag Categories (mirrors Edit Creative dropdowns)
export const TAG_CATEGORIES: Record<string, CategoryConfig> = {
  // CTA Tags
  ctaVerb: {
    displayName: 'CTA Verb',
    selectType: 'single',
    description: 'Action words used in call-to-action buttons',
    options: [
      { label: 'Get', value: 'get', category: 'ctaVerb' },
      { label: 'Start', value: 'start', category: 'ctaVerb' },
      { label: 'Join', value: 'join', category: 'ctaVerb' },
      { label: 'Learn', value: 'learn', category: 'ctaVerb' },
      { label: 'Try', value: 'try', category: 'ctaVerb' },
      { label: 'Download', value: 'download', category: 'ctaVerb' },
      { label: 'Sign Up', value: 'sign_up', category: 'ctaVerb' },
      { label: 'Contact', value: 'contact', category: 'ctaVerb' },
      { label: 'Buy', value: 'buy', category: 'ctaVerb' },
      { label: 'Shop', value: 'shop', category: 'ctaVerb' },
    ]
  },

  ctaColor: {
    displayName: 'CTA Color',
    selectType: 'single',
    description: 'Color schemes used for call-to-action elements',
    options: [
      { label: 'Primary', value: 'primary', category: 'ctaColor' },
      { label: 'Secondary', value: 'secondary', category: 'ctaColor' },
      { label: 'Blue', value: 'blue', category: 'ctaColor' },
      { label: 'Green', value: 'green', category: 'ctaColor' },
      { label: 'Red', value: 'red', category: 'ctaColor' },
      { label: 'Orange', value: 'orange', category: 'ctaColor' },
      { label: 'Purple', value: 'purple', category: 'ctaColor' },
      { label: 'Black', value: 'black', category: 'ctaColor' },
      { label: 'White', value: 'white', category: 'ctaColor' },
      { label: 'Gray', value: 'gray', category: 'ctaColor' },
    ]
  },

  ctaPosition: {
    displayName: 'CTA Position',
    selectType: 'single',
    description: 'Placement location of call-to-action elements',
    options: [
      { label: 'Top', value: 'top', category: 'ctaPosition' },
      { label: 'Bottom', value: 'bottom', category: 'ctaPosition' },
      { label: 'Center', value: 'center', category: 'ctaPosition' },
      { label: 'Left', value: 'left', category: 'ctaPosition' },
      { label: 'Right', value: 'right', category: 'ctaPosition' },
      { label: 'Header', value: 'header', category: 'ctaPosition' },
      { label: 'Footer', value: 'footer', category: 'ctaPosition' },
      { label: 'Sidebar', value: 'sidebar', category: 'ctaPosition' },
      { label: 'Overlay', value: 'overlay', category: 'ctaPosition' },
    ]
  },

  ctaStyleGroup: {
    displayName: 'CTA Style Group',
    selectType: 'single',
    description: 'Visual styling approaches for call-to-action elements',
    options: [
      { label: 'Button', value: 'button', category: 'ctaStyleGroup' },
      { label: 'Text Link', value: 'text_link', category: 'ctaStyleGroup' },
      { label: 'Banner', value: 'banner', category: 'ctaStyleGroup' },
      { label: 'Card', value: 'card', category: 'ctaStyleGroup' },
      { label: 'Popup', value: 'popup', category: 'ctaStyleGroup' },
      { label: 'Inline', value: 'inline', category: 'ctaStyleGroup' },
      { label: 'Floating', value: 'floating', category: 'ctaStyleGroup' },
      { label: 'Sticky', value: 'sticky', category: 'ctaStyleGroup' },
    ]
  },

  // Creative Layout & Structure
  creativeLayoutType: {
    displayName: 'Creative Layout Type',
    selectType: 'single',
    description: 'Overall layout structure and composition approach',
    options: [
      { label: 'Single Column', value: 'single_column', category: 'creativeLayoutType' },
      { label: 'Two Column', value: 'two_column', category: 'creativeLayoutType' },
      { label: 'Grid Layout', value: 'grid_layout', category: 'creativeLayoutType' },
      { label: 'Hero Banner', value: 'hero_banner', category: 'creativeLayoutType' },
      { label: 'Card Based', value: 'card_based', category: 'creativeLayoutType' },
      { label: 'List Format', value: 'list_format', category: 'creativeLayoutType' },
    ]
  },

  messagingStructure: {
    displayName: 'Messaging Structure',
    selectType: 'single',
    description: 'Narrative framework and content organization approach',
    options: [
      { label: 'Problem-Solution', value: 'problem_solution', category: 'messagingStructure' },
      { label: 'Benefit-Focused', value: 'benefit_focused', category: 'messagingStructure' },
      { label: 'Story-Driven', value: 'story_driven', category: 'messagingStructure' },
      { label: 'Question-Based', value: 'question_based', category: 'messagingStructure' },
      { label: 'Social Proof', value: 'social_proof', category: 'messagingStructure' },
      { label: 'Urgency-Driven', value: 'urgency_driven', category: 'messagingStructure' },
      { label: 'Feature List', value: 'feature_list', category: 'messagingStructure' },
      { label: 'Comparison', value: 'comparison', category: 'messagingStructure' },
    ]
  },

  // Visual Elements
  imageryType: {
    displayName: 'Imagery Type',
    selectType: 'multi',
    description: 'Types of visual content and media used',
    options: [
      { label: 'Photography', value: 'photography', category: 'imageryType' },
      { label: 'Illustration', value: 'illustration', category: 'imageryType' },
      { label: 'Graphics', value: 'graphics', category: 'imageryType' },
      { label: 'Mixed Media', value: 'mixed_media', category: 'imageryType' },
      { label: 'Icons', value: 'icons', category: 'imageryType' },
      { label: 'Screenshots', value: 'screenshots', category: 'imageryType' },
      { label: 'Charts/Graphs', value: 'charts_graphs', category: 'imageryType' },
      { label: 'Video Stills', value: 'video_stills', category: 'imageryType' },
    ]
  },

  imageryBackground: {
    displayName: 'Imagery Background',
    selectType: 'multi',
    description: 'Background treatments and environmental contexts',
    options: [
      { label: 'White/Clean', value: 'white_clean', category: 'imageryBackground' },
      { label: 'Gradient', value: 'gradient', category: 'imageryBackground' },
      { label: 'Pattern', value: 'pattern', category: 'imageryBackground' },
      { label: 'Natural', value: 'natural', category: 'imageryBackground' },
      { label: 'Office/Workspace', value: 'office_workspace', category: 'imageryBackground' },
      { label: 'Lifestyle', value: 'lifestyle', category: 'imageryBackground' },
      { label: 'Abstract', value: 'abstract', category: 'imageryBackground' },
    ]
  },

  // Copy and Messaging
  copyTone: {
    displayName: 'Copy Tone',
    selectType: 'multi',
    description: 'Emotional and stylistic approach of written content',
    options: [
      { label: 'Professional', value: 'professional', category: 'copyTone' },
      { label: 'Casual', value: 'casual', category: 'copyTone' },
      { label: 'Urgent', value: 'urgent', category: 'copyTone' },
      { label: 'Friendly', value: 'friendly', category: 'copyTone' },
      { label: 'Authoritative', value: 'authoritative', category: 'copyTone' },
      { label: 'Playful', value: 'playful', category: 'copyTone' },
      { label: 'Empathetic', value: 'empathetic', category: 'copyTone' },
      { label: 'Conversational', value: 'conversational', category: 'copyTone' },
      { label: 'Inspiring', value: 'inspiring', category: 'copyTone' },
    ]
  },

  copyAngle: {
    displayName: 'Copy Angle',
    selectType: 'multi',
    description: 'Strategic messaging approaches and value propositions',
    options: [
      { label: 'Cost Savings', value: 'cost_savings', category: 'copyAngle' },
      { label: 'Time Savings', value: 'time_savings', category: 'copyAngle' },
      { label: 'Ease of Use', value: 'ease_of_use', category: 'copyAngle' },
      { label: 'Expert Solution', value: 'expert_solution', category: 'copyAngle' },
      { label: 'Results Focused', value: 'results_focused', category: 'copyAngle' },
      { label: 'Risk Mitigation', value: 'risk_mitigation', category: 'copyAngle' },
      { label: 'Innovation', value: 'innovation', category: 'copyAngle' },
      { label: 'Trust/Security', value: 'trust_security', category: 'copyAngle' },
    ]
  },

  headlineTags: {
    displayName: 'Headline Tags',
    selectType: 'multi',
    description: 'Structural and content categories for headlines',
    options: [
      { label: 'Question', value: 'question', category: 'headlineTags' },
      { label: 'Stat/Number', value: 'stat_number', category: 'headlineTags' },
      { label: 'How-To', value: 'how_to', category: 'headlineTags' },
      { label: 'List/Steps', value: 'list_steps', category: 'headlineTags' },
      { label: 'Benefit Statement', value: 'benefit_statement', category: 'headlineTags' },
      { label: 'Pain Point', value: 'pain_point', category: 'headlineTags' },
      { label: 'Testimonial Quote', value: 'testimonial_quote', category: 'headlineTags' },
      { label: 'Call to Action', value: 'call_to_action', category: 'headlineTags' },
    ]
  },
};

// Default category expanded state (first 2 expanded)
export const DEFAULT_CATEGORY_STATE: Record<string, boolean> = {
  ctaVerb: true,
  ctaColor: true,
  ctaPosition: false,
  ctaStyleGroup: false,
  creativeLayoutType: false,
  messagingStructure: false,
  imageryType: false,
  imageryBackground: false,
  copyTone: false,
  copyAngle: false,
  headlineTags: false,
};