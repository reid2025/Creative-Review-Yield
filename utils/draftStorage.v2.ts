export interface DraftDataV2 {
  draftId: string
  creativeFilename: string
  lastSaved: string
  autoSaved?: boolean
  formData: any
  imageUrl?: string
}

export class DraftStorageV2 {
  private static readonly DRAFT_PREFIX = 'single-upload-draft-'
  private static readonly V2_PREFIX = 'draft-v2-'
  
  static saveDraft(data: Partial<DraftDataV2>): string {
    const draftId = data.draftId || this.generateDraftId()
    const draftData: DraftDataV2 = {
      draftId,
      creativeFilename: data.creativeFilename || 'Untitled',
      lastSaved: new Date().toISOString(),
      autoSaved: data.autoSaved || false,
      formData: data.formData || {},
      imageUrl: data.imageUrl
    }
    
    const key = `${this.V2_PREFIX}${draftId}`
    localStorage.setItem(key, JSON.stringify(draftData))
    return draftId
  }
  
  static getDraft(draftId: string): DraftDataV2 | null {
    const key = `${this.V2_PREFIX}${draftId}`
    const data = localStorage.getItem(key)
    if (data) {
      return JSON.parse(data)
    }
    
    // Check for legacy format
    const legacyData = this.getLegacyDraft(draftId)
    if (legacyData) {
      return legacyData
    }
    
    return null
  }
  
  static getAllDrafts(): DraftDataV2[] {
    const drafts: DraftDataV2[] = []
    
    // Get V2 drafts
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.V2_PREFIX)) {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            drafts.push(JSON.parse(data))
          } catch (e) {
            console.error('Failed to parse draft:', key, e)
          }
        }
      }
    }
    
    // Get legacy drafts
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.DRAFT_PREFIX) && !key.startsWith(this.V2_PREFIX)) {
        const legacyDraft = this.getLegacyDraftByKey(key)
        if (legacyDraft && !drafts.some(d => d.creativeFilename === legacyDraft.creativeFilename)) {
          drafts.push(legacyDraft)
        }
      }
    }
    
    return drafts
  }
  
  static deleteDraft(draftId: string): boolean {
    // Try V2 format first
    const v2Key = `${this.V2_PREFIX}${draftId}`
    if (localStorage.getItem(v2Key)) {
      localStorage.removeItem(v2Key)
      return true
    }
    
    // Try legacy format
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.DRAFT_PREFIX)) {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            const parsed = JSON.parse(data)
            if (parsed.creativeFilename === draftId || key === `${this.DRAFT_PREFIX}${draftId}`) {
              localStorage.removeItem(key)
              return true
            }
          } catch (e) {
            // Try direct match
            if (key === `${this.DRAFT_PREFIX}${draftId}`) {
              localStorage.removeItem(key)
              return true
            }
          }
        }
      }
    }
    
    return false
  }
  
  static migrateFromV1(): void {
    const migrated: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.DRAFT_PREFIX) && !key.startsWith(this.V2_PREFIX)) {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            const parsed = JSON.parse(data)
            const filename = key.replace(this.DRAFT_PREFIX, '')
            
            // Create V2 draft
            const v2Draft: DraftDataV2 = {
              draftId: this.generateDraftId(),
              creativeFilename: parsed.creativeFilename || filename,
              lastSaved: parsed.savedAt || new Date().toISOString(),
              autoSaved: parsed.autoSaved || false,
              formData: parsed,
              imageUrl: undefined // Legacy format didn't store image URLs
            }
            
            // Save as V2
            const v2Key = `${this.V2_PREFIX}${v2Draft.draftId}`
            localStorage.setItem(v2Key, JSON.stringify(v2Draft))
            migrated.push(key)
          } catch (e) {
            console.error('Failed to migrate draft:', key, e)
          }
        }
      }
    }
    
    // Remove migrated legacy drafts
    migrated.forEach(key => {
      localStorage.removeItem(key)
    })
    
    if (migrated.length > 0) {
      console.log(`Migrated ${migrated.length} drafts to V2 format`)
    }
  }
  
  private static getLegacyDraft(filename: string): DraftDataV2 | null {
    const key = `${this.DRAFT_PREFIX}${filename}`
    const data = localStorage.getItem(key)
    if (data) {
      try {
        const parsed = JSON.parse(data)
        return {
          draftId: filename,
          creativeFilename: parsed.creativeFilename || filename,
          lastSaved: parsed.savedAt || new Date().toISOString(),
          autoSaved: parsed.autoSaved || false,
          formData: parsed,
          imageUrl: undefined
        }
      } catch (e) {
        console.error('Failed to parse legacy draft:', key, e)
      }
    }
    return null
  }
  
  private static getLegacyDraftByKey(key: string): DraftDataV2 | null {
    const data = localStorage.getItem(key)
    if (data) {
      try {
        const parsed = JSON.parse(data)
        const filename = key.replace(this.DRAFT_PREFIX, '')
        return {
          draftId: filename,
          creativeFilename: parsed.creativeFilename || filename,
          lastSaved: parsed.savedAt || new Date().toISOString(),
          autoSaved: parsed.autoSaved || false,
          formData: parsed,
          imageUrl: undefined
        }
      } catch (e) {
        console.error('Failed to parse legacy draft:', key, e)
      }
    }
    return null
  }
  
  private static generateDraftId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}