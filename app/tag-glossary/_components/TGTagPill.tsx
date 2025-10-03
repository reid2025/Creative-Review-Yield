'use client'

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TagUsage } from '../_lib/TGTypes';
import { TGUsageBadge } from './TGUsageBadge';
import { TAG_CATEGORIES } from '../_lib/TGConstants';

interface TGTagPillProps {
  tag: TagUsage;
  className?: string;
}

/**
 * TGTagPill - Individual tag pill with usage badge and hover effects
 * Clickable pill that navigates to tag detail page
 */
export function TGTagPill({ tag, className }: TGTagPillProps) {
  const categoryConfig = TAG_CATEGORIES[tag.category];
  const selectType = categoryConfig?.selectType || 'single';
  
  return (
    <Link
      href={`/tag-glossary/${tag.category}/${tag.value}`}
      className={cn(
        "group relative block p-3 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-white hover:bg-gray-50",
        className
      )}
      title={`Open detail • See creatives using this tag`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Tag Label */}
          <div className="font-medium text-gray-900 truncate group-hover:text-gray-700">
            {tag.label}
          </div>
          
          {/* Category Info */}
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {categoryConfig?.displayName || tag.category}
            </Badge>
            
            {selectType === 'multi' && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                Multi
              </Badge>
            )}
          </div>
          
          {/* Last Used (if applicable) */}
          {tag.lastUsed && (
            <div className="text-xs text-gray-500 mt-1">
              Last used {new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
                .format(Math.round((tag.lastUsed.getTime() - Date.now()) / (1000 * 60 * 60 * 24)), 'day')}
            </div>
          )}
        </div>
        
        {/* Usage Badge */}
        <div className="flex-shrink-0">
          <TGUsageBadge 
            count={tag.count} 
            decile={tag.decile}
          />
        </div>
      </div>
      
      {/* Percentage bar (subtle visual indicator) */}
      {tag.percentage > 0 && (
        <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${Math.min(tag.percentage * 2, 100)}%` }}
          />
        </div>
      )}
    </Link>
  );
}