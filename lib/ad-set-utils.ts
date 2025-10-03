import { formatCTDate } from '@/lib/timezone-utils'

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

interface MergedCreative {
  uniqueKey: string // Now using imageAssetId
  imageAssetId: string
  imageAssetName: string
  imageUrl?: string
  litigationName?: string
  campaignType?: string
  designer?: string
  startDate?: string
  endDate?: string
  markedAsTopAd?: boolean
  optimizationValue?: boolean
  adSets: AdSetEntry[]
  aggregatedMetrics: {
    totalCost: number
    avgCostPerLead: number
    avgCPC: number
    totalAdSets: number
    totalLeads: number
    totalClicks: number
  }
  firstSeen: Date
  lastUpdated: Date
  recordCount: number
  savedInLibrary?: boolean
  libraryStatus?: 'draft' | 'saved'
  // Legacy compatibility
  history: CreativeHistoryEntry[]
  accountName: string
  campaignName: string
  campaignStatus: string
}

export interface AdSetCreative {
  creative: MergedCreative
  creativeKey: string
  status: 'Active' | 'Paused' | 'Draft'
  cpl: number
  cpc: number
  leads: number
  latestDate: string
}

export interface AdSet {
  adSetKey: string
  accountName: string
  campaignName: string
  firstSeenCT: string
  firstSeenDate: Date
  lastUpdatedCT: string
  lastUpdatedDate: Date
  totalCreatives: number
  activeCount: number
  pausedCount: number
  inactiveCount: number
  draftCount: number
  savedCount: number
  creatives: AdSetCreative[]
}

/**
 * Extract creative identity using Image Asset ID (stable identifier)
 */
export function getCreativeIdentity(creative: MergedCreative): string {
  // Use imageAssetId as the stable unique identifier
  return creative.imageAssetId || creative.uniqueKey || ''
}

/**
 * Calculate First Seen date in Central Time for a creative
 */
export function getFirstSeenCT(creative: MergedCreative): Date {
  if (!creative.history || creative.history.length === 0) {
    return creative.firstSeen
  }
  
  // The dates in history are already stored as UTC, so we use the creative.firstSeen
  // which should already be the correct first seen date
  return creative.firstSeen
}

/**
 * Generate ad set group key based on Account + Campaign + First Seen (CT)
 */
export function getAdSetKey(creative: MergedCreative): string {
  const firstSeenCT = getFirstSeenCT(creative)
  const firstSeenDateStr = formatCTDate(firstSeenCT, 'yyyy-MM-dd')
  
  // Use first account and campaign (before any "|" separators)
  const primaryAccount = creative.accountName.split(' | ')[0].trim()
  const primaryCampaign = creative.campaignName.split(' | ')[0].trim()
  
  return `${primaryAccount}___${primaryCampaign}___${firstSeenDateStr}`.toLowerCase()
}

/**
 * Get creative delivery and workflow statuses separately
 */
export function getCreativeStatuses(creative: MergedCreative): {
  delivery: 'Active' | 'Paused' | 'Inactive' | 'Unknown'
  workflow: 'Draft' | 'Saved' | 'None'
} {
  // Delivery status from campaign status
  const campaignStatus = creative.campaignStatus?.toLowerCase()
  let delivery: 'Active' | 'Paused' | 'Inactive' | 'Unknown'
  
  if (campaignStatus === 'active') {
    delivery = 'Active'
  } else if (campaignStatus === 'paused') {
    delivery = 'Paused'
  } else if (campaignStatus === 'inactive') {
    delivery = 'Inactive'
  } else {
    delivery = 'Unknown'
  }
  
  // Workflow status from library status
  let workflow: 'Draft' | 'Saved' | 'None'
  
  if (creative.libraryStatus === 'draft') {
    workflow = 'Draft'
  } else if (creative.libraryStatus === 'saved') {
    workflow = 'Saved'
  } else {
    workflow = 'None'
  }
  
  return { delivery, workflow }
}

/**
 * Get creative status based on campaign status and library status (legacy compatibility)
 */
export function getCreativeStatus(creative: MergedCreative): 'Active' | 'Paused' | 'Draft' {
  const statuses = getCreativeStatuses(creative)
  
  // If it has a workflow status, prioritize that
  if (statuses.workflow === 'Draft') {
    return 'Draft'
  }
  
  // Otherwise use delivery status
  if (statuses.delivery === 'Active') {
    return 'Active'
  } else if (statuses.delivery === 'Paused') {
    return 'Paused'
  }
  
  // Default to Draft if no clear status
  return 'Draft'
}

/**
 * Get latest performance metrics for a creative using aggregated data
 */
export function getLatestMetrics(creative: MergedCreative) {
  // Use aggregated metrics if available
  if (creative.aggregatedMetrics) {
    const latestAdSet = creative.adSets.length > 0
      ? [...creative.adSets].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      : null

    return {
      cpl: creative.aggregatedMetrics.avgCostPerLead,
      cpc: creative.aggregatedMetrics.avgCPC,
      leads: creative.aggregatedMetrics.totalLeads,
      cost: creative.aggregatedMetrics.totalCost,
      clicks: creative.aggregatedMetrics.totalClicks,
      adSets: creative.aggregatedMetrics.totalAdSets,
      date: latestAdSet?.date || creative.lastUpdated.toISOString()
    }
  }

  // Fallback to legacy history-based calculation
  if (!creative.history || creative.history.length === 0) {
    return { cpl: 0, cpc: 0, leads: 0, cost: 0, clicks: 0, adSets: 0, date: creative.lastUpdated.toISOString() }
  }

  const sortedHistory = [...creative.history].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  const latest = sortedHistory[0]
  const cost = parseFloat(latest.cost || '0')
  const cpl = parseFloat(latest.costPerWebsiteLead || '0')
  const cpc = parseFloat(latest.costPerLinkClick || '0')

  // Calculate leads from cost and CPL
  const leads = cpl > 0 ? cost / cpl : 0

  return {
    cpl,
    cpc,
    leads: Math.round(leads * 100) / 100, // Round to 2 decimal places
    cost,
    clicks: 0, // Not available in legacy data
    adSets: 1, // Assume single ad set for legacy data
    date: latest.date
  }
}

/**
 * Group creatives into ad sets based on the defined criteria
 */
export function groupCreativesIntoAdSets(creatives: MergedCreative[]): Map<string, AdSet> {
  const adSetMap = new Map<string, AdSet>()
  
  creatives.forEach(creative => {
    const adSetKey = getAdSetKey(creative)
    const creativeIdentity = getCreativeIdentity(creative)
    const status = getCreativeStatus(creative)
    const statuses = getCreativeStatuses(creative)
    const metrics = getLatestMetrics(creative)
    const firstSeenCT = getFirstSeenCT(creative)
    
    const adSetCreative: AdSetCreative = {
      creative,
      creativeKey: creativeIdentity,
      status,
      cpl: metrics.cpl,
      cpc: metrics.cpc,
      leads: metrics.leads,
      latestDate: metrics.date
    }
    
    if (adSetMap.has(adSetKey)) {
      const adSet = adSetMap.get(adSetKey)!
      adSet.creatives.push(adSetCreative)
      adSet.totalCreatives++
      
      // Update delivery counts
      if (statuses.delivery === 'Active') adSet.activeCount++
      else if (statuses.delivery === 'Paused') adSet.pausedCount++
      else if (statuses.delivery === 'Inactive') adSet.inactiveCount++
      
      // Update workflow counts
      if (statuses.workflow === 'Draft') adSet.draftCount++
      else if (statuses.workflow === 'Saved') adSet.savedCount++
      
      // Update last updated date if this creative is newer
      if (creative.lastUpdated > adSet.lastUpdatedDate) {
        adSet.lastUpdatedDate = creative.lastUpdated
        adSet.lastUpdatedCT = formatCTDate(creative.lastUpdated, 'MMM dd, yyyy')
      }
    } else {
      // Use first account and campaign (before any "|" separators)
      const primaryAccount = creative.accountName.split(' | ')[0].trim()
      const primaryCampaign = creative.campaignName.split(' | ')[0].trim()
      
      const adSet: AdSet = {
        adSetKey,
        accountName: primaryAccount,
        campaignName: primaryCampaign,
        firstSeenCT: formatCTDate(firstSeenCT, 'MMM dd, yyyy'),
        firstSeenDate: firstSeenCT,
        lastUpdatedCT: formatCTDate(creative.lastUpdated, 'MMM dd, yyyy'),
        lastUpdatedDate: creative.lastUpdated,
        totalCreatives: 1,
        activeCount: statuses.delivery === 'Active' ? 1 : 0,
        pausedCount: statuses.delivery === 'Paused' ? 1 : 0,
        inactiveCount: statuses.delivery === 'Inactive' ? 1 : 0,
        draftCount: statuses.workflow === 'Draft' ? 1 : 0,
        savedCount: statuses.workflow === 'Saved' ? 1 : 0,
        creatives: [adSetCreative]
      }
      
      adSetMap.set(adSetKey, adSet)
    }
  })
  
  return adSetMap
}

/**
 * Find ad set for a specific creative
 */
export function findAdSetForCreative(creative: MergedCreative, allCreatives: MergedCreative[]): AdSet | null {
  const adSetKey = getAdSetKey(creative)
  const adSetMap = groupCreativesIntoAdSets(allCreatives)
  return adSetMap.get(adSetKey) || null
}