'use client'

import { FileText, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onResetFilters?: () => void
  hasFilters?: boolean
  type?: 'table' | 'grid'
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  onResetFilters, 
  hasFilters = false,
  type = 'table'
}) => {
  return (
    <div className="text-center py-16 bg-white">
      <div className="max-w-md mx-auto">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-6" />
        
        <h3 className="text-lg font-[500] text-gray-600 mb-2 font-['DM_Sans']">
          No creatives found
        </h3>
        
        <p className="text-gray-500 font-['DM_Sans'] mb-6">
          {hasFilters 
            ? "We couldn't find any creatives matching your current filter criteria. Try adjusting or clearing your filters to see more results."
            : "There are no creatives in your library yet. Upload some creatives to get started."
          }
        </p>
        
        {hasFilters && onResetFilters && (
          <Button 
            variant="outline" 
            onClick={onResetFilters}
            className="h-11 px-6 font-[500] font-['DM_Sans'] border-gray-200 text-gray-700 hover:bg-gray-50 gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  )
}