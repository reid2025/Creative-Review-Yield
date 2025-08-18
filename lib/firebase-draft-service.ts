// Firebase Draft Service - Real-time draft management with Firestore
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
 
  getDocs, 
  getDoc,
  onSnapshot,
  query,
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from './firebase'

export interface FirebaseDraftData {
  id?: string
  creativeFilename: string
  lastSaved: Timestamp
  createdAt: Timestamp
  status?: 'draft' | 'saved'
  formData: Record<string, unknown>
  imageUrl?: string
  userId?: string
  aiPopulatedFields?: string[]
  // Performance history
  creativeHistory?: Array<{
    date: string
    cost: string
    costPerWebsiteLead: string
    costPerLinkClick: string
    dataSource: 'manual' | 'google-sheets'
  }>
}

export class FirebaseDraftService {
  private static readonly COLLECTION_NAME = 'creatives'
  private static readonly STORAGE_PATH = 'creative-images'

  /**
   * Test Firebase connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      // Testing Firebase connection
      // Try to read from Firestore
      const q = query(collection(db, this.COLLECTION_NAME))
      await getDocs(q)
      // Firebase connection test successful
      return true
    } catch (error) {
      console.error('❌ Firebase connection test failed:', error)
      return false
    }
  }

  /**
   * Clean object to remove undefined values (Firebase doesn't accept undefined)
   */
  private static cleanObject(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
      return null
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanObject(item))
    }
    
    if (typeof obj === 'object' && obj !== null && obj.constructor === Object) {
      const cleaned: Record<string, unknown> = {}
      const objRecord = obj as Record<string, unknown>
      for (const key in objRecord) {
        if (Object.prototype.hasOwnProperty.call(objRecord, key)) {
          const value = objRecord[key]
          if (value !== undefined) {
            cleaned[key] = this.cleanObject(value)
          }
        }
      }
      return cleaned
    }
    
    return obj
  }

  /**
   * Save or update a draft in Firestore
   */
  static async saveDraft(data: Partial<FirebaseDraftData>, imageFile?: File): Promise<string> {
    try {
      // Saving draft to Firebase
      
      // Clean the formData to remove non-serializable objects like File and undefined values
      const cleanFormData = this.cleanObject({ ...data.formData })
      if (cleanFormData && cleanFormData.uploadedImage) {
        // Store only file metadata, not the actual File object
        const file = cleanFormData.uploadedImage as File
        if (file && typeof file === 'object' && file.name) {
          cleanFormData.uploadedImage = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            isFileObject: true // Flag to identify this was a file
          }
        }
      }
      
      // Extract performanceHistory from formData if it exists
      // BUT don't save it as creativeHistory if it's from Google Sheets
      const performanceHistory = cleanFormData?.performanceHistory as FirebaseDraftData['creativeHistory']
      if (performanceHistory) {
        delete cleanFormData.performanceHistory // Remove from formData to store separately
      }
      
      // Clean the entire draft data object to remove undefined values
      const draftData = this.cleanObject({
        creativeFilename: data.creativeFilename || 'Untitled',
        lastSaved: serverTimestamp() as Timestamp,
        status: data.status || 'saved', // Default to saved
        formData: cleanFormData || {},
        aiPopulatedFields: data.aiPopulatedFields || [],
        userId: data.userId || 'anonymous',
        // Don't save creativeHistory - it should not be stored in Firebase
        // creativeHistory: performanceHistory || data.creativeHistory
      })

      // Prepared draft data for Firebase

      // Handle image upload if provided (skip if storage permission issues)
      if (imageFile) {
        try {
          const imageData = await this.uploadImage(imageFile, draftData.creativeFilename!)
          draftData.imageUrl = imageData.downloadUrl
          // Image uploaded successfully - we don't need to save the storage path
        } catch (imageError) {
          console.warn('⚠️ Image upload failed, continuing without image:', imageError)
          // Don't fail the entire draft save if image upload fails
        }
      }

      // If draftId exists, update existing document
      if (data.id) {
        // Updating existing draft
        const draftRef = doc(db, this.COLLECTION_NAME, data.id)
        await updateDoc(draftRef, {
          ...draftData,
          lastSaved: serverTimestamp()
        })
        // Draft updated successfully
        return data.id
      } else {
        // Create new draft
        // Creating new draft document
        draftData.createdAt = serverTimestamp() as Timestamp
        const docRef = await addDoc(collection(db, this.COLLECTION_NAME), draftData)
        // New draft created
        return docRef.id
      }
    } catch (error) {
      console.error('❌ Failed to save draft to Firebase:', error)
      console.error('Firebase error details:', error)
      throw new Error(`Failed to save draft: ${error}`)
    }
  }

  /**
   * Get a single draft by ID
   */
  static async getDraft(id: string): Promise<FirebaseDraftData | null> {
    try {
      const draftRef = doc(db, this.COLLECTION_NAME, id)
      const draftSnap = await getDoc(draftRef)
      
      if (draftSnap.exists()) {
        return {
          id: draftSnap.id,
          ...draftSnap.data()
        } as FirebaseDraftData
      }
      return null
    } catch (error) {
      console.error('Failed to get draft:', error)
      return null
    }
  }

  /**
   * Get all active drafts for a user (only draft status)
   */
  static async getAllDrafts(userId: string = 'anonymous'): Promise<FirebaseDraftData[]> {
    try {
      // Simplified query to avoid needing a composite index
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        where('status', '==', 'draft')
      )
      
      const querySnapshot = await getDocs(q)
      const drafts: FirebaseDraftData[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        // Only include documents with draft status or no status (legacy drafts)
        if (data.status === 'draft' || !data.status) {
          drafts.push({
            id: doc.id,
            ...data
          } as FirebaseDraftData)
        }
      })
      
      // Sort by lastSaved in memory to avoid needing a composite index
      return drafts.sort((a, b) => {
        const aTime = a.lastSaved?.toDate?.()?.getTime() || 0
        const bTime = b.lastSaved?.toDate?.()?.getTime() || 0
        return bTime - aTime // Desc order
      })
    } catch (error) {
      console.error('Failed to get drafts:', error)
      return []
    }
  }

  /**
   * Delete a draft (soft delete by marking as inactive)
   */
  static async deleteDraft(id: string): Promise<boolean> {
    try {
      const draftRef = doc(db, this.COLLECTION_NAME, id)
      
      // Simply update status to deleted
      await updateDoc(draftRef, {
        status: 'deleted',
        lastSaved: serverTimestamp()
      })
      
      return true
    } catch (error) {
      console.error('Failed to delete draft:', error)
      return false
    }
  }

  /**
   * Set up real-time listener for drafts
   */
  static onDraftsChange(userId: string = 'anonymous', callback: (drafts: FirebaseDraftData[]) => void): () => void {
    // Simplified query to avoid needing a composite index
    const q = query(
      collection(db, this.COLLECTION_NAME),
      where('userId', '==', userId)
    )

    return onSnapshot(q, (querySnapshot) => {
      const drafts: FirebaseDraftData[] = []
      querySnapshot.forEach((doc) => {
        drafts.push({
          id: doc.id,
          ...doc.data()
        } as FirebaseDraftData)
      })
      
      // Sort by lastSaved in memory to avoid needing a composite index
      const sortedDrafts = drafts.sort((a, b) => {
        const aTime = a.lastSaved?.toDate?.()?.getTime() || 0
        const bTime = b.lastSaved?.toDate?.()?.getTime() || 0
        return bTime - aTime // Desc order
      })
      
      callback(sortedDrafts)
    }, (error) => {
      console.error('Real-time drafts listener error:', error)
    })
  }

  /**
   * Set up real-time listener for a specific draft
   */
  static onDraftChange(draftId: string, callback: (draft: FirebaseDraftData | null) => void): () => void {
    const draftRef = doc(db, this.COLLECTION_NAME, draftId)
    
    return onSnapshot(draftRef, (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        } as FirebaseDraftData)
      } else {
        callback(null)
      }
    }, (error) => {
      console.error('Real-time draft listener error:', error)
    })
  }

  /**
   * Upload image to Firebase Storage
   */
  private static async uploadImage(file: File, draftId: string): Promise<{ downloadUrl: string, storagePath: string }> {
    try {
      const storagePath = `${this.STORAGE_PATH}/${draftId}/${file.name}`
      const imageRef = ref(storage, storagePath)
      
      await uploadBytes(imageRef, file)
      const downloadUrl = await getDownloadURL(imageRef)
      
      return { downloadUrl, storagePath }
    } catch (error) {
      console.error('Failed to upload image:', error)
      throw new Error('Failed to upload image')
    }
  }

  /**
   * Delete image from Firebase Storage
   */
  private static async deleteImage(storagePath: string): Promise<void> {
    try {
      const imageRef = ref(storage, storagePath)
      await deleteObject(imageRef)
    } catch (error) {
      console.error('Failed to delete image:', error)
      // Don't throw error as this is cleanup
    }
  }

  /**
   * Generate unique draft ID
   */
  private static generateDraftId(): string {
    return `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Migrate existing localStorage drafts to Firebase
   */
  static async migrateLocalDrafts(): Promise<void> {
    try {
      // Import the existing draft storage to access local drafts
      const { DraftStorageV2 } = await import('../utils/draftStorage.v2')
      const localDrafts = DraftStorageV2.getAllDrafts()
      
      console.log(`Found ${localDrafts.length} local drafts to migrate`)
      
      for (const localDraft of localDrafts) {
        try {
          const firebaseDraft: Partial<FirebaseDraftData> = {
            creativeFilename: localDraft.creativeFilename,
            formData: localDraft.formData,
            status: 'draft'
          }
          
          await this.saveDraft(firebaseDraft)
          console.log(`Migrated draft: ${localDraft.creativeFilename}`)
        } catch (error) {
          console.error(`Failed to migrate draft ${localDraft.draftId}:`, error)
        }
      }
      
      console.log('Draft migration completed')
    } catch (error) {
      console.error('Failed to migrate local drafts:', error)
    }
  }

  /**
   * Get real-time tracking statistics
   */
  static async getTrackingStats(userId: string = 'anonymous'): Promise<{
    totalDrafts: number
    autoSavedCount: number
    manualSavedCount: number
    aiPopulatedCount: number
  }> {
    try {
      const drafts = await this.getAllDrafts(userId)
      
      const stats = {
        totalDrafts: drafts.length,
        autoSavedCount: 0, // No longer tracking autoSaved
        manualSavedCount: drafts.length,
        aiPopulatedCount: drafts.filter(d => d.aiPopulatedFields && d.aiPopulatedFields.length > 0).length
      }
      
      return stats
    } catch (error) {
      console.error('Failed to get tracking stats:', error)
      return {
        totalDrafts: 0,
        autoSavedCount: 0,
        manualSavedCount: 0,
        aiPopulatedCount: 0
      }
    }
  }
}