'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterState, CategoryState } from './_lib/TGTypes';
import { FEATURE_TAG_GLOSSARY, DEFAULT_CATEGORY_STATE } from './_lib/TGConstants';
import { getCachedMockAnalytics, getMockTagUsage } from './_lib/TGMockData';

// Components
import { TGPageShell } from './_components/TGPageShell';
import { TGHeader } from './_components/TGHeader';
import { TGKPITiles } from './_components/TGKPITiles';
import { TGControlsBar } from './_components/TGControlsBar';
import { TGCategorySection } from './_components/TGCategorySection';

// Feature disabled component
function FeatureDisabled() {
  return (
    <TGPageShell>
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Feature Disabled
        </h1>
        <p className="text-gray-600 mb-6">
          The Tag Glossary feature is currently disabled. Please contact your administrator to enable it.
        </p>
        <div className="text-sm text-gray-500">
          To enable: Set <code className="bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_FEATURE_TAG_GLOSSARY=true</code>
        </div>
      </div>
    </TGPageShell>
  );
}

// Main Tag Glossary page
export default function TagGlossaryPage() {
  // Feature flag check
  if (!FEATURE_TAG_GLOSSARY) {
    return <FeatureDisabled />;
  }

  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters with URL params and localStorage
  const [filters, setFilters] = useState<FilterState>(() => {
    const urlCategory = searchParams.get('category') || 'all';
    const savedCategory = typeof window !== 'undefined' 
      ? localStorage.getItem('tagGlossary.lastCategory') 
      : null;
    
    return {
      search: '',
      category: urlCategory !== 'all' ? urlCategory : (savedCategory || 'all'),
      sortBy: 'usage-desc',
      view: 'grid',
      showUnusedOnly: false
    };
  });

  const [categoryState, setCategoryState] = useState<CategoryState>(DEFAULT_CATEGORY_STATE);

  // Load category state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tagGlossary.categoryState');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCategoryState({ ...DEFAULT_CATEGORY_STATE, ...parsed });
      }
    } catch (error) {
      console.warn('Failed to load category state from localStorage:', error);
    }
  }, []);

  // Save category state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tagGlossary.categoryState', JSON.stringify(categoryState));
    } catch (error) {
      console.warn('Failed to save category state to localStorage:', error);
    }
  }, [categoryState]);

  // Sync category filter with URL and localStorage
  useEffect(() => {
    if (filters.category !== 'all') {
      // Update URL
      const params = new URLSearchParams(searchParams);
      params.set('category', filters.category);
      router.replace(`/tag-glossary?${params.toString()}`, { scroll: false });
      
      // Save to localStorage
      localStorage.setItem('tagGlossary.lastCategory', filters.category);
    } else {
      // Remove from URL when 'all' is selected
      const params = new URLSearchParams(searchParams);
      params.delete('category');
      const newUrl = params.toString() ? `/tag-glossary?${params.toString()}` : '/tag-glossary';
      router.replace(newUrl, { scroll: false });
    }
  }, [filters.category, router, searchParams]);

  // Data
  const analytics = getCachedMockAnalytics();
  const tagUsage = getMockTagUsage();

  // Handlers
  const handleFiltersChange = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const handleCategoryToggle = (categoryKey: string) => {
    setCategoryState(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  const handleAddTag = () => {
    // Mock handler - in real implementation, would open modal
    alert('Add Tag functionality coming soon!');
  };

  const handleExportCSV = () => {
    // Mock handler - in real implementation, would export data
    alert('Export CSV functionality coming soon!');
  };

  // Filter categories based on current category filter
  const categoriesToShow = Object.keys(tagUsage).filter(categoryKey => {
    if (filters.category === 'all') return true;
    return categoryKey === filters.category;
  });

  return (
    <TGPageShell>
      <div className="space-y-8">
        {/* Header */}
        <TGHeader 
          onAddTag={handleAddTag}
          onExportCSV={handleExportCSV}
        />

        {/* KPI Tiles */}
        <TGKPITiles analytics={analytics} />

        {/* Controls Bar */}
        <TGControlsBar 
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        {/* Directory Content */}
        <div>
          {categoriesToShow.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">
                No categories found
              </div>
              <div className="text-gray-400 text-sm">
                Try adjusting your category filter
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {categoriesToShow.map(categoryKey => (
                <TGCategorySection
                  key={categoryKey}
                  categoryKey={categoryKey}
                  tags={tagUsage[categoryKey] || []}
                  isExpanded={categoryState[categoryKey] || false}
                  onToggle={() => handleCategoryToggle(categoryKey)}
                  filters={filters}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </TGPageShell>
  );
}