import { Kpi, SeriesPoint, CampaignRow, CreativeRow, TagPerfRow, ActivityEvent } from './DBTypes';
import { generateDateRange, generateSparklineData, calculateCPL, calculateCTR, calculateCVR } from './DBUtils';
import { 
  transformToCampaignRows, 
  transformToCreativeRows, 
  transformToTagPerformanceRows,
  transformToKPIs,
  transformToTimeSeries 
} from './DBGoogleSheetsAdapter';

/**
 * Mock data generators for Dashboard
 * Provides realistic performance metrics and activity patterns
 */

// Generate mock KPI data with previous period comparison
export const getMockKPIs = (): Kpi => {
  const current = {
    leads: 2847,
    spend: 12450.67,
    clicks: 45623,
    impressions: 892456,
    activeTests: 23
  };

  const previous = {
    leads: 2234,
    spend: 11890.23,
    clicks: 41203,
    impressions: 834567,
    activeTests: 19
  };

  return { ...current, previous };
};

// Generate time series data for charts (last N days)
export const getMockSeries = (days: number = 14): SeriesPoint[] => {
  const points: SeriesPoint[] = [];
  const baseDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    
    const leads = Math.floor(Math.random() * 100) + 150;
    const spend = Math.random() * 500 + 800;
    const clicks = Math.floor(Math.random() * 2000) + 3000;
    const impressions = Math.floor(Math.random() * 30000) + 60000;

    points.push({
      date: date.toISOString().split('T')[0],
      leads,
      spend,
      cpl: calculateCPL(spend, leads),
      ctr: calculateCTR(clicks, impressions),
      cvr: calculateCVR(leads, clicks)
    });
  }

  return points;
};

// Generate mock campaign data
export const getMockCampaigns = (): CampaignRow[] => {
  const campaigns = [
    'Q4 Lead Gen - Home Insurance',
    'Holiday Promo - Auto Insurance',
    'New Customer Acquisition',
    'Retargeting - High Intent',
    'Brand Awareness - Gen Z',
    'Lead Magnet - Free Quote',
    'Competitor Conquesting',
    'Lookalike Expansion',
    'Geographic Expansion',
    'Product Launch - Business Insurance'
  ];

  return campaigns.map((name, i) => {
    const leads = Math.floor(Math.random() * 500) + 100;
    const spend = Math.random() * 3000 + 1000;
    const clicks = Math.floor(Math.random() * 5000) + 2000;
    const impressions = Math.floor(Math.random() * 50000) + 100000;

    return {
      id: `camp_${i + 1}`,
      name,
      spend,
      leads,
      clicks,
      impressions,
      activeCreatives: Math.floor(Math.random() * 10) + 3
    };
  }).sort((a, b) => b.spend - a.spend);
};

// Generate mock creative data
export const getMockCreatives = (): CreativeRow[] => {
  const creativeNames = [
    'Hero Banner - Home Insurance',
    'Video Ad - Auto Claims',
    'Carousel - Insurance Benefits',
    'Story Ad - Quick Quote',
    'Static - Compare Rates',
    'Video - Customer Testimonial',
    'Banner - Limited Time Offer',
    'Interactive - Coverage Calculator',
    'Animated - Policy Benefits',
    'UGC - Real Customer Stories'
  ];

  const designers = ['Sarah Chen', 'Mike Johnson', 'Lisa Park', 'David Wilson', 'Emma Davis'];
  const tags = [
    ['High Converting', 'CTA: Get Quote', 'Blue Theme'],
    ['Testing', 'Video Format', 'Testimonial'],
    ['Winner', 'Carousel', 'Multi-Product'],
    ['New', 'Story Format', 'Mobile First'],
    ['Comparison', 'Static', 'Price Focus']
  ];

  return creativeNames.map((name, i) => {
    const leads = Math.floor(Math.random() * 200) + 50;
    const spend = Math.random() * 1500 + 500;
    const clicks = Math.floor(Math.random() * 1000) + 500;
    const impressions = Math.floor(Math.random() * 20000) + 10000;

    return {
      id: `creative_${i + 1}`,
      name,
      previewUrl: `/mock-creatives/creative-${i + 1}.jpg`,
      campaign: `Campaign ${Math.floor(i / 2) + 1}`,
      designer: designers[Math.floor(Math.random() * designers.length)],
      spend,
      leads,
      clicks,
      impressions,
      tags: tags[Math.floor(Math.random() * tags.length)],
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  }).sort((a, b) => b.spend - a.spend);
};

// Generate mock tag performance data
export const getMockTagPerformance = (): TagPerfRow[] => {
  const tagData = [
    { tag: 'High Converting', category: 'Performance', usage: 45 },
    { tag: 'CTA: Get Quote', category: 'CTA Verb', usage: 38 },
    { tag: 'Video Format', category: 'Creative Type', usage: 32 },
    { tag: 'Blue Theme', category: 'Design', usage: 28 },
    { tag: 'Testimonial', category: 'Content Type', usage: 25 },
    { tag: 'Mobile First', category: 'Device Target', usage: 23 },
    { tag: 'Winner', category: 'Status', usage: 20 },
    { tag: 'Testing', category: 'Status', usage: 18 },
    { tag: 'Comparison', category: 'Message Type', usage: 15 },
    { tag: 'Price Focus', category: 'Value Prop', usage: 12 }
  ];

  return tagData.map(({ tag, category, usage }) => {
    const leads = Math.floor(Math.random() * 300) + 100;
    const spend = Math.random() * 2000 + 800;
    const clicks = Math.floor(Math.random() * 1500) + 800;
    const impressions = Math.floor(Math.random() * 25000) + 15000;

    return {
      tag,
      category,
      usage,
      spend,
      leads,
      cpl: calculateCPL(spend, leads),
      ctr: calculateCTR(clicks, impressions),
      cvr: calculateCVR(leads, clicks)
    };
  }).sort((a, b) => b.usage - a.usage);
};

// Generate mock activity events
export const getMockActivity = (): ActivityEvent[] => {
  const events: ActivityEvent[] = [];
  const actors = [
    { name: 'Sarah Chen', avatar: '/avatars/sarah.jpg' },
    { name: 'Mike Johnson', avatar: '/avatars/mike.jpg' },
    { name: 'Lisa Park', avatar: '/avatars/lisa.jpg' },
    { name: 'David Wilson', avatar: '/avatars/david.jpg' },
    { name: 'Emma Davis', avatar: '/avatars/emma.jpg' }
  ];

  const eventTypes = [
    'creative.created',
    'creative.updated', 
    'tag.added',
    'tag.removed',
    'status.changed',
    'upload.succeeded',
    'upload.failed'
  ] as const;

  // Generate 50 recent events
  for (let i = 0; i < 50; i++) {
    const actor = actors[Math.floor(Math.random() * actors.length)];
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);

    let meta = {};
    if (type === 'tag.added' || type === 'tag.removed') {
      meta = {
        tagChanges: {
          added: type === 'tag.added' ? ['High Converting'] : [],
          removed: type === 'tag.removed' ? ['Testing'] : []
        }
      };
    } else if (type === 'status.changed') {
      meta = {
        statusChange: {
          from: 'Testing',
          to: 'Winner'
        }
      };
    }

    events.push({
      id: `event_${i + 1}`,
      type,
      actor,
      entity: {
        id: `creative_${Math.floor(Math.random() * 20) + 1}`,
        type: 'creative',
        name: `Creative ${Math.floor(Math.random() * 20) + 1}`
      },
      meta,
      createdAt: createdAt.toISOString()
    });
  }

  return events.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// Generate sparkline data for KPI tiles
export const getMockSparklines = () => ({
  leads: generateSparklineData(14, 'up'),
  spend: generateSparklineData(14, 'up'), 
  clicks: generateSparklineData(14, 'flat'),
  impressions: generateSparklineData(14, 'up'),
  activeTests: generateSparklineData(14, 'flat')
});

// Cache mock data to avoid regeneration on each call
let cachedMockData: any = null;

export const getCachedMockData = () => {
  if (!cachedMockData) {
    cachedMockData = {
      kpis: getMockKPIs(),
      series: getMockSeries(14),
      campaigns: getMockCampaigns(),
      creatives: getMockCreatives(),
      tagPerformance: getMockTagPerformance(),
      activity: getMockActivity(),
      sparklines: getMockSparklines()
    };
  }
  return cachedMockData;
};

// Enhanced function that can use Google Sheets data or fall back to mock data
export const getDashboardData = (googleSheetsData?: any) => {
  if (googleSheetsData?.data) {
    try {
      // Transform Google Sheets data to dashboard format
      const transformedData = {
        kpis: transformToKPIs(googleSheetsData.data),
        series: transformToTimeSeries(googleSheetsData.data),
        campaigns: transformToCampaignRows(googleSheetsData.data),
        creatives: transformToCreativeRows(googleSheetsData.data),
        tagPerformance: transformToTagPerformanceRows(googleSheetsData.data),
        activity: getMockActivity(), // Still use mock data for activity (not in Google Sheets)
        sparklines: getMockSparklines(), // Generate sparklines from the series data
        dataSource: 'google-sheets' as const,
        lastUpdated: googleSheetsData.data.fetchedAt
      };

      // Generate sparklines from real time series data if available
      if (transformedData.series.length > 0) {
        transformedData.sparklines = {
          leads: transformedData.series.map(s => s.leads || 0),
          spend: transformedData.series.map(s => s.spend || 0),
          clicks: transformedData.series.map(s => (s.ctr || 0) * (transformedData.kpis.impressions / 100)),
          impressions: transformedData.series.map(s => transformedData.kpis.impressions / transformedData.series.length),
          activeTests: getMockSparklines().activeTests // Still mock for active tests
        };
      }

      return transformedData;
    } catch (error) {
      console.warn('Error transforming Google Sheets data, falling back to mock data:', error);
      return {
        ...getCachedMockData(),
        dataSource: 'mock-fallback' as const,
        lastUpdated: new Date()
      };
    }
  }

  // Fall back to mock data
  return {
    ...getCachedMockData(),
    dataSource: 'mock' as const,
    lastUpdated: new Date()
  };
};