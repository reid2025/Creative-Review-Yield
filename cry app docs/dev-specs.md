# Developer Implementation Guide - Page by Page Specifications

## Project Overview
**Legal Marketing Creative Tracker** - A comprehensive system for tracking, analyzing, and strategizing creative marketing campaigns with AI-powered insights and performance analytics.

---

## Page 1: Authentication System

### **Technical Requirements**
- **Framework**: Firebase Authentication (already implemented)
- **Protected Routes**: All pages require authentication
- **Session Management**: Auto-logout after inactivity
- **Security**: Password requirements, optional 2FA

### **Pages Needed**
1. **Sign In Page**
2. **Sign Up Page** 
3. **Password Reset Page**

### **Layout & UI**
- **Layout Type**: Centered form with branding
- **Components**: 
  - Email/password input fields
  - Submit buttons with loading states
  - Error message displays
  - "Remember me" checkbox
  - Social auth buttons (optional)

### **Testing Requirements**
```javascript
// Authentication Test Cases
describe('Authentication System', () => {
  test('Valid login redirects to dashboard', () => {
    // Test successful login flow
  });
  
  test('Invalid credentials show error message', () => {
    // Test error handling
  });
  
  test('Protected routes redirect to login when not authenticated', () => {
    // Test route protection
  });
  
  test('Session expires after inactivity period', () => {
    // Test auto-logout
  });
});
```

### **Expected Behavior**
- Successful login → Redirect to Dashboard
- Failed login → Show error message, stay on login
- Session timeout → Redirect to login with message
- All other pages → Redirect to login if not authenticated

---

## Page 2: Dashboard Page

### **Technical Requirements**
- **Layout Type**: Grid-based dashboard with widgets
- **Real-time Updates**: Live activity feed, performance metrics
- **Responsive Design**: Mobile-friendly widget stacking
- **API Integration**: Ready for live performance data

### **Layout Structure**
```
[Header: Welcome + Quick Actions]
[Row 1: 4 Metric Cards - Equal Width]
[Row 2: Left: Activity Feed (60%) | Right: Tag Trends (40%)]
[Row 3: Left: Team Vibes (70%) | Right: Quick Actions (30%)]
```

### **Components Breakdown**

#### **Top Metrics Cards (4-card layout)**
```javascript
const MetricCard = {
  layout: 'card',
  size: 'equal-width-4',
  content: {
    title: 'Total Creatives',
    value: '128',
    change: '+12% vs last month',
    icon: 'trending-up'
  }
}
```

#### **Activity Feed (Table/List Hybrid)**
```javascript
const ActivityFeed = {
  layout: 'scrollable-list',
  maxHeight: '400px',
  itemStructure: {
    avatar: 'user-photo',
    content: 'action-description',
    timestamp: 'relative-time',
    actionButton: 'view-details'
  }
}
```

#### **Tag Trends (Chart)**
```javascript
const TagTrends = {
  layout: 'chart-widget',
  chartType: 'line-chart',
  data: 'tag-performance-over-time',
  filters: ['campaign-type', 'date-range']
}
```

#### **Team Vibes Section**
```javascript
const TeamVibes = {
  layout: 'flexible-content-area',
  components: [
    'daily-note-input',
    'gif-upload-area',
    'quote-of-day',
    'mood-emoji-selector'
  ]
}
```

### **Testing Requirements**
```javascript
describe('Dashboard Page', () => {
  test('All metric cards load with correct data', () => {
    // Verify 4 cards render with proper metrics
  });
  
  test('Activity feed shows recent team actions', () => {
    // Mock activity data and verify display
  });
  
  test('Real-time updates work without page refresh', () => {
    // Test WebSocket/polling for live updates
  });
  
  test('Quick actions navigate to correct pages', () => {
    // Test all dashboard buttons and links
  });
  
  test('Responsive layout adapts to mobile', () => {
    // Test mobile responsive behavior
  });
});
```

### **API Endpoints Needed**
```javascript
// Dashboard API Requirements
GET /api/dashboard/metrics          // Top 4 metrics
GET /api/dashboard/activity         // Recent activity feed
GET /api/dashboard/tag-trends       // Tag performance data
POST /api/dashboard/daily-note      // Save daily team note
POST /api/dashboard/upload-gif      // Team motivation GIF
```

### **Expected Behavior**
- Page loads in <2 seconds with skeleton loaders
- Real-time activity updates every 30 seconds
- Metric cards show percentage changes with color coding
- Activity feed scrollable with "load more" functionality
- All quick action buttons navigate correctly
- Mobile responsive with stacked layout

---

## Page 3: Single Upload Page

### **Technical Requirements**
- **URL Structure**: `/upload-image` → `/upload-image/[timestamp]` after upload
- **Real-time Features**: 30-second auto-save timer, live countdown in console
- **AI Integration**: Auto-populate functionality with tag management
- **Form Validation**: Required field validation, spell check
- **File Upload**: Image upload with zoom functionality

### **Layout Structure**
```
[Left: Image Display (40%) | Right: Form Fields (60%)]
└── Image Section:
    ├── Upload area (drag & drop)
    ├── Image preview with zoom controls
    └── Zoom always available during form completion
    
└── Form Section:
    ├── Metadata & Campaign Info (collapsible)
    ├── Performance Metrics (collapsible)
    ├── Message & Targeting Insights (collapsible)
    ├── Headline & CTA Details (collapsible)
    ├── Copy & Conversion Drivers (collapsible)
    └── Additional (collapsible)
```

### **Form Field Components**

#### **Field Categories Layout**
```javascript
const FormSection = {
  layout: 'collapsible-sections',
  sections: [
    {
      title: 'Metadata & Campaign Info',
      fields: [
        { name: 'image', type: 'file-upload' },
        { name: 'date_added', type: 'date', auto: true },
        { name: 'designer', type: 'single-dropdown-add' },
        { name: 'start_date', type: 'date', required: true },
        { name: 'end_date', type: 'date', required: true },
        { name: 'creative_filename', type: 'text', required: true },
        { name: 'litigation_name', type: 'single-dropdown-add', required: true },
        { name: 'campaign_type', type: 'single-dropdown-add', required: true },
        { name: 'marked_top_ad', type: 'switch' },
        { name: 'optimization', type: 'switch' }
      ]
    }
    // ... other sections
  ]
}
```

#### **Auto-Save System**
```javascript
const AutoSaveSystem = {
  triggers: [
    'image-upload-complete + 30-seconds-inactivity',
    'any-field-change + 30-seconds-inactivity',
    'ai-autopopulate + 30-seconds-inactivity'
  ],
  behavior: {
    firstSave: 'create-new-draft',
    subsequentSaves: 'update-existing-draft',
    console: 'show-countdown-timer'
  }
}
```

#### **AI Auto-populate Components**
```javascript
const AIAutopopulate = {
  buttons: ['fill-blank-fields', 'overwrite-fields'],
  workflow: {
    analyzeImage: 'extract-visual-and-text-data',
    matchTags: 'compare-with-existing-glossary',
    showReview: 'similar-tags-found',
    applyTags: 'add-ai-tag-pills'
  }
}
```

### **Testing Requirements**
```javascript
describe('Single Upload Page', () => {
  // Image Upload Tests
  test('Image upload updates URL with timestamp', () => {
    // Verify URL changes to /upload-image/[timestamp]
  });
  
  test('Zoom controls work during form completion', () => {
    // Test zoom in/out functionality
  });
  
  // Auto-save Tests
  test('Auto-save triggers after 30 seconds of inactivity', () => {
    jest.useFakeTimers();
    // Upload image, wait 30 seconds, verify draft created
  });
  
  test('Console shows countdown timer', () => {
    // Verify console.log countdown appears
  });
  
  test('Subsequent changes update existing draft', () => {
    // Verify no duplicate drafts created
  });
  
  // AI Auto-populate Tests
  test('Fill blank fields only populates empty fields', () => {
    // Pre-fill some fields, run AI, verify only empty ones change
  });
  
  test('Overwrite shows confirmation modal', () => {
    // Test confirmation modal appears and functions
  });
  
  test('Similar tag detection shows review modal', () => {
    // Mock AI suggestion similar to existing tag
  });
  
  test('AI tag pills appear on AI-populated fields', () => {
    // Verify visual indicators for AI suggestions
  });
  
  // Form Validation Tests
  test('Submit buttons disabled until required fields filled', () => {
    // Test 9 required fields validation
  });
  
  test('Spell check suggests corrections', () => {
    // Test spell check on text fields
  });
  
  // Draft Management Tests
  test('Draft appears in Drafts page after auto-save', () => {
    // Cross-page verification
  });
  
  test('Draft removed after successful upload', () => {
    // Verify draft cleanup
  });
});
```

### **API Endpoints Needed**
```javascript
POST /api/upload/image              // Image upload
POST /api/drafts/create             // Create draft
PUT /api/drafts/{id}                // Update draft
POST /api/ai/analyze-image          // AI analysis
GET /api/tags/glossary              // Tag glossary data
POST /api/tags/add                  // Add new tag
POST /api/upload/complete           // Final upload
DELETE /api/drafts/{id}             // Remove draft after upload
```

### **Expected Behavior**
- Image upload → URL changes → 30-second timer starts
- Console shows live countdown
- Auto-save creates draft → appears in Drafts page
- AI analysis → smart tag matching → review modals when needed
- Form validation prevents submission until complete
- Successful upload → draft removed → success notification

---

## Page 4: Drafts Page

### **Technical Requirements**
- **Layout Type**: Card-based grid layout
- **Real-time Sync**: Updates when Single Upload drafts change
- **Cross-tab Detection**: Prevent multiple tabs editing same draft
- **Filtering**: Search and filter drafts by date, user, etc.

### **Layout Structure**
```
[Header: Search + Filters]
[Grid: Draft Cards (3-4 per row)]
└── Each Draft Card:
    ├── Thumbnail image
    ├── Creative filename
    ├── Last updated timestamp
    ├── Progress indicator (fields completed)
    └── Action buttons (Continue, Delete)
```

### **Draft Card Component**
```javascript
const DraftCard = {
  layout: 'card-with-thumbnail',
  structure: {
    thumbnail: 'uploaded-image-preview',
    header: 'creative-filename',
    metadata: [
      'last-updated-timestamp',
      'created-by-user',
      'completion-percentage'
    ],
    actions: ['continue-editing', 'delete-draft'],
    status: 'progress-bar'
  }
}
```

### **Multi-tab Conflict Prevention**
```javascript
const TabConflictSystem = {
  detection: 'track-active-draft-sessions',
  warning: 'modal-alert-when-conflict-detected',
  message: 'This draft is already open in another tab',
  resolution: 'close-other-tab-to-continue'
}
```

### **Testing Requirements**
```javascript
describe('Drafts Page', () => {
  test('Drafts appear after Single Upload auto-save', () => {
    // Create draft in Single Upload, verify appears here
  });
  
  test('Real-time updates when drafts change', () => {
    // Update draft in another tab, verify changes appear
  });
  
  test('Multi-tab conflict prevention works', () => {
    // Open same draft in multiple tabs, verify warning
  });
  
  test('Draft deletion removes from page and system', () => {
    // Delete draft, verify cleanup
  });
  
  test('Continue editing redirects to correct URL', () => {
    // Click continue, verify proper timestamp URL
  });
  
  test('Search and filtering work correctly', () => {
    // Test search functionality
  });
  
  test('Draft cards show correct completion percentage', () => {
    // Verify progress calculation
  });
});
```

### **API Endpoints Needed**
```javascript
GET /api/drafts                     // List all drafts
GET /api/drafts/{id}                // Get specific draft
DELETE /api/drafts/{id}             // Delete draft
PUT /api/drafts/{id}/status         // Update draft status
GET /api/drafts/check-active/{id}   // Check if draft active in other session
```

### **Expected Behavior**
- Real-time sync with Single Upload page
- Multi-tab conflict detection and prevention
- Search/filter functionality with instant results
- Progress indicators show completion percentage
- Continue editing opens correct Single Upload URL
- Delete confirmation with immediate UI update

---

## Page 5: Creatives Page

### **Technical Requirements**
- **Dual Tab System**: Table View + Visual Grid View
- **Advanced Filtering**: Different filters per tab
- **Multi-select**: Persistent selection across tabs
- **Strategy Sync Integration**: Seamless creative selection
- **Export Functionality**: CSV/Excel export capabilities

### **Layout Structure**
```
[Header: Tab Switcher (Table | Visual)]
[Filter Bar: Context-aware filters per tab]
[Selection Bar: Appears when items selected]
[Content Area: Table or Grid based on active tab]
[Floating Action: "Analyze in Strategy Sync" when 3+ selected]
```

### **Tab 1: Table View**
```javascript
const TableView = {
  layout: 'data-table-with-pagination',
  columns: [
    'checkbox', 'thumbnail', 'creative_filename', 
    'litigation_name', 'campaign_type', 'designer',
    'start_date', 'amount_spent', 'cost_per_click',
    'cost_per_lead', 'marked_top_ad', 'actions'
  ],
  features: [
    'sortable-columns',
    'multi-select-checkboxes',
    'bulk-actions',
    'pagination',
    'export-functionality'
  ]
}
```

### **Tab 2: Visual Grid View**
```javascript
const VisualGrid = {
  layout: 'pinterest-masonry-grid',
  cardStructure: {
    image: 'creative-thumbnail',
    overlay: 'selection-checkbox',
    metadata: 'hover-overlay-with-key-info',
    actions: 'quick-action-buttons'
  },
  features: [
    'infinite-scroll',
    'hover-effects',
    'batch-selection',
    'visual-filters'
  ]
}
```

### **Filter System**
```javascript
const FilterSystem = {
  tableFilters: [
    'date-range', 'performance-metrics', 'campaign-data',
    'copy-messaging', 'text-search', 'conversion-elements'
  ],
  visualFilters: [
    'creative-layout-type', 'imagery-type', 'imagery-background',
    'icons-used', 'client-branding', 'cta-elements'
  ],
  persistence: 'maintain-across-tab-switches'
}
```

### **Multi-select System**
```javascript
const MultiSelectSystem = {
  behavior: {
    tableView: 'checkbox-selection-with-shift-click',
    visualView: 'checkbox-overlay-on-hover',
    persistence: 'maintain-selection-across-tabs',
    conflicts: 'smart-filter-translation-between-tabs'
  },
  actionBar: {
    trigger: 'appears-when-3-plus-selected',
    actions: ['strategy-sync', 'bulk-edit', 'export', 'clear-selection']
  }
}
```

### **Testing Requirements**
```javascript
describe('Creatives Page', () => {
  // Tab System Tests
  test('Tab switching maintains filter state when compatible', () => {
    // Apply filters, switch tabs, verify appropriate filters maintained
  });
  
  test('Incompatible filters show warning when switching tabs', () => {
    // Apply table-only filter, switch to visual, verify warning
  });
  
  // Selection System Tests
  test('Multi-select works in both views', () => {
    // Test checkbox selection in table and visual views
  });
  
  test('Selection persists across tab switches', () => {
    // Select items, switch tabs, verify selection maintained
  });
  
  test('Action bar appears with 3+ selections', () => {
    // Select items, verify floating action bar appears
  });
  
  // Table View Tests
  test('Table sorting works on all columns', () => {
    // Test column sorting functionality
  });
  
  test('Pagination works correctly', () => {
    // Test page navigation and item counts
  });
  
  test('Export functionality generates correct files', () => {
    // Test CSV/Excel export
  });
  
  // Visual Grid Tests
  test('Masonry layout displays correctly', () => {
    // Test responsive grid layout
  });
  
  test('Hover effects show metadata overlay', () => {
    // Test hover interactions
  });
  
  test('Infinite scroll loads more items', () => {
    // Test lazy loading
  });
  
  // Strategy Sync Integration Tests
  test('Strategy Sync button redirects with selection', () => {
    // Select creatives, click analyze, verify redirect with data
  });
});
```

### **API Endpoints Needed**
```javascript
GET /api/creatives                  // List creatives with filters
GET /api/creatives/filters          // Available filter options
POST /api/creatives/export          // Export selected creatives
GET /api/creatives/search           // Search functionality
POST /api/strategy-sync/create      // Create Strategy Sync with selection
```

### **Expected Behavior**
- Smooth tab switching with appropriate filter translation
- Multi-select persistence across all interactions
- Real-time filter application without page reload
- Export downloads start immediately
- Strategy Sync integration maintains creative context
- Responsive design works on all screen sizes

---

## Page 6: Strategy Sync Page

### **Technical Requirements**
- **AI Analysis Engine**: Image analysis and pattern recognition
- **Multi-level Analytics**: Campaign type + litigation specific insights
- **Collaboration Features**: Comments, takeaway saving
- **Export Functionality**: Custom PDF generation
- **Real-time Processing**: Live analysis progress indicators

### **Layout Structure**
```
[Header: Selected Creatives Summary]
[Left Sidebar: Creative Thumbnails (20%)]
[Main Content: Analysis Results (80%)]
└── Analysis Sections:
    ├── General AI Insights
    ├── Context-Aware Trends
    ├── Performance Recommendations
    └── User Takeaways Section
```

### **Creative Selection Display**
```javascript
const CreativeSelection = {
  layout: 'thumbnail-grid-with-metadata',
  display: {
    thumbnails: 'selected-creative-images',
    metadata: 'litigation-name-campaign-type',
    summary: 'context-distribution-percentages'
  }
}
```

### **AI Analysis Sections**
```javascript
const AnalysisResults = {
  sections: [
    {
      title: 'Pattern Recognition Analysis',
      content: 'common-visual-elements-messaging-patterns'
    },
    {
      title: 'Campaign Type Level Insights', 
      content: 'broad-category-performance-insights'
    },
    {
      title: 'Litigation-Specific Analysis',
      content: 'granular-location-context-insights'
    },
    {
      title: 'Cross-Litigation Opportunities',
      content: 'successful-element-testing-suggestions'
    },
    {
      title: 'Optimization Recommendations',
      content: 'ab-testing-suggestions-performance-improvements'
    }
  ]
}
```

### **Takeaway Management**
```javascript
const TakeawaySystem = {
  input: 'rich-text-editor-for-user-notes',
  saving: {
    includes: [
      'selected-creatives-used',
      'ai-generated-insights', 
      'user-takeaways-notes',
      'current-metrics-snapshot',
      'timestamp-user-attribution'
    ]
  },
  collaboration: 'comment-system-on-saved-takeaways'
}
```

### **Testing Requirements**
```javascript
describe('Strategy Sync Page', () => {
  // Creative Selection Tests
  test('Displays selected creatives correctly', () => {
    // Verify selected creatives from Creatives page appear
  });
  
  test('Shows context distribution percentages', () => {
    // Verify campaign type/litigation breakdown
  });
  
  // AI Analysis Tests  
  test('AI analysis processes selected creatives', () => {
    // Mock AI service, verify analysis generation
  });
  
  test('Context-aware insights based on litigation types', () => {
    // Test multi-level analytics generation
  });
  
  test('Performance recommendations include specific suggestions', () => {
    // Verify actionable recommendations generated
  });
  
  // Takeaway System Tests
  test('User can add and save takeaways', () => {
    // Test takeaway creation and saving
  });
  
  test('Saved takeaway includes all required data', () => {
    // Verify complete data package saved
  });
  
  test('Takeaway appears in Takeaway History', () => {
    // Cross-page verification
  });
  
  // Export Tests
  test('PDF export generates correctly', () => {
    // Test custom PDF generation
  });
  
  test('PDF includes all analysis sections', () => {
    // Verify complete PDF content
  });
});
```

### **API Endpoints Needed**
```javascript
POST /api/strategy-sync/analyze          // AI analysis of creatives
GET /api/strategy-sync/context/{types}   // Context-aware insights
POST /api/takeaways/save                 // Save takeaway
POST /api/strategy-sync/export-pdf       // Generate PDF
GET /api/performance/context-trends      // Multi-level analytics
```

### **Expected Behavior**
- Analysis processing with real-time progress indicators
- Comprehensive multi-level insights generation
- Smooth takeaway creation and saving workflow
- Immediate availability in Takeaway History
- Professional PDF export with custom branding
- All data properly attributed and timestamped

---

## Page 7: Takeaway History Page

### **Technical Requirements**
- **Multiple View Modes**: Timeline, Campaign, Performance views
- **Advanced Search**: Full-text search across all takeaway content
- **Collaboration**: Comment system with @mentions
- **Performance Tracking**: Implementation status and ROI measurement
- **Organization**: Favorites, archiving, bulk operations

### **Layout Structure**
```
[Header: View Mode Tabs + Search Bar]
[Filter Sidebar (25%) | Main Content (75%)]
└── Main Content Views:
    ├── Timeline View: Chronological cards
    ├── Campaign View: Grouped by campaign
    └── Performance View: Sorted by impact
```

### **Takeaway Card Layout**
```javascript
const TakeawayCard = {
  layout: 'expandable-card',
  structure: {
    header: {
      title: 'takeaway-title',
      metadata: 'date-creator-status',
      actions: 'favorite-archive-export'
    },
    preview: {
      creativeThumbnails: 'selected-creatives-grid',
      keyInsights: 'top-3-ai-insights-condensed',
      userNotes: 'takeaway-preview-text'
    },
    expanded: {
      fullAnalysis: 'complete-ai-insights',
      userTakeaways: 'full-user-notes',
      comments: 'comment-thread',
      implementation: 'status-and-results'
    }
  }
}
```

### **View Mode Implementations**
```javascript
const ViewModes = {
  timeline: {
    layout: 'chronological-cards',
    sorting: 'most-recent-first',
    grouping: 'by-month-separators'
  },
  campaign: {
    layout: 'grouped-sections',
    grouping: 'by-litigation-name-campaign-type',
    sorting: 'by-date-within-groups'
  },
  performance: {
    layout: 'sorted-cards',
    sorting: 'by-implementation-success-rate',
    indicators: 'roi-impact-badges'
  }
}
```

### **Search & Filter System**
```javascript
const SearchSystem = {
  fullTextSearch: [
    'takeaway-titles',
    'ai-insights-content',
    'user-notes',
    'comments'
  ],
  filters: [
    'date-range',
    'creator-user',
    'campaign-litigation',
    'implementation-status',
    'performance-impact'
  ],
  advanced: {
    tags: 'custom-takeaway-tags',
    favorites: 'starred-takeaways-only',
    archived: 'include-exclude-archived'
  }
}
```

### **Collaboration Features**
```javascript
const CollaborationSystem = {
  comments: {
    threading: 'nested-comment-responses',
    mentions: '@username-notification-system',
    editing: 'edit-delete-own-comments'
  },
  statusUpdates: {
    implementation: 'not-started-in-progress-completed',
    results: 'performance-data-before-after',
    roi: 'impact-measurement-tracking'
  }
}
```

### **Testing Requirements**
```javascript
describe('Takeaway History Page', () => {
  // View Mode Tests
  test('Timeline view shows chronological order', () => {
    // Verify proper date-based sorting
  });
  
  test('Campaign view groups by litigation/campaign type', () => {
    // Test grouping functionality
  });
  
  test('Performance view sorts by impact', () => {
    // Test ROI-based sorting
  });
  
  // Search & Filter Tests
  test('Full-text search works across all content', () => {
    // Test search functionality
  });
  
  test('Filters work individually and in combination', () => {
    // Test filter combinations
  });
  
  test('Advanced filters provide precise results', () => {
    // Test tag, favorite, archived filters
  });
  
  // Collaboration Tests
  test('Comment system works with threading', () => {
    // Test comment creation and responses
  });
  
  test('@mentions send notifications', () => {
    // Test mention notification system
  });
  
  test('Implementation status updates correctly', () => {
    // Test status change functionality
  });
  
  // Organization Tests
  test('Favorites system works correctly', () => {
    // Test starring/unstarring
  });
  
  test('Archive functionality hides items appropriately', () => {
    // Test archiving behavior
  });
  
  test('Bulk operations work on multiple selections', () => {
    // Test mass operations
  });
  
  // Performance Tracking Tests
  test('ROI measurement displays correctly', () => {
    // Test performance tracking
  });
  
  test('Implementation results are tracked accurately', () => {
    // Test results recording
  });
});
```

### **API Endpoints Needed**
```javascript
GET /api/takeaways                  // List takeaways with filters
GET /api/takeaways/search           // Full-text search
POST /api/takeaways/comment         // Add comment
PUT /api/takeaways/{id}/status      // Update implementation status
POST /api/takeaways/favorite        // Toggle favorite
POST /api/takeaways/archive         // Archive takeaway
POST /api/takeaways/bulk-action     // Bulk operations
GET /api/takeaways/performance      // Performance analytics
```

### **Expected Behavior**
- Fast search results with highlighting
- Smooth view mode transitions
- Real-time collaboration updates
- Performance tracking with visual indicators
- Bulk operations with progress feedback
- Export functionality for reporting

---

## Page 8: Tag Glossary Page

### **Technical Requirements**
- **Hierarchical Analytics**: Campaign type → Litigation level performance
- **CRUD Operations**: Create, Read, Update, Delete tags with safeguards
- **Performance Matrix**: Multi-dimensional tag effectiveness display
- **Creative Association**: Click tag → view all associated creatives
- **Permission System**: Role-based tag management access

### **Layout Structure**
```
[Header: Analytics Dashboard Toggle + Search]
[Left Sidebar: Tag Categories (30%) | Main Content: Tag List/Analytics (70%)]
└── Main Content Modes:
    ├── Tag List Mode: Hierarchical tag display
    ├── Analytics Mode: Performance matrices
    └── Creative View Mode: Creatives using selected tag
```

### **Tag Display Component**
```javascript
const TagDisplay = {
  layout: 'hierarchical-categories',
  structure: {
    category: 'field-type-grouping',
    tagList: {
      name: 'tag-name',
      usage: 'creative-count',
      performance: 'performance-indicators',
      source: 'ai-generated-or-manual',
      actions: 'edit-delete-view-creatives'
    }
  }
}
```

### **Performance Analytics Display**
```javascript
const PerformanceMatrix = {
  levels: {
    campaignType: {
      layout: 'heatmap-table',
      rows: 'tags',
      columns: 'campaign-types',
      values: 'performance-percentages'
    },
    litigation: {
      layout: 'drill-down-table',
      grouping: 'by-campaign-type',
      subRows: 'litigation-specific-performance'
    }
  }
}
```

### **Tag Management System**
```javascript
const TagManagement = {
  create: {
    form: 'tag-name-category-selection',
    validation: 'no-duplicates-proper-format'
  },
  update: {
    inlineEdit: 'click-to-edit-tag-name',
    impact: 'show-affected-creatives-count',
    confirmation: 'confirm-changes-to-x-creatives'
  },
  delete: {
    safeguards: 'check-usage-before-delete',
    replacement: 'suggest-alternative-tags',
    options: ['replace-with-alternative', 'remove-entirely']
  }
}
```

### **Creative Association View**
```javascript
const CreativeAssociation = {
  trigger: 'click-tag-to-view-creatives',
  layout: 'grid-with-filters',
  display: {
    thumbnails: 'creative-images',
    metadata: 'filename-campaign-performance',
    filters: 'date-range-performance-litigation'
  },
  actions: ['select-for-strategy-sync', 'view-details', 'edit-tags']
}
```

### **Testing Requirements**
```javascript
describe('Tag Glossary Page', () => {
  // Tag Display Tests
  test('Tags grouped by field categories correctly', () => {
    // Verify proper categorization
  });
  
  test('Tag usage counts are accurate', () => {
    // Test creative count accuracy
  });
  
  test('Performance indicators display correctly', () => {
    // Test performance visualization
  });
  
  // Analytics Tests
  test('Campaign type performance matrix displays correctly', () => {
    // Test heatmap functionality
  });
  
  test('Litigation-level drill-down works', () => {
    // Test hierarchical navigation
  });
  
  test('Performance data updates with new creative data', () => {
    // Test real-time analytics updates
  });
  
  // CRUD Operations Tests
  test('Tag creation works with validation', () => {
    // Test tag creation flow
  });
  
  test('Tag editing updates all associated creatives', () => {
    // Test edit impact
  });
  
  test('Tag deletion shows replacement options', () => {
    // Test deletion workflow
  });
  
  test('Permission system prevents unauthorized actions', () => {
    // Test role-based access
  });
  
  // Creative Association Tests
  test('Clicking tag shows associated creatives', () => {
    // Test creative view functionality
  });
  
  test('Creative filters work correctly', () => {
    // Test filtering in creative view
  });
  
  test('Strategy Sync integration works from tag view', () => {
    // Test workflow integration
  });
});
```

### **API Endpoints Needed**
```javascript
GET /api/tags                       // List all tags with usage
GET /api/tags/performance           // Performance analytics data
GET /api/tags/{id}/creatives        // Creatives using specific tag
POST /api/tags                      // Create new tag
PUT /api/tags/{id}                  // Update tag
DELETE /api/tags/{id}               // Delete tag (with replacement options)
GET /api/tags/analytics/matrix      // Performance matrix data
POST /api/tags/bulk-operations      // Bulk tag operations
```

### **Expected Behavior**
- Real-time performance updates as new creative data comes in
- Smooth transitions between list and analytics views
- Permission-based UI hiding/showing of edit controls
- Intelligent tag deletion with replacement suggestions
- Fast creative association loading with proper filtering
- Export capabilities for analytics data

---

## Page 9: User Profile Page

### **Technical Requirements**
- **Profile Management**: Photo upload, personal info editing
- **Security Settings**: Password change, 2FA, session management
- **Notification Preferences**: Granular notification controls
- **Dashboard Customization**: Personal dashboard preferences
- **Activity Tracking**: User activity history and statistics

### **Layout Structure**
```
[Left Sidebar: Profile Navigation (25%) | Main Content: Setting Sections (75%)]
└── Navigation Sections:
    ├── Basic Profile
    ├── Security Settings
    ├── Notification Preferences
    ├── Dashboard Customization
    └── Activity & Statistics
```

### **Basic Profile Section**
```javascript
const BasicProfile = {
  layout: 'form-with-preview',
  components: {
    photoUpload: {
      type: 'drag-drop-with-cropping',
      validation: 'max-5mb-jpg-png',
      preview: 'circular-crop-preview'
    },
    personalInfo: {
      username: 'unique-validation',
      fullName: 'text-input',
      email: 'email-with-verification',
      role: 'display-only-admin-assigned',
      department: 'optional-text'
    }
  }
}
```

### **Security Settings Section**
```javascript
const SecuritySettings = {
  layout: 'security-form-sections',
  components: {
    passwordChange: {
      currentPassword: 'password-verification',
      newPassword: 'strength-indicator',
      confirmPassword: 'match-validation'
    },
    twoFactor: {
      setup: 'qr-code-setup-optional',
      backup: 'backup-codes-generation'
    },
    sessions: {
      display: 'active-sessions-list',
      actions: 'logout-other-devices'
    }
  }
}
```

### **Notification Preferences**
```javascript
const NotificationPrefs = {
  layout: 'toggle-grid',
  categories: {
    strategySyncMentions: 'toggle-with-email-in-app-options',
    teamActivity: 'toggle-with-frequency-settings',
    performanceAlerts: 'toggle-with-threshold-settings',
    systemUpdates: 'toggle-admin-controlled',
    weeklyDigest: 'toggle-with-day-time-preferences'
  }
}
```

### **Dashboard Customization**
```javascript
const DashboardCustomization = {
  layout: 'widget-configuration',
  options: {
    defaultView: 'dropdown-selection',
    widgetOrder: 'drag-drop-arrangement',
    metricPreferences: 'checkbox-selections',
    quickActions: 'customizable-shortcuts',
    theme: 'light-dark-mode-selection'
  }
}
```

### **Testing Requirements**
```javascript
describe('User Profile Page', () => {
  // Basic Profile Tests
  test('Profile photo upload and cropping works', () => {
    // Test image upload and crop functionality
  });
  
  test('Username uniqueness validation works', () => {
    // Test duplicate username prevention
  });
  
  test('Email change requires verification', () => {
    // Test email verification flow
  });
  
  // Security Tests
  test('Password change requires current password', () => {
    // Test password change security
  });
  
  test('2FA setup generates QR code and backup codes', () => {
    // Test 2FA implementation
  });
  
  test('Session management shows active sessions', () => {
    // Test session tracking
  });
  
  // Notification Tests
  test('Notification preferences save correctly', () => {
    // Test preference persistence
  });
  
  test('Email/in-app notification toggles work independently', () => {
    // Test notification channel controls
  });
  
  // Dashboard Customization Tests
  test('Widget arrangements save and apply to dashboard', () => {
    // Test dashboard customization
  });
  
  test('Theme preferences apply across app', () => {
    // Test theme consistency
  });
  
  // Activity Tracking Tests
  test('User activity history displays correctly', () => {
    // Test activity log functionality
  });
  
  test('Statistics show accurate user metrics', () => {
    // Test statistics calculation
  });
});
```

### **API Endpoints Needed**
```javascript
GET /api/user/profile               // Get current user profile
PUT /api/user/profile               // Update profile info
POST /api/user/upload-photo         // Upload profile photo
PUT /api/user/password              // Change password
POST /api/user/2fa/setup            // Setup 2FA
GET /api/user/sessions              // Get active sessions
DELETE /api/user/sessions/{id}      // Logout specific session
PUT /api/user/notifications         // Update notification preferences
PUT /api/user/dashboard-prefs       // Update dashboard customization
GET /api/user/activity              // Get user activity history
GET /api/user/statistics            // Get user statistics
```

### **Expected Behavior**
- Immediate profile updates reflected across app
- Secure password change with proper validation
- 2FA setup with backup code generation
- Notification preferences immediately effective
- Dashboard customization applied on next visit
- Activity history with proper privacy controls

---

## Cross-Page Integration Testing

### **Global Navigation Tests**
```javascript
describe('Cross-Page Integration', () => {
  test('Navigation between all pages works correctly', () => {
    // Test all navigation links and page transitions
  });
  
  test('Authentication state maintained across pages', () => {
    // Test session persistence
  });
  
  test('User permissions enforced on all pages', () => {
    // Test role-based access control
  });
});
```

### **Data Consistency Tests**
```javascript
describe('Data Consistency', () => {
  test('Draft creation in Single Upload appears in Drafts page', () => {
    // Cross-page data verification
  });
  
  test('Strategy Sync saves appear in Takeaway History', () => {
    // Workflow data integrity
  });
  
  test('Tag changes update across all relevant pages', () => {
    // Data synchronization testing
  });
});
```

### **Performance Requirements**
- **Page Load Time**: <2 seconds initial load
- **Navigation Speed**: <500ms between pages
- **Search Response**: <1 second for search results
- **Real-time Updates**: <30 seconds for live data
- **File Upload**: Progress indicators for >5MB files

### **Browser Compatibility**
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Responsive**: iOS Safari, Android Chrome
- **Features**: ES6+, WebSocket support, File API support

### **Security Requirements**
- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-based access control on all endpoints
- **Data Validation**: Input sanitization and validation
- **File Security**: Image upload validation and virus scanning
- **HTTPS**: All communications encrypted

---

## Development Phases

### **Phase 1: Core Foundation**
1. Authentication system
2. Basic Dashboard
3. Single Upload (manual mode)
4. Drafts page
5. Basic Creatives page

### **Phase 2: Enhanced Features**
1. Strategy Sync (basic AI)
2. Takeaway History
3. Tag Glossary (basic CRUD)
4. User Profiles
5. Notification system

### **Phase 3: Advanced Analytics**
1. API integration preparation
2. Advanced performance analytics
3. Enhanced AI features
4. Advanced collaboration
5. Export/reporting features

### **Phase 4: API Integration**
1. API connection setup
2. Real-time data sync
3. Automated performance detection
4. Advanced analytics
5. Performance optimization