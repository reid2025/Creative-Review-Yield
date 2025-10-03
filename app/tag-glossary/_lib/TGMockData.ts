import { TagUsage, CreativeSummary, TagAnalytics, CategoryUsage } from './TGTypes';
import { TAG_CATEGORIES } from './TGConstants';

// Mock Creative Summaries
export const MOCK_CREATIVES: CreativeSummary[] = [
  {
    id: 'creative_001',
    name: 'Q4 Holiday Campaign Hero',
    previewUrl: '/api/creative-thumbnails/creative_001.jpg',
    campaign: 'Holiday 2023',
    designer: 'Sarah Chen',
    updatedAt: '2024-01-15T10:30:00Z',
    status: 'Active'
  },
  {
    id: 'creative_002',
    name: 'Mobile Banner Variant A',
    previewUrl: '/api/creative-thumbnails/creative_002.jpg',
    campaign: 'Mobile First Q1',
    designer: 'Mike Torres',
    updatedAt: '2024-01-14T16:45:00Z',
    status: 'Draft'
  },
  {
    id: 'creative_003',
    name: 'Social Video Test',
    previewUrl: '/api/creative-thumbnails/creative_003.jpg',
    campaign: 'Social Expansion',
    designer: 'Lisa Park',
    updatedAt: '2024-01-13T08:15:00Z',
    status: 'Active'
  },
  {
    id: 'creative_004',
    name: 'Email Newsletter Header',
    previewUrl: '/api/creative-thumbnails/creative_004.jpg',
    campaign: 'Newsletter Q1',
    designer: 'David Kim',
    updatedAt: '2024-01-12T14:20:00Z',
    status: 'Active'
  },
  {
    id: 'creative_005',
    name: 'Landing Page Hero',
    previewUrl: '/api/creative-thumbnails/creative_005.jpg',
    campaign: 'Product Launch',
    designer: 'Emma Rodriguez',
    updatedAt: '2024-01-11T09:15:00Z',
    status: 'Paused'
  }
];

// Generate realistic usage distribution
function generateUsageDistribution(totalTags: number): number[] {
  // Power law distribution - few tags used heavily, many used rarely
  const usages = [];
  
  // Top 10% get high usage (50-200)
  const topCount = Math.ceil(totalTags * 0.1);
  for (let i = 0; i < topCount; i++) {
    usages.push(Math.floor(Math.random() * 150) + 50);
  }
  
  // Next 20% get medium usage (10-50)  
  const mediumCount = Math.ceil(totalTags * 0.2);
  for (let i = 0; i < mediumCount; i++) {
    usages.push(Math.floor(Math.random() * 40) + 10);
  }
  
  // Next 40% get low usage (1-10)
  const lowCount = Math.ceil(totalTags * 0.4);
  for (let i = 0; i < lowCount; i++) {
    usages.push(Math.floor(Math.random() * 9) + 1);
  }
  
  // Remaining 30% are unused (0)
  const remainingCount = totalTags - topCount - mediumCount - lowCount;
  for (let i = 0; i < remainingCount; i++) {
    usages.push(0);
  }
  
  // Shuffle to distribute randomly
  return usages.sort(() => Math.random() - 0.5);
}

// Calculate decile based on usage count
function calculateDecile(count: number, allCounts: number[]): number {
  if (count === 0) return 0;
  
  const nonZeroCounts = allCounts.filter(c => c > 0).sort((a, b) => a - b);
  if (nonZeroCounts.length === 0) return 0;
  
  const percentile = nonZeroCounts.indexOf(count) / (nonZeroCounts.length - 1);
  return Math.min(Math.floor(percentile * 9) + 1, 9);
}

// Generate mock tag usage data
export function generateMockTagUsage(): Record<string, TagUsage[]> {
  const result: Record<string, TagUsage[]> = {};
  
  // Get all tags across categories
  const allTags = Object.values(TAG_CATEGORIES).flatMap(category => 
    category.options
  );
  
  // Generate usage distribution
  const usages = generateUsageDistribution(allTags.length);
  const totalCreatives = 665; // Mock total
  
  // Calculate all counts for decile calculation
  const allCounts = usages.slice();
  
  let tagIndex = 0;
  
  Object.entries(TAG_CATEGORIES).forEach(([categoryKey, category]) => {
    result[categoryKey] = category.options.map(option => {
      const count = usages[tagIndex++];
      const percentage = totalCreatives > 0 ? (count / totalCreatives) * 100 : 0;
      const decile = calculateDecile(count, allCounts);
      
      // Generate realistic last used date (if used)
      let lastUsed: Date | undefined = undefined;
      if (count > 0) {
        const daysAgo = Math.floor(Math.random() * 30) + 1;
        lastUsed = new Date();
        lastUsed.setDate(lastUsed.getDate() - daysAgo);
      }
      
      return {
        ...option,
        count,
        percentage: Math.round(percentage * 10) / 10,
        decile,
        lastUsed
      };
    });
  });
  
  return result;
}

// Generate category usage breakdown
export function generateCategoryBreakdown(tagUsage: Record<string, TagUsage[]>): CategoryUsage[] {
  const totalUsage = Object.values(tagUsage)
    .flatMap(tags => tags)
    .reduce((sum, tag) => sum + tag.count, 0);
  
  return Object.entries(TAG_CATEGORIES).map(([categoryKey, category]) => {
    const categoryTags = tagUsage[categoryKey] || [];
    const categoryUsage = categoryTags.reduce((sum, tag) => sum + tag.count, 0);
    const percentage = totalUsage > 0 ? (categoryUsage / totalUsage) * 100 : 0;
    
    return {
      category: categoryKey,
      displayName: category.displayName,
      totalUsage: categoryUsage,
      percentage: Math.round(percentage * 10) / 10,
      tagCount: categoryTags.length,
      selectType: category.selectType
    };
  });
}

// Get mock analytics
export function getMockAnalytics(): TagAnalytics {
  const tagUsage = generateMockTagUsage();
  const allTags = Object.values(tagUsage).flatMap(tags => tags);
  
  // Calculate KPIs
  const totalTags = allTags.length;
  const zeroUseTags = allTags.filter(tag => tag.count === 0).length;
  const nonZeroUsages = allTags.filter(tag => tag.count > 0).map(tag => tag.count).sort((a, b) => a - b);
  const medianUsage = nonZeroUsages.length > 0 
    ? nonZeroUsages[Math.floor(nonZeroUsages.length / 2)] 
    : 0;
  const p90Usage = nonZeroUsages.length > 0 
    ? nonZeroUsages[Math.floor(nonZeroUsages.length * 0.9)] 
    : 0;
  
  // Top 10 tags
  const topTags = allTags
    .filter(tag => tag.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  // Opportunity tags (bottom 10, excluding zero usage and recent tags)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const opportunityTags = allTags
    .filter(tag => tag.count > 0) // Exclude unused
    .filter(tag => !tag.createdAt || new Date(tag.createdAt) < sevenDaysAgo) // Exclude recent
    .sort((a, b) => a.count - b.count)
    .slice(0, 10);
  
  // Category breakdown
  const categoryBreakdown = generateCategoryBreakdown(tagUsage);
  
  return {
    totalTags,
    zeroUseTags,
    medianUsage,
    p90Usage,
    topTags,
    categoryBreakdown: categoryBreakdown.sort((a, b) => b.totalUsage - a.totalUsage),
    opportunityTags
  };
}

// Get mock creatives for a specific tag
export function getMockCreativesForTag(category: string, value: string, page: number = 1, limit: number = 20): {
  creatives: CreativeSummary[];
  total: number;
  hasMore: boolean;
} {
  // Filter mock creatives that would use this tag
  // In real implementation, this would query Firestore
  const mockUsageCount = generateMockTagUsage()[category]?.find(tag => tag.value === value)?.count || 0;
  
  if (mockUsageCount === 0) {
    return {
      creatives: [],
      total: 0,
      hasMore: false
    };
  }
  
  // Return a subset of mock creatives based on usage count
  const creativesToShow = Math.min(mockUsageCount, MOCK_CREATIVES.length);
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, creativesToShow);
  const creatives = MOCK_CREATIVES.slice(startIndex, endIndex);
  
  return {
    creatives,
    total: creativesToShow,
    hasMore: endIndex < creativesToShow
  };
}

// Export singleton instances
let cachedTagUsage: Record<string, TagUsage[]> | null = null;
let cachedAnalytics: TagAnalytics | null = null;

export function getMockTagUsage(): Record<string, TagUsage[]> {
  if (!cachedTagUsage) {
    cachedTagUsage = generateMockTagUsage();
  }
  return cachedTagUsage;
}

export function getCachedMockAnalytics(): TagAnalytics {
  if (!cachedAnalytics) {
    cachedAnalytics = getMockAnalytics();
  }
  return cachedAnalytics;
}