'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronLeft, ChevronRight, Search, ChevronDown } from 'lucide-react'

interface Filters {
  search: string
  dateRange: string
  status: string
  wave: string
  testFocus: string
  attributes: string
  hasHistory: string
  showAdvanced: boolean
}

interface FiltersAndControlsProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  sortBy: string
  onSortChange: (sortBy: string) => void
  showCount: number
  onShowCountChange: (count: number) => void
  currentPage: number
  onPageChange: (page: number) => void
  totalItems: number
}

export default function FiltersAndControls({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  showCount,
  onShowCountChange,
  currentPage,
  onPageChange,
  totalItems
}: FiltersAndControlsProps) {
  const startIndex = (currentPage - 1) * showCount + 1
  const endIndex = Math.min(currentPage * showCount, totalItems)
  const totalPages = Math.ceil(totalItems / showCount)

  const handleFilterChange = (key: keyof Filters, value: string | boolean) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  return (
    <div className="space-y-4">
      {/* Primary Filters Pills */}
      <div className="flex items-center gap-3">
        {/* Date Range */}
        <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
          <SelectTrigger className="h-9 px-4 bg-gray-100 border-none rounded-full font-[500] text-black font-['DM_Sans'] w-auto min-w-[120px]">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-7-days">Last 7 days</SelectItem>
            <SelectItem value="last-30-days">Last 30 days</SelectItem>
            <SelectItem value="last-90-days">Last 90 days</SelectItem>
            <SelectItem value="this-quarter">This Quarter</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}
        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger className="h-9 px-4 bg-gray-100 border-none rounded-full font-[500] text-black font-['DM_Sans'] w-auto min-w-[100px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced Filters Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleFilterChange('showAdvanced', !filters.showAdvanced)}
          className="h-9 px-4 bg-gray-100 hover:bg-gray-200 border-none rounded-full text-black font-[500] font-['DM_Sans'] gap-2"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${filters.showAdvanced ? 'rotate-180' : ''}`} />
          Advanced
        </Button>
      </div>

      {/* Advanced Filters (collapsible) */}
      <Collapsible open={filters.showAdvanced} onOpenChange={(open) => handleFilterChange('showAdvanced', open)}>
        <CollapsibleContent>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 h-9 bg-gray-100 border-none rounded-full font-[500] text-black font-['DM_Sans'] w-48"
              />
            </div>

            {/* Wave Number */}
            <Select value={filters.wave} onValueChange={(value) => handleFilterChange('wave', value)}>
              <SelectTrigger className="h-9 px-4 bg-gray-100 border-none rounded-full font-[500] text-black font-['DM_Sans'] w-auto min-w-[110px]">
                <SelectValue placeholder="Wave #" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Wave 1</SelectItem>
                <SelectItem value="2">Wave 2</SelectItem>
                <SelectItem value="3">Wave 3</SelectItem>
                <SelectItem value="4">Wave 4</SelectItem>
                <SelectItem value="5">Wave 5</SelectItem>
                <SelectItem value="6">Wave 6+</SelectItem>
              </SelectContent>
            </Select>

            {/* Test Focus */}
            <Select value={filters.testFocus} onValueChange={(value) => handleFilterChange('testFocus', value)}>
              <SelectTrigger className="h-9 px-4 bg-gray-100 border-none rounded-full font-[500] text-black font-['DM_Sans'] w-auto min-w-[120px]">
                <SelectValue placeholder="Test Focus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="headline">Headline Testing</SelectItem>
                <SelectItem value="cta">CTA Optimization</SelectItem>
                <SelectItem value="imagery">Imagery Testing</SelectItem>
                <SelectItem value="copy">Copy Testing</SelectItem>
                <SelectItem value="targeting">Targeting</SelectItem>
                <SelectItem value="social-proof">Social Proof</SelectItem>
                <SelectItem value="performance">Performance Optimization</SelectItem>
              </SelectContent>
            </Select>

            {/* Attributes */}
            <Select value={filters.attributes} onValueChange={(value) => handleFilterChange('attributes', value)}>
              <SelectTrigger className="h-9 px-4 bg-gray-100 border-none rounded-full font-[500] text-black font-['DM_Sans'] w-auto min-w-[120px]">
                <SelectValue placeholder="Attributes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="question-headlines">Question Headlines</SelectItem>
                <SelectItem value="testimonials">Testimonials</SelectItem>
                <SelectItem value="statistics">Statistics</SelectItem>
                <SelectItem value="urgency">Urgency</SelectItem>
                <SelectItem value="icons">Has Icons</SelectItem>
                <SelectItem value="dark-theme">Dark Theme</SelectItem>
              </SelectContent>
            </Select>

            {/* Has History */}
            <Select value={filters.hasHistory} onValueChange={(value) => handleFilterChange('hasHistory', value)}>
              <SelectTrigger className="h-9 px-4 bg-gray-100 border-none rounded-full font-[500] text-black font-['DM_Sans'] w-auto min-w-[120px]">
                <SelectValue placeholder="Has Results" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">With Results</SelectItem>
                <SelectItem value="no">Awaiting Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Controls Bottom Row */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          {/* Sort */}
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-9 px-4 bg-gray-100 border-none rounded-full font-[500] text-black font-['DM_Sans'] w-auto min-w-[140px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Date (Newest)</SelectItem>
              <SelectItem value="leads">Leads (Highest)</SelectItem>
              <SelectItem value="cpl">CPL (Lowest)</SelectItem>
              <SelectItem value="ctr">CTR (Highest)</SelectItem>
              <SelectItem value="spend">Spend (Highest)</SelectItem>
            </SelectContent>
          </Select>

          {/* Show count */}
          <Select value={showCount.toString()} onValueChange={(value) => onShowCountChange(parseInt(value))}>
            <SelectTrigger className="h-9 px-4 bg-gray-100 border-none rounded-full font-[500] text-black font-['DM_Sans'] w-auto min-w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-[500] text-black font-['DM_Sans']">
            {startIndex}–{endIndex} of {totalItems}
          </span>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 rounded-full"
            >
              <ChevronLeft className="h-4 w-4 text-black" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 rounded-full"
            >
              <ChevronRight className="h-4 w-4 text-black" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}