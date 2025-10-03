'use client'

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Grid3X3, Table, Eye, EyeOff } from 'lucide-react';
import { FilterState } from '../_lib/TGTypes';
import { SORT_OPTIONS, TAG_CATEGORIES } from '../_lib/TGConstants';
import { TGCategoryStrip } from './TGCategoryStrip';
import { getMockTagUsage } from '../_lib/TGMockData';

interface TGControlsBarProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  isSticky?: boolean;
}

/**
 * TGControlsBar - Dual-row controls with category strip and toolbar
 * Top row: Category chip strip with overflow handling
 * Bottom row: Search, sort, view toggle, unused filter
 */
export function TGControlsBar({ filters, onFiltersChange, isSticky = true }: TGControlsBarProps) {
  // Get tag usage data for category counts
  const tagUsage = getMockTagUsage();
  
  // Build category options with counts
  const categoryOptions = [
    { label: 'All Categories', slug: 'all' },
    ...Object.entries(TAG_CATEGORIES).map(([key, config]) => {
      const tags = tagUsage[key] || [];
      const totalCount = tags.reduce((sum, tag) => sum + tag.count, 0);
      return {
        label: config.displayName,
        slug: key,
        count: totalCount
      };
    })
  ];

  return (
    <div className={`bg-white border-b border-gray-200 ${isSticky ? 'sticky top-0 z-10' : ''}`}>
      {/* Category Strip Row */}
      <div className="py-3">
        <TGCategoryStrip
          categories={categoryOptions}
          value={filters.category}
          onChange={(category) => onFiltersChange({ category })}
        />
      </div>

      {/* Controls Row */}
      <div className="pb-4 px-8">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-64 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tags..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ search: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Sort:
            </span>
            <Select
              value={filters.sortBy}
              onValueChange={(value: any) => onFiltersChange({ sortBy: value })}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1">
            <Button
              variant={filters.view === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFiltersChange({ view: 'grid' })}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={filters.view === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFiltersChange({ view: 'table' })}
            >
              <Table className="h-4 w-4" />
            </Button>
          </div>

          {/* Show Unused Only Toggle */}
          <Button
            variant={filters.showUnusedOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFiltersChange({ showUnusedOnly: !filters.showUnusedOnly })}
            className="flex items-center gap-2"
          >
            {filters.showUnusedOnly ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            Show Unused Only
          </Button>
        </div>
      </div>
    </div>
  );
}