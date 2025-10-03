'use client'

import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Kpi } from '../_lib/DBTypes';
import { formatCurrency, formatNumber, formatPercent, formatDelta, calculateCPL, calculateCTR } from '../_lib/DBUtils';

interface DBKPIStripProps {
  kpis: Kpi;
  sparklines?: Record<string, number[]>;
  isLoading?: boolean;
}

interface KPITileProps {
  title: string;
  value: string | number;
  delta?: number;
  format?: 'number' | 'currency' | 'percent';
  sparkline?: number[];
  isLoading?: boolean;
  anomaly?: boolean;
}

function KPITile({ title, value, delta, format = 'number', sparkline, isLoading, anomaly }: KPITileProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </Card>
    );
  }

  const formatValue = (val: string | number) => {
    const numVal = typeof val === 'string' ? parseFloat(val) : val;
    
    switch (format) {
      case 'currency':
        return formatCurrency(numVal);
      case 'percent':
        return formatPercent(numVal);
      default:
        return formatNumber(numVal);
    }
  };

  const deltaInfo = delta !== undefined ? formatDelta(delta) : null;

  return (
    <Card className="p-6 hover:shadow-md transition-shadow relative">
      {anomaly && (
        <Badge variant="destructive" className="absolute top-2 right-2 text-xs">
          Anomaly
        </Badge>
      )}
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">
            {title}
          </h3>
          {deltaInfo && (
            <div className={`flex items-center gap-1 text-xs ${deltaInfo.className}`}>
              {deltaInfo.icon === '↗' && <TrendingUp className="h-3 w-3" />}
              {deltaInfo.icon === '↘' && <TrendingDown className="h-3 w-3" />}
              {deltaInfo.icon === '→' && <Minus className="h-3 w-3" />}
              <span>{deltaInfo.text}</span>
            </div>
          )}
        </div>
        
        <div className="text-2xl font-bold text-gray-900">
          {formatValue(value)}
        </div>

        {/* Mini sparkline */}
        {sparkline && sparkline.length > 0 && (
          <div className="h-8 flex items-end gap-px">
            {sparkline.slice(-14).map((point, i) => {
              const height = Math.max(2, (point / Math.max(...sparkline)) * 24);
              return (
                <div
                  key={i}
                  className="bg-blue-200 w-1 rounded-sm"
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * DBKPIStrip - Row of KPI tiles with sparklines and delta indicators
 * Shows leads, spend, CPL, CTR, and active tests
 */
export function DBKPIStrip({ kpis, sparklines, isLoading }: DBKPIStripProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <KPITile key={i} title="" value={0} isLoading />
        ))}
      </div>
    );
  }

  // Calculate derived metrics
  const cpl = calculateCPL(kpis.spend, kpis.leads);
  const ctr = calculateCTR(kpis.clicks, kpis.impressions);
  
  // Calculate deltas
  const leadsDelta = kpis.previous ? ((kpis.leads - kpis.previous.leads) / kpis.previous.leads) * 100 : undefined;
  const spendDelta = kpis.previous ? ((kpis.spend - kpis.previous.spend) / kpis.previous.spend) * 100 : undefined;
  const previousCPL = kpis.previous ? calculateCPL(kpis.previous.spend, kpis.previous.leads) : 0;
  const cplDelta = previousCPL > 0 ? ((cpl - previousCPL) / previousCPL) * 100 : undefined;
  const previousCTR = kpis.previous ? calculateCTR(kpis.previous.clicks, kpis.previous.impressions) : 0;
  const ctrDelta = previousCTR > 0 ? ((ctr - previousCTR) / previousCTR) * 100 : undefined;
  const testsDelta = kpis.previous ? ((kpis.activeTests - kpis.previous.activeTests) / kpis.previous.activeTests) * 100 : undefined;

  // Check for anomalies (CPL spike > 20%)
  const cplAnomaly = cplDelta && cplDelta > 20;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <KPITile
        title="Leads"
        value={kpis.leads}
        delta={leadsDelta}
        format="number"
        sparkline={sparklines?.leads}
      />
      
      <KPITile
        title="Spend"
        value={kpis.spend}
        delta={spendDelta}
        format="currency"
        sparkline={sparklines?.spend}
      />
      
      <KPITile
        title="CPL"
        value={cpl}
        delta={cplDelta}
        format="currency"
        anomaly={cplAnomaly}
      />
      
      <KPITile
        title="CTR"
        value={ctr}
        delta={ctrDelta}
        format="percent"
        sparkline={sparklines?.clicks}
      />
      
      <KPITile
        title="Active Tests"
        value={kpis.activeTests}
        delta={testsDelta}
        format="number"
        sparkline={sparklines?.activeTests}
      />
    </div>
  );
}