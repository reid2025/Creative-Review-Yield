import { 
  collection, 
  doc, 
  setDoc, 
 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from './firebase'

export interface Tag {
  id: string  // Document ID from Firebase (not stored in doc)
  value: string
  label: string
  fieldName: string
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
  createdBy: string
}

export interface TagCategory {
  id: string
  name: string
  displayName: string
  fieldName: string
  description: string
  allowMultiple: boolean
  allowAddNew: boolean
  tags: Tag[]
}

// Tag categories matching the form fields
export const TAG_CATEGORIES: TagCategory[] = [
  // Metadata & Campaign Info
  {
    id: 'designer',
    name: 'designer',
    displayName: 'Designer',
    fieldName: 'designer',
    description: 'Creative designers',
    allowMultiple: false,
    allowAddNew: true,
    tags: []
  },
  {
    id: 'litigation-name',
    name: 'litigationName',
    displayName: 'Litigation Name',
    fieldName: 'litigationName',
    description: 'Specific litigation or case names',
    allowMultiple: false,
    allowAddNew: true,
    tags: []
  },
  {
    id: 'campaign-type',
    name: 'campaignType',
    displayName: 'Campaign Type',
    fieldName: 'campaignType',
    description: 'Types of marketing campaigns',
    allowMultiple: false,
    allowAddNew: true,
    tags: []
  },
  
  // Message & Targeting Insights
  {
    id: 'creative-layout-type',
    name: 'creativeLayoutType',
    displayName: 'Creative Layout Type',
    fieldName: 'creativeLayoutType',
    description: 'Layout formats for creatives',
    allowMultiple: false,
    allowAddNew: true,
    tags: []
  },
  {
    id: 'imagery-type',
    name: 'imageryType',
    displayName: 'Imagery Type',
    fieldName: 'imageryType',
    description: 'Types of imagery used',
    allowMultiple: true,
    allowAddNew: true,
    tags: []
  },
  {
    id: 'imagery-background',
    name: 'imageryBackground',
    displayName: 'Imagery Background',
    fieldName: 'imageryBackground',
    description: 'Background styles for imagery',
    allowMultiple: true,
    allowAddNew: true,
    tags: []
  },
  {
    id: 'messaging-structure',
    name: 'messagingStructure',
    displayName: 'Messaging Structure',
    fieldName: 'messagingStructure',
    description: 'Structure of the marketing message',
    allowMultiple: false,
    allowAddNew: true,
    tags: []
  },
  
  // Headline & CTA
  {
    id: 'headline-tags',
    name: 'headlineTags',
    displayName: 'Headline Tags',
    fieldName: 'headlineTags',
    description: 'Tags describing headline characteristics',
    allowMultiple: true,
    allowAddNew: true,
    tags: []
  },
  {
    id: 'headline-intent',
    name: 'headlineIntent',
    displayName: 'Headline Intent',
    fieldName: 'headlineIntent',
    description: 'Purpose or intent of the headline',
    allowMultiple: true,
    allowAddNew: true,
    tags: []
  },
  {
    id: 'cta-verb',
    name: 'ctaVerb',
    displayName: 'CTA Verb',
    fieldName: 'ctaVerb',
    description: 'Action words used in CTAs',
    allowMultiple: false,
    allowAddNew: true,
    tags: []
  },
  {
    id: 'cta-style',
    name: 'ctaStyleGroup',
    displayName: 'CTA Style',
    fieldName: 'ctaStyleGroup',
    description: 'Visual style of the CTA',
    allowMultiple: false,
    allowAddNew: true,
    tags: []
  },
  {
    id: 'cta-color',
    name: 'ctaColor',
    displayName: 'CTA Color',
    fieldName: 'ctaColor',
    description: 'Color of the CTA button/link',
    allowMultiple: false,
    allowAddNew: true,
    tags: []
  },
  {
    id: 'cta-position',
    name: 'ctaPosition',
    displayName: 'CTA Position',
    fieldName: 'ctaPosition',
    description: 'Position of the CTA in the creative',
    allowMultiple: false,
    allowAddNew: true,
    tags: []
  },
  
  // Copy & Conversion Drivers
  {
    id: 'copy-angle',
    name: 'copyAngle',
    displayName: 'Copy Angle',
    fieldName: 'copyAngle',
    description: 'Approach angle of the copy',
    allowMultiple: true,
    allowAddNew: true,
    tags: []
  },
  {
    id: 'copy-tone',
    name: 'copyTone',
    displayName: 'Copy Tone',
    fieldName: 'copyTone',
    description: 'Tone of voice in the copy',
    allowMultiple: true,
    allowAddNew: true,
    tags: []
  },
  {
    id: 'audience-persona',
    name: 'audiencePersona',
    displayName: 'Audience Persona',
    fieldName: 'audiencePersona',
    description: 'Target audience characteristics',
    allowMultiple: false,
    allowAddNew: true,
    tags: []
  },
  {
    id: 'campaign-trigger',
    name: 'campaignTrigger',
    displayName: 'Campaign Trigger',
    fieldName: 'campaignTrigger',
    description: 'Events or conditions triggering the campaign',
    allowMultiple: false,
    allowAddNew: true,
    tags: []
  }
]

class FirebaseTagService {
  private tagsCollection = 'tags'
  
  // Create a new tag
  async createTag(tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tag> {
    try {
      const tagId = doc(collection(db, this.tagsCollection)).id
      
      // Don't store 'id' in the document, it's the document ID
      const tagData = {
        value: tag.value,
        label: tag.label,
        fieldName: tag.fieldName,
        createdBy: tag.createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      await setDoc(doc(db, this.tagsCollection, tagId), tagData)
      
      // Return with ID for client-side use
      return {
        ...tagData,
        id: tagId,
        createdAt: tagData.createdAt as Timestamp,
        updatedAt: tagData.updatedAt as Timestamp
      }
    } catch (error) {
      console.error('Error creating tag:', error)
      throw error
    }
  }
  
  // Get all tags
  async getAllTags(): Promise<Tag[]> {
    try {
      // Simplified query - just get all tags, sort in memory
      const snapshot = await getDocs(collection(db, this.tagsCollection))
      const tags = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tag))
      
      // Sort in memory instead of using compound index
      return tags.sort((a, b) => {
        // First sort by category
        const categoryCompare = (a.category || '').localeCompare(b.category || '')
        if (categoryCompare !== 0) return categoryCompare
        // Then sort by label
        return (a.label || '').localeCompare(b.label || '')
      })
    } catch (error) {
      console.error('Error fetching tags:', error)
      throw error
    }
  }
  
  // Get tags by category
  async getTagsByCategory(category: string): Promise<Tag[]> {
    try {
      const q = query(
        collection(db, this.tagsCollection),
        where('category', '==', category)
      )
      const snapshot = await getDocs(q)
      const tags = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tag))
      
      // Sort in memory to avoid complex index
      return tags.sort((a, b) => (a.label || '').localeCompare(b.label || ''))
    } catch (error) {
      console.error('Error fetching tags by category:', error)
      throw error
    }
  }
  
  // Get tags by field name
  async getTagsByFieldName(fieldName: string): Promise<Tag[]> {
    try {
      const q = query(
        collection(db, this.tagsCollection),
        where('fieldName', '==', fieldName)
      )
      const snapshot = await getDocs(q)
      const tags = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tag))
      
      // Sort in memory to avoid complex index
      return tags.sort((a, b) => (a.label || '').localeCompare(b.label || ''))
    } catch (error) {
      console.error('Error fetching tags by field name:', error)
      throw error
    }
  }
  
  // Update a tag
  async updateTag(tagId: string, updates: Partial<Tag>): Promise<void> {
    try {
      await updateDoc(doc(db, this.tagsCollection, tagId), {
        ...updates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating tag:', error)
      throw error
    }
  }
  
  // Delete a tag (soft delete by setting isActive to false)
  async deleteTag(tagId: string): Promise<void> {
    try {
      await updateDoc(doc(db, this.tagsCollection, tagId), {
        isActive: false,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error deleting tag:', error)
      throw error
    }
  }
  
  // Permanently delete a tag
  async permanentlyDeleteTag(tagId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.tagsCollection, tagId))
    } catch (error) {
      console.error('Error permanently deleting tag:', error)
      throw error
    }
  }
  
  // Batch create tags
  async batchCreateTags(tags: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<void> {
    try {
      const batch = writeBatch(db)
      
      tags.forEach(tag => {
        const tagRef = doc(collection(db, this.tagsCollection))
        
        // Don't store 'id' in the document
        const tagData = {
          value: tag.value,
          label: tag.label,
          fieldName: tag.fieldName,
          createdBy: tag.createdBy,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
        
        batch.set(tagRef, tagData)
      })
      
      await batch.commit()
    } catch (error) {
      console.error('Error batch creating tags:', error)
      throw error
    }
  }
  
  
  // Get tag performance analytics
  async getTagPerformance(): Promise<Record<string, number>> {
    // This would query creatives collection to calculate performance
    // For now, returning mock data
    return {
      avgROAS: 3.5,
      avgCostPerClick: 2.75,
      avgCostPerLead: 25.50,
      totalSpend: 15000,
      totalRevenue: 52500
    }
  }
}

export const tagService = new FirebaseTagService()