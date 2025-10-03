'use client'

import React from 'react';
import { Card } from '@/components/ui/card';
import { TagAnalytics } from '../_lib/TGTypes';

interface TGKPITilesProps {
  analytics: TagAnalytics;
}

interface KPITileProps {
  title: string;
  value: string | number;
  subtitle?: string;
  tooltip?: string;
}

function KPITile({ title, value, subtitle, tooltip }: KPITileProps) {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">
            {title}
          </h3>
          {tooltip && (
            <div className="text-xs text-gray-400" title={tooltip}>
              ?
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {subtitle && (
          <p className="text-sm text-gray-500">
            {subtitle}
          </p>
        )}
      </div>
    </Card>
  );
}

/**
 * TGKPITiles - Key performance indicator tiles
 * Shows total tags, zero-use tags, median usage, and 90th percentile
 */
export function TGKPITiles({ analytics }: TGKPITilesProps) {
  const unusedPercentage = analytics.totalTags > 0 
    ? Math.round((analytics.zeroUseTags / analytics.totalTags) * 100)
    : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPITile
        title="Total Tags"
        value={analytics.totalTags}
        subtitle="Across all categories"
      />
      
      <KPITile
        title="Zero-Use Tags"
        value={analytics.zeroUseTags}
        subtitle={`${unusedPercentage}% of total tags`}
        tooltip="Tags present in Edit Creative but not used by any creative"
      />
      
      <KPITile
        title="Median Usage"
        value={analytics.medianUsage}
        subtitle="Uses per tag (excluding unused)"
      />
      
      <KPITile
        title="90th Percentile"
        value={analytics.p90Usage}
        subtitle="Top 10% usage threshold"
      />
    </div>
  );
}