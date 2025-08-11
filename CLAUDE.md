# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application for creative asset management and review workflows, built with TypeScript, React 19, and Firebase backend services.

## Key Commands

### Development
```bash
npm run dev        # Start development server on http://localhost:3000
npm run build      # Create production build
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Dependency Management
- **IMPORTANT**: This project uses React 19. When installing packages, check compatibility first.
- The `vaul` package (v0.9.9) currently has a peer dependency conflict with React 19. To resolve, either:
  1. Update to a React 19-compatible version of vaul (check `npm view vaul versions`)
  2. Replace vaul with an alternative drawer/modal library
  3. Use `npm install --force` as a last resort (not recommended)

## Architecture & Structure

### Core Technologies
- **Framework**: Next.js 15.2.4 with App Router
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database/Auth**: Firebase (Firestore, Auth, Storage)
- **Forms**: react-hook-form with Zod validation
- **State Management**: React Context (AuthContext)

### Key Directories
- `/app` - Next.js App Router pages and layouts
- `/components` - Reusable React components
  - `/ui` - shadcn/ui base components
  - `/common` - Custom form components (FormCardSection, FormDialog, FormDropdown)
  - `/input` - Form input components
- `/lib` - Core utilities and Firebase configuration
- `/hooks` - Custom React hooks (useAIFields, useFirebaseDrafts, etc.)
- `/contexts` - React Context providers (AuthContext)
- `/utils` - Utility functions (draftStorage.v2, dropdownSpellcheck)
- `/config` - Configuration files (sidebar.ts)

### Authentication Flow
The app uses Firebase Authentication with email/password:
1. AuthContext (`/contexts/AuthContext.tsx`) wraps the entire app
2. ProtectedRoute component guards authenticated pages
3. User data stored in Firestore `users` collection

### Key Features & Pages
- **Dashboard** (`/`) - Main dashboard
- **Upload** (`/upload/single`) - Single creative upload with draft support
- **Creatives** (`/creatives`) - Browse creative assets
- **Strategy Sync** (`/strategy-sync`) - Strategy synchronization
- **Lightbox** (`/lightbox`) - Creative lightbox view
- **Takeaway History** (`/takeaway-history`) - History tracking
- **Tag Glossary** (`/tag-glossary`) - Tag management system

### Data Storage Patterns
- **Local Storage**: Draft forms via `DraftStorageV2` utility
- **Firebase Firestore**: Persistent data and user records
- **Firebase Storage**: File/image uploads

### Component Patterns
- Forms use `FormProvider` from react-hook-form
- Validation with Zod schemas
- Toast notifications via sonner
- Modular form components (FormInput, FormSelect, FormTextarea, etc.)

## Important Configuration

### Build Settings (next.config.mjs)
- ESLint errors ignored during builds
- TypeScript errors ignored during builds
- Images unoptimized for development

### TypeScript Configuration
- Path alias: `@/*` maps to root directory
- Target: ES6
- Strict mode enabled

### Firebase Services
The app is configured to use Firebase project "creative-review-yield" with:
- Firestore for database
- Authentication (Email/Password must be enabled in Firebase Console)
- Storage for file uploads

## Development Notes

### When Adding New Features
1. Follow existing component patterns in `/components`
2. Use shadcn/ui components from `/components/ui` when possible
3. Place reusable form components in `/components/common`
4. Create custom hooks in `/hooks` for shared logic
5. Use the established Firebase service patterns in `/lib/firebase.ts`

### Error Handling
- Firebase auth errors are caught and provide helpful messages
- Check Firebase Console to ensure Email/Password auth is enabled
- Draft autosave includes error handling with toast notifications

### Styling Conventions
- Use Tailwind CSS classes
- Follow existing component styling patterns
- Custom fonts: Geist Sans and Geist Mono