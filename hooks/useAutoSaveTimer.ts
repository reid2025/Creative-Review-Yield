import { useState, useEffect, useCallback, useRef } from 'react'

interface UseAutoSaveTimerProps {
  onSave: () => Promise<void>
  enabled?: boolean
  delay?: number // in seconds, default 30
  onCountdownUpdate?: (seconds: number) => void
}

export function useAutoSaveTimer({
  onSave,
  enabled = true,
  delay = 30,
  onCountdownUpdate
}: UseAutoSaveTimerProps) {
  const [countdown, setCountdown] = useState(delay)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [lastActivity, setLastActivity] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    setIsCountingDown(false)
    setCountdown(delay)
  }, [delay])

  // Start countdown
  const startCountdown = useCallback(() => {
    if (!enabled) return
    
    clearTimers()
    setIsCountingDown(true)
    setCountdown(delay)
    setLastActivity(new Date())

    // Start countdown interval
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        const newValue = prev - 1
        
        // Log to console for visibility
        console.log(`Auto-save countdown: ${newValue}...`)
        
        // Call callback if provided
        if (onCountdownUpdate) {
          onCountdownUpdate(newValue)
        }
        
        if (newValue <= 0) {
          clearInterval(countdownRef.current!)
          countdownRef.current = null
          setIsCountingDown(false)
          
          // Trigger save
          console.log('Draft Saved!')
          setIsSaving(true)
          onSave().finally(() => {
            setIsSaving(false)
          })
          
          return delay
        }
        
        return newValue
      })
    }, 1000)
  }, [enabled, delay, onSave, clearTimers, onCountdownUpdate])

  // Reset countdown (when user interacts)
  const resetCountdown = useCallback(() => {
    if (!enabled) return
    
    clearTimers()
    setCountdown(delay)
    setLastActivity(new Date())
    
    // Start new countdown
    setIsCountingDown(true)
    
    // Use timeout instead of interval for the initial delay
    saveTimeoutRef.current = setTimeout(() => {
      // After initial delay, start the visible countdown
      setCountdown(delay)
      
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          const newValue = prev - 1
          
          // Log to console
          console.log(`Auto-save countdown: ${newValue}...`)
          
          if (onCountdownUpdate) {
            onCountdownUpdate(newValue)
          }
          
          if (newValue <= 0) {
            clearInterval(countdownRef.current!)
            countdownRef.current = null
            setIsCountingDown(false)
            
            // Trigger save
            console.log('Draft Saved!')
            setIsSaving(true)
            onSave().finally(() => {
              setIsSaving(false)
            })
            
            return delay
          }
          
          return newValue
        })
      }, 1000)
    }, delay * 1000)
  }, [enabled, delay, onSave, clearTimers, onCountdownUpdate])

  // Manual save trigger
  const triggerManualSave = useCallback(async () => {
    clearTimers()
    setIsSaving(true)
    try {
      await onSave()
      console.log('Manual save completed')
    } finally {
      setIsSaving(false)
    }
  }, [onSave, clearTimers])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  return {
    countdown,
    isCountingDown,
    isSaving,
    lastActivity,
    startCountdown,
    resetCountdown,
    triggerManualSave,
    clearTimers
  }
}