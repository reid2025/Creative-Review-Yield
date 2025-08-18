import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { getServerSession } from 'next-auth/next'

// Google Sheets configuration
const SPREADSHEET_ID = '1XaYez9SPv-ICmjdDSfTEfjK29bRgk3l7vKTz4Kg8Gnc'
const RANGE = 'A:Z'

// Cache the Google Sheets data for 5 minutes
const getCachedGoogleSheetsData = unstable_cache(
  async (accessToken: string) => {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch Google Sheets data')
    }

    const data = await response.json()
    return {
      values: data.values,
      fetchedAt: new Date().toISOString()
    }
  },
  ['google-sheets-data'], // Cache key
  {
    revalidate: 300, // Cache for 5 minutes (300 seconds)
    tags: ['google-sheets']
  }
)

export async function GET(request: NextRequest) {
  try {
    // Get the access token from the request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.split(' ')[1]

    // Get cached data (will fetch if not cached or expired)
    const data = await getCachedGoogleSheetsData(accessToken)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

// Force refresh endpoint
export async function POST(request: NextRequest) {
  try {
    // Revalidate the cache
    const { revalidateTag } = await import('next/cache')
    revalidateTag('google-sheets')
    
    return NextResponse.json({ revalidated: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
}