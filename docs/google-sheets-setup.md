# Google Sheets Integration Setup Guide

This guide will help you set up the Google Sheets integration to fetch data from your private Google Sheets.

## Prerequisites

- A Google account (any Gmail account, not necessarily the Firebase one)
- Access to Google Cloud Console
- The spreadsheet ID (already configured: `1XaYez9SPv-ICmjdDSfTEfjK29bRgk3l7vKTz4Kg8Gnc`)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" → "New Project"
3. Enter a project name (e.g., "CRY Sheets Integration")
4. Click "Create"

## Step 2: Enable Google Sheets API

1. In your Google Cloud project, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"
4. Also search and enable "Google Identity Platform" or "Google+ API" for user info

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in the required fields:
     - App name: "CRY Creative Tracker"
     - User support email: your email
     - Developer contact: your email
   - Add scopes:
     - `https://www.googleapis.com/auth/spreadsheets.readonly`
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
   - Add test users (your email and any other emails that need access)

4. Back to creating OAuth client ID:
   - Application type: "Web application"
   - Name: "CRY Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production URL (when deploying)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/google-sheets/callback` (for development)
     - `https://yourdomain.com/api/google-sheets/callback` (for production)
   - Click "Create"

5. Copy the Client ID and Client Secret

## Step 4: Configure Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add the following variables:

```env
# Google Sheets API
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 5: Grant Access to the Spreadsheet

Since your spreadsheet is private, you need to ensure the Google account you're using has access:

1. Open your [Google Sheet](https://docs.google.com/spreadsheets/d/1XaYez9SPv-ICmjdDSfTEfjK29bRgk3l7vKTz4Kg8Gnc)
2. Click "Share" button
3. Add the email addresses that will be accessing the sheet
4. Give them at least "Viewer" permission

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `/google-sheets`
3. Click "Sign in with Google"
4. Authorize the application
5. You should see your spreadsheet data

## How It Works

1. **Authentication Flow**:
   - User clicks "Sign in with Google"
   - Redirected to Google OAuth consent screen
   - After approval, redirected back with authorization code
   - Code is exchanged for access tokens
   - Tokens are stored in HTTP-only cookies for security

2. **Data Fetching**:
   - Uses the stored access token to authenticate with Google Sheets API
   - Fetches data from the specified spreadsheet
   - Converts rows to JSON objects using headers as keys
   - Data is displayed in a searchable, exportable table

3. **Security**:
   - Tokens are stored in HTTP-only cookies (not accessible via JavaScript)
   - Refresh tokens are used to maintain long sessions
   - Each user can only access sheets they have permission to view

## Features

- **Multiple Google Accounts**: Users can sign in with any Google account, not just the Firebase one
- **Private Sheet Access**: Works with private sheets as long as the user has view access
- **Search & Filter**: Search across all data in the sheet
- **Export**: Download the data as JSON
- **Auto-refresh**: Manually refresh to get latest data
- **Secure**: OAuth 2.0 authentication with token management

## Troubleshooting

### "Not authenticated" error
- Clear cookies and re-authenticate
- Check if tokens have expired

### "Failed to fetch spreadsheet data"
- Verify the Google account has access to the sheet
- Check if Google Sheets API is enabled in your project
- Verify environment variables are set correctly

### "Token expired"
- The app will automatically prompt for re-authentication
- Click "Sign in with Google" again

### Rate Limits
- Google Sheets API has quotas (300 requests per minute)
- For production, consider implementing caching

## Production Deployment

When deploying to production:

1. Update OAuth redirect URIs in Google Cloud Console
2. Update `NEXT_PUBLIC_APP_URL` in production environment
3. Ensure cookies are set with `secure: true` (already configured)
4. Consider implementing rate limiting and caching

## API Endpoints

- `GET /api/google-sheets/auth` - Initiates OAuth flow
- `GET /api/google-sheets/callback` - Handles OAuth callback
- `GET /api/google-sheets/data` - Fetches spreadsheet data
- `POST /api/google-sheets/data` - Logs out (clears tokens)