'use client'

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { USAGE_DECILE_COLORS } from '../_lib/TGConstants';

interface TGUsageBadgeProps {
  count: number;
  decile: number;
  className?: string;
}

/**
 * TGUsageBadge - Color-intensity usage badge based on decile
 * Provides instant visual feedback on tag usage patterns
 */
export function TGUsageBadge({ count, decile, className }: TGUsageBadgeProps) {
  const colorClass = USAGE_DECILE_COLORS[decile] || USAGE_DECILE_COLORS[0];
  
  return (
    <Badge 
      variant="secondary"
      className={cn(
        colorClass,
        "font-medium text-xs",
        className
      )}
    >
      {count === 0 ? 'Unused' : `${count} use${count === 1 ? '' : 's'}`}
    </Badge>
  );
}