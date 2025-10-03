'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Settings, Database, FileText } from 'lucide-react';

interface DBHeaderProps {
  onExportCSV?: () => void;
  onSettings?: () => void;
  dataSource?: 'google-sheets' | 'mock' | 'mock-fallback';
  lastUpdated?: Date;
}

/**
 * DBHeader - Dashboard header with title and action buttons
 * Matches Creative Stream header styling
 */
export function DBHeader({ onExportCSV, onSettings, dataSource, lastUpdated }: DBHeaderProps) {
  const getDataSourceBadge = () => {
    if (dataSource === 'google-sheets') {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Database className="h-3 w-3" />
          Live Data
        </Badge>
      );
    } else if (dataSource === 'mock-fallback') {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Mock Data (Fallback)
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Mock Data
        </Badge>
      );
    }
  };

  return (
    <div className="pb-6 border-b border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-league-spartan text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            {getDataSourceBadge()}
          </div>
          <p className="text-gray-600 text-lg">
            Performance overview, team activity, and what to ship next.
          </p>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        
        <div className="ml-auto flex gap-3">
          <Button 
            variant="outline" 
            onClick={onExportCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          
          <Button 
            variant="outline"
            onClick={onSettings}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}