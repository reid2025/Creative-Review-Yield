// Core Types
export interface TagOption {
  label: string;          // Display name (e.g., "Get Started") 
  value: string;          // Internal value (e.g., "get_started")
  category: string;       // Field category (e.g., "ctaVerb")
  createdAt?: string;     // ISO date when tag was added
}

export interface TagUsage extends TagOption {
  count: number;          // Usage count
  percentage: number;     // % of total creatives
  lastUsed?: Date;       // Most recent usage
  decile: number;        // 0-9 for color intensity (0=unused, 9=top 10%)
}

export interface CreativeSummary {
  id: string;
  name?: string;
  previewUrl?: string;
  campaign?: string;
  designer?: string;
  updatedAt?: string;
  status?: 'Active' | 'Draft' | 'Paused' | 'Archived';
}

// Analytics Types  
export interface TagAnalytics {
  totalTags: number;
  zeroUseTags: number;
  medianUsage: number;
  p90Usage: number;
  topTags: TagUsage[]; // Top 10
  categoryBreakdown: CategoryUsage[];
  opportunityTags: TagUsage[]; // Bottom usage, excluding recent
}

export interface CategoryUsage {
  category: string;
  displayName: string;
  totalUsage: number;
  percentage: number;
  tagCount: number;
  selectType: 'single' | 'multi';
}

// UI State Types
export interface FilterState {
  search: string;
  category: string | 'all';
  sortBy: 'usage-desc' | 'usage-asc' | 'label-az' | 'label-za';
  view: 'grid' | 'table';
  showUnusedOnly: boolean;
}

export interface CategoryState {
  [categoryKey: string]: boolean; // collapsed/expanded state
}

export interface CategoryConfig {
  displayName: string;
  selectType: 'single' | 'multi';
  description: string;
  options: TagOption[];
}