"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DraftStorageV2 as DraftStorage } from "@/utils/draftStorage.v2"

export default function ClearDraftsPage() {
  const [draftsCount, setDraftsCount] = useState(0)
  const [isCleared, setIsCleared] = useState(false)

  useEffect(() => {
    // Check current drafts count
    const checkDrafts = () => {
      const drafts = DraftStorage.getAllDrafts()
      setDraftsCount(drafts.length)
    }
    
    checkDrafts()
  }, [])

  const handleClearAll = () => {
    try {
      // Clear using our utility
      DraftStorage.clearAllDrafts()
      
      // Also force clear localStorage directly
      if (typeof window !== 'undefined') {
        localStorage.removeItem('creative-upload-drafts')
        
        // Clear any other possible keys
        const allKeys = Object.keys(localStorage)
        allKeys.forEach(key => {
          if (key.includes('draft') || key.includes('creative')) {
            localStorage.removeItem(key)
          }
        })
      }
      
      setDraftsCount(0)
      setIsCleared(true)
      
      // console.log('✅ All drafts forcefully cleared')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error clearing drafts:', error)
    }
  }

  const handleCheckAgain = () => {
    const drafts = DraftStorage.getAllDrafts()
    setDraftsCount(drafts.length)
    setIsCleared(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Clear All Drafts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">
              Current Drafts: {draftsCount}
            </div>
            {isCleared && (
              <div className="text-green-600 font-medium">
                ✅ All drafts have been cleared!
              </div>
            )}
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={handleClearAll}
              variant="destructive"
              size="lg"
            >
              Force Clear All Drafts
            </Button>
            
            <Button 
              onClick={handleCheckAgain}
              variant="outline"
              size="lg"
            >
              Check Again
            </Button>
          </div>
          
          <div className="text-sm text-gray-600 text-center">
            <p>This will permanently delete all saved drafts from localStorage.</p>
            <p className="mt-2">After clearing, go to <a href="/drafts" className="text-blue-600 underline">/drafts</a> to confirm it&apos;s empty.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}