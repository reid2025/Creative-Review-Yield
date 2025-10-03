# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev        # Start development server on http://localhost:3000
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Architecture Overview

This is a Next.js 15.2.4 application using App Router for tracking and analyzing legal marketing creatives. The application integrates Firebase (Firestore + Storage + Vertex AI), Google Sheets API, and shadcn/ui component library.

### Core Services

**Firebase Integration (`/lib/firebase.ts`, `/lib/firebase-draft-service.ts`, `/lib/firebase-ai-service.ts`)**
- All configuration managed through `/lib/env.ts` - **no .env file needed** (hardcoded config)
- **Firestore Collections**: `creatives` (multi-user draft system with version tracking)
- **Storage**: Images stored at `creative-images/{creativeId}/{filename}`
- **Vertex AI**: Gemini model for image analysis and auto-population of form fields
  - Enabled via `env.vertexAI.enabled` flag
  - Analyzes creative images to extract text, layout, imagery, CTA details
  - Uses tag glossary to suggest matching options or new tags
  - Retry logic with exponential backoff for rate limiting
- **Real-time Updates**: onSnapshot listeners for live draft synchronization
- **Multi-user Features**:
  - `creativeId` based on image asset for deduplication
  - Per-user drafts stored in `userDrafts` map
  - Edit history tracking with user attribution
  - Published version tracking separate from drafts

**Google Authentication & Sheets API (`/contexts/GoogleAuthContext.tsx`)**
- OAuth2 flow with hardcoded client ID and spreadsheet ID (no env vars)
- Token persistence in localStorage with auto-restore on refresh
- Access control: validates user has read access to specific spreadsheet
- Session state management for post-login redirects
- Scripts: GAPI (Google API) and GIS (Google Identity Services) loaded via Next.js Script

**Creative Data Layer (`/contexts/CreativeDataContext.tsx`)**
- **Unified data source** combining Firebase drafts and Google Sheets performance data
- `EnhancedCreative` interface merges both data sources
- Auto-matches creatives by filename or image URL
- Provides utility functions: `getCreativeById`, `getImageUrlForCreative`
- Real-time updates from both Firebase and Google Sheets

**AI Analysis System (`/lib/firebase-ai-service.ts`)**
- `analyzeCreativeImage()`: Analyzes user-uploaded images
- `analyzeGoogleSheetsData()`: Analyzes Facebook ad images via proxy API
- Tag glossary integration: AI checks existing tags before suggesting new ones
- Structured analysis prompt with field-by-field logic
- Validation and fuzzy matching against tag glossary
- Partial data recovery from malformed AI responses

### Key Patterns

**Form Handling**
- React Hook Form + Zod validation across all forms
- Custom components: `FormDialog`, `FormCardSection`, `FormDropdown` in `/components/common/`
- AI auto-population: `aiPopulatedFields` array tracks which fields were AI-generated

**UI Components**
- Shadcn/ui components in `/components/ui/`
- Import pattern: `import { Button } from "@/components/ui/button"`
- Custom floating inputs: `FloatingInput`, `FloatingSelect` for better UX
- Accordion-based layout for complex forms (Performance, CTA, Attributes, etc.)

**State Management**
- **Global Context**: `GoogleAuthContext`, `CreativeDataContext`
- **React Query**: `@tanstack/react-query` for Google Sheets data fetching
- **Custom Hooks**: `useFirebaseDrafts`, `useGoogleSheetsData`, `useSessionMonitor`
- **Local State**: React hooks for component-specific state

**Error Handling & User Feedback**
- Toast notifications via `sonner` library
- Offline detection with auto-sync on reconnection
- Session expiration modal with state preservation
- Detailed error logging in AI service for debugging

### Important Configuration

**Next.js Config (`next.config.mjs`)**
- ESLint and TypeScript errors ignored during builds
- Image optimization disabled (`unoptimized: true`)
- Turbo mode enabled for faster dev reload
- Console logs preserved in production

**Environment (`/lib/env.ts`)**
- **Hardcoded configuration** - no .env file used
- Firebase config with all API keys
- Vertex AI feature flag: `vertexAI.enabled`
- Change `app.url` for production deployments

**Google Sheets Integration**
- Client ID: `277440481893-266hjhtdct3vmh1u3rs4cdtt9rrf6a8u.apps.googleusercontent.com`
- Spreadsheet ID: `1XaYez9SPv-ICmjdDSfTEfjK29bRgk3l7vKTz4Kg8Gnc`
- Scopes: sheets.readonly, userinfo.email, userinfo.profile

### File Structure
- `/app/` - Next.js App Router pages
  - `/creative-library/` - Main library view with filtering
  - `/creative-stream/` - Stream view of creatives
  - `/google-sheets-records/` - Google Sheets data viewer
  - `/tag-glossary/` - Tag management system
  - `/my-drafts/` - User drafts management
- `/components/ui/` - Shadcn/ui components
- `/components/common/` - Shared form components
- `/components/creative-library/` - Library-specific accordions
- `/lib/` - Core services (Firebase, AI, utilities)
- `/contexts/` - React context providers
- `/hooks/` - Custom React hooks
- `/types/` - TypeScript type definitions

### Critical Implementation Notes

**When working with Firebase drafts:**
- Always use `FirebaseDraftService.saveDraft()` - handles data cleaning and File object serialization
- Image files must be uploaded via `saveDraft(data, imageFile, user)`
- Undefined values are automatically removed (Firestore doesn't accept them)
- Multi-user data structure is optional but recommended for collaboration features

**When working with AI analysis:**
- Check `env.vertexAI.enabled` before calling AI services
- Load tag glossary via `firebaseAIService.loadAvailableTags()` before analysis
- Handle rate limiting - service includes retry logic with exponential backoff
- AI responses are validated against tag glossary with fuzzy matching

**When adding new form fields:**
1. Add field to tag glossary (if it uses predefined options)
2. Update AI analysis prompt in `buildAnalysisPrompt()`
3. Add field mapping in `analyzeCreativeImage()` result processing
4. Update `CreativeAnalysisResult` type if needed