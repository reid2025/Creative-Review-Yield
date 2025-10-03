'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';

interface TGHeaderProps {
  onAddTag?: () => void;
  onExportCSV?: () => void;
}

/**
 * TGHeader - Header section matching Creative Stream styling
 * Includes title, subtitle, and action buttons
 */
export function TGHeader({ onAddTag, onExportCSV }: TGHeaderProps) {
  return (
    <div className="pb-6 border-b border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-league-spartan text-3xl font-bold text-gray-900">
            Tag Glossary
          </h1>
          <p className="text-gray-600 text-lg mt-2">
            Manage and analyze all tags used in creative uploads.
          </p>
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
            onClick={onAddTag}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Tag
          </Button>
        </div>
      </div>
    </div>
  );
}