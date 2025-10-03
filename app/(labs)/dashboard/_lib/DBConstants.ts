// Feature flag
export const FEATURE_CREATIVE_DASHBOARD = 
  process.env.NEXT_PUBLIC_FEATURE_CREATIVE_DASHBOARD === 'true';

// Default filters
export interface DashboardFilters {
  dateRange: { start: string; end: string };
  channel: 'all' | 'meta' | 'google' | 'tiktok';
  campaign?: string;
}

export const DEFAULT_FILTERS: DashboardFilters = {
  dateRange: {
    start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  },
  channel: 'all',
  campaign: undefined
};

// Chart colors matching Creative Stream
export const CHART_COLORS = {
  leads: '#3b82f6',      // Blue
  spend: '#ef4444',      // Red
  cpl: '#f97316',        // Orange
  ctr: '#10b981',        // Green
  cvr: '#8b5cf6'         // Purple
};

// Channel options
export const CHANNEL_OPTIONS = [
  { value: 'all', label: 'All Channels' },
  { value: 'meta', label: 'Meta' },
  { value: 'google', label: 'Google' },
  { value: 'tiktok', label: 'TikTok' }
];

// Date range presets
export const DATE_PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 }
];