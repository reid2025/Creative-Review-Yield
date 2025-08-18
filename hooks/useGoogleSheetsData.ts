import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useGoogleAuth } from '@/contexts/GoogleAuthContext'
import { toast } from 'sonner'

interface GoogleSheetRow {
  [key: string]: string
}

interface CreativeHistoryEntry {
  date: string
  cost: string
  costPerWebsiteLead: string
  costPerLinkClick: string
  dataSource: 'google-sheets' | 'manual'
}

interface MergedCreative {
  uniqueKey: string
  accountName: string
  campaignName: string
  imageAssetName: string
  imageUrl?: string
  litigationName?: string
  campaignType?: string
  designer?: string
  startDate?: string
  endDate?: string
  markedAsTopAd?: boolean
  optimizationValue?: boolean
  history: CreativeHistoryEntry[]
  firstSeen: Date
  lastUpdated: Date
  recordCount: number
  savedInLibrary?: boolean
  libraryStatus?: 'draft' | 'saved'
}

// Function to fetch directly from Google Sheets API (client-side)
async function fetchGoogleSheetsData(accessToken: string | null) {
  if (!accessToken) {
    throw new Error('No access token available. Please sign in.')
  }

  // Check if gapi is ready
  if (!window.gapi || !window.gapi.client) {
    throw new Error('Google API not ready. Please refresh the page.')
  }

  const SPREADSHEET_ID = '1XaYez9SPv-ICmjdDSfTEfjK29bRgk3l7vKTz4Kg8Gnc'
  const RANGE = 'A:Z'
  
  const response = await window.gapi.client.request({
    path: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}`,
    method: 'GET',
  })

  if (!response.result.values || response.result.values.length === 0) {
    throw new Error('No data found in spreadsheet')
  }

  const values = response.result.values
  const headers = values[0]
  const rows = values.slice(1)

  // Convert to objects
  const rawData: GoogleSheetRow[] = rows.map(row => {
    const obj: GoogleSheetRow = {}
    headers.forEach((header, index) => {
      obj[header] = row[index] || ''
    })
    return obj
  })

  return rawData
}

// Function to merge creatives
function mergeCreatives(data: GoogleSheetRow[]): MergedCreative[] {
  const mergedMap = new Map<string, MergedCreative>()
  
  data.forEach((row) => {
    const imageUrl = row['Image asset URL'] || ''
    if (!imageUrl) return
    
    const key = imageUrl.toLowerCase()
    
    const historyEntry: CreativeHistoryEntry = {
      date: row['Date'] || new Date().toISOString(),
      cost: row['Cost'] || '0',
      costPerWebsiteLead: row['Cost per website lead'] || '0',
      costPerLinkClick: row['CPC (cost per link click)'] || '0',
      dataSource: 'google-sheets'
    }
    
    if (mergedMap.has(key)) {
      const existing = mergedMap.get(key)!
      existing.history.push(historyEntry)
      existing.recordCount++
      existing.lastUpdated = new Date(row['Date'] || new Date())
      
      if (!existing.accountName.includes(row['Account name'])) {
        existing.accountName += ` | ${row['Account name']}`
      }
      
      if (!existing.campaignName.includes(row['Campaign name'])) {
        existing.campaignName += ` | ${row['Campaign name']}`
      }
    } else {
      const merged: MergedCreative = {
        uniqueKey: key,
        accountName: row['Account name'] || '',
        campaignName: row['Campaign name'] || '',
        imageAssetName: row['Image asset name'] || '',
        imageUrl: row['Image asset URL'],
        litigationName: extractLitigation(row['Campaign name']),
        campaignType: extractCampaignType(row['Campaign name']),
        history: [historyEntry],
        firstSeen: new Date(row['Date'] || new Date()),
        lastUpdated: new Date(row['Date'] || new Date()),
        recordCount: 1,
        markedAsTopAd: false,
        optimizationValue: false
      }
      mergedMap.set(key, merged)
    }
  })
  
  // Sort history by date for each creative
  mergedMap.forEach((creative) => {
    creative.history.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
  })
  
  return Array.from(mergedMap.values())
}

function extractLitigation(campaignName: string): string {
  if (!campaignName) return ''
  const parts = campaignName.split('/')
  if (parts.length > 0) {
    return parts[0].trim()
  }
  return campaignName
}

function extractCampaignType(campaignName: string): string {
  if (!campaignName) return ''
  const lowerCase = campaignName.toLowerCase()
  if (lowerCase.includes('social')) return 'Social Media'
  if (lowerCase.includes('search')) return 'Search'
  if (lowerCase.includes('display')) return 'Display'
  if (lowerCase.includes('video')) return 'Video'
  return 'Other'
}

// Custom hook for Google Sheets data
export function useGoogleSheetsData() {
  const { user, gapiInited } = useGoogleAuth()
  const queryClient = useQueryClient()

  // Main query for fetching data
  const query = useQuery({
    queryKey: ['googleSheetsData', user?.access_token],
    queryFn: async () => {
      const rawData = await fetchGoogleSheetsData(user?.access_token || null)
      const merged = mergeCreatives(rawData)
      
      // Sort by lastUpdated date (latest first)
      merged.sort((a, b) => {
        return b.lastUpdated.getTime() - a.lastUpdated.getTime()
      })
      
      return {
        rawData,
        mergedCreatives: merged,
        stats: {
          totalRecords: rawData.length,
          uniqueCreatives: merged.length
        },
        fetchedAt: new Date()
      }
    },
    enabled: !!user?.access_token && typeof window !== 'undefined' && gapiInited && !!window.gapi?.client,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  })

  // Mutation for manual refresh
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const rawData = await fetchGoogleSheetsData(user?.access_token || null)
      const merged = mergeCreatives(rawData)
      
      merged.sort((a, b) => {
        return b.lastUpdated.getTime() - a.lastUpdated.getTime()
      })
      
      return {
        rawData,
        mergedCreatives: merged,
        stats: {
          totalRecords: rawData.length,
          uniqueCreatives: merged.length
        },
        fetchedAt: new Date()
      }
    },
    onSuccess: (data) => {
      // Update the cache with new data
      queryClient.setQueryData(['googleSheetsData', user?.access_token], data)
      toast.success(`Refreshed: ${data.stats.totalRecords} records, ${data.stats.uniqueCreatives} unique creatives`)
    },
    onError: (error) => {
      console.error('Error refreshing data:', error)
      toast.error('Failed to refresh data')
    }
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    refresh: refreshMutation.mutate,
    isRefreshing: refreshMutation.isPending,
    lastFetchTime: query.data?.fetchedAt
  }
}