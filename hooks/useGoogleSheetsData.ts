import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useGoogleAuth } from '@/contexts/GoogleAuthContext'
import { toast } from 'sonner'
import { parseGoogleSheetsDate, fromCTToUTC } from '@/lib/timezone-utils'

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

interface AdSetEntry {
  adSetId: string
  adId: string
  adCreativeId: string
  accountName: string
  campaignName: string
  campaignStatus: string
  cost: string
  costPerWebsiteLead: string
  costPerLinkClick: string
  websiteLeads: string
  linkClicks: string
  date: string
}

interface GroupedCreative {
  uniqueKey: string // imageAssetId (primary unique identifier)
  imageAssetId: string
  imageAssetName: string
  imageUrl?: string
  litigationName?: string
  campaignType?: string
  accountName: string
  campaignName: string
  campaignStatus: string
  adSets: AdSetEntry[] // All ad sets for this creative across all dates
  aggregatedMetrics: {
    totalCost: number
    avgCostPerLead: number
    avgCPC: number
    totalAdSets: number
    uniqueAdSets: number
    totalLeads: number
    totalClicks: number
    historyCount: number // Total entries across all ad sets
  }
  firstSeen: Date
  lastUpdated: Date
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

  try {
    const response = await window.gapi.client.request({
      path: `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}`,
      method: 'GET',
      params: {
        majorDimension: 'ROWS',
        valueRenderOption: 'UNFORMATTED_VALUE',
        dateTimeRenderOption: 'FORMATTED_STRING'
      }
    })

    if (!response.result.values || response.result.values.length === 0) {
      throw new Error('No data found in spreadsheet')
    }

    const values = response.result.values
    // console.log('🔍 DEBUG: Raw Google Sheets response:', values.length, 'rows')

    const headers = values[0]
    const rows = values.slice(1)

    // Convert to objects
    const rawData: GoogleSheetRow[] = rows.map((row, index) => {
      const obj: GoogleSheetRow = {}
      headers.forEach((header, headerIndex) => {
        obj[header] = row[headerIndex] || ''
      })

      // Debug first few rows to see structure
      // if (index < 3) console.log(`Converting row ${index}:`, obj['Campaign name'])

      return obj
    })

    // console.log('Raw data conversion complete:', rawData.length, 'rows')

    return rawData
  } catch (error: any) {
    console.error('Google Sheets API Error:', {
      error,
      message: error?.message,
      status: error?.status,
      result: error?.result,
      body: error?.body,
      errorType: typeof error,
      errorString: String(error),
      errorKeys: Object.keys(error || {}),
      gapihint: window.gapi ? 'GAPI available' : 'GAPI not available',
      clientHint: window.gapi?.client ? 'Client available' : 'Client not available'
    })
    
    if (error?.status === 403) {
      throw new Error('Access denied to spreadsheet. Please check permissions.')
    } else if (error?.status === 401) {
      throw new Error('Authentication expired. Please sign in again.')
    } else if (error?.status === 404) {
      throw new Error('Spreadsheet not found. Please check the spreadsheet ID.')
    } else {
      throw new Error(error?.message || 'Failed to fetch data from Google Sheets')
    }
  }
}

// Helper function to safely parse cost values (handles strings like "$1,234.56" and numbers)
function parseCostValue(value: any): number {
  if (value === null || value === undefined || value === '') {
    return 0
  }

  // If it's already a number, return it
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value
  }

  // If it's a string, clean it up and parse
  if (typeof value === 'string') {
    // Remove currency symbols, commas, and whitespace
    const cleaned = value.replace(/[$,\s]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  // Try to convert to number as fallback
  const parsed = parseFloat(String(value))
  return isNaN(parsed) ? 0 : parsed
}

// Function to group creatives by Image Asset ID - COMPLETELY REWRITTEN FOR PROPER GROUPING
function mergeCreatives(data: GoogleSheetRow[]): GroupedCreative[] {
  console.log('🔍 DEBUG: Processing Google Sheets data:', data.length, 'rows')

  // === GOOGLE SHEETS DEBUG ===
  console.log('=== GOOGLE SHEETS COLUMN DEBUG ===');
  console.log('Total rows loaded:', data.length);

  // Check first few rows structure
  if (data.length > 0) {
    console.log('First 3 rows structure:', data.slice(0, 3).map((row, index) => ({
      rowIndex: index,
      keys: Object.keys(row),
      imageAssetId: row['Image asset ID'],
      imageAssetIdAlt: row['image_asset_id'],
      imageAssetIdAlt2: row['imageAssetId'],
      imageAssetIdAlt3: row['Image_Asset_ID'],
      imageAssetName: row['Image asset name'],
      imageAssetUrl: row['Image asset URL']
    })));

    // Check what column names actually exist
    console.log('Available columns in first row:', Object.keys(data[0] || {}));

    // Check for different column name variations
    const columnVariations = [
      'Image asset ID',
      'Image Asset ID',
      'image_asset_id',
      'imageAssetId',
      'Image_Asset_ID',
      'IMAGE_ASSET_ID',
      'creative_id',
      'Creative ID',
      'IMAGE ASSET ID'
    ];

    console.log('=== COLUMN VARIATION CHECK ===');
    columnVariations.forEach(colName => {
      const count = data.filter(row => {
        const value = row[colName];
        return value && value.toString().trim() !== '';
      }).length;
      console.log(`Column "${colName}": ${count} non-empty values`);

      if (count > 0) {
        console.log(`  Sample values for "${colName}":`, data.filter(row => row[colName]).slice(0, 3).map(row => row[colName]));
      }
    });

    // Count total rows with ANY form of Image Asset ID
    const rowsWithAnyImageAssetId = data.filter(row => {
      return columnVariations.some(colName => {
        const value = row[colName];
        return value && value.toString().trim() !== '';
      });
    });
    console.log('Rows with ANY Image Asset ID variation:', rowsWithAnyImageAssetId.length);
  }

  // Step 1: Group all raw data by imageAssetId
  const groupingMap = new Map<string, {
    imageAssetId: string
    imageAssetName: string
    imageUrl: string
    accountName: string
    campaignName: string
    campaignStatus: string
    litigationName: string
    campaignType: string
    allEntries: AdSetEntry[]
    allDates: Date[]
  }>()

  let skippedRows = 0
  let processedRows = 0

  // Debug: Check data structure
  if (data.length > 0) {
    console.log('🔍 DEBUG: Sample columns:', Object.keys(data[0]))
    console.log('🔍 DEBUG: First row sample:', data[0])
  }

  // Process every single row and group by Image Asset ID ONLY
  data.forEach((row, index) => {
    const imageAssetId = (row['Image asset ID'] || '').toString().trim()

    // ONLY use Image Asset ID as unique key - no fallbacks
    if (!imageAssetId) {
      skippedRows++
      console.log(`⚠️ Skipping row ${index}: No Image Asset ID`)
      return
    }

    const uniqueKey = imageAssetId

    // Parse date
    const centralDate = parseGoogleSheetsDate(row['Date'])
    const utcDate = fromCTToUTC(centralDate)
    const dateString = utcDate.toISO() || new Date().toISOString()
    const entryDate = new Date(dateString)

    // Create ad set entry - try multiple column name variations for Ad Set ID
    const adSetId = row['Ad Set ID'] || row['AdSet ID'] || row['Ad set ID'] || row['adSetId'] || row['Adset ID'] || ''

    const adSetEntry: AdSetEntry = {
      adSetId: adSetId,
      adId: row['Ad ID'] || row['AdID'] || '',
      adCreativeId: row['Ad Creative ID'] || row['AdCreative ID'] || '',
      accountName: row['Account name'] || '',
      campaignName: row['Campaign name'] || '',
      campaignStatus: row['Campaign status'] || 'Unknown',
      cost: row['Cost'] || '0',
      costPerWebsiteLead: row['Cost per website lead'] || row['Cost per Website Lead'] || '0',
      costPerLinkClick: row['CPC (cost per link click)'] || row['CPC'] || '0',
      websiteLeads: row['Website Leads'] || row['Website leads'] || '0',
      linkClicks: row['Link Clicks'] || row['Link clicks'] || '0',
      date: dateString
    }

    // Debug ad set ID for first few entries
    if (index < 5) {
      console.log(`🔍 DEBUG Row ${index} Ad Set ID:`, {
        adSetId: adSetId,
        availableColumns: Object.keys(row).filter(key => key.toLowerCase().includes('set') || key.toLowerCase().includes('id')),
        adSetColumns: {
          'Ad Set ID': row['Ad Set ID'],
          'AdSet ID': row['AdSet ID'],
          'Ad set ID': row['Ad set ID'],
          'adSetId': row['adSetId'],
          'Adset ID': row['Adset ID']
        }
      })
    }

    if (groupingMap.has(uniqueKey)) {
      // Add to existing group
      const existing = groupingMap.get(uniqueKey)!
      existing.allEntries.push(adSetEntry)
      existing.allDates.push(entryDate)
    } else {
      // Create new group - imageAssetId is guaranteed to exist here
      groupingMap.set(uniqueKey, {
        imageAssetId: imageAssetId,
        imageAssetName: row['Image asset name'] || '',
        imageUrl: row['Image asset URL'] || '',
        accountName: row['Account name'] || '',
        campaignName: row['Campaign name'] || '',
        campaignStatus: row['Campaign status'] || 'Unknown',
        litigationName: extractLitigation(row['Campaign name']),
        campaignType: extractCampaignType(row['Campaign name']),
        allEntries: [adSetEntry],
        allDates: [entryDate]
      })
    }

    processedRows++
  })

  console.log(`🔍 DEBUG: Found ${groupingMap.size} unique Image Asset IDs`)
  console.log(`🔍 DEBUG: Processed ${processedRows} rows, skipped ${skippedRows} rows (rows without Image Asset ID)`)

  // Log ratio of valid vs invalid rows
  const validRatio = ((processedRows / data.length) * 100).toFixed(1)
  console.log(`🔍 DEBUG: ${validRatio}% of rows have Image Asset ID`)

  // Step 2: Convert grouped data to final GroupedCreative format
  const groupedCreatives: GroupedCreative[] = []

  groupingMap.forEach((group, uniqueKey) => {
    // Calculate aggregated metrics
    const uniqueAdSetIds = new Set(group.allEntries.map(entry => entry.adSetId))

    let totalCost = 0
    let totalLeads = 0
    let totalClicks = 0
    let totalCPLSum = 0
    let totalCPCSum = 0
    let validCPLCount = 0
    let validCPCCount = 0

    group.allEntries.forEach(entry => {
      const cost = parseCostValue(entry.cost)
      const leads = parseCostValue(entry.websiteLeads)
      const clicks = parseCostValue(entry.linkClicks)
      const cpl = parseCostValue(entry.costPerWebsiteLead)
      const cpc = parseCostValue(entry.costPerLinkClick)

      totalCost += cost
      totalLeads += leads
      totalClicks += clicks

      if (cpl > 0) {
        totalCPLSum += cpl
        validCPLCount++
      }

      if (cpc > 0) {
        totalCPCSum += cpc
        validCPCCount++
      }
    })

    // Find first and last dates
    const sortedDates = group.allDates.sort((a, b) => a.getTime() - b.getTime())
    const firstSeen = sortedDates[0]
    const lastUpdated = sortedDates[sortedDates.length - 1]

    const groupedCreative: GroupedCreative = {
      uniqueKey,
      imageAssetId: group.imageAssetId,
      imageAssetName: group.imageAssetName,
      imageUrl: group.imageUrl,
      litigationName: group.litigationName,
      campaignType: group.campaignType,
      accountName: group.accountName,
      campaignName: group.campaignName,
      campaignStatus: group.campaignStatus,
      adSets: group.allEntries,
      aggregatedMetrics: {
        totalCost,
        avgCostPerLead: validCPLCount > 0 ? totalCPLSum / validCPLCount : 0,
        avgCPC: validCPCCount > 0 ? totalCPCSum / validCPCCount : 0,
        totalAdSets: group.allEntries.length,
        uniqueAdSets: uniqueAdSetIds.size,
        totalLeads,
        totalClicks,
        historyCount: group.allEntries.length
      },
      firstSeen,
      lastUpdated
    }

    groupedCreatives.push(groupedCreative)
  })

  // Sort by last updated date (newest first) - ensure proper Date comparison
  groupedCreatives.sort((a, b) => {
    const dateA = a.lastUpdated instanceof Date ? a.lastUpdated : new Date(a.lastUpdated)
    const dateB = b.lastUpdated instanceof Date ? b.lastUpdated : new Date(b.lastUpdated)
    return dateB.getTime() - dateA.getTime()
  })

  console.log('🔍 DEBUG: Sorting verification - top 3 creatives by date:')
  groupedCreatives.slice(0, 3).forEach((creative, i) => {
    console.log(`  ${i + 1}. ${creative.imageAssetName}: lastUpdated = ${creative.lastUpdated.toISOString().split('T')[0]}`)
  })

  console.log(`✅ FINAL GROUPING RESULTS:`)
  console.log(`📊 Input: ${data.length} total Google Sheets rows`)
  console.log(`📊 Output: ${groupedCreatives.length} unique creatives`)
  console.log(`📊 Processed: ${processedRows} rows`)
  console.log(`📊 Skipped: ${skippedRows} rows`)

  // Debug: Show detailed sample
  if (groupedCreatives.length > 0) {
    const sample = groupedCreatives.slice(0, 3)
    console.log('🔍 DEBUG: Sample grouped creatives:')
    sample.forEach((creative, i) => {
      // Get unique ad set IDs for this creative
      const uniqueAdSetIds = [...new Set(creative.adSets.map(adSet => adSet.adSetId).filter(Boolean))]
      console.log(`  Creative ${i + 1}:`, {
        imageAssetName: creative.imageAssetName,
        totalEntries: creative.adSets.length,
        uniqueAdSetsCount: creative.aggregatedMetrics.uniqueAdSets,
        uniqueAdSetIds: uniqueAdSetIds,
        adSetIdsInData: creative.adSets.slice(0, 5).map(ads => ads.adSetId), // First 5 ad set IDs
        totalCost: creative.aggregatedMetrics.totalCost.toFixed(2),
        dateRange: {
          firstSeen: creative.firstSeen.toISOString().split('T')[0],
          lastUpdated: creative.lastUpdated.toISOString().split('T')[0]
        }
      })
    })
  }

  // Debug: Check for the specific uber-eats creative
  const uberEatsCreatives = groupedCreatives.filter(c =>
    c.uniqueKey.includes('uber-eats_claim-up-to-200-trip_yellow_ciyo-fcr.png_105') ||
    c.imageAssetName.toLowerCase().includes('uber') ||
    c.imageAssetName.includes('uber-eats_claim-up-to-200-trip_yellow_ciyo-fcr.png_105')
  )

  if (uberEatsCreatives.length > 0) {
    console.log(`🔍 DEBUG: Found ${uberEatsCreatives.length} Uber Eats creatives:`)
    uberEatsCreatives.forEach((creative, i) => {
      console.log(`  Uber Creative ${i + 1}:`, {
        uniqueKey: creative.uniqueKey,
        imageAssetId: creative.imageAssetId,
        totalEntries: creative.adSets.length,
        uniqueAdSets: creative.aggregatedMetrics.uniqueAdSets
      })
    })
  } else {
    console.log('🔍 DEBUG: No Uber Eats creatives found in grouped results')
  }

  return groupedCreatives
}

// Helper function to calculate aggregated metrics from ad sets
function calculateAggregatedMetrics(adSets: AdSetEntry[]) {
  let totalCost = 0
  let totalLeads = 0
  let totalClicks = 0
  let totalCPLSum = 0
  let totalCPCSum = 0
  let validCPLCount = 0
  let validCPCCount = 0

  adSets.forEach(adSet => {
    const cost = parseFloat(adSet.cost) || 0
    const leads = parseFloat(adSet.websiteLeads) || 0
    const clicks = parseFloat(adSet.linkClicks) || 0
    const cpl = parseFloat(adSet.costPerWebsiteLead) || 0
    const cpc = parseFloat(adSet.costPerLinkClick) || 0

    totalCost += cost
    totalLeads += leads
    totalClicks += clicks

    if (cpl > 0) {
      totalCPLSum += cpl
      validCPLCount++
    }

    if (cpc > 0) {
      totalCPCSum += cpc
      validCPCCount++
    }
  })

  return {
    totalCost,
    avgCostPerLead: validCPLCount > 0 ? totalCPLSum / validCPLCount : 0,
    avgCPC: validCPCCount > 0 ? totalCPCSum / validCPCCount : 0,
    totalAdSets: adSets.length,
    totalLeads,
    totalClicks
  }
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
      try {
        console.log('🔄 Starting Google Sheets data fetch...')
        const rawData = await fetchGoogleSheetsData(user?.access_token || null)
        console.log('📥 Raw data loaded:', rawData.length, 'rows')

        const merged = mergeCreatives(rawData)
        
        // Sort by last updated date (latest first)
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
      } catch (error: any) {
        console.error('Query error:', {
          error,
          message: error?.message,
          stack: error?.stack,
          user: user?.email,
          gapiInited,
          hasGapiClient: !!window.gapi?.client,
          windowGapi: !!window.gapi,
          accessToken: !!user?.access_token
        })
        throw error
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
      try {
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
      } catch (error: any) {
        console.error('Refresh mutation error:', {
          error,
          message: error?.message,
          stack: error?.stack,
          user: user?.email,
          gapiInited,
          hasGapiClient: !!window.gapi?.client,
          windowGapi: !!window.gapi,
          accessToken: !!user?.access_token
        })
        throw error
      }
    },
    onSuccess: (data) => {
      // Update the cache with new data
      queryClient.setQueryData(['googleSheetsData', user?.access_token], data)
      toast.success(`Refreshed: ${data.stats.totalRecords} records, ${data.stats.dailyEntries} daily entries`)
    },
    onError: (error: any) => {
      console.error('Error refreshing data:', {
        error,
        message: error?.message,
        status: error?.status,
        stack: error?.stack
      })
      
      const errorMessage = error?.message || 'Failed to refresh data'
      toast.error(errorMessage)
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