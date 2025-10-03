'use client'

import { FilterTag } from './FilterTag'

interface FilterTagsDisplayProps {
  // Search
  searchQuery: string
  onClearSearch: () => void

  // Date
  dateFilter: string
  onClearDate: () => void
  getDateDisplayName?: (dateKey: string) => string

  // Accounts
  accountFilter: string[] | null
  onRemoveAccount: (account: string) => void

  // Campaigns
  campaignFilter: string[] | null
  onRemoveCampaign: (campaign: string) => void

  // Status filters
  deliveryStatusFilter: string | null
  onRemoveDeliveryStatus: (status: string) => void
  workflowStatusFilter: string | null
  onRemoveWorkflowStatus: (status: string) => void


  // Helper function for status display names
  getStatusDisplayName: (status: string) => string
}

export function FilterTagsDisplay({
  searchQuery,
  onClearSearch,
  dateFilter,
  onClearDate,
  getDateDisplayName,
  accountFilter,
  onRemoveAccount,
  campaignFilter,
  onRemoveCampaign,
  deliveryStatusFilter,
  onRemoveDeliveryStatus,
  workflowStatusFilter,
  onRemoveWorkflowStatus,
  getStatusDisplayName
}: FilterTagsDisplayProps) {

  const hasAnyFilters = searchQuery ||
                       dateFilter !== 'all' ||
                       (accountFilter && accountFilter.length > 0) ||
                       (campaignFilter && campaignFilter.length > 0) ||
                       deliveryStatusFilter !== null ||
                       workflowStatusFilter !== null

  if (!hasAnyFilters) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {/* Search Tag */}
      {searchQuery && (
        <FilterTag
          label={`Search: "${searchQuery}"`}
          type="search"
          onRemove={onClearSearch}
        />
      )}

      {/* Date Tag */}
      {dateFilter !== 'all' && (
        <FilterTag
          label={dateFilter === 'custom' ? 'Custom Date Range' : (getDateDisplayName ? getDateDisplayName(dateFilter) : dateFilter)}
          type="date"
          onRemove={onClearDate}
        />
      )}

      {/* Account Tags */}
      {accountFilter && accountFilter.map(account => (
        <FilterTag
          key={account}
          label={account}
          type="account"
          onRemove={() => onRemoveAccount(account)}
        />
      ))}

      {/* Campaign Tags */}
      {campaignFilter && campaignFilter.map(campaign => (
        <FilterTag
          key={campaign}
          label={campaign}
          type="campaign"
          onRemove={() => onRemoveCampaign(campaign)}
        />
      ))}

      {/* Delivery Status Tag */}
      {deliveryStatusFilter && (
        <FilterTag
          key={`delivery-${deliveryStatusFilter}`}
          label={`Status: ${getStatusDisplayName(deliveryStatusFilter)}`}
          type="status"
          onRemove={() => onRemoveDeliveryStatus(deliveryStatusFilter)}
        />
      )}

      {/* Workflow Status Tag */}
      {workflowStatusFilter && (
        <FilterTag
          key={`workflow-${workflowStatusFilter}`}
          label={`Library: ${
            workflowStatusFilter === 'show-published-only' ? 'Show Published Only' :
            workflowStatusFilter === 'show-not-published' ? 'Show Not Published' :
            getStatusDisplayName(workflowStatusFilter)
          }`}
          type="status"
          onRemove={() => onRemoveWorkflowStatus(workflowStatusFilter)}
        />
      )}

    </div>
  )
}