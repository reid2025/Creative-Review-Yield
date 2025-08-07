'use client'

import { useState, useCallback } from 'react'

/**
 * Custom hook for managing AI-populated fields
 * Uses Set state directly for reliable updates
 */
export function useAIFields() {
  // Use Set directly in state for reliable updates
  const [aiFieldsSet, setAiFieldsSet] = useState<Set<string>>(new Set())
  
  // Convert to object for debugging
  const aiFields = Object.fromEntries(
    Array.from(aiFieldsSet).map(field => [field, true])
  )

  // Check if a specific field is AI-filled
  const isFieldAIFilled = useCallback((fieldName: string): boolean => {
    const result = aiFieldsSet.has(fieldName)
    console.log(`🔍 Checking AI status for "${fieldName}":`, result)
    return result
  }, [aiFieldsSet])

  // Mark a single field as AI-filled
  const markFieldAsAI = useCallback((fieldName: string) => {
    console.log(`✅ Marking field "${fieldName}" as AI-filled`)
    setAiFieldsSet(prev => new Set(prev).add(fieldName))
  }, [])

  // Remove AI tag from a single field
  const removeAITag = useCallback((fieldName: string) => {
    console.log(`❌ Removing AI tag from field "${fieldName}"`)
    setAiFieldsSet(prev => {
      const newSet = new Set(prev)
      newSet.delete(fieldName)
      return newSet
    })
  }, [])

  // Set multiple fields as AI-filled at once
  const setMultipleAITags = useCallback((fieldNames: string[]) => {
    console.log(`🏷️ Setting AI tags for ${fieldNames.length} fields:`, fieldNames)
    const newSet = new Set(fieldNames)
    console.log(`📊 New Set size:`, newSet.size)
    setAiFieldsSet(newSet)
  }, [])

  // Clear all AI tags
  const clearAllAITags = useCallback(() => {
    console.log('🧹 Clearing all AI tags')
    setAiFieldsSet(new Set())
  }, [])

  // Get count of AI-filled fields
  const aiFieldCount = aiFieldsSet.size

  return {
    // State
    aiFields,
    aiFieldsSet,
    aiFieldCount,
    
    // Methods
    isFieldAIFilled,
    markFieldAsAI,
    removeAITag,
    setMultipleAITags,
    clearAllAITags,
  }
}