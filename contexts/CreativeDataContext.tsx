'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { useFirebaseDrafts } from '@/hooks/useFirebaseDrafts'
import { useGoogleSheetsData } from '@/hooks/useGoogleSheetsData'
import { useGoogleAuth } from '@/contexts/GoogleAuthContext'

// Enhanced creative interface that combines Firebase and Google Sheets data
export interface EnhancedCreative {
  // Firebase data (primary)
  id: string
  status: 'draft' | 'saved' | 'published'
  creativeFilename: string
  createdAt?: Date
  lastSaved?: Date
  userId?: string
  imageUrl?: string
  
  // Form data from Firebase
  formData: {
    accountName?: string
    campaignName?: string
    designer?: string
    litigationName?: string
    campaignType?: string
    headlineText?: string
    preheadlineText?: string
    ctaLabel?: string
    bodyCopySummary?: string
    // ... all other form fields
    [key: string]: any
  }
  
  // Google Sheets supplementary data (if available)
  googleSheetsData?: {
    imageUrl?: string
    performanceHistory?: Array<{
      date: string
      cost: string
      costPerWebsiteLead: string
      costPerLinkClick: string
      dataSource: 'google-sheets'
    }>
    recordCount?: number
    firstSeen?: Date
    lastUpdated?: Date
  }
  
  // AI populated fields
  aiPopulatedFields?: string[]
}

interface CreativeDataContextType {
  // Combined data
  enhancedCreatives: EnhancedCreative[]
  
  // Loading states
  isLoading: boolean
  isError: boolean
  
  // Utility functions
  getCreativeById: (id: string) => EnhancedCreative | undefined
  getCreativeByFilename: (filename: string) => EnhancedCreative | undefined
  getImageUrlForCreative: (creative: EnhancedCreative) => string | undefined
  
  // Refresh functions
  refreshFirebaseData: () => void
  refreshGoogleSheetsData: () => void
}

const CreativeDataContext = createContext<CreativeDataContextType | undefined>(undefined)

export function CreativeDataProvider({ children }: { children: React.ReactNode }) {
  // Get user info for Firebase queries
  const { user } = useGoogleAuth()

  // Get data from both sources - only query if user is authenticated
  const { drafts: firebaseCreatives, isLoading: firebaseLoading } = useFirebaseDrafts({
    userId: user?.email || 'anonymous',
    enableRealTime: !!user?.email // Only enable if user is authenticated
  })
  const { 
    data: googleSheetsData, 
    isLoading: googleSheetsLoading, 
    isError: googleSheetsError,
    refresh: refreshGoogleSheets
  } = useGoogleSheetsData()

  // Combine and enhance the data
  const enhancedCreatives = useMemo((): EnhancedCreative[] => {
    if (!firebaseCreatives) return []

    const savedCreatives = firebaseCreatives.filter(creative =>
      creative.status === 'saved' || creative.status === 'published'
    )
    
    const enhancedResult = savedCreatives.map(creative => {
        
        // Try to find matching Google Sheets data by comparing creative filename or image URL
        const googleSheetsMatch = googleSheetsData?.mergedCreatives?.find(gsCreative => {
          // Match by image asset name or creative filename
          const creativeFilename = creative.formData?.creativeFilename || creative.creativeFilename || ''
          const imageAssetName = gsCreative.imageAssetName || ''

          // Use more precise matching - exact match or very close match
          return (
            // Exact filename match (case insensitive)
            creativeFilename.toLowerCase() === imageAssetName.toLowerCase() ||
            // Match by account and campaign name if available (exact match)
            (creative.formData?.accountName && creative.formData?.campaignName &&
             gsCreative.accountName === creative.formData.accountName &&
             gsCreative.campaignName === creative.formData.campaignName)
          )
        })

        const enhanced: EnhancedCreative = {
          id: creative.id,
          status: creative.status,
          creativeFilename: creative.creativeFilename || creative.formData?.creativeFilename || '',
          createdAt: creative.createdAt,
          lastSaved: creative.lastSaved,
          userId: creative.userId,
          imageUrl: creative.imageUrl, // Include Firebase image URL
          formData: creative.formData || {},
          aiPopulatedFields: creative.aiPopulatedFields || []
        }

        // Add Google Sheets data if match found
        if (googleSheetsMatch) {
          enhanced.googleSheetsData = {
            // Use Firebase image URL if available, otherwise fall back to Google Sheets
            imageUrl: creative.imageUrl || googleSheetsMatch.imageUrl,
            performanceHistory: googleSheetsMatch.history,
            recordCount: googleSheetsMatch.recordCount,
            firstSeen: googleSheetsMatch.firstSeen,
            lastUpdated: googleSheetsMatch.lastUpdated
          }
        }

        return enhanced
      })
    
    return enhancedResult
  }, [firebaseCreatives, googleSheetsData])

  // Utility functions
  const getCreativeById = (id: string): EnhancedCreative | undefined => {
    return enhancedCreatives.find(creative => creative.id === id)
  }

  const getCreativeByFilename = (filename: string): EnhancedCreative | undefined => {
    return enhancedCreatives.find(creative => 
      creative.creativeFilename.toLowerCase().includes(filename.toLowerCase()) ||
      filename.toLowerCase().includes(creative.creativeFilename.toLowerCase())
    )
  }

  const getImageUrlForCreative = (creative: EnhancedCreative): string | undefined => {
    // Priority: Firebase stored image > Google Sheets image URL > form data image
    return creative.imageUrl || creative.googleSheetsData?.imageUrl || creative.formData?.imageUrl
  }

  const contextValue: CreativeDataContextType = {
    enhancedCreatives,
    isLoading: firebaseLoading || googleSheetsLoading,
    isError: googleSheetsError,
    getCreativeById,
    getCreativeByFilename,
    getImageUrlForCreative,
    refreshFirebaseData: () => {
      // Firebase data auto-refreshes via real-time listeners
      console.log('Firebase data refreshes automatically via real-time listeners')
    },
    refreshGoogleSheetsData: refreshGoogleSheets
  }

  return (
    <CreativeDataContext.Provider value={contextValue}>
      {children}
    </CreativeDataContext.Provider>
  )
}

export function useCreativeData() {
  const context = useContext(CreativeDataContext)
  if (context === undefined) {
    throw new Error('useCreativeData must be used within a CreativeDataProvider')
  }
  return context
}