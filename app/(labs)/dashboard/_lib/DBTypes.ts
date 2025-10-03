// Core metrics
export interface Kpi {
  leads: number;
  spend: number;
  clicks: number;
  impressions: number;
  activeTests: number;
  previous?: Kpi; // For Δ calculations
}

export interface SeriesPoint {
  date: string;
  leads?: number;
  spend?: number;
  cpl?: number;
  ctr?: number;
  cvr?: number;
}

// Breakdown tables
export interface CampaignRow {
  id: string;
  name: string;
  spend: number;
  leads: number;
  clicks: number;
  impressions: number;
  activeCreatives: number;
}

export interface CreativeRow {
  id: string;
  name: string;
  previewUrl?: string;
  campaign?: string;
  designer?: string;
  spend: number;
  leads: number;
  clicks: number;
  impressions: number;
  tags?: string[];
  updatedAt?: string;
}

export interface TagPerfRow {
  tag: string;
  category: string;
  usage: number;
  spend: number;
  leads: number;
  cpl: number;
  ctr: number;
  cvr: number;
}

// Activity log
export interface ActivityEvent {
  id: string;
  type: 'creative.created' | 'creative.updated' | 'tag.added' | 'tag.removed' | 'status.changed' | 'upload.succeeded' | 'upload.failed';
  actor?: { 
    id?: string; 
    name?: string; 
    avatar?: string;
  };
  entity: { 
    id: string; 
    type: 'creative' | 'tag' | 'campaign'; 
    name?: string;
  };
  meta?: Record<string, any>; // Diffs, old/new values
  createdAt: string; // ISO timestamp
}

// Canvas posts
export interface CanvasPost {
  id: string;
  imageUrl: string;
  caption?: string;
  postedBy?: string;
  createdAt: string;
}

// Dashboard state
export interface DashboardFilters {
  dateRange: { start: string; end: string };
  channel: 'all' | 'meta' | 'google' | 'tiktok';
  campaign?: string;
}

// KPI tile props
export interface KPITileProps {
  title: string;
  value: string | number;
  delta?: number;
  sparkline?: number[];
  format?: 'number' | 'currency' | 'percent';
  isLoading?: boolean;
}