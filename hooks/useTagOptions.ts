import { useState, useEffect } from 'react'
import { tagService, type Tag } from '@/lib/firebase-tag-service'
import { useGoogleAuth } from '@/contexts/GoogleAuthContext'
import { toast } from 'sonner'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface TagOption {
  value: string
  label: string
}

export function useTagOptions(fieldName: string) {
  const { user } = useGoogleAuth()
  const [options, setOptions] = useState<TagOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set up real-time listener for tags
    const q = query(
      collection(db, 'tags'),
      where('fieldName', '==', fieldName)
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tagOptions = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          value: data.value,
          label: data.label
        }
      })
      setOptions(tagOptions)
      setLoading(false)
    }, (error) => {
      console.error(`Error listening to tags for ${fieldName}:`, error)
      setOptions([])
      setLoading(false)
    })
    
    return () => unsubscribe()
  }, [fieldName])

  const fetchTags = async () => {
    try {
      setLoading(true)
      const tags = await tagService.getTagsByFieldName(fieldName)
      const tagOptions = tags.map(tag => ({
        value: tag.value,
        label: tag.label
      }))
      setOptions(tagOptions)
    } catch (error) {
      console.error(`Error fetching tags for ${fieldName}:`, error)
      // Return empty array on error, don't show toast for each field
      setOptions([])
    } finally {
      setLoading(false)
    }
  }

  const addNewTag = async (label: string): Promise<string> => {
    try {
      const value = label.toLowerCase().replace(/\s+/g, '-')
      
      // Check if tag already exists
      const existingTag = options.find(opt => 
        opt.value === value || opt.label.toLowerCase() === label.toLowerCase()
      )
      
      if (existingTag) {
        toast.info('Tag already exists')
        return existingTag.value
      }

      // Get category info from TAG_CATEGORIES
      const { TAG_CATEGORIES } = await import('@/lib/firebase-tag-service')
      const category = TAG_CATEGORIES.find(cat => cat.fieldName === fieldName)
      
      if (!category) {
        throw new Error(`Category not found for field: ${fieldName}`)
      }

      // Create new tag
      const newTag = await tagService.createTag({
        label,
        value,
        fieldName: fieldName,
        createdBy: user?.uid || 'unknown',
        usageCount: 0
      })

      // No need to update local options - real-time listener will handle it
      // setOptions(prev => [...prev, { value: newTag.value, label: newTag.label }])
      
      toast.success(`Tag "${label}" added successfully`)
      
      // Small delay to ensure Firestore updates are propagated
      await new Promise(resolve => setTimeout(resolve, 100))
      return newTag.value
    } catch (error) {
      console.error('Error adding new tag:', error)
      toast.error('Failed to add new tag')
      throw error
    }
  }

  return {
    options,
    loading,
    addNewTag,
    refetch: fetchTags
  }
}