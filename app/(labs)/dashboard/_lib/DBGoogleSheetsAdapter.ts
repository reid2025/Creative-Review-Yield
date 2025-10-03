import { CampaignRow, CreativeRow, TagPerfRow, Kpi, SeriesPoint } from './DBTypes';

// Types from the existing Google Sheets hook
interface GoogleSheetRow {
  [key: string]: string;
}

interface CreativeHistoryEntry {
  date: string;
  cost: string;
  costPerWebsiteLead: string;
  costPerLinkClick: string;
  dataSource: 'google-sheets' | 'manual';
}

interface MergedCreative {
  uniqueKey: string;
  accountName: string;
  campaignName: string;
  campaignStatus: string;
  imageAssetName: string;
  imageUrl?: string;
  litigationName?: string;
  campaignType?: string;
  designer?: string;
  startDate?: string;
  endDate?: string;
  markedAsTopAd?: boolean;
  optimizationValue?: boolean;
  history: CreativeHistoryEntry[];
  firstSeen: Date;
  lastUpdated: Date;
  recordCount: number;
  savedInLibrary?: boolean;
  libraryStatus?: 'draft' | 'saved';
}

interface GoogleSheetsData {
  rawData: GoogleSheetRow[];
  mergedCreatives: MergedCreative[];
  stats: {
    totalRecords: number;
    uniqueCreatives: number;
  };
  fetchedAt: Date;
}

/**
 * Transform Google Sheets data into dashboard campaign rows
 */
export function transformToCampaignRows(googleSheetsData: GoogleSheetsData): CampaignRow[] {
  const campaignMap = new Map<string, {
    spend: number;
    leads: number;
    clicks: number;
    impressions: number;
    creativeCount: number;
  }>();

  // Aggregate data by campaign
  googleSheetsData.rawData.forEach((row) => {
    const campaignName = row['Campaign name'] || 'Unknown Campaign';
    const cost = parseFloat(row['Cost'] || '0');
    const leads = parseFloat(row['Website leads'] || '0'); // Assuming there's a leads column
    const clicks = parseFloat(row['Link clicks'] || '0'); // Assuming there's a clicks column
    const impressions = parseFloat(row['Impressions'] || '0'); // Assuming there's an impressions column

    if (!campaignMap.has(campaignName)) {
      campaignMap.set(campaignName, {
        spend: 0,
        leads: 0,
        clicks: 0,
        impressions: 0,
        creativeCount: 0
      });
    }

    const campaign = campaignMap.get(campaignName)!;
    campaign.spend += cost;
    campaign.leads += leads;
    campaign.clicks += clicks;
    campaign.impressions += impressions;
  });

  // Count unique creatives per campaign
  googleSheetsData.mergedCreatives.forEach((creative) => {
    const campaignNames = creative.campaignName.split(' | ');
    campaignNames.forEach((campaignName) => {
      if (campaignMap.has(campaignName)) {
        campaignMap.get(campaignName)!.creativeCount++;
      }
    });
  });

  // Convert to CampaignRow format
  return Array.from(campaignMap.entries()).map(([campaignName, data], index) => ({
    id: `gs_campaign_${index}`,
    name: campaignName,
    spend: data.spend,
    leads: data.leads,
    clicks: data.clicks,
    impressions: data.impressions,
    activeCreatives: data.creativeCount
  })).sort((a, b) => b.spend - a.spend);
}

/**
 * Transform Google Sheets data into dashboard creative rows
 */
export function transformToCreativeRows(googleSheetsData: GoogleSheetsData): CreativeRow[] {
  return googleSheetsData.mergedCreatives.map((creative, index) => {
    // Calculate totals from history
    const totalSpend = creative.history.reduce((sum, entry) => {
      return sum + parseFloat(entry.cost || '0');
    }, 0);

    const totalLeads = creative.history.reduce((sum, entry) => {
      // Try to extract leads from cost per lead calculation
      const cpl = parseFloat(entry.costPerWebsiteLead || '0');
      const cost = parseFloat(entry.cost || '0');
      if (cpl > 0) {
        return sum + Math.round(cost / cpl);
      }
      return sum;
    }, 0);

    // Calculate clicks from cost per click
    const totalClicks = creative.history.reduce((sum, entry) => {
      const cpc = parseFloat(entry.costPerLinkClick || '0');
      const cost = parseFloat(entry.cost || '0');
      if (cpc > 0) {
        return sum + Math.round(cost / cpc);
      }
      return sum;
    }, 0);

    // Estimate impressions (typical CTR is 1-2%)
    const estimatedImpressions = Math.round(totalClicks * 75); // Assuming ~1.3% CTR

    // Extract tags from campaign name and other fields
    const tags: string[] = [];
    if (creative.campaignStatus) tags.push(creative.campaignStatus);
    if (creative.campaignType) tags.push(creative.campaignType);
    if (creative.litigationName) tags.push(creative.litigationName);
    if (creative.markedAsTopAd) tags.push('Top Ad');
    if (creative.optimizationValue) tags.push('Optimized');

    return {
      id: creative.uniqueKey,
      name: creative.imageAssetName || `Creative ${index + 1}`,
      previewUrl: creative.imageUrl,
      campaign: creative.campaignName.split(' | ')[0], // Use first campaign if multiple
      designer: creative.designer || extractDesignerFromName(creative.imageAssetName),
      spend: totalSpend,
      leads: totalLeads,
      clicks: totalClicks,
      impressions: estimatedImpressions,
      tags: tags.slice(0, 5), // Limit to 5 tags
      updatedAt: creative.lastUpdated.toISOString()
    };
  }).sort((a, b) => b.spend - a.spend);
}

/**
 * Transform Google Sheets data into tag performance rows
 */
export function transformToTagPerformanceRows(googleSheetsData: GoogleSheetsData): TagPerfRow[] {
  const tagMap = new Map<string, {
    category: string;
    usage: number;
    spend: number;
    leads: number;
    clicks: number;
    impressions: number;
  }>();

  // Extract tags from all creatives and aggregate performance
  googleSheetsData.mergedCreatives.forEach((creative) => {
    const totalSpend = creative.history.reduce((sum, entry) => sum + parseFloat(entry.cost || '0'), 0);
    const totalLeads = creative.history.reduce((sum, entry) => {
      const cpl = parseFloat(entry.costPerWebsiteLead || '0');
      const cost = parseFloat(entry.cost || '0');
      return cpl > 0 ? sum + Math.round(cost / cpl) : sum;
    }, 0);
    const totalClicks = creative.history.reduce((sum, entry) => {
      const cpc = parseFloat(entry.costPerLinkClick || '0');
      const cost = parseFloat(entry.cost || '0');
      return cpc > 0 ? sum + Math.round(cost / cpc) : sum;
    }, 0);

    // Extract tags
    const tags = [
      { tag: creative.campaignStatus, category: 'Status' },
      { tag: creative.campaignType, category: 'Campaign Type' },
      { tag: creative.litigationName, category: 'Practice Area' },
      { tag: creative.accountName.split(' | ')[0], category: 'Account' }
    ].filter(item => item.tag && item.tag.trim());

    tags.forEach(({ tag, category }) => {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, {
          category,
          usage: 0,
          spend: 0,
          leads: 0,
          clicks: 0,
          impressions: 0
        });
      }

      const tagData = tagMap.get(tag)!;
      tagData.usage++;
      tagData.spend += totalSpend;
      tagData.leads += totalLeads;
      tagData.clicks += totalClicks;
      tagData.impressions += totalClicks * 75; // Estimate impressions
    });
  });

  // Convert to TagPerfRow format
  return Array.from(tagMap.entries()).map(([tag, data]) => ({
    tag,
    category: data.category,
    usage: data.usage,
    spend: data.spend,
    leads: data.leads,
    cpl: data.leads > 0 ? data.spend / data.leads : 0,
    ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
    cvr: data.clicks > 0 ? (data.leads / data.clicks) * 100 : 0
  })).sort((a, b) => b.usage - a.usage);
}

/**
 * Transform Google Sheets data into KPI metrics
 */
export function transformToKPIs(googleSheetsData: GoogleSheetsData): Kpi {
  // Calculate current period metrics (last 14 days)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 14);

  let currentSpend = 0;
  let currentLeads = 0;
  let currentClicks = 0;
  let currentImpressions = 0;

  let previousSpend = 0;
  let previousLeads = 0;
  let previousClicks = 0;
  let previousImpressions = 0;

  // Calculate from raw data
  googleSheetsData.rawData.forEach((row) => {
    const rowDate = new Date(row['Date'] || '');
    const cost = parseFloat(row['Cost'] || '0');
    const leads = parseFloat(row['Website leads'] || '0');
    const clicks = parseFloat(row['Link clicks'] || '0');
    const impressions = parseFloat(row['Impressions'] || '0');

    const previousCutoff = new Date(cutoffDate);
    previousCutoff.setDate(previousCutoff.getDate() - 14);

    if (rowDate >= cutoffDate) {
      // Current period
      currentSpend += cost;
      currentLeads += leads;
      currentClicks += clicks;
      currentImpressions += impressions;
    } else if (rowDate >= previousCutoff) {
      // Previous period (14 days before current period)
      previousSpend += cost;
      previousLeads += leads;
      previousClicks += clicks;
      previousImpressions += impressions;
    }
  });

  return {
    leads: Math.round(currentLeads),
    spend: currentSpend,
    clicks: Math.round(currentClicks),
    impressions: Math.round(currentImpressions),
    activeTests: googleSheetsData.mergedCreatives.filter(c => c.campaignStatus === 'ENABLED').length,
    previous: {
      leads: Math.round(previousLeads),
      spend: previousSpend,
      clicks: Math.round(previousClicks),
      impressions: Math.round(previousImpressions),
      activeTests: googleSheetsData.mergedCreatives.filter(c => c.campaignStatus === 'ENABLED').length
    }
  };
}

/**
 * Transform Google Sheets data into time series for charts
 */
export function transformToTimeSeries(googleSheetsData: GoogleSheetsData): SeriesPoint[] {
  const dateMap = new Map<string, {
    leads: number;
    spend: number;
    clicks: number;
    impressions: number;
  }>();

  // Aggregate by date
  googleSheetsData.rawData.forEach((row) => {
    const date = row['Date'] || '';
    if (!date) return;

    // Normalize date to YYYY-MM-DD format
    const normalizedDate = new Date(date).toISOString().split('T')[0];
    
    if (!dateMap.has(normalizedDate)) {
      dateMap.set(normalizedDate, { leads: 0, spend: 0, clicks: 0, impressions: 0 });
    }

    const dayData = dateMap.get(normalizedDate)!;
    dayData.spend += parseFloat(row['Cost'] || '0');
    dayData.leads += parseFloat(row['Website leads'] || '0');
    dayData.clicks += parseFloat(row['Link clicks'] || '0');
    dayData.impressions += parseFloat(row['Impressions'] || '0');
  });

  // Convert to SeriesPoint array and sort by date
  return Array.from(dateMap.entries())
    .map(([date, data]) => ({
      date,
      leads: Math.round(data.leads),
      spend: data.spend,
      cpl: data.leads > 0 ? data.spend / data.leads : 0,
      ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0,
      cvr: data.clicks > 0 ? (data.leads / data.clicks) * 100 : 0
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14); // Keep last 14 days only
}

/**
 * Helper function to extract designer from creative name
 */
function extractDesignerFromName(imageName: string): string {
  if (!imageName) return 'Unknown';
  
  // Look for common patterns in image names that might indicate designer
  const patterns = [
    /created?[\s_-]?by[\s_-]([a-zA-Z\s]+)/i,
    /designer[\s_-]([a-zA-Z\s]+)/i,
    /([a-zA-Z]+)[\s_-]design/i
  ];

  for (const pattern of patterns) {
    const match = imageName.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // If no pattern matches, try to extract from filename
  const parts = imageName.split(/[_\-\s]+/);
  if (parts.length > 1) {
    return parts[0] || 'Unknown';
  }

  return 'Unknown';
}