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
  status?: 'draft' | 'saved' | 'published'
  formData: Record<string, unknown>
  imageUrl?: string
  userId?: string
  aiPopulatedFields?: string[]

  // NEW MULTI-USER FIELDS (optional for backward compatibility)
  creativeId?: string  // Based on image asset ID for deduplication
  createdBy?: {
    email: string
    googleId: string
    name: string
    photoURL: string
  }
  userDrafts?: Record<string, {
    formData: Record<string, unknown>
    lastSaved: Timestamp
  }>
  publishedVersion?: {
    formData: Record<string, unknown>
    publishedAt: Timestamp
    publishedBy: {
      email: string
      name: string
    }
  }
  editHistory?: Array<{
    name: string
    email: string
    action: 'created' | 'edited' | 'published'
    timestamp: Timestamp
    details?: string
  }>
  version?: number

  // Performance history (existing)
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
   * Generate creative ID based on image asset (for deduplication)
   */
  private static generateCreativeId(formData: Record<string, unknown>): string {
    // Use image asset name or URL as the unique identifier
    const imageAsset = formData.creativeFilename || formData.imageUrl || formData.imageAssetName

    if (imageAsset && typeof imageAsset === 'string') {
      // Create a stable ID from the image asset
      return btoa(imageAsset).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)
    }

    // Fallback to timestamp-based ID for creatives without images
    return `creative_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get user data from GoogleAuth context (to be called from components)
   */
  private static getUserData(user: any): { email: string; googleId: string; name: string; photoURL: string } | null {
    if (!user) return null

    return {
      email: user.email || '',
      googleId: user.access_token || '', // Using access_token as googleId for now
      name: user.name || '',
      photoURL: user.picture || ''
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
   * Save or update a draft in Firestore (with multi-user support)
   */
  static async saveDraft(data: Partial<FirebaseDraftData>, imageFile?: File, user?: any): Promise<string> {
    try {
      // Saving draft to Firebase
      
      // Clean the formData to remove non-serializable objects like File and undefined values
      const cleanFormData = this.cleanObject({ ...data.formData }) as Record<string, unknown>
      if (cleanFormData && typeof cleanFormData === 'object' && cleanFormData.uploadedImage) {
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
      
      // Get user data for multi-user tracking
      const userData = user ? this.getUserData(user) : null
      const currentUserId = data.userId || userData?.email || 'anonymous'


      // Generate or use existing creative ID
      const creativeId = data.creativeId || this.generateCreativeId(cleanFormData)

      // Prepare base draft data (backward compatible)
      const baseDraftData = {
        creativeFilename: data.creativeFilename || 'Untitled',
        lastSaved: Timestamp.fromMillis(Date.now()),
        status: data.status || 'draft', // Default to draft for new system
        formData: cleanFormData || {},
        aiPopulatedFields: data.aiPopulatedFields || [],
        userId: currentUserId,
      }

      // NEW MULTI-USER STRUCTURE (only add if user data available)
      let multiUserData = {}
      if (userData) {
        multiUserData = {
          creativeId,
          createdBy: data.createdBy || userData, // Set creator on first save
          userDrafts: {
            ...(data.userDrafts || {}),
            [userData.email]: {
              formData: cleanFormData || {},
              lastSaved: Timestamp.fromMillis(Date.now())
            }
          },
          editHistory: [
            ...(data.editHistory || []),
            {
              name: userData.name,
              email: userData.email,
              action: data.id ? 'edited' : 'created',
              timestamp: Timestamp.fromMillis(Date.now()),
              details: data.id ? 'Updated draft' : 'Created new draft'
            }
          ],
          version: (data.version || 0) + 1
        }
      }

      // Combine base data with multi-user data
      const draftData = this.cleanObject({
        ...baseDraftData,
        ...multiUserData,
        // Preserve existing published version if exists
        publishedVersion: data.publishedVersion
      }) as Record<string, unknown>

      // Prepared draft data for Firebase

      // Handle image upload if provided (skip if storage permission issues)
      if (imageFile) {
        try {
          const imageData = await this.uploadImage(imageFile, (draftData.creativeFilename as string) || 'untitled')
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
          lastSaved: Timestamp.fromMillis(Date.now())
        })
        // Draft updated successfully
        return data.id
      } else {
        // Create new draft
        // Creating new draft document
        draftData.createdAt = Timestamp.fromMillis(Date.now())
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
   * Publish a creative (move from draft to published status)
   */
  static async publishCreative(draftId: string, user?: any): Promise<boolean> {
    try {
      const draftRef = doc(db, this.COLLECTION_NAME, draftId)
      const draftSnap = await getDoc(draftRef)

      if (!draftSnap.exists()) {
        throw new Error('Draft not found')
      }

      const draftData = draftSnap.data() as FirebaseDraftData
      const userData = user ? this.getUserData(user) : null

      if (!userData) {
        throw new Error('User information required for publishing')
      }

      // Create published version from current form data
      const publishedVersion = {
        formData: draftData.formData,
        publishedAt: Timestamp.fromMillis(Date.now()),
        publishedBy: {
          email: userData.email,
          name: userData.name
        }
      }

      // Update the creative with published status
      await updateDoc(draftRef, {
        status: 'published',
        publishedVersion,
        lastSaved: Timestamp.fromMillis(Date.now()),
        editHistory: [
          ...(draftData.editHistory || []),
          {
            name: userData.name,
            email: userData.email,
            action: 'published',
            timestamp: Timestamp.fromMillis(Date.now()),
            details: 'Published creative'
          }
        ],
        version: (draftData.version || 0) + 1
      })

      return true
    } catch (error) {
      console.error('Failed to publish creative:', error)
      throw new Error(`Failed to publish creative: ${error}`)
    }
  }

  /**
   * Get user's drafts for specific creative ID
   */
  static async getUserDraftsForCreative(creativeId: string, userEmail: string): Promise<FirebaseDraftData[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('creativeId', '==', creativeId)
      )

      const querySnapshot = await getDocs(q)
      const creatives: FirebaseDraftData[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseDraftData
        // Check if user has a draft for this creative
        if (data.userDrafts && data.userDrafts[userEmail]) {
          creatives.push({
            id: doc.id,
            ...data
          })
        }
      })

      return creatives
    } catch (error) {
      console.error('Failed to get user drafts for creative:', error)
      return []
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
   * Get all creatives for a user (drafts, saved, and published)
   */
  static async getAllDrafts(userId: string = 'anonymous'): Promise<FirebaseDraftData[]> {
    try {
      // Get all creatives for this user (drafts, saved, and published)
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId)
      )

      const querySnapshot = await getDocs(q)
      const drafts: FirebaseDraftData[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()

        // Include all statuses: draft, saved, published, or no status (legacy drafts)
        if (data.status === 'draft' || data.status === 'saved' || data.status === 'published' || !data.status) {
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
        lastSaved: Timestamp.fromMillis(Date.now())
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