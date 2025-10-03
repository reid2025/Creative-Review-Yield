'use client'

import React, { useState, useEffect } from 'react';
import { FEATURE_CREATIVE_DASHBOARD, DEFAULT_FILTERS, DashboardFilters } from './_lib/DBConstants';
import { getDashboardData } from './_lib/DBMockData';
import { useGoogleSheetsData } from '@/hooks/useGoogleSheetsData';
import { useGoogleAuth } from '@/contexts/GoogleAuthContext';

// Components
import { DBPageShell } from './_components/DBPageShell';
import { DBHeader } from './_components/DBHeader';
import { DBToolbar } from './_components/DBToolbar';
import { DBKPIStrip } from './_components/DBKPIStrip';
import { DBTrends } from './_components/DBTrends';
import { DBBreakdownTables } from './_components/DBBreakdownTables';

// Feature disabled component
function FeatureDisabled() {
  return (
    <DBPageShell>
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Feature Disabled
        </h1>
        <p className="text-gray-600 mb-6">
          The Creative Dashboard feature is currently disabled. Please contact your administrator to enable it.
        </p>
        <div className="text-sm text-gray-500">
          To enable: Set <code className="bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_FEATURE_CREATIVE_DASHBOARD=true</code>
        </div>
      </div>
    </DBPageShell>
  );
}

// Main Dashboard page
export default function DashboardPage() {
  // Feature flag check
  if (!FEATURE_CREATIVE_DASHBOARD) {
    return <FeatureDisabled />;
  }

  // State management
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(true);

  // Google Sheets integration
  const { isAuthenticated } = useGoogleAuth();
  const googleSheetsQuery = useGoogleSheetsData();

  // Simulate loading for initial mount, then use Google Sheets loading state
  useEffect(() => {
    if (isAuthenticated && !googleSheetsQuery.isLoading) {
      setIsLoading(false);
    } else if (!isAuthenticated) {
      // If not authenticated, still show dashboard with mock data after initial delay
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, googleSheetsQuery.isLoading]);

  // Get dashboard data (Google Sheets if available, otherwise mock data)
  const dashboardData = getDashboardData(googleSheetsQuery);

  // Handlers
  const handleFiltersChange = (updates: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const handleExportCSV = () => {
    // Mock handler - in real implementation, would export filtered data
    alert('Export CSV functionality coming soon!');
  };

  const handleSettings = () => {
    // Mock handler - in real implementation, would open settings modal
    alert('Settings modal coming soon!');
  };

  const handleExport = () => {
    // Mock handler - in real implementation, would export current view
    alert('Export current view functionality coming soon!');
  };

  return (
    <DBPageShell>
      <div className="space-y-8">
        {/* Header */}
        <DBHeader 
          onExportCSV={handleExportCSV}
          onSettings={handleSettings}
          dataSource={dashboardData.dataSource}
          lastUpdated={dashboardData.lastUpdated}
        />

        {/* Sticky Toolbar */}
        <DBToolbar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onExport={handleExport}
        />

        {/* KPI Strip */}
        <DBKPIStrip
          kpis={dashboardData.kpis}
          sparklines={dashboardData.sparklines}
          isLoading={isLoading}
        />

        {/* Trends Charts */}
        <DBTrends
          series={dashboardData.series}
          isLoading={isLoading}
        />

        {/* Breakdown Tables */}
        <DBBreakdownTables
          campaigns={dashboardData.campaigns}
          creatives={dashboardData.creatives}
          tagPerformance={dashboardData.tagPerformance}
          isLoading={isLoading}
        />

        {/* Coming Soon Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Activity Log
            </h3>
            <p className="text-gray-500 text-sm">
              Phase 3: Team activity feed with filters and search
            </p>
          </div>

          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Lift-Up Canvas
            </h3>
            <p className="text-gray-500 text-sm">
              Phase 4: Drag-drop images and GIFs for team morale
            </p>
          </div>
        </div>

        {/* Debug Info in Development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Dashboard Debug Info
            </h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p>Feature Flag: {FEATURE_CREATIVE_DASHBOARD ? '✅ Enabled' : '❌ Disabled'}</p>
              <p>Date Range: {filters.dateRange.start} to {filters.dateRange.end}</p>
              <p>Channel: {filters.channel}</p>
              <p>Campaign Filter: {filters.campaign || 'None'}</p>
              <p>Authentication: {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</p>
              <p>Data Source: {dashboardData.dataSource === 'google-sheets' ? '✅ Google Sheets' : 
                dashboardData.dataSource === 'mock-fallback' ? '⚠️ Mock (Google Sheets Error)' : '📝 Mock Data'}</p>
              <p>Google Sheets Status: {googleSheetsQuery.isLoading ? '⏳ Loading' : 
                googleSheetsQuery.isError ? '❌ Error' : '✅ Ready'}</p>
              {dashboardData.lastUpdated && (
                <p>Last Updated: {new Date(dashboardData.lastUpdated).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </DBPageShell>
  );
}