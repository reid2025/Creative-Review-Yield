# Single Upload Page - Implementation Documentation

## Overview
The Single Upload page (`/upload/single`) is a comprehensive form for uploading and managing creative marketing materials with AI-powered analysis, performance tracking, and auto-save functionality.

## Current Implementation Status

### ✅ Completed Features

#### 1. **Image Upload System**
- **Drag & Drop Support**: React Dropzone integration for file selection
- **Image Preview**: Real-time preview with zoom functionality
- **Firebase Storage**: Images uploaded to `creative-images/{userId}/` path
- **URL Management**: Image URLs stored in Firestore for quick access

#### 2. **Form Management**
- **React Hook Form**: Complete form state management with validation
- **Zod Schema**: Type-safe validation for all form fields
- **Auto-save**: 30-second timer for draft saving
- **Draft System**: Automatic draft creation and updates

#### 3. **AI Integration**
- **Vertex AI (Gemini)**: Image analysis using Google's Gemini Pro Vision model
- **Auto-populate**: Two modes - "Fill Blanks" and "Overwrite All"
- **AI Field Tracking**: Visual indicators (AI tags) on AI-populated fields
- **Smart Suggestions**: Context-aware field suggestions based on image analysis

#### 4. **Performance History System**
- **History Tracking**: Complete replacement of individual cost fields with history array
- **Manual Entry**: Users can add performance metrics manually with date selection
- **Data Sources**: Tracks whether data is from manual entry or Google Sheets sync
- **Visualization Ready**: Data structure supports charts and trend analysis

#### 5. **Tag Management**
- **Dynamic Dropdowns**: All dropdown fields support adding new options
- **Firebase Integration**: Tags stored in centralized tag collection
- **Real-time Sync**: New tags immediately available across the application
- **Duplicate Prevention**: Smart detection of similar tags with review modal

#### 6. **Draft Management**
- **Auto-save Timer**: Visual countdown in UI (not console)
- **Firebase Drafts**: All drafts stored in Firestore, no localStorage dependency
- **Status Tracking**: Drafts marked as 'draft' or 'saved' status
- **Clean Data Structure**: Removed unnecessary fields (draftId, version, isActive, autoSaved)

## Data Structure

### Creative Document Schema
```typescript
interface CreativeData {
  // Core Fields
  id: string                          // Firebase document ID
  creativeFilename: string             // Main filename
  imageUrl?: string                    // Firebase Storage URL
  status: 'draft' | 'saved' | 'deleted'
  
  // Form Data
  formData: {
    // Metadata & Campaign Info
    designer?: string
    startDate?: string
    endDate?: string
    litigationName?: string
    campaignType?: string
    markedAsTopAd?: boolean
    optimizationValue?: boolean
    
    // Message & Targeting
    describeImage?: string
    targetingCallout?: string[]
    emotionalAppeal?: string[]
    
    // Headlines & CTA
    headlineText?: string
    headlineFontStyle?: string
    ctaButton?: string
    ctaButtonSubtext?: string
    
    // Copy & Conversion
    creativeCopy?: string[]
    urgencyDrivers?: string[]
    benefitsList?: string[]
    credibilityElements?: string[]
    
    // Additional
    layout?: string
    imageryType?: string[]
    icons?: string[]
    backgroundImagery?: string[]
    colors?: string[]
    notes?: string
  }
  
  // Performance History (Single Source of Truth)
  creativeHistory?: Array<{
    date: string
    cost: string                     // Total Spend
    costPerWebsiteLead: string       // Cost Per Lead
    costPerLinkClick: string         // Cost Per Click
    dataSource: 'manual' | 'google-sheets'
    syncedAt?: Timestamp
  }>
  
  // Tracking Fields
  aiPopulatedFields?: string[]        // Fields populated by AI
  userId: string                       // Owner ID
  createdAt: Timestamp
  lastSaved: Timestamp
  
  // Sync Fields (for Google Sheets)
  lastSyncedAt?: Timestamp
  syncSource?: 'google-sheets'
  syncKey?: string                     // Unique key for deduplication
}
```

## Key Implementation Details

### 1. **Form Field Categories**
The form is organized into collapsible sections for better UX:

```typescript
const formSections = [
  {
    title: "Metadata & Campaign Info",
    fields: ['designer', 'startDate', 'endDate', 'litigationName', 'campaignType', 'markedAsTopAd', 'optimizationValue']
  },
  {
    title: "Performance Metrics",
    component: PerformanceHistorySection // Custom component for history management
  },
  {
    title: "Message & Targeting Insights",
    fields: ['describeImage', 'targetingCallout', 'emotionalAppeal']
  },
  {
    title: "Headline & CTA Details",
    fields: ['headlineText', 'headlineFontStyle', 'ctaButton', 'ctaButtonSubtext']
  },
  {
    title: "Copy & Conversion Drivers",
    fields: ['creativeCopy', 'urgencyDrivers', 'benefitsList', 'credibilityElements']
  },
  {
    title: "Additional",
    fields: ['layout', 'imageryType', 'icons', 'backgroundImagery', 'colors', 'notes']
  }
]
```

### 2. **AI Auto-populate Workflow**

```typescript
// AI Analysis Process
const handleAIAutopopulate = async (mode: 'fill' | 'overwrite') => {
  // 1. Analyze image with Vertex AI
  const analysis = await analyzeImageWithAI(imageFile)
  
  // 2. Parse AI response for field suggestions
  const suggestions = parseAIResponse(analysis)
  
  // 3. Apply suggestions based on mode
  if (mode === 'fill') {
    // Only populate empty fields
    Object.keys(suggestions).forEach(field => {
      if (!form.getValues(field)) {
        form.setValue(field, suggestions[field])
        markFieldAsAI(field)
      }
    })
  } else {
    // Overwrite all fields with confirmation
    if (await confirmOverwrite()) {
      Object.keys(suggestions).forEach(field => {
        form.setValue(field, suggestions[field])
        markFieldAsAI(field)
      })
    }
  }
  
  // 4. Trigger auto-save
  performAutoSave()
}
```

### 3. **Performance History Management**

```typescript
// Adding Performance History Entry
const addPerformanceEntry = () => {
  const newEntry = {
    date: selectedDate,
    cost: form.getValues('tempCost'),
    costPerWebsiteLead: form.getValues('tempCPL'),
    costPerLinkClick: form.getValues('tempCPC'),
    dataSource: 'manual' as const
  }
  
  const currentHistory = form.getValues('performanceHistory') || []
  form.setValue('performanceHistory', [...currentHistory, newEntry])
  
  // Clear temporary fields
  clearTempFields()
}
```

### 4. **Auto-save System**

```typescript
// Auto-save Implementation
useEffect(() => {
  if (!hasChanges || !imageUploaded) return
  
  const timer = setTimeout(() => {
    performAutoSave()
  }, 30000) // 30 seconds
  
  return () => clearTimeout(timer)
}, [hasChanges, formData])

const performAutoSave = async () => {
  const draftData = {
    id: currentFirebaseDocId,
    creativeFilename: form.getValues('creativeFilename'),
    status: 'draft' as const,
    formData: form.getValues(),
    aiPopulatedFields: Array.from(aiFieldsSet)
  }
  
  const docId = await saveFirebaseDraft(draftData, uploadedImageFile)
  if (docId) {
    setCurrentFirebaseDocId(docId)
    setLastSaved(new Date())
    setHasChanges(false)
  }
}
```

### 5. **Error Handling**
All error scenarios are properly caught and logged:

```typescript
try {
  // Operation code
} catch (error) {
  console.error('Specific error context:', error)
  toast.error('User-friendly error message')
}
```

## Integration Points

### 1. **Firebase Services**
- **Firestore**: Document storage in 'creatives' collection
- **Storage**: Image files in 'creative-images' bucket
- **Authentication**: User context from AuthContext

### 2. **Google Sheets Sync**
- Shares the same `creativeHistory` structure
- Uses `syncKey` for deduplication
- Tracks `syncSource` and `lastSyncedAt`

### 3. **Preview Modal**
- Full creative preview with all fields
- Performance history visualization
- Edit capability from preview

### 4. **Draft System**
- Seamless integration with Drafts page
- Real-time updates via Firebase listeners
- Automatic cleanup on successful save

## Component Dependencies

### UI Components (shadcn/ui)
- Form controls (Input, Textarea, Select, etc.)
- Card layouts for sections
- Dialog/Modal for confirmations
- Toast notifications via Sonner

### Custom Components
- `FormDropdown`: Dynamic dropdown with add capability
- `CreativePreviewModal`: Full preview with history
- `CostHistoryTooltip`: Hover tooltip for metrics
- `CreativeHistoryViewer`: Chart visualization

### Hooks
- `useFirebaseDrafts`: Draft management
- `useTagOptions`: Tag synchronization
- `useAIFields`: AI field tracking
- `useAuth`: User authentication

## Recent Updates

### Removed Fields (Cleanup)
- ❌ `draftId` - No longer needed, using Firebase doc ID
- ❌ `version` - Not required for current implementation
- ❌ `imageStoragePath` - Only storing download URL
- ❌ `isActive` - Replaced with status-based filtering
- ❌ `autoSaved` - All saves tracked equally

### Performance Improvements
- Optimized re-renders with React.memo
- Debounced auto-save triggers
- Lazy loading for heavy components
- Efficient Firebase queries

## Testing Checklist

### ✅ Core Functionality
- [x] Image upload with preview
- [x] Form validation and submission
- [x] Auto-save every 30 seconds
- [x] Draft creation and updates
- [x] AI auto-populate (both modes)

### ✅ Performance History
- [x] Manual history entry
- [x] History display in form
- [x] Preview modal integration
- [x] Date-based sorting

### ✅ Error Handling
- [x] Proper error logging
- [x] User-friendly error messages
- [x] Graceful fallbacks
- [x] Network error handling

### ✅ Integration
- [x] Firebase save/load
- [x] Draft synchronization
- [x] Tag management
- [x] Preview functionality

## Known Limitations

1. **File Size**: Maximum 10MB for image uploads
2. **Image Formats**: Supports JPG, PNG, WebP only
3. **Browser Support**: Requires modern browsers with ES6+
4. **Concurrent Editing**: No real-time collaboration yet

## Future Enhancements

1. **Batch Operations**: Multiple image upload support
2. **Version History**: Track all changes with rollback
3. **Collaboration**: Real-time multi-user editing
4. **Advanced AI**: More sophisticated analysis models
5. **Performance Analytics**: Direct API integration for live metrics

## API Endpoints

### Current (Firebase)
```javascript
// All operations through Firebase SDK
FirebaseDraftService.saveDraft(data)
FirebaseDraftService.getDraft(id)
FirebaseDraftService.deleteDraft(id)
```

### Future (REST API)
```javascript
POST   /api/creatives          // Create creative
GET    /api/creatives/:id      // Get creative
PUT    /api/creatives/:id      // Update creative
DELETE /api/creatives/:id      // Delete creative
POST   /api/ai/analyze         // AI analysis
GET    /api/performance/:id    // Performance metrics
```

## Deployment Notes

### Environment Variables Required
```env
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_VERTEX_AI_PROJECT
NEXT_PUBLIC_VERTEX_AI_LOCATION
```

### Build Configuration
```javascript
// next.config.mjs
{
  eslint: {
    ignoreDuringBuilds: false  // Now passing all checks
  },
  typescript: {
    ignoreBuildErrors: false   // Type-safe build
  }
}
```

## Support & Maintenance

### Common Issues & Solutions

1. **Auto-save not triggering**
   - Check if image is uploaded
   - Verify form has changes
   - Check browser console for errors

2. **AI analysis failing**
   - Verify Vertex AI credentials
   - Check image format compatibility
   - Review API quotas

3. **Performance history not saving**
   - Ensure proper date format
   - Check Firebase permissions
   - Verify data structure

### Debug Commands
```javascript
// Check current form state
console.log(form.getValues())

// Check Firebase connection
FirebaseDraftService.testConnection()

// View current draft data
console.log(currentFirebaseDocId, formData)
```

---

Last Updated: November 2024
Version: 2.0.0