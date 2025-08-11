# Detailed Page Requirements - Functional Specifications

## Project Overview
**Legal Marketing Creative Tracker** - A comprehensive system for tracking, analyzing, and strategizing creative marketing campaigns with AI-powered insights and performance analytics.

---

## Page 1: Authentication Pages (Sign In, Sign Up, Password Reset)

### **What It Does**
These pages control access to the entire system. Every feature requires users to be logged in first.

### **Sign In Page Details**
**Required Elements:**
- Email address input field
- Password input field
- "Remember Me" checkbox to stay logged in longer
- "Sign In" button that becomes clickable only when both fields are filled
- "Forgot Password?" link that goes to password reset
- "Don't have an account? Sign Up" link
- Error messages that appear if login fails (wrong password, account doesn't exist, etc.)

**What Happens When:**
- User enters correct credentials → Redirect to Dashboard page
- User enters wrong credentials → Show error message, stay on same page
- User has been inactive too long → Automatically log out and redirect back to sign in
- User clicks "Forgot Password" → Go to password reset page

### **Sign Up Page Details**
**Required Elements:**
- Full name input field
- Email address input field with validation (must be proper email format)
- Password input field with strength requirements (minimum length, special characters)
- Confirm password field that must match first password
- "Create Account" button
- "Already have an account? Sign In" link
- Terms of service acceptance checkbox
- Error messages for validation failures

**What Happens When:**
- All fields valid and passwords match → Create account and redirect to profile setup
- Email already exists → Show error message
- Password too weak → Show requirements and prevent submission
- Any field invalid → Highlight problematic fields with specific error messages

### **Password Reset Page Details**
**Required Elements:**
- Email input field
- "Send Reset Link" button
- Instructions text explaining what will happen
- "Back to Sign In" link
- Success message after email is sent
- Error message if email doesn't exist in system

**What Happens When:**
- Valid email entered → Send reset email and show confirmation message
- Invalid/non-existent email → Show error message
- User clicks link in email → Allow them to set new password

### **Security Requirements**
- All passwords must be encrypted/hashed, never stored as plain text
- Account lockout after multiple failed login attempts
- Password reset links expire after set time period
- Optional two-factor authentication for enhanced security
- Remember login state but require re-authentication for sensitive actions

---

## Page 2: Dashboard Page

### **What It Does**
The main landing page after login - shows overview of system activity, key metrics, and provides quick access to all major features.

### **Top Section: Key Performance Metrics**
**Four Metric Cards (displayed side by side):**

**Card 1: Total Creatives**
- Shows total number of creatives uploaded this month
- Compares to last month with percentage change (green for increase, red for decrease)
- Clicking card takes you to Creatives page

**Card 2: Top Performing Litigation**
- Shows which litigation type (Ozempic, Personal Injury, etc.) has best performance this month
- Displays the performance metric (lowest cost per lead, highest conversion rate)
- Clicking takes you to Creatives page filtered for that litigation

**Card 3: AI Efficiency Score**
- Shows percentage of form fields that were auto-populated by AI vs manually entered
- Higher percentage means AI is being used effectively
- Clicking shows detailed AI usage statistics

**Card 4: Strategy Sync Sessions**
- Shows how many Strategy Sync analyses were completed this week
- Compares to previous week
- Clicking takes you to Takeaway History page

### **Center Section: Activity and Trends**

**Team Activity Feed (Left side, 60% width):**
This shows real-time activities from all team members:
- "Sarah uploaded 3 new Personal Injury creatives - 2 hours ago"
- "Mike completed Strategy Sync on Ozempic campaign - 4 hours ago"
- "Lisa added 'Urgency Red' to CTA Color tags - 6 hours ago"
- "Team hit 100 uploads milestone! 🎯 - 1 day ago"

**Features:**
- Updates automatically without refreshing page
- Shows user profile photos next to each activity
- Clicking activities takes you to relevant page (the upload, the takeaway, etc.)
- "Load More" button to see older activities
- Filter dropdown to show only certain types of activities

**Tag Trends Chart (Right side, 40% width):**
- Line chart showing performance of top tags over time
- Shows which tags are "rising stars" (improving performance)
- Dropdown to filter by campaign type or litigation
- Clicking chart elements shows more detailed analytics

### **Bottom Section: Team Motivation**

**Daily Team Vibes (Left side, 70% width):**
**Daily Note Area:**
- Text box where anyone can add daily goals, wins, or team updates
- Previous day's notes displayed above for reference
- Character limit with counter

**GIF Upload Section:**
- Drag and drop area for uploading motivational or celebratory GIFs
- Recently uploaded GIFs displayed in small gallery
- Option to delete inappropriate GIFs (admin only)

**Quote of the Day:**
- Rotating inspirational quotes related to marketing, teamwork, success
- Admin can add custom quotes specific to the team
- Previous quotes archived and can be browsed

**Team Mood Tracker:**
- Simple emoji selector (😊 😐 😔 😤 🎉) for daily team energy
- Shows today's mood submissions from all team members
- Weekly mood trend graph

**Celebration Corner (Right side, 30% width):**
**Recent Wins:**
- Automatically populated when creatives hit performance milestones
- Shows thumbnails of top-performing creatives from this week
- "Creative of the Week" highlight with special badge

**Team Achievements:**
- Milestone celebrations (50th upload, 10th Strategy Sync, etc.)
- Success stories from implemented recommendations
- Team streak counters (consecutive days of uploads, high AI accuracy, etc.)

### **Sidebar: Quick Actions**
**Main Action Buttons:**
- "Start Strategy Sync" - shows count of pinned creatives if any exist
- "Quick Upload" - direct link to Single Upload page
- "Browse Creatives" - with recent filter presets saved
- "Check Takeaways" - shows count of unread takeaways

**System Health Indicators:**
- "X Drafts Need Attention" - links to Drafts page
- "AI Accuracy: X%" - this week's AI suggestion success rate
- "X New Tags Added This Week" - links to Tag Glossary
- Server status indicator (green = all systems operational)

### **Personalization Features**
- User can rearrange widget positions by dragging
- Choose which metrics to show in top cards
- Set preferred activity feed filters
- Customize quick action shortcuts
- Choose between light and dark theme

### **Real-Time Features**
- Activity feed updates every 30 seconds automatically
- Metric cards refresh when new data is available
- Live notifications for @mentions in team activities
- "Someone is currently online" indicators for active team members

---

## Page 3: Single Upload Page

### **What It Does**
The main creative upload interface where users upload images, fill in all the metadata, and save their creatives to the system.

### **URL Behavior**
- Starts at `/upload-image` 
- After image upload, URL changes to `/upload-image/[timestamp]` (e.g., `/upload-image/1706123456789`)
- This timestamp becomes the unique identifier for this upload session
- If user shares URL, others can see the upload in progress (permissions permitting)

### **Page Layout**
**Left Side (40% width): Image Section**
- Image upload area (drag and drop or click to browse)
- After upload: Image preview with zoom controls
- Zoom in/out buttons always visible while filling form
- Image filename displayed below preview
- Option to replace image (with confirmation if form already filled)

**Right Side (60% width): Form Section**
- Organized into collapsible sections by category
- Each section can be expanded/collapsed independently
- Required fields marked with red asterisk
- Progress indicator showing completion percentage

### **Image Upload Details**
**Supported Formats:** JPG, PNG, GIF, WebP
**File Size Limit:** 10MB maximum
**Upload Process:**
1. User selects image file
2. Upload progress bar shows during transfer
3. Image processes and thumbnail generates
4. URL updates with timestamp
5. 30-second auto-save countdown begins (visible in browser console)
6. Zoom controls become available

**Zoom Functionality:**
- Zoom in/out buttons or mouse wheel
- Pan by clicking and dragging
- Reset to original size button
- Zoom level indicator (50%, 100%, 200%, etc.)
- Zoom controls remain functional throughout entire form completion

### **Form Sections Breakdown**

**Section 1: Metadata & Campaign Info**
- **Image:** Already uploaded above
- **Date Added to Sheet:** Auto-filled with today's date, not editable
- **Designer:** Dropdown with existing designers + "Add New" option (REQUIRED)
- **Start Date:** Date picker for campaign start (REQUIRED)
- **End Date:** Date picker for campaign end (REQUIRED)
- **Creative Filename:** Text field for internal reference (REQUIRED)
- **Litigation Name:** Dropdown with existing litigations + "Add New" (REQUIRED - was Campaign Name)
- **Campaign Type:** Dropdown with existing types + "Add New" (REQUIRED - was Litigation)
- **Marked as Top Ad?:** Toggle switch (off by default)
- **Optimization?:** Toggle switch (off by default)

**Section 2: Performance Metrics**
- **Amount Spent:** Number field with currency symbol, decimal places (REQUIRED)
- **Cost Per Website Lead:** Number field with currency symbol (REQUIRED)
- **Cost Per Click:** Number field with currency symbol (REQUIRED)
- All fields show validation for positive numbers only
- Option to import from API (future feature - grayed out initially)

**Section 3: Message & Targeting Insights**
- **Creative Layout Type:** Single dropdown + Add (Quiz, Banner, Card, etc.)
- **Imagery Type:** Multi-select dropdown + Add (Photos, Illustrations, Graphics)
- **Imagery Background:** Multi-select dropdown + Add (Solid Colors, Gradients, Patterns)
- **Messaging Structure:** Single dropdown + Add (Problem-Solution, Before-After, etc.)
- **Question-Based Headline?:** Toggle switch
- **Client Branding?:** Toggle switch  
- **Icons Used?:** Toggle switch

**Section 4: Headline & CTA Details**
- **Preheadline Text:** Text field for text above main headline
- **Headline Text:** Text field for main headline text
- **Headline Tags:** Multi-select dropdown + Add (Urgency, Benefit, Question, etc.)
- **Headline Intent:** Multi-select dropdown + Add (Educate, Convert, Engage, etc.)
- **CTA Label:** Text field for call-to-action text
- **CTA Verb:** Single dropdown + Add (Click, Call, Download, etc.)
- **CTA Style Group:** Single dropdown + Add (Button, Link, Banner, etc.)
- **CTA Color:** Single dropdown + Add (Red, Blue, Green, etc.)
- **CTA Position:** Single dropdown + Add (Top, Bottom, Center, Floating, etc.)

**Section 5: Copy & Conversion Drivers**
- **Body Copy Summary:** Text field for main copy description
- **Copy Angle:** Multi-select dropdown + Add (Emotional, Logical, Social Proof, etc.)
- **Copy Tone:** Multi-select dropdown + Add (Professional, Casual, Urgent, etc.)
- **Audience Persona:** Single dropdown + Add (Age groups, demographics, etc.)
- **Conditions Listed?:** Toggle switch
- **Campaign Trigger:** Single dropdown + Add (Holiday, Event, Seasonal, etc.)
- **Legal Language Present?:** Toggle switch
- **Stat Mentioned?:** Toggle switch
- **Emotional Statement Present?:** Toggle switch
- **Disclaimer Added?:** Toggle switch
- **$ Amount Mentioned?:** Toggle switch

**Section 6: Additional**
- **Designer Remarks:** Large text area for internal designer notes
- **Internal Notes:** Large text area for team notes
- **Upload Google Doc Link:** Text area for related document links
- **Pin Note for Strategy Sync:** Toggle switch to mark for future analysis

### **Auto-Save System Details**

**How Auto-Save Works:**
1. **First Auto-Save:** 30 seconds after image upload (if no form interaction yet)
2. **Subsequent Auto-Saves:** 30 seconds after any form interaction stops
3. **What Triggers Reset:** Typing, dropdown selection, toggle switch, AI auto-populate
4. **Console Display:** Live countdown "30... 29... 28... 3... 2... 1... Draft Saved!"

**What Gets Saved:**
- Uploaded image reference
- All form field values (even partial entries)
- Timestamp of last update
- User who created the draft
- Auto-save vs manual save indicator

**UI Updates After Save:**
- "My Creative Snapshot" section shows "Last Updated: [current time]"
- Action bar shows "Last Draft Saved at Time: [current time]"
- Draft appears in Drafts page immediately
- No duplicate drafts created - always updates existing one

### **AI Auto-Populate Features**

**Two AI Buttons:**
1. **"Fill Blank Fields"** - Only populates empty form fields
2. **"Overwrite"** - Replaces ALL fields (requires confirmation modal)

**AI Analysis Process:**
1. User clicks AI button
2. System analyzes uploaded image for:
   - Text content (headlines, body copy, CTA text)
   - Visual elements (colors, layout type, imagery style)
   - Design elements (icons, branding, structure)
3. AI suggests values for form fields based on analysis
4. AI compares suggestions to existing tag glossary

**Smart Tag Matching:**
**When AI finds similar existing tag:**
- Small "Review" link appears below the affected field
- User clicks "Review" → Modal opens with two options:
  - AI's suggested value
  - Similar existing value from tag glossary
- **If user chooses AI value:** Added to dropdown permanently, gets AI tag pill, saved to glossary
- **If user chooses existing value:** Uses existing tag, no AI tag pill
- **If user closes modal:** Field remains unchanged

**When AI finds completely new value:**
- Value populated directly into field
- AI tag pill automatically applied
- Value added to tag glossary after successful upload

**AI Tag Pills:**
- Small visual indicators showing field was AI-populated
- Different color/style from manual entries
- Remain visible even after draft is reopened
- Help track which insights came from AI vs human input

### **Form Validation & Submission**

**Required Field Validation:**
- 9 fields must be completed: Designer, Start Date, End Date, Creative Filename, Litigation Name, Campaign Type, Amount Spent, Cost Per Website Lead, Cost Per Click
- "Preview" and "Upload" buttons disabled (grayed out) until all required fields filled
- Buttons become active/clickable once validation passes
- Real-time validation feedback as user fills fields

**Spell Check Integration:**
- Active on all text fields
- Suggests corrections for common marketing/legal terms
- Ignores proper nouns, brand names, technical terms
- Red underline for misspelled words
- Right-click to see suggestions

**Preview Modal:**
- Shows summary of all entered information
- Organized by the same sections as the form
- User can review before final submission
- "Go Back to Edit" and "Confirm Upload" options
- Shows AI tag indicators in preview

**Final Upload Process:**
1. User clicks "Upload" (after required fields completed)
2. Preview modal opens for final review
3. User confirms upload
4. Data saves to main database
5. Draft automatically deleted from Drafts page
6. Success notification appears
7. Option to "Upload Another" or "View in Creatives"

### **Additional Features**

**Add New Tag Functionality:**
- Every dropdown has "+ Add New" option
- Clicking opens mini-modal with text input
- New tag automatically added to dropdown
- New tag available immediately in tag glossary
- Validation prevents duplicate tags

**Form Progress Tracking:**
- Progress bar showing percentage completion
- Based on required fields + number of optional fields filled
- Updates in real-time as user completes sections

**Keyboard Shortcuts:**
- Tab navigation through all form fields
- Enter to submit when validation passes
- Escape to close modals
- Ctrl+S to force manual save

**Session Management:**
- Form state preserved if user accidentally navigates away
- "Unsaved changes" warning if user tries to leave
- Auto-recovery if browser crashes or closes unexpectedly

---

## Page 4: Drafts Page

### **What It Does**
Shows all incomplete uploads that were auto-saved but not yet completed. Users can continue working on drafts or delete them.

### **When Drafts Appear Here**
- After first auto-save from Single Upload (30 seconds after image upload)
- While user is still working on the upload (hasn't clicked final "Upload" yet)
- If user navigates away from Single Upload before completing
- Remains visible until either completed or manually deleted

### **When Drafts Disappear**
- Immediately after successful upload completion
- When user manually deletes the draft
- After specified time period (30 days of inactivity)
- When admin performs cleanup operations

### **Page Layout**
**Header Section:**
- Page title "Draft Creatives"
- Search bar to find specific drafts
- Filter dropdown (All Drafts, My Drafts, Last 7 Days, etc.)
- "Clean Up Old Drafts" button (admin only)

**Main Content: Draft Grid**
- Cards displayed in grid layout (3-4 cards per row on desktop)
- Responsive layout (stacks to single column on mobile)
- Newest drafts first (by last updated time)
- Infinite scroll or pagination for many drafts

### **Draft Card Details**

**Card Layout:**
**Top: Image Thumbnail**
- Small preview of uploaded image
- If no image uploaded yet, shows placeholder icon
- Clicking thumbnail opens larger preview

**Middle: Draft Information**
- **Creative Filename:** If entered, shows as card title; if not, shows "Untitled Draft"
- **Last Updated:** "2 hours ago" or "January 15, 3:45 PM" format
- **Created By:** User name and profile photo
- **Litigation Name:** If selected, shows below filename
- **Campaign Type:** If selected, shows below litigation

**Progress Indicator:**
- Progress bar showing completion percentage
- Text like "6 of 9 required fields completed"
- Color coding: Red (0-30%), Yellow (31-70%), Green (71-99%)

**Bottom: Action Buttons**
- **"Continue Editing"** button (primary action)
- **"Delete Draft"** button (secondary, with confirmation)
- **"Duplicate"** button (creates copy for similar creative)

### **Multi-Tab Conflict Prevention**

**How It Works:**
- System tracks which drafts are currently open in browser tabs
- When user clicks "Continue Editing" on draft already open elsewhere
- Modal appears: "This draft is already open in another tab"
- Options: "Close other tab and continue" or "Cancel"
- User must resolve conflict before proceeding

**Detection Method:**
- Browser session tracking per draft ID
- Real-time checking when draft access attempted
- Clear warning messages about which tab has the draft open

### **Search & Filter Features**

**Search Functionality:**
- Search by creative filename, litigation name, campaign type
- Search by creator name
- Real-time search results as user types
- Clear search button to reset

**Filter Options:**
- **All Drafts:** Shows every draft in system
- **My Drafts:** Only drafts created by current user
- **Shared with Me:** Drafts other users marked for collaboration
- **Last 7 Days:** Recently created/updated drafts
- **Needs Attention:** Drafts with very low completion percentage
- **Ready to Complete:** Drafts missing only 1-2 required fields

**Sort Options:**
- Last updated (newest first - default)
- Last updated (oldest first)
- Creation date
- Completion percentage (highest first)
- Alphabetical by filename

### **Draft Management Features**

**Bulk Operations:**
- Checkbox selection for multiple drafts
- "Delete Selected" button appears when items selected
- "Export Selected" to download draft data
- Confirmation modal for destructive actions

**Draft Collaboration:**
- **"Share Draft"** button to give access to other team members
- **Comments section** for draft feedback
- **Assignment feature** to assign draft completion to specific user
- **Notification system** when assigned drafts need attention

**Draft Analytics:**
- **Average completion time** statistics
- **Abandonment rate** (drafts never completed)
- **Peak draft creation times** (when team is most active)
- **User productivity metrics** (drafts to completion ratio)

### **Mobile-Specific Features**
- Touch-friendly card interface
- Swipe gestures for quick actions (swipe right to continue, swipe left to delete)
- Simplified card layout for smaller screens
- Quick action buttons optimized for thumb navigation

### **Error Handling**
- **Network Issues:** Offline indicators, retry buttons
- **Corrupted Drafts:** Error messages with recovery options
- **Permission Issues:** Clear messages about access rights
- **Storage Limits:** Warnings when approaching draft storage limits

---

## Page 5: Creatives Page

### **What It Does**
Displays all completed creative uploads in two different viewing modes, with advanced filtering and multi-select capabilities for Strategy Sync analysis.

### **Dual Tab System**

**Tab 1: Table View (Data Analysis Focus)**
**Purpose:** Detailed data analysis, performance comparison, bulk operations
**Best For:** Finding creatives by specific metrics, performance analysis, exporting data

**Tab 2: Visual Grid View (Creative Discovery Focus)**  
**Purpose:** Visual browsing, creative inspiration, pattern recognition
**Best For:** Finding creative patterns, visual inspiration, seeing layout types

### **Tab Switching Behavior**
- Tabs switch instantly without page reload
- User selections persist when switching between tabs
- Filters translate intelligently between views
- Warning appears if some filters not available in target tab
- Same creatives shown in both views, just different presentation

### **Table View Details**

**Column Structure:**
- **Checkbox:** Multi-select for bulk operations
- **Thumbnail:** Small image preview (click to enlarge)
- **Creative Filename:** Sortable, searchable
- **Litigation Name:** Sortable, filterable dropdown
- **Campaign Type:** Sortable, filterable dropdown  
- **Designer:** Sortable, filterable dropdown
- **Start Date:** Sortable, date range filter
- **Amount Spent:** Sortable, numeric range filter
- **Cost Per Click:** Sortable, numeric range filter
- **Cost Per Lead:** Sortable, numeric range filter
- **Top Ad?:** Icon indicator, filterable
- **Actions:** Edit, Delete, Pin to Strategy, View Details

**Table Features:**
- **Sorting:** Click column headers to sort ascending/descending
- **Pagination:** 25/50/100 items per page options
- **Column Customization:** Show/hide columns, reorder columns
- **Export Options:** CSV, Excel, PDF with selected data
- **Bulk Actions:** Edit multiple items, delete multiple, bulk tag operations

**Data Analysis Filters:**
- **Date Ranges:** Last 7 days, 30 days, 90 days, custom range, specific months
- **Performance Metrics:** Amount spent ranges, CPC ranges, CPL ranges, ROI calculations
- **Campaign Data:** Specific litigation names, campaign types, designers
- **Status Indicators:** Top ads only, optimized campaigns only
- **Text Search:** Search within headline text, body copy summary, internal notes

### **Visual Grid View Details**

**Grid Layout:**
- **Pinterest-style masonry grid** with varying image heights
- **3-5 columns** depending on screen size
- **Infinite scroll** loading more items as user scrolls down
- **Hover effects** showing metadata overlay on each image

**Card Structure:**
- **Main Image:** Full creative display as card background
- **Selection Overlay:** Checkbox appears on hover/touch
- **Quick Info Overlay:** Appears on hover with key metadata
- **Action Buttons:** Pin to Strategy, View Details, Quick Edit
- **Performance Badges:** Small indicators for top performers

**Visual Discovery Filters:**
- **Creative Layout Type:** Quiz, Banner, Card, Video, Carousel, etc.
- **Imagery Type:** Photos, Illustrations, Graphics, Mixed Media
- **Imagery Background:** Solid Colors, Gradients, Patterns, Transparent
- **Visual Elements:** Icons used, Client branding present, Question headlines
- **CTA Elements:** CTA colors, CTA positions, CTA styles
- **Design Patterns:** Color schemes, layout styles, text density

**Visual Search Features:**
- **"Find Similar"** button on each creative
- **Color-based filtering** (find all creatives with blue CTAs)
- **Layout pattern matching** (find all quiz-style layouts)
- **Visual similarity suggestions** powered by image analysis

### **Multi-Select System**

**How Selection Works:**
- **Table View:** Checkbox in first column, shift-click for range selection
- **Visual Grid:** Checkbox overlay appears on hover, click to select
- **Selection Counter:** Shows "X creatives selected" in floating bar
- **Cross-Tab Persistence:** Selection maintained when switching between Table/Visual

**Selection Bar (appears when 3+ items selected):**
- **Selection Summary:** Count and quick preview thumbnails
- **Primary Action:** "Analyze in Strategy Sync" button
- **Secondary Actions:** Export Selected, Bulk Edit, Clear Selection
- **Quick Filters:** "Select All Filtered Results", "Select Top Performers"

**Smart Selection Features:**
- **"Select Similar"** option when one creative selected
- **Performance-based selection:** "Select all with CPC < $2"
- **Campaign-based selection:** "Select all from this litigation"
- **Date-based selection:** "Select all from last month"

### **Advanced Filtering System**

**Filter Compatibility Between Tabs:**
- **Shared Filters:** Date ranges, litigation names, campaign types, designers, top ad status
- **Table-Only Filters:** Specific performance metrics, text search, detailed analytics
- **Visual-Only Filters:** Layout types, visual elements, design patterns
- **Smart Translation:** System converts compatible filters when switching tabs

**Filter Persistence:**
- **Session Memory:** Filters remembered during browser session
- **Saved Filter Sets:** Users can save frequently used filter combinations
- **Default Filters:** Admin can set default filters for new users
- **Filter History:** Recently used filters appear in quick-access dropdown

**Filter UI:**
- **Collapsible Filter Panel** on left side (can be hidden to save space)
- **Active Filter Breadcrumbs** at top showing current filters
- **Quick Filter Buttons** for common searches
- **Clear All Filters** button with confirmation

### **Strategy Sync Integration**

**Selection to Analysis Flow:**
1. User selects creatives using checkboxes
2. Selection bar appears when 3+ items selected
3. "Analyze in Strategy Sync" button becomes active
4. Click redirects to Strategy Sync page with selected creatives pre-loaded
5. Strategy Sync page shows selected creative thumbnails and begins analysis

**Smart Selection Suggestions:**
- **"These creatives work well together"** recommendations
- **Performance correlation suggestions:** "Select other high-performers"
- **Campaign coherence alerts:** "Add more from same litigation for better insights"
- **Diversity recommendations:** "Add different campaign types for comparison"

### **Performance Features**

**Loading & Performance:**
- **Lazy Loading:** Images load as they come into view
- **Thumbnail Optimization:** Compressed images for fast loading
- **Infinite Scroll:** Smooth loading of additional items
- **Search Debouncing:** Wait for user to stop typing before filtering
- **Loading States:** Skeleton screens while data loads

**Mobile Optimization:**
- **Touch-Friendly:** Large touch targets for mobile selection
- **Responsive Grid:** Grid adapts to screen size
- **Mobile Filters:** Collapsible mobile-friendly filter interface
- **Swipe Gestures:** Swipe for quick actions on mobile

### **Export & Sharing Features**

**Export Options:**
- **Excel Export:** Full data with all metadata
- **CSV Export:** Raw data for analysis
- **PDF Report:** Visual report with images and key metrics
- **Image Package:** ZIP file with selected creative images
- **Custom Templates:** Admin-defined export formats

**Sharing Features:**
- **Share Filter Results:** Generate shareable link for current filtered view
- **Email Creative Lists:** Send selected creatives to team members
- **Print View:** Printer-friendly version of table or grid
- **Presentation Mode:** Full-screen grid view for team presentations

---

## Page 6: Strategy Sync Page

### **What It Does**
The core strategic analysis feature where AI analyzes selected creatives to provide insights, identify patterns, and generate optimization recommendations across different litigation types and campaign strategies.

### **Entry Methods to Strategy Sync**

**Method 1: From Creatives Page**
- User selects 3+ creatives in Table or Visual view
- Clicks "Analyze in Strategy Sync" button
- Redirects with selected creatives pre-loaded

**Method 2: From Pin Queue**
- User has previously pinned creatives using "Pin to Strategy Sync" switch in Single Upload
- Strategy Sync suggests pinned creatives when starting new analysis
- "You have 5 pinned creatives. Analyze them?" prompt

**Method 3: Direct Access**
- User navigates directly to Strategy Sync page
- Shows creative selection interface to choose creatives for analysis
- Minimum 3 creatives required before analysis can begin

### **Page Layout Structure**

**Header Section:**
- **Page Title:** "Strategy Sync Analysis"
- **Selected Creatives Counter:** "Analyzing 5 creatives from 2 litigation types"
- **Analysis Progress Indicator:** Shows AI processing status
- **Action Buttons:** Save Takeaway, Export PDF, Start New Analysis

**Left Sidebar (20% width): Selected Creatives**
- **Thumbnail Grid:** All selected creative images
- **Metadata Summary:** Litigation names and campaign types represented
- **Context Distribution:** "60% SA campaigns, 40% Personal Injury"
- **Modify Selection:** Add/remove creatives button

**Main Content Area (80% width): Analysis Results**
- **Multiple Analysis Sections** displayed vertically
- **Collapsible Sections** for better organization
- **Loading States** while AI generates each section
- **User Takeaway Editor** at bottom

### **AI Analysis Sections**

**Section 1: Pattern Recognition Analysis**
**What It Shows:**
- **Common Visual Elements:** "4 out of 5 creatives use blue CTAs"
- **Layout Patterns:** "3 creatives use quiz-style layouts"
- **Imagery Similarities:** "All use professional photography with testimonial-style imagery"
- **Messaging Patterns:** "Consistent use of urgency language and benefit-focused headlines"
- **Brand Consistency:** "Strong brand compliance across all creatives"

**Section 2: Campaign Type Level Insights**
**What It Shows:**
- **Broad Category Performance:** "SA campaigns in this selection perform 25% better than average"
- **Cross-Campaign Patterns:** "Question-based headlines work well across both SA and PI campaigns"
- **Campaign Type Strengths:** "SA campaigns excel with empathy-focused copy, PI campaigns with urgency messaging"
- **General Recommendations:** "Blue CTAs consistently outperform red across all campaign types"

**Section 3: Litigation-Specific Analysis**  
**What It Shows:**
- **Granular Performance:** "LA County SA vs IL Juvie SA comparison shows different optimal strategies"
- **Location-Specific Insights:** "West Coast litigations respond better to softer color palettes"
- **Jurisdiction Differences:** "IL requires 40% more legal disclaimer text than CA"
- **Market Context:** "Demographic differences between markets affect messaging effectiveness"

**Section 4: Cross-Litigation Opportunities**
**What It Shows:**
- **Success Pattern Transfer:** "Red CTA success in IL Juvie SA suggests testing in TX Youth SA"
- **Underutilized Strategies:** "Testimonial imagery works well in LA County SA but hasn't been tested in FL Adult SA"
- **Performance Gaps:** "Question headlines increase conversion 30% in LA County - opportunity for other SA markets"
- **Testing Recommendations:** "These 3 elements from high-performers could be A/B tested in underperforming campaigns"

**Section 5: Optimization Recommendations**
**What It Shows:**
- **A/B Testing Suggestions:** Specific elements to test with expected impact percentages
- **Copy Variations:** Alternative headline and body copy options based on successful patterns
- **Visual Optimizations:** CTA color/position changes, imagery style adjustments
- **Performance Predictions:** "Implementing these changes could improve CPL by 15-25%"
- **Priority Rankings:** "High Impact/Low Effort" vs "High Impact/High Effort" recommendations

### **AI Processing Details**

**Image Analysis Process:**
1. **Text Extraction:** AI reads all visible text (headlines, body copy, CTAs, disclaimers)
2. **Visual Element Detection:** Colors, layout structure, imagery type, design elements
3. **Performance Data Integration:** Connects visual/text elements to performance metrics
4. **Pattern Recognition:** Identifies what elements correlate with success
5. **Context Awareness:** Considers litigation type and campaign context for recommendations

**Multi-Level Analysis Logic:**
- **Step 1:** Analyze each creative individually
- **Step 2:** Find patterns across all selected creatives  
- **Step 3:** Compare patterns to historical performance data
- **Step 4:** Generate campaign type level insights
- **Step 5:** Generate litigation-specific insights
- **Step 6:** Identify cross-litigation opportunities
- **Step 7:** Provide actionable recommendations

### **User Takeaway System**

**Takeaway Editor Features:**
- **Rich Text Editor:** Bold, italic, bullet points, numbered lists
- **Section Templates:** Pre-built templates for different types of takeaways
- **Voice Notes:** Record audio notes for team members
- **Action Items:** Create task list with assignments and due dates
- **Performance Goals:** Set measurable targets based on recommendations

**What Gets Saved:**
- **All AI-Generated Insights:** Complete analysis results
- **Selected Creatives:** References to analyzed creatives with thumbnails
- **User Takeaways:** Custom notes, decisions, and action plans
- **Current Metrics Snapshot:** Performance data at time of analysis
- **Context Information:** Litigation types, campaign types, date ranges
- **User Attribution:** Who created the analysis and when

**Takeaway Metadata:**
- **Analysis Date:** When the Strategy Sync was performed
- **Creator:** User who performed the analysis
- **Participant Count:** How many creatives were analyzed
- **Context Scope:** Which litigation types and campaign types included
- **Implementation Status:** Not Started, In Progress, Completed
- **Performance Impact:** Measured results from implemented recommendations

### **Collaboration Features**

**Sharing & Discussion:**
- **Share Takeaway:** Send analysis to specific team members
- **@Mention System:** Tag team members in takeaway notes
- **Comment Threading:** Team discussions on specific insights
- **Approval Workflow:** Mark takeaways as approved for implementation
- **Follow-up Reminders:** Set reminders to check implementation results

**Team Integration:**
- **Role-Based Insights:** Different recommendations for designers vs managers
- **Permission Levels:** Who can view, edit, or implement recommendations
- **Notification System:** Updates when takeaways are commented on or implemented
- **Team Dashboard Integration:** Analysis results appear in team activity feed

### **Export & Reporting Features**

**PDF Export Options:**
- **Executive Summary:** High-level insights and recommendations only
- **Complete Analysis:** Full detailed report with all sections
- **Visual Report:** Heavy emphasis on creative images and visual comparisons
- **Implementation Guide:** Action-focused document with step-by-step recommendations

**Custom PDF Features:**
- **Branding Customization:** Company logo, colors, fonts
- **Template Selection:** Different layouts for different audiences
- **Section Selection:** Choose which analysis sections to include
- **Appendix Options:** Include raw data, methodology, additional context

**Sharing Options:**
- **Direct Email:** Send PDF to stakeholders
- **Secure Links:** Password-protected online viewing
- **Presentation Mode:** Full-screen view for team meetings
- **Print Optimization:** Printer-friendly formatting

### **Advanced Features**

**Performance Tracking:**
- **Recommendation Implementation:** Track which suggestions were actually tested
- **A/B Test Results:** Connect analysis recommendations to actual test outcomes
- **ROI Measurement:** Measure performance improvement from implemented changes
- **Success Rate Analytics:** Track which types of recommendations yield best results

**Machine Learning Enhancement:**
- **Pattern Learning:** AI improves recommendations based on implementation success
- **Contextual Adaptation:** Better insights as system learns litigation-specific patterns
- **Predictive Analytics:** Forecast performance based on creative elements
- **Anomaly Detection:** Flag unusual patterns that might indicate opportunities

**Integration Points:**
- **Tag Glossary Connection:** Analysis can suggest new tags based on discovered patterns
- **Creative Database Updates:** Insights can enhance creative metadata
- **Performance Data Sync:** Real-time integration with advertising platform APIs
- **Takeaway History:** All analyses preserved for future reference and learning

---

## Page 7: Takeaway History Page

### **What It Does**
Central repository for all saved Strategy Sync analyses, enabling team collaboration, progress tracking, and strategic knowledge management over time.

### **Three Main View Modes**

**Timeline View (Default)**
**Purpose:** See chronological progression of all strategic analyses
**Layout:** Vertical timeline with most recent at top
**Best For:** Seeing recent activity, tracking team's strategic evolution over time
**Features:**
- Month/week separators for easy navigation
- "This Week", "Last Month", "Quarter" quick filters
- Infinite scroll for historical analyses

**Campaign View**
**Purpose:** See all analyses organized by litigation and campaign type
**Layout:** Grouped sections with expandable categories  
**Best For:** Reviewing all strategic work for specific litigation types
**Features:**
- Primary grouping by Litigation Name (LA County SA, IL Juvie SA, etc.)
- Secondary grouping by Campaign Type within each litigation
- Count indicators showing number of analyses per group

**Performance View**
**Purpose:** See analyses ranked by implementation success and impact
**Layout:** Sorted cards with performance indicators
**Best For:** Finding most successful strategies, identifying high-impact recommendations
**Features:**
- ROI impact badges (High, Medium, Low impact)
- Implementation status indicators (Completed, In Progress, Not Started)
- Success rate percentages based on implemented recommendations

### **Takeaway Card Structure**

**Card Header:**
- **Title:** User-created title or auto-generated from context
- **Date & Time:** When analysis was performed  
- **Creator:** Name and profile photo of analyst
- **Status Badge:** Implementation status with color coding
- **Action Icons:** Favorite star, archive option, export, share

**Card Preview Content:**
- **Creative Thumbnails:** Grid of analyzed creative images (4-6 thumbnails max)
- **Context Summary:** "5 creatives • 2 litigation types • SA & Personal Injury"
- **Key Insights Preview:** Top 3 most important AI insights in condensed format
- **User Takeaway Preview:** First 2-3 lines of user's notes
- **Engagement Stats:** Comment count, implementation progress, team interactions

**Expandable Full Content:**
- **Complete AI Analysis:** All sections from original Strategy Sync
- **Full User Takeaways:** Complete notes, decisions, action plans
- **Implementation Details:** What was tested, results achieved, ROI measurements
- **Comment Thread:** Team discussions with timestamps and user attribution
- **Related Analyses:** Links to similar or follow-up Strategy Sync sessions

### **Advanced Search System**

**Full-Text Search Capabilities:**
- **Takeaway Titles:** Search through user-created titles
- **AI Insights Content:** Search within all AI-generated analysis text
- **User Notes:** Search through all user takeaways and comments
- **Creative Metadata:** Search by litigation names, campaign types, creative filenames
- **Comment Content:** Search within team discussions and feedback

**Search Features:**
- **Real-time Results:** Search updates as user types
- **Keyword Highlighting:** Matching terms highlighted in results
- **Search Suggestions:** Auto-complete based on previous searches
- **Saved Searches:** Frequently used searches saved for quick access
- **Search History:** Recent searches available in dropdown

**Advanced Search Filters:**
- **Date Range Selection:** Specific date ranges, relative dates (last 30 days)
- **Creator Filter:** Analyses by specific team members
- **Litigation/Campaign Filter:** Specific litigation types or campaign types
- **Implementation Status:** Not Started, In Progress, Completed, All
- **Performance Impact:** High ROI, Medium ROI, Low ROI, Unknown
- **Engagement Level:** Highly commented, team favorites, recently active

### **Filter Combinations**
- **Multiple Filter Support:** Apply several filters simultaneously
- **Filter Logic:** AND/OR combinations for complex searches  
- **Filter Persistence:** Filters remembered during session
- **Quick Filter Presets:** Common filter combinations saved as one-click options
- **Filter Sharing:** Share filter combinations with team members

### **Team Collaboration Features**

**Comment System:**
- **Threaded Comments:** Replies and responses to create discussion threads
- **@Mention Notifications:** Tag specific team members for their input
- **Comment Editing:** Edit/delete own comments within time limit
- **Comment Reactions:** Like, agree, disagree emoji reactions
- **Comment Moderation:** Admin ability to moderate inappropriate comments

**Status Update System:**
- **Implementation Tracking:** Update progress on recommendation implementation
- **Results Recording:** Document actual performance results from tests
- **ROI Documentation:** Track financial impact of implemented strategies
- **Photo/Document Attachments:** Add supporting evidence of implementation
- **Team Notifications:** Automatic notifications when status changes

**Collaboration Workflow:**
- **Assignment System:** Assign action items to specific team members
- **Due Date Tracking:** Set and monitor deadlines for implementations
- **Approval Process:** Mark takeaways as approved for implementation
- **Review Cycles:** Schedule regular reviews of implementation progress
- **Team Accountability:** Track who's responsible for what actions

### **Organization & Management Features**

**Favorites System:**
- **Star Important Takeaways:** Mark high-value analyses for quick access
- **Personal Favorites:** Each user can star different takeaways
- **Team Favorites:** Admin-designated takeaways important for whole team
- **Favorites Dashboard:** Quick access view of all starred items
- **Smart Suggestions:** System suggests takeaways to favorite based on usage

**Archive Functionality:**
- **Archive Old Takeaways:** Hide outdated or irrelevant analyses
- **Archive Reasons:** Tag why takeaway was archived (outdated, superseded, etc.)
- **Archive Recovery:** Unarchive if needed later
- **Archive Permissions:** Control who can archive team takeaways
- **Archive Analytics:** Track what types of takeaways get archived and why

**Bulk Operations:**
- **Multi-Select Interface:** Checkboxes for selecting multiple takeaways
- **Bulk Actions:** Archive, delete, export, share multiple items at once
- **Bulk Status Updates:** Change implementation status for multiple takeaways
- **Bulk Tagging:** Apply custom tags to multiple takeaways
- **Progress Indicators:** Show progress for bulk operations

### **Performance Tracking & Analytics**

**Implementation Monitoring:**
- **Progress Tracking:** Visual indicators of implementation progress
- **Timeline Tracking:** See how long implementations take
- **Success Rate Metrics:** Percentage of recommendations actually implemented
- **Team Performance:** Who implements recommendations most effectively
- **Bottleneck Analysis:** Identify where implementations get stuck

**ROI Measurement:**
- **Before/After Comparisons:** Performance metrics before and after implementation
- **Cost/Benefit Analysis:** Investment required vs results achieved
- **Impact Scoring:** Quantified impact rating for each implemented recommendation
- **Trend Analysis:** Track ROI improvements over time
- **Predictive ROI:** Estimate potential impact of unimplemented recommendations

**Strategic Analytics:**
- **Pattern Success Tracking:** Which types of recommendations work best
- **Litigation Performance:** Success rates by litigation type and campaign type
- **Team Learning Curves:** How team strategic capabilities improve over time
- **Insight Quality Metrics:** Rate the accuracy and usefulness of AI insights
- **Knowledge Building:** Track accumulation of strategic knowledge over time

### **Export & Reporting Features**

**Individual Takeaway Export:**
- **PDF Format:** Professional document with branding
- **Word Document:** Editable format for further customization
- **Email Integration:** Direct sharing via email with attachments
- **Print Optimization:** Formatted for professional printing

**Bulk Export Options:**
- **Summary Reports:** Executive summaries across multiple takeaways
- **Implementation Reports:** Focus on actions taken and results achieved
- **Performance Dashboards:** Visual charts and graphs of key metrics
- **Strategic Archives:** Complete historical record of all analyses

**Custom Report Builder:**
- **Date Range Selection:** Reports for specific time periods
- **Content Filtering:** Include/exclude specific analysis sections
- **Audience Customization:** Different reports for different stakeholders
- **Template Library:** Pre-built report formats for common use cases
- **Automated Reports:** Scheduled generation and distribution of key reports

### **Mobile & Accessibility Features**

**Mobile Optimization:**
- **Touch-Friendly Interface:** Large touch targets, swipe gestures
- **Responsive Layout:** Adapts gracefully to different screen sizes
- **Mobile Search:** Optimized search interface for mobile devices
- **Offline Reading:** Cache takeaways for offline viewing
- **Mobile Notifications:** Push notifications for comments and updates

**Accessibility Features:**
- **Screen Reader Support:** Proper markup for assistive technologies
- **Keyboard Navigation:** Full functionality without mouse
- **High Contrast Mode:** Enhanced visibility for visually impaired users
- **Text Size Scaling:** Adjustable text sizes for readability
- **Alternative Text:** Descriptive text for all images and visual elements

---

## Page 8: Tag Glossary Page

### **What It Does**
Comprehensive management system for all tags used throughout the tracker, providing multi-dimensional performance analytics and tag lifecycle management with hierarchical insights across litigation types and campaign types.

### **Main Page Layout**

**Header Section:**
- **Page Title:** "Tag Glossary & Performance Analytics"
- **View Toggle:** Switch between "Tag Management" and "Analytics Dashboard" modes
- **Global Search:** Search across all tags and their performance data
- **Create New Tag:** Quick-add button for creating tags
- **Export Options:** Export tag data and analytics

**Left Sidebar (30% width): Tag Categories**
- **Field Categories:** Organized by form field types (CTA Colors, Imagery Types, etc.)
- **Category Filters:** Show/hide specific categories
- **Usage Statistics:** Tag count per category
- **Performance Indicators:** Category-level performance summaries

**Main Content (70% width): Tag Display & Analytics**
- **Tag List Mode:** Hierarchical display of all tags
- **Analytics Mode:** Performance matrices and charts
- **Creative Association Mode:** View creatives using selected tags

### **Tag List Mode Details**

**Category Organization:**
Each form field type becomes a collapsible category:
- **CTA Colors:** Red, Blue, Green, Orange, etc.
- **Creative Layout Types:** Quiz, Banner, Card, Video, etc.
- **Imagery Types:** Photos, Illustrations, Graphics, etc.
- **Copy Angles:** Emotional, Logical, Social Proof, etc.
- **Headline Tags:** Urgency, Benefit, Question, etc.
- And all other dropdown/multi-select fields from Single Upload

**Individual Tag Display:**
**Tag Information:**
- **Tag Name:** The actual tag text
- **Usage Count:** "Used in 45 creatives"
- **Performance Rating:** Star rating or color-coded indicator
- **Source Indicator:** "AI Generated" or "Manual" badge
- **Creation Date:** When tag was first added
- **Last Used:** Most recent usage date

**Performance Preview:**
- **Overall Performance:** Average CPC, CPL across all usage
- **Best Performing Context:** "Works best in SA campaigns"
- **Trend Indicator:** Improving, stable, or declining performance
- **Usage Trend:** Increasing or decreasing adoption

**Action Buttons:**
- **View Creatives:** See all creatives using this tag
- **Edit Tag:** Rename or modify tag (permission-based)
- **Performance Details:** Deep dive into tag analytics
- **Delete Tag:** Remove tag with replacement options

### **Multi-Dimensional Analytics Mode**

**Campaign Type Performance Matrix:**
**Visual Layout:** Heatmap table
- **Rows:** All tags in selected category
- **Columns:** Campaign types (SA, Personal Injury, Mass Tort, etc.)
- **Cell Values:** Performance percentages or metrics
- **Color Coding:** Green for high performance, red for low performance
- **Interactive:** Click cells for detailed breakdown

**Example Matrix:**
```
                   SA    Personal Injury    Mass Tort
Blue CTA          92%        78%             85%
Red CTA           65%        94%             72%
Question Headlines 78%        85%             91%
Urgency Copy      45%        89%             76%
```

**Litigation-Level Drill-Down:**
**Within each campaign type, show litigation-specific performance:**
- **SA Campaign Type expanded shows:**
  - LA County SA: Blue CTA 95%, Red CTA 62%
  - IL Juvie SA: Blue CTA 67%, Red CTA 89%
  - TX Youth SA: Blue CTA 84%, Red CTA 71%
  - FL Adult SA: Blue CTA 91%, Red CTA 58%

**Performance Insights Generation:**
- **Cross-Litigation Patterns:** "Blue CTAs work consistently well across most SA litigations except IL Juvie"
- **Opportunity Identification:** "Red CTAs perform exceptionally in IL Juvie SA - test in other SA markets"
- **Performance Anomalies:** "Question headlines underperform in SA but excel in Personal Injury"
- **Trend Analysis:** "Urgency messaging declining in effectiveness across all campaign types"

### **Tag Performance Analytics**

**Individual Tag Analytics:**
**Performance History Chart:**
- **Time-based performance:** Line chart showing tag performance over time
- **Usage Frequency:** Bar chart showing usage patterns
- **Context Performance:** Breakdown by litigation and campaign type
- **Comparative Analysis:** How this tag performs vs similar tags

**Correlation Analysis:**
- **Tag Combinations:** Which tags work well together
- **Performance Multipliers:** Tags that enhance each other's effectiveness
- **Conflict Detection:** Tag combinations that underperform
- **Optimization Suggestions:** Recommended tag combinations for specific contexts

**Predictive Analytics:**
- **Performance Forecasting:** Predicted future performance based on trends
- **Usage Predictions:** Expected adoption rates for new tags
- **Context Recommendations:** Best contexts for tag usage
- **A/B Testing Suggestions:** Tag variations worth testing

### **Creative Association Features**

**Tag-to-Creative Navigation:**
**Trigger:** Click any tag name
**Result:** Shows all creatives using that specific tag

**Creative Grid Display:**
- **Thumbnail View:** Visual grid of all associated creatives
- **Metadata Overlay:** Litigation name, campaign type, performance metrics
- **Performance Sorting:** Sort by best/worst performing creatives with this tag
- **Context Filtering:** Filter by litigation type, campaign type, date range

**Multi-Tag Analysis:**
- **Tag Combination View:** See creatives using multiple selected tags
- **Venn Diagram Mode:** Visual representation of tag overlap
- **Performance Comparison:** Compare performance of different tag combinations
- **Optimization Opportunities:** Identify underused but high-performing combinations

### **Tag Management (CRUD Operations)**

**Create New Tag:**
**Process:**
1. Click "Create New Tag" button
2. **Category Selection:** Choose which field category (CTA Color, Copy Angle, etc.)
3. **Tag Name Input:** Text field with validation
4. **Description (Optional):** Explain when/how to use this tag
5. **Initial Context:** Suggest which litigation/campaign types to try first

**Validation:**
- **No Duplicates:** Check against existing tags in same category
- **Naming Standards:** Consistent capitalization, format
- **Length Limits:** Reasonable character limits
- **Reserved Words:** Prevent confusion with system terms

**Edit Existing Tag:**
**Process:**
1. Click "Edit" button on any tag
2. **Impact Warning:** "This tag is used in 23 creatives"
3. **Edit Options:** Rename, change description, merge with another tag
4. **Preview Changes:** Show what will change before confirming
5. **Update Confirmation:** Confirm changes will apply to all linked creatives

**Permission Checking:**
- **Role-Based Access:** Only users with edit permissions can modify
- **Ownership Rules:** Users can always edit tags they created
- **Admin Override:** Admins can edit any tag
- **Change Logging:** Track who made what changes when

**Delete Tag with Replacement System:**

**Deletion Process:**
1. **Usage Check:** System identifies all creatives using this tag
2. **Impact Warning:** "This tag is used in 15 creatives across 3 litigation types"
3. **Creative Preview:** Show thumbnails of affected creatives
4. **Replacement Options:**

**Option A: Replace with Existing Tag**
- **Similar Tag Suggestions:** System suggests related tags
- **Manual Selection:** User chooses replacement from dropdown
- **Impact Preview:** "Blue CTA will be replaced with Navy CTA in all 15 creatives"
- **Performance Comparison:** Show how replacement tag performs

**Option B: Remove Tag Entirely**
- **Orphan Warning:** "Tag will be removed but creative data preserved"
- **Future Impact:** "This tag will no longer be available for new uploads"
- **Irreversible Warning:** "This action cannot be undone"

**Confirmation Process:**
- **Final Confirmation:** Review all changes before execution
- **Bulk Update Progress:** Progress bar for updating multiple creatives
- **Success Notification:** Confirmation of successful changes
- **Rollback Option:** Brief window to undo if mistake made

### **Smart Recommendation Engine**

**Usage Recommendations:**
- **"Tags to Try":** Suggest high-performing tags user hasn't used yet
- **Context-Specific Suggestions:** Different recommendations based on current litigation/campaign
- **Performance-Based Suggestions:** "Users similar to you found success with these tags"
- **Trend Alerts:** "This tag is gaining popularity and showing good results"

**Optimization Alerts:**
- **Underperformer Warnings:** "This tag is declining in performance"
- **Opportunity Notifications:** "This tag works well in similar litigation types"
- **Combination Suggestions:** "Try pairing this tag with these others"
- **A/B Testing Recommendations:** "Test this tag variation in your next upload"

**Knowledge Sharing:**
- **Best Practice Insights:** "Most successful users apply this tag in these contexts"
- **Team Learning:** "Your team has discovered these effective combinations"
- **Cross-Team Insights:** "Other teams with similar litigation types use these tags"
- **Industry Benchmarks:** "This tag performance compared to industry standards"

### **Permission System Integration**

**Role-Based Tag Management:**
**Admin (You):**
- **Full Control:** Create, edit, delete any tag
- **Permission Assignment:** Grant tag management rights to other users
- **System Management:** Bulk operations, data cleanup, analytics access
- **Override Authority:** Can modify any tag regardless of creator

**Manager Level:**
- **Create Tags:** Add new tags to system
- **Edit Own Tags:** Modify tags they created
- **Limited Delete:** Delete tags with minimal usage
- **Analytics Access:** View all performance data

**Designer Level:**
- **Create Tags:** Add new tags during uploads
- **View Only:** See all tags and basic performance data
- **Request Changes:** Submit requests for tag modifications
- **Personal Analytics:** See performance of tags they use

**Permission Inheritance:**
- **Tag Ownership:** Creator has edit rights
- **Team Tags:** Tags used by multiple team members become shared
- **System Tags:** Core tags managed only by admins
- **Permission Escalation:** Request higher permissions through admin

### **Advanced Analytics Features**

**Trend Analysis:**
- **Seasonal Performance:** How tag performance varies by time of year
- **Lifecycle Analysis:** Track tag performance from creation to retirement
- **Adoption Curves:** How quickly new tags gain acceptance
- **Performance Maturity:** How tag effectiveness changes with usage

**Competitive Intelligence:**
- **Cross-Litigation Learning:** How successful elements transfer between litigation types
- **Market Adaptation:** How tag effectiveness varies by geographic market
- **Industry Benchmarking:** Performance compared to similar organizations
- **Innovation Tracking:** Identify breakthrough tag combinations

**Machine Learning Enhancement:**
- **Pattern Recognition:** AI identifies successful tag patterns
- **Predictive Modeling:** Forecast tag performance in new contexts
- **Anomaly Detection:** Flag unusual performance patterns for investigation
- **Automated Optimization:** Suggest tag improvements based on data patterns

---

## Page 9: User Profile & Settings Page

### **What It Does**
Comprehensive user account management, security settings, personalization options, and activity tracking for individual users.

### **Page Navigation Structure**

**Left Sidebar Navigation (25% width):**
- **Basic Profile** (default selected)
- **Security Settings**
- **Notification Preferences**
- **Dashboard Customization**
- **Activity & Statistics**
- **Privacy Settings**
- **Account Management**

**Main Content Area (75% width):**
- **Active Section Display** based on sidebar selection
- **Section-specific content** with save/cancel buttons
- **Real-time validation** and feedback
- **Change confirmation** for important updates

### **Basic Profile Section**

**Profile Photo Management:**
**Upload Interface:**
- **Drag & Drop Area:** Visual upload zone with file type indicators
- **Browse Button:** Traditional file selection option
- **Current Photo Display:** Shows existing photo with option to change
- **Photo Requirements:** "JPG, PNG, or GIF • Max 5MB • Recommended 400x400px"

**Photo Editing Features:**
- **Crop Tool:** Circular crop with zoom and pan controls
- **Preview Mode:** See how photo will appear throughout app
- **Size Optimization:** Automatic compression for optimal loading
- **Default Options:** System-provided avatar options if no upload

**Personal Information:**
**Username Management:**
- **Current Username Display:** Shows existing username
- **Edit Mode:** Inline editing with real-time availability checking
- **Validation Feedback:** "Username available" or "Already taken" indicators
- **Character Requirements:** Length limits, allowed characters, no special symbols
- **Change Impact Warning:** "This will update your name across all comments and takeaways"

**Contact Information:**
- **Full Name:** Real name for team identification and attribution
- **Email Address:** Account email with verification requirement for changes
- **Job Title/Role:** Display role (Designer, Manager, Admin) - some admin-controlled
- **Department:** Optional team/department assignment
- **Phone Number:** Optional contact information

**Profile Completion:**
- **Completion Percentage:** Visual indicator of profile completeness
- **Missing Information Alerts:** Gentle prompts for incomplete sections
- **Team Visibility Benefits:** Enhanced collaboration features with complete profile

### **Security Settings Section**

**Password Management:**
**Change Password Form:**
- **Current Password:** Required verification field
- **New Password:** With real-time strength indicator
- **Confirm New Password:** Must match validation
- **Password Requirements Display:** Clear requirements list
- **Security Tips:** Best practices for strong passwords

**Password Strength Indicator:**
- **Visual Strength Meter:** Color-coded strength display
- **Requirement Checklist:** Minimum length, special characters, numbers, etc.
- **Suggestions:** Recommendations for improving password strength
- **Breach Checking:** Warning if password found in known breaches

**Two-Factor Authentication (2FA):**
**Setup Process:**
- **Enable 2FA Option:** Toggle switch with explanation
- **QR Code Generation:** For authenticator app setup
- **Backup Codes:** Generate and download emergency codes
- **Verification Test:** Confirm 2FA working before activation
- **Recovery Options:** Alternative verification methods

**2FA Management:**
- **Status Display:** Current 2FA status and last used
- **Regenerate Codes:** Create new backup codes
- **Disable Option:** With additional security verification
- **App Management:** Switch between different authenticator apps

**Session Management:**
**Active Sessions Display:**
- **Session List:** All currently logged-in devices/browsers
- **Device Information:** Browser, operating system, location (if available)
- **Login Time:** When each session started
- **Last Activity:** Most recent activity timestamp
- **Current Session Indicator:** Highlight the current device

**Session Actions:**
- **Logout Single Session:** End specific device session
- **Logout All Other Sessions:** Keep current, end all others
- **Logout All Sessions:** End all sessions, require re-login everywhere
- **Session Alerts:** Notifications for new logins from unfamiliar devices

### **Notification Preferences Section**

**Email Notifications:**
**Strategy Sync & Collaboration:**
- **Comment Notifications:** When someone comments on your takeaways
- **@Mention Alerts:** When you're mentioned in comments or notes
- **Takeaway Sharing:** When someone shares a takeaway with you
- **Assignment Notifications:** When you're assigned tasks from Strategy Sync

**System & Performance:**
- **Performance Alerts:** When your creatives become top performers
- **AI Efficiency Reports:** Weekly summary of AI usage and accuracy
- **System Updates:** Important system changes and new features
- **Maintenance Notifications:** Scheduled downtime and updates

**Team & Activity:**
- **Team Activity Digest:** Daily or weekly summary of team activity
- **Milestone Celebrations:** Team achievements and success notifications
- **New User Introductions:** When new team members join
- **Achievement Badges:** Personal milestone notifications

**In-App Notifications:**
**Real-Time Alerts:**
- **Immediate Notifications:** Pop-up alerts for urgent items
- **Notification Center:** Persistent list of all notifications
- **Read/Unread Status:** Track which notifications have been seen
- **Action Buttons:** Quick actions directly from notifications

**Notification Timing:**
- **Do Not Disturb Hours:** Set quiet hours for notifications
- **Frequency Controls:** Immediate, hourly digest, daily digest options
- **Priority Settings:** High priority vs normal priority notifications
- **Mobile Push Settings:** Control mobile app notifications (future feature)

### **Dashboard Customization Section**

**Layout Preferences:**
**Widget Configuration:**
- **Widget Selection:** Choose which widgets to display
- **Widget Arrangement:** Drag-and-drop positioning
- **Widget Sizing:** Small, medium, large options for flexible widgets
- **Default View:** Set preferred starting view when logging in

**Metric Preferences:**
**Performance Metrics:**
- **Primary Metrics:** Choose most important metrics for top cards
- **Secondary Metrics:** Additional metrics for detailed views
- **Comparison Periods:** Default comparison timeframes (vs last month, quarter, etc.)
- **Threshold Settings:** Personal alerts for performance thresholds

**Activity Feed Customization:**
- **Activity Types:** Choose which activities to show
- **Team Members:** Filter for specific team members
- **Time Range:** Default time range for activity display
- **Update Frequency:** How often to refresh activity feed

**Theme & Appearance:**
**Visual Preferences:**
- **Theme Selection:** Light mode, dark mode, system preference
- **Color Scheme:** Accent color preferences
- **Font Size:** Accessibility options for text sizing
- **High Contrast:** Enhanced visibility options

**Quick Actions:**
- **Shortcut Customization:** Choose which quick actions to display
- **Shortcut Ordering:** Arrange shortcuts by priority
- **Keyboard Shortcuts:** Custom hotkey assignments
- **Context Menus:** Customize right-click menu options

### **Activity & Statistics Section**

**Personal Activity History:**
**Recent Activity:**
- **Upload History:** Recent creative uploads with thumbnails
- **Strategy Sync Sessions:** Recent analyses with brief summaries
- **Comment Activity:** Recent comments and discussions
- **Tag Contributions:** Tags created or modified recently

**Activity Timeline:**
- **Chronological View:** All activity in timeline format
- **Activity Categories:** Filter by activity type
- **Search History:** Find specific past activities
- **Export Options:** Download personal activity report

**Personal Statistics:**
**Productivity Metrics:**
- **Upload Statistics:** Total creatives, monthly averages, upload frequency
- **AI Collaboration:** AI usage rates, accuracy improvements
- **Strategy Sync Participation:** Analyses performed, takeaways created
- **Team Collaboration:** Comments, mentions, shared takeaways

**Performance Insights:**
- **Creative Performance:** Average performance of uploaded creatives
- **Improvement Trends:** How personal metrics improve over time
- **Goal Tracking:** Progress toward personal or team goals
- **Achievement History:** Badges earned, milestones reached

**Learning & Growth:**
- **Skill Development:** Areas of expertise and improvement
- **Feature Adoption:** How quickly new features are adopted
- **Training Progress:** Completion of tutorials and help content
- **Knowledge Sharing:** Contributions to team knowledge base

### **Privacy Settings Section**

**Profile Visibility:**
**Information Sharing:**
- **Profile Photo Visibility:** Who can see your profile photo
- **Contact Information:** Control sharing of email, phone, etc.
- **Activity Visibility:** Who can see your activity in feeds
- **Statistics Sharing:** Whether personal stats are visible to team

**Data Usage Preferences:**
**Analytics Participation:**
- **Usage Analytics:** Contribute to system improvement analytics
- **Performance Benchmarking:** Include your data in performance comparisons
- **Feature Development:** Participate in new feature testing
- **Research Participation:** Contribute to marketing research studies

**Communication Preferences:**
- **Team Directory Inclusion:** Appear in team member directory
- **@Mention Permissions:** Who can mention you in comments
- **Direct Contact:** Allow direct communication from team members
- **External Sharing:** Control if your work can be shared outside organization

### **Account Management Section**

**Account Information:**
**Account Status:**
- **Account Type:** Free, Premium, Enterprise (display only)
- **Account Creation Date:** When account was first created
- **Last Login:** Most recent login time and location
- **Storage Usage:** Current usage vs limits
- **Feature Access:** List of available features for account type

**Data Management:**
**Data Export:**
- **Personal Data Export:** Download all personal information
- **Creative Portfolio Export:** Download all uploaded creatives
- **Analysis Export:** Download all Strategy Sync takeaways
- **Comment Export:** Download all comments and discussions

**Account Actions:**
**Advanced Options:**
- **Account Deactivation:** Temporarily disable account
- **Account Deletion:** Permanently delete account and data
- **Data Transfer:** Transfer ownership of content to another user
- **Account Recovery:** Options for account recovery procedures

**Deletion Process:**
- **Impact Warning:** Clear explanation of what will be deleted
- **Data Retention:** What happens to shared content (takeaways, comments)
- **Grace Period:** Temporary deactivation before permanent deletion
- **Final Confirmation:** Multiple confirmation steps for irreversible actions

### **Mobile & Accessibility Features**

**Mobile Optimization:**
- **Touch-Friendly Controls:** Large buttons and touch targets
- **Mobile-Specific Layouts:** Optimized forms for mobile editing
- **Gesture Support:** Swipe and pinch gestures where appropriate
- **Mobile Upload:** Camera integration for profile photo updates

**Accessibility Features:**
- **Screen Reader Support:** Proper labeling and structure
- **Keyboard Navigation:** Full functionality without mouse
- **Color Blind Support:** Alternative visual indicators beyond color
- **Text Scaling:** Respect system text size preferences
- **Focus Management:** Clear focus indicators for interactive elements

### **Save & Sync Features**

**Auto-Save Functionality:**
- **Automatic Saving:** Changes saved automatically as user types
- **Save Indicators:** Visual feedback when changes are saved
- **Conflict Resolution:** Handle simultaneous changes from multiple devices
- **Version History:** Track changes to important settings

**Cross-Device Synchronization:**
- **Settings Sync:** Preferences synchronized across all devices
- **Session Continuity:** Seamless experience across device switches
- **Backup & Restore