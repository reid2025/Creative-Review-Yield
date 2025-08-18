import { Timestamp } from 'firebase/firestore'

// Creative History Entry for tracking changes over time
export interface CreativeHistoryEntry {
  date: string                  // ISO date string
  cost: string                  // Amount spent at this point
  costPerWebsiteLead: string   
  costPerLinkClick: string      // CPC
  syncedAt: Timestamp           // When this data was synced
  dataSource: 'google-sheets' | 'manual'  // Source identifier
}

// Main Creative interface
export interface Creative {
  id: string
  creativeFilename: string
  imageUrl?: string
  litigationName?: string
  campaignType?: string
  designer?: string
  startDate?: string
  endDate?: string
  markedAsTopAd?: boolean
  status?: 'draft' | 'saved'
  createdAt?: Timestamp
  lastSaved?: Timestamp
  
  // New fields from Google Sheets sync
  accountName?: string          // Account Name from Google Sheets
  campaignName?: string         // Campaign Name from Google Sheets
  
  // History tracking for cost changes
  creativeHistory?: CreativeHistoryEntry[]
  lastSyncedAt?: Timestamp
  syncSource?: 'google-sheets' | 'manual'
  syncKey?: string  // Unique key for sync deduplication
  
  // Additional fields from form
  creativeLayoutType?: string
  imageryType?: string[]
  imageryBackground?: string[]
  messagingStructure?: string
  headlineText?: string
  ctaLabel?: string
  ctaColor?: string
  ctaPosition?: string
  copyAngle?: string[]
  copyTone?: string[]
  audiencePersona?: string
  
  // More detailed fields
  dateAdded?: string
  needsOptimization?: boolean
  questionBasedHeadline?: boolean
  clientBranding?: boolean
  iconsUsed?: boolean
  preheadlineText?: string
  headlineTags?: string[]
  headlineIntent?: string[]
  ctaVerb?: string
  ctaStyleGroup?: string
  bodyCopySummary?: string
  campaignTrigger?: string
  legalLanguage?: boolean
  emotionalStatement?: boolean
  dollarAmount?: boolean
  statMentioned?: boolean
  disclaimer?: boolean
  conditionsListed?: boolean
  designerRemarks?: string
  internalNotes?: string
  uploadGoogleDocLink?: string
  pinNoteForStrategySync?: boolean
  
  // User tracking
  userId?: string
}

// Google Sheet Row interface for sync
export interface GoogleSheetRow {
  accountName?: string
  campaignName?: string
  imageAssetName?: string
  imageAssetUrl?: string
  cost?: string
  costPerWebsiteLead?: string
  costPerClick?: string
  date?: string
  [key: string]: string | undefined  // Allow other fields
}