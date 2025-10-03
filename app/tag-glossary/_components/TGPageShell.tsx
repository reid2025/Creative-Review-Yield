'use client'

import React from 'react';
import { cn } from '@/lib/utils';

interface TGPageShellProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * TGPageShell - Full-width white container matching Creative Library layout
 * Provides clean page structure with proper spacing and white background
 */
export function TGPageShell({ children, className }: TGPageShellProps) {
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