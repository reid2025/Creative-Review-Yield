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

This is a Next.js 15.2.4 application using App Router for tracking legal marketing creatives. The application uses Firebase for backend services (Firestore, Auth, Storage) and shadcn/ui for the component library.

### Core Services

**Firebase Integration (`/lib/firebase.ts`, `/lib/firebase-draft-service.ts`)**
- All Firebase operations go through these service files
- Draft service handles auto-save with 30-second intervals
- Images are stored in Firebase Storage under `creative-images/{userId}/`
- Real-time listeners use Firestore's onSnapshot for live updates

**Authentication (`/contexts/AuthContext.tsx`)**
- Firebase Auth wrapped in React Context
- Access user with `useAuth()` hook
- Protected routes should check `user` object from context

**Draft Management System**
- Drafts auto-save every 30 seconds via `firebase-draft-service.ts`
- Use `useFirebaseDrafts` hook for real-time draft synchronization
- Draft IDs are generated using Firebase's auto-ID system
- Images upload to Firebase Storage with progress tracking

### Key Patterns

**Form Handling**
- All forms use React Hook Form with Zod validation
- Form components are in `/components/input/form-fields.tsx`
- Use controlled components with register() from react-hook-form

**UI Components**
- All UI components from shadcn/ui are in `/components/ui/`
- Import components like: `import { Button } from "@/components/ui/button"`
- Custom dialogs use `FormDialog` component for consistency

**State Management**
- Global auth state via AuthContext
- Local state with React hooks
- Real-time data with Firebase listeners (onSnapshot)

**Error Handling**
- Use toast notifications via `sonner` for user feedback
- Firebase errors should be caught and displayed with user-friendly messages
- Connection status monitoring in draft service

### Important Configuration

**Next.js Config (`next.config.mjs`)**
- ESLint errors ignored during builds
- TypeScript errors ignored during builds  
- Image optimization disabled

**Firebase Config**
- Configuration is hardcoded in `/lib/firebase.ts`
- Collections: `drafts`, `tags`, `creatives`
- Storage bucket: `creative-images/`

### File Upload System
- Single upload: `/app/upload/single/page.tsx`
- Bulk upload: `/app/upload/bulk/page.tsx`
- Uses react-dropzone for file selection
- Images stored in Firebase Storage with userId organization