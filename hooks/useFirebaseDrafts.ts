// React hook for Firebase draft management with real-time updates
import { useState, useEffect, useCallback, useRef } from 'react'
import { FirebaseDraftService, FirebaseDraftData } from '@/lib/firebase-draft-service'
import { toast } from 'sonner'

export interface UseFirebaseDraftsOptions {
  userId?: string
  enableRealTime?: boolean
}

export interface UseFirebaseDraftsReturn {
  drafts: FirebaseDraftData[]
  isLoading: boolean
  error: string | null
  saveDraft: (data: Partial<FirebaseDraftData>, imageFile?: File) => Promise<string | null>
  deleteDraft: (id: string) => Promise<boolean>
  getDraft: (id: string) => Promise<FirebaseDraftData | null>
  refreshDrafts: () => Promise<void>
  trackingStats: {
    totalDrafts: number
    autoSavedCount: number
    manualSavedCount: number
    aiPopulatedCount: number
  }
  isOnline: boolean
  lastSyncTime: Date | null
}

export const useFirebaseDrafts = (options: UseFirebaseDraftsOptions = {}): UseFirebaseDraftsReturn => {
  const { userId = 'anonymous', enableRealTime = true } = options
  
  const [drafts, setDrafts] = useState<FirebaseDraftData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [trackingStats, setTrackingStats] = useState({
    totalDrafts: 0,
    autoSavedCount: 0,
    manualSavedCount: 0,
    aiPopulatedCount: 0
  })
  
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Connection restored - syncing data...')
      refreshDrafts()
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      toast.warning('Connection lost - data will sync when reconnected')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Calculate tracking stats when drafts change
  useEffect(() => {
    const stats = {
      totalDrafts: drafts.length,
      autoSavedCount: drafts.filter(d => d.autoSaved).length,
      manualSavedCount: drafts.filter(d => !d.autoSaved).length,
      aiPopulatedCount: drafts.filter(d => d.aiPopulatedFields && d.aiPopulatedFields.length > 0).length
    }
    setTrackingStats(stats)
  }, [drafts])

  // Set up real-time listener or fetch drafts
  useEffect(() => {
    const initializeFirebase = async () => {
      // Initializing Firebase connection
      
      // Test Firebase connection first
      const connectionSuccess = await FirebaseDraftService.testConnection()
      if (!connectionSuccess) {
        setError('Firebase connection failed')
        setIsLoading(false)
        return
      }

      if (enableRealTime && isOnline) {
        // Setting up real-time drafts listener
        
        const unsubscribe = FirebaseDraftService.onDraftsChange(userId, (updatedDrafts) => {
          // Real-time update received
          setDrafts(updatedDrafts)
          setLastSyncTime(new Date())
          setIsLoading(false)
          setError(null)
        })
        
        unsubscribeRef.current = unsubscribe
        
        return () => {
          // Cleaning up real-time drafts listener
          unsubscribe()
        }
      } else {
        // Fallback to manual fetch
        refreshDrafts()
      }
    }

    initializeFirebase()
  }, [userId, enableRealTime, isOnline])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const refreshDrafts = useCallback(async () => {
    if (!isOnline) {
      setError('Cannot refresh drafts - you are offline')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const updatedDrafts = await FirebaseDraftService.getAllDrafts(userId)
      setDrafts(updatedDrafts)
      setLastSyncTime(new Date())
      
      // Manual refresh completed
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load drafts'
      setError(errorMessage)
      console.error('Failed to refresh drafts:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId, isOnline])

  const saveDraft = useCallback(async (
    data: Partial<FirebaseDraftData>, 
    imageFile?: File
  ): Promise<string | null> => {
    if (!isOnline) {
      // Cannot save draft - offline
      toast.error('Cannot save draft - you are offline')
      return null
    }

    try {
      // Starting save draft process
      
      // Add user ID to draft data
      const draftData = { ...data, userId }
      
      const draftId = await FirebaseDraftService.saveDraft(draftData, imageFile)
      
      // Draft saved successfully
      
      // Show success toast
      const isUpdate = Boolean(data.id)
      toast.success(isUpdate ? 'Draft updated successfully' : 'Draft saved successfully')
      
      return draftId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save draft'
      console.error('❌ Hook: Save draft failed:', err)
      setError(errorMessage)
      toast.error(`Failed to save draft: ${errorMessage}`)
      return null
    }
  }, [userId, isOnline])

  const deleteDraft = useCallback(async (id: string): Promise<boolean> => {
    if (!isOnline) {
      toast.error('Cannot delete draft - you are offline')
      return false
    }

    try {
      // Deleting draft
      
      const success = await FirebaseDraftService.deleteDraft(id)
      
      if (success) {
        // Draft deleted successfully
        toast.success('Draft deleted successfully')
        return true
      } else {
        toast.error('Failed to delete draft')
        return false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete draft'
      setError(errorMessage)
      toast.error(`Failed to delete draft: ${errorMessage}`)
      console.error('Failed to delete draft:', err)
      return false
    }
  }, [isOnline])

  const getDraft = useCallback(async (id: string): Promise<FirebaseDraftData | null> => {
    if (!isOnline) {
      toast.error('Cannot load draft - you are offline')
      return null
    }

    try {
      // Loading draft
      
      const draft = await FirebaseDraftService.getDraft(id)
      
      if (draft) {
        // Draft loaded successfully
      } else {
        // Draft not found
      }
      
      return draft
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load draft'
      setError(errorMessage)
      toast.error(`Failed to load draft: ${errorMessage}`)
      console.error('Failed to load draft:', err)
      return null
    }
  }, [isOnline])

  // Auto-save functionality with debounce
  const autoSave = useCallback((data: Partial<FirebaseDraftData>, imageFile?: File) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      // Auto-save triggered
      await saveDraft({ ...data, autoSaved: true }, imageFile)
    }, 2000) // 2 second debounce
  }, [saveDraft])

  return {
    drafts,
    isLoading,
    error,
    saveDraft,
    deleteDraft,
    getDraft,
    refreshDrafts,
    trackingStats,
    isOnline,
    lastSyncTime
  }
}