'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FirebaseDraftService, FirebaseDraftData } from '@/lib/firebase-draft-service'
import { useGoogleAuth } from '@/contexts/GoogleAuthContext'
import { useGoogleSheetsData } from '@/hooks/useGoogleSheetsData'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Edit, Trash2, FileText, Calendar, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

export default function MyDraftsPage() {
  const { user } = useGoogleAuth()
  const router = useRouter()
  const { data: sheetsData } = useGoogleSheetsData()
  const [myDrafts, setMyDrafts] = useState<FirebaseDraftData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Load user's drafts
  useEffect(() => {
    loadMyDrafts()
  }, [user])

  const loadMyDrafts = async () => {
    if (!user?.email) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Get all drafts for the user
      const drafts = await FirebaseDraftService.getAllDrafts(user.email)

      // Filter to only include drafts where the user has a personal draft
      const userDrafts = drafts.filter(draft => {
        // Check if this user has a draft in the userDrafts object
        return draft.userDrafts && draft.userDrafts[user.email]
      })

      setMyDrafts(userDrafts)
    } catch (err) {
      console.error('Failed to load drafts:', err)
      setError('Failed to load your drafts')
      toast.error('Failed to load your drafts')
    } finally {
      setLoading(false)
    }
  }

  const handleEditDraft = async (draft: FirebaseDraftData) => {
    if (!user?.email || !draft.userDrafts?.[user.email]) {
      toast.error('Draft not found')
      return
    }

    // Check if the creative has been published by someone else
    if (draft.status === 'published' && draft.publishedVersion) {
      const publishedBy = draft.publishedVersion.publishedBy
      if (publishedBy.email !== user.email) {
        toast.info(
          `This creative has been published by ${publishedBy.name}. You can view it in the Creative Library.`,
          {
            action: {
              label: 'View Published',
              onClick: () => router.push('/creative-library')
            }
          }
        )
      }
    }

    // Navigate to creative form with draft data - same URL as existing creative editing
    router.push(`/google-sheets-records/creative-details?draftId=${draft.id}`)
  }

  const handleDeleteDraft = async (draftId: string) => {
    if (!user?.email) return

    try {
      setDeletingId(draftId)

      // Get the draft to check if user has a personal draft
      const draft = await FirebaseDraftService.getDraft(draftId)
      if (!draft || !draft.userDrafts?.[user.email]) {
        toast.error('Draft not found')
        return
      }

      // Remove user's draft from the userDrafts object
      const updatedUserDrafts = { ...draft.userDrafts }
      delete updatedUserDrafts[user.email]

      // If no other users have drafts, delete the entire document
      if (Object.keys(updatedUserDrafts).length === 0) {
        await FirebaseDraftService.deleteDraft(draftId)
      } else {
        // Update the document to remove this user's draft
        await FirebaseDraftService.saveDraft({
          ...draft,
          userDrafts: updatedUserDrafts,
          editHistory: [
            ...(draft.editHistory || []),
            {
              name: user.name || 'User',
              email: user.email,
              action: 'edited' as const,
              timestamp: new Date() as any,
              details: 'Removed personal draft'
            }
          ]
        })
      }

      // Remove from local state
      setMyDrafts(prev => prev.filter(d => d.id !== draftId))
      toast.success('Draft deleted successfully')
    } catch (err) {
      console.error('Failed to delete draft:', err)
      toast.error('Failed to delete draft')
    } finally {
      setDeletingId(null)
    }
  }

  const formatLastSaved = (timestamp: any) => {
    if (!timestamp) return 'Unknown'

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffMins < 1) return 'Just now'
      if (diffMins <= 10) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`

      // Show specific time and date for anything older than 10 minutes
      const timeString = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })

      // If it's today, just show the time
      if (diffHours < 24 && date.toDateString() === now.toDateString()) {
        return timeString
      }

      // If it's yesterday
      if (diffDays === 1) {
        return `Yesterday ${timeString}`
      }

      // If it's within this week, show day name
      if (diffDays < 7) {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
        return `${dayName} ${timeString}`
      }

      // For older dates, show full date and time
      const dateString = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
      return `${dateString} ${timeString}`
    } catch (err) {
      return 'Unknown'
    }
  }

  const getUserDraftData = (draft: FirebaseDraftData) => {
    if (!user?.email || !draft.userDrafts) return null
    return draft.userDrafts[user.email]
  }

  const getThumbnailUrl = (draft: FirebaseDraftData) => {
    // First try the draft's imageUrl
    if (draft.imageUrl) {
      return draft.imageUrl
    }

    // If no direct imageUrl, try to find it in Google Sheets data
    if (sheetsData?.mergedCreatives && draft.creativeFilename) {
      const matchingCreative = sheetsData.mergedCreatives.find(creative =>
        creative.imageAssetName === draft.creativeFilename ||
        creative.imageUrl === draft.imageUrl
      )
      return matchingCreative?.imageUrl
    }

    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="font-league-spartan text-2xl font-bold">My Drafts</h1>
          <p className="text-muted-foreground">Your personal creative drafts</p>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="font-league-spartan text-2xl font-bold">My Drafts</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Drafts</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadMyDrafts}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Drafts</h1>
        <p className="text-muted-foreground">
          Your personal creative drafts ({myDrafts.length} total)
        </p>
      </div>

      {myDrafts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No drafts yet</h3>
            <p className="text-muted-foreground mb-6">
              Start creating your first creative draft to see it here.
            </p>
            <Button onClick={() => router.push('/creative-stream')}>
              Create New Creative
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {myDrafts.map((draft) => {
            const userDraft = getUserDraftData(draft)
            const isPublished = draft.status === 'published'
            const publishedByOther = isPublished &&
              draft.publishedVersion?.publishedBy.email !== user?.email
            const thumbnailUrl = getThumbnailUrl(draft)

            return (
              <Card key={draft.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      {thumbnailUrl ? (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={thumbnailUrl}
                            alt={draft.creativeFilename || 'Creative thumbnail'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold truncate">
                            {userDraft?.formData?.campaignName || draft.creativeFilename}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {draft.creativeFilename}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {isPublished && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Published
                            </Badge>
                          )}
                          {publishedByOther && (
                            <Badge variant="outline" className="text-orange-600">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Conflict
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Last saved: {formatLastSaved(userDraft?.lastSaved)}
                        </div>
                      </div>

                      {publishedByOther && (
                        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-center gap-2 text-orange-800">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Published by {draft.publishedVersion?.publishedBy.name}
                            </span>
                          </div>
                          <p className="text-xs text-orange-700 mt-1">
                            This creative has been published. Your draft may conflict with the published version.
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleEditDraft(draft)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Draft
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={deletingId === draft.id}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Draft</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this draft? This action cannot be undone.
                                {publishedByOther && (
                                  <span className="block mt-2 text-orange-600">
                                    Note: The published version will remain in the Creative Library.
                                  </span>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteDraft(draft.id!)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Draft
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        {publishedByOther && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/creative-library')}
                            className="ml-auto"
                          >
                            View Published
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}