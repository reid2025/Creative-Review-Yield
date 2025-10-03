'use client'

import React from 'react';
import { cn } from '@/lib/utils';

interface DBPageShellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * DBPageShell - Full-width white container matching Creative Stream layout
 * Provides clean page structure with proper spacing and white background
 */
export function DBPageShell({ children, className }: DBPageShellProps) {
  return (
    <div className="w-full bg-white">
      <div className={cn(
        "w-full px-8 py-6",
        className
      )}>
        {children}
      </div>
    </div>
  );
}