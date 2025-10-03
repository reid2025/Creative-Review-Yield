'use client'

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { CampaignRow, CreativeRow, TagPerfRow } from '../_lib/DBTypes';
import { formatCurrency, formatNumber, formatPercent, calculateCPL, calculateCTR, calculateCVR } from '../_lib/DBUtils';

interface DBBreakdownTablesProps {
  campaigns: CampaignRow[];
  creatives: CreativeRow[];
  tagPerformance: TagPerfRow[];
  isLoading?: boolean;
}

type SortColumn = string;
type SortDirection = 'asc' | 'desc' | null;

/**
 * DBBreakdownTables - Tabbed interface with campaign, creative, and tag performance tables
 * Features sorting, detailed metrics, and creative thumbnails
 */
export function DBBreakdownTables({ campaigns, creatives, tagPerformance, isLoading }: DBBreakdownTablesProps) {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [sortColumn, setSortColumn] = useState<SortColumn>('spend');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(
        sortDirection === 'desc' ? 'asc' : 
        sortDirection === 'asc' ? null : 'desc'
      );
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="h-4 w-4 text-blue-600" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4 text-blue-600" />;
    }
    return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
  };

  const sortData = (data: any[]) => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];
      
      // Handle calculated metrics
      if (sortColumn === 'cpl') {
        aVal = calculateCPL(a.spend, a.leads);
        bVal = calculateCPL(b.spend, b.leads);
      } else if (sortColumn === 'ctr') {
        aVal = calculateCTR(a.clicks, a.impressions);
        bVal = calculateCTR(b.clicks, b.impressions);
      } else if (sortColumn === 'cvr') {
        aVal = calculateCVR(a.leads, a.clicks);
        bVal = calculateCVR(b.leads, b.clicks);
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Performance Breakdown
          </h3>
          <div className="text-sm text-gray-500">
            Click column headers to sort
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="creatives">Creatives</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="mt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Campaign</TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('spend')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Spend
                        {getSortIcon('spend')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('leads')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Leads
                        {getSortIcon('leads')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('cpl')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        CPL
                        {getSortIcon('cpl')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('ctr')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        CTR
                        {getSortIcon('ctr')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('activeCreatives')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Creatives
                        {getSortIcon('activeCreatives')}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortData(campaigns).slice(0, 10).map((campaign) => {
                    const cpl = calculateCPL(campaign.spend, campaign.leads);
                    const ctr = calculateCTR(campaign.clicks, campaign.impressions);
                    
                    return (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {campaign.name}
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(campaign.spend)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(campaign.leads)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cpl > 50 ? 'text-red-600 font-medium' : ''}>
                            {formatCurrency(cpl)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPercent(ctr)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">
                            {campaign.activeCreatives}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Creatives Tab */}
          <TabsContent value="creatives" className="mt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Creative</TableHead>
                    <TableHead>Designer</TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('spend')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Spend
                        {getSortIcon('spend')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('leads')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Leads
                        {getSortIcon('leads')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('cpl')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        CPL
                        {getSortIcon('cpl')}
                      </div>
                    </TableHead>
                    <TableHead>Tags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortData(creatives).slice(0, 10).map((creative) => {
                    const cpl = calculateCPL(creative.spend, creative.leads);
                    
                    return (
                      <TableRow key={creative.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 rounded">
                              <AvatarImage src={creative.previewUrl} alt={creative.name} />
                              <AvatarFallback className="rounded text-xs bg-gray-100">
                                IMG
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{creative.name}</div>
                              <div className="text-sm text-gray-500">{creative.campaign}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{creative.designer}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(creative.spend)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(creative.leads)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={cpl > 40 ? 'text-red-600 font-medium' : ''}>
                            {formatCurrency(cpl)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {creative.tags?.slice(0, 2).map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {creative.tags && creative.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{creative.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Tags Tab */}
          <TabsContent value="tags" className="mt-6">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tag</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('usage')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Usage
                        {getSortIcon('usage')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('spend')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        Spend
                        {getSortIcon('spend')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('cpl')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        CPL
                        {getSortIcon('cpl')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('ctr')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        CTR
                        {getSortIcon('ctr')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-right cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('cvr')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        CVR
                        {getSortIcon('cvr')}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortData(tagPerformance).map((tag) => {
                    return (
                      <TableRow key={tag.tag}>
                        <TableCell className="font-medium">{tag.tag}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{tag.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {tag.usage}
                            <div className="w-12 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{ width: `${Math.min(100, (tag.usage / 50) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(tag.spend)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={tag.cpl > 30 ? 'text-red-600 font-medium' : ''}>
                            {formatCurrency(tag.cpl)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPercent(tag.ctr)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPercent(tag.cvr)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}