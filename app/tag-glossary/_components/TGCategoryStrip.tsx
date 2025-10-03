'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryOption {
  label: string;
  slug: string;
  count?: number;
}

interface TGCategoryStripProps {
  categories: CategoryOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * TGCategoryStrip - Horizontal chip strip with overflow handling
 * Single row of category chips with "+N more" overflow popover
 */
export function TGCategoryStrip({ categories, value, onChange, className }: TGCategoryStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(Math.min(4, categories.length)); // Conservative default
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize visible count once when categories change
  useEffect(() => {
    const maxVisible = 4;
    const newVisibleCount = Math.min(maxVisible, categories.length);
    setVisibleCount(newVisibleCount);
  }, [categories.length]);

  // Scroll active chip into view
  useEffect(() => {
    if (!containerRef.current) return;

    const activeChip = containerRef.current.querySelector(`[data-chip="${value}"]`) as HTMLElement;
    if (activeChip) {
      activeChip.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }
  }, [value]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, chipValue: string) => {
    const currentIndex = categories.findIndex(cat => cat.slug === value);
    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        nextIndex = Math.max(0, currentIndex - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextIndex = Math.min(categories.length - 1, currentIndex + 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onChange(chipValue);
        break;
    }

    if (nextIndex !== currentIndex) {
      onChange(categories[nextIndex].slug);
    }
  };

  const visibleCategories = categories.slice(0, visibleCount);
  const hiddenCategories = categories.slice(visibleCount);
  const hasOverflow = hiddenCategories.length > 0;

  // Filter hidden categories for search
  const filteredHidden = hiddenCategories.filter(cat =>
    cat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChip = (category: CategoryOption, index: number) => {
    const isActive = category.slug === value;
    const showCount = category.count !== undefined;

    return (
      <button
        key={category.slug}
        data-chip={category.slug}
        role="tab"
        aria-selected={isActive}
        aria-pressed={isActive}
        tabIndex={isActive ? 0 : -1}
        onKeyDown={(e) => handleKeyDown(e, category.slug)}
        onClick={() => onChange(category.slug)}
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-sm shadow-sm ring-1 ring-border transition-all",
          "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap",
          isActive 
            ? "bg-foreground text-background" 
            : "bg-background text-foreground"
        )}
      >
        {category.label}
        {showCount && (
          <span className={cn(
            "ml-1.5 text-xs",
            isActive ? "text-background/70" : "text-muted-foreground"
          )}>
            · {category.count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={cn("relative", className)}>
      <div 
        ref={containerRef}
        role="tablist"
        aria-label="Category filter"
        className="relative flex items-center gap-2 overflow-hidden px-2"
        style={{
          maskImage: hasOverflow 
            ? 'linear-gradient(90deg, transparent 0, black 16px, black calc(100% - 16px), transparent 100%)'
            : undefined
        }}
      >
        {visibleCategories.map(renderChip)}
        
        {hasOverflow && (
          <Popover open={overflowOpen} onOpenChange={setOverflowOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="inline-flex items-center rounded-full px-3 py-1 text-sm shadow-sm ring-1 ring-border whitespace-nowrap"
              >
                +{hiddenCategories.length} more
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              align="end" 
              className="w-64 p-0"
              sideOffset={8}
            >
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div role="listbox" className="max-h-64 overflow-y-auto p-1">
                {filteredHidden.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                    No categories found
                  </div>
                ) : (
                  filteredHidden.map((category) => (
                    <button
                      key={category.slug}
                      role="option"
                      aria-selected={category.slug === value}
                      onClick={() => {
                        onChange(category.slug);
                        setOverflowOpen(false);
                        setSearchQuery('');
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-muted transition-colors text-left",
                        category.slug === value && "bg-muted"
                      )}
                    >
                      <span>{category.label}</span>
                      {category.count !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          {category.count}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}