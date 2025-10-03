'use client'

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TagUsage, FilterState } from '../_lib/TGTypes';
import { TAG_CATEGORIES } from '../_lib/TGConstants';
import { TGTagPill } from './TGTagPill';

interface TGCategorySectionProps {
  categoryKey: string;
  tags: TagUsage[];
  isExpanded: boolean;
  onToggle: () => void;
  filters: FilterState;
}

/**
 * TGCategorySection - Collapsible category card with tags
 * Displays category info and filtered/sorted tags
 */
export function TGCategorySection({ 
  categoryKey, 
  tags, 
  isExpanded, 
  onToggle,
  filters 
}: TGCategorySectionProps) {
  const categoryConfig = TAG_CATEGORIES[categoryKey];
  
  if (!categoryConfig) {
    return null;
  }

  // Filter and sort tags based on current filters
  let filteredTags = tags;
  
  // Apply search filter
  if (filters.search) {
    filteredTags = filteredTags.filter(tag => 
      tag.label.toLowerCase().includes(filters.search.toLowerCase())
    );
  }
  
  // Apply unused filter
  if (filters.showUnusedOnly) {
    filteredTags = filteredTags.filter(tag => tag.count === 0);
  }
  
  // Apply sorting
  switch (filters.sortBy) {
    case 'usage-desc':
      filteredTags.sort((a, b) => b.count - a.count);
      break;
    case 'usage-asc':
      filteredTags.sort((a, b) => a.count - b.count);
      break;
    case 'label-az':
      filteredTags.sort((a, b) => a.label.localeCompare(b.label));
      break;
    case 'label-za':
      filteredTags.sort((a, b) => b.label.localeCompare(a.label));
      break;
  }

  const totalUsage = tags.reduce((sum, tag) => sum + tag.count, 0);
  const unusedCount = tags.filter(tag => tag.count === 0).length;
  
  return (
    <Card className="shadow-sm overflow-hidden">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 border-b border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 text-left">
              {categoryConfig.displayName}
            </h3>
            <p className="text-sm text-gray-600 mt-1 text-left">
              {categoryConfig.description}
            </p>
            
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="secondary" 
                className={categoryConfig.selectType === 'single' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
              >
                {categoryConfig.selectType === 'single' ? 'Single-Select' : 'Multi-Select'}
              </Badge>
              
              <Badge variant="outline">
                {tags.length} tag{tags.length === 1 ? '' : 's'}
              </Badge>
              
              {totalUsage > 0 && (
                <Badge variant="secondary">
                  {totalUsage.toLocaleString()} total uses
                </Badge>
              )}
              
              {unusedCount > 0 && (
                <Badge variant="destructive" className="bg-red-100 text-red-700">
                  {unusedCount} unused
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <ChevronDown 
          className={cn(
            "h-5 w-5 text-gray-400 transition-transform flex-shrink-0",
            isExpanded && "transform rotate-180"
          )}
        />
      </button>

      {/* Category Content */}
      {isExpanded && (
        <div className="p-6">
          {filteredTags.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-sm">
                {filters.search ? 
                  `No tags found matching "${filters.search}"` :
                  filters.showUnusedOnly ?
                    'No unused tags in this category' :
                    'No tags available'
                }
              </div>
            </div>
          ) : (
            <div className={cn(
              filters.view === 'grid' ?
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3" :
                "space-y-2"
            )}>
              {filteredTags.map((tag) => (
                <TGTagPill 
                  key={`${tag.category}-${tag.value}`} 
                  tag={tag}
                  className={filters.view === 'table' ? 'rounded-md' : ''}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}