'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Filter, Download } from 'lucide-react';
import { DashboardFilters, CHANNEL_OPTIONS, DATE_PRESETS } from '../_lib/DBConstants';
import { generateDateRange } from '../_lib/DBUtils';

interface DBToolbarProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: Partial<DashboardFilters>) => void;
  onExport?: () => void;
}

/**
 * DBToolbar - Sticky toolbar with date range, channel filter, and export
 * Matches Creative Stream toolbar styling
 */
export function DBToolbar({ filters, onFiltersChange, onExport }: DBToolbarProps) {
  const handleDatePresetChange = (preset: string) => {
    const days = parseInt(preset);
    const dateRange = generateDateRange(days);
    onFiltersChange({ dateRange });
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 py-4">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Date Range Preset */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <Select
            value={DATE_PRESETS.find(p => {
              const range = generateDateRange(p.days);
              return range.start === filters.dateRange.start && 
                     range.end === filters.dateRange.end;
            })?.days.toString() || 'custom'}
            onValueChange={handleDatePresetChange}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              {DATE_PRESETS.map(preset => (
                <SelectItem key={preset.days} value={preset.days.toString()}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Channel Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select
            value={filters.channel}
            onValueChange={(channel: any) => onFiltersChange({ channel })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHANNEL_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Campaign Search */}
        <div className="relative flex-1 min-w-64 max-w-sm">
          <Input
            placeholder="Search campaigns..."
            value={filters.campaign || ''}
            onChange={(e) => onFiltersChange({ 
              campaign: e.target.value || undefined 
            })}
            className="pl-3"
          />
        </div>

        {/* Export Button */}
        <Button 
          variant="outline" 
          onClick={onExport}
          className="flex items-center gap-2 ml-auto"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
}