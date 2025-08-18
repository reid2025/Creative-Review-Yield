'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { CreativeHistoryEntry } from '@/types/creative'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Minus, History, Calendar, DollarSign } from 'lucide-react'

interface CreativeHistoryViewerProps {
  history: CreativeHistoryEntry[]
  currentCost?: string
  currentCPL?: string
  currentCPC?: string
}

export function CreativeHistoryViewer({
  history,
  currentCost,
  currentCPL,
  currentCPC
}: CreativeHistoryViewerProps) {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('chart')

  // Check if we have meaningful data (not just zeros)
  const hasMeaningfulData = history && history.length > 0 && history.some(entry => 
    parseFloat(entry.cost || '0') > 0 || 
    parseFloat(entry.costPerWebsiteLead || '0') > 0 || 
    parseFloat(entry.costPerLinkClick || '0') > 0
  )
  
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No history data available</p>
        </CardContent>
      </Card>
    )
  }
  
  // If we only have zero values, show a simplified view
  if (!hasMeaningfulData) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center text-gray-500">
            <History className="h-5 w-5 mr-2" />
            <span>No performance data recorded yet</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort history by date first
  const sortedHistory = [...history].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateA - dateB // Ascending order (oldest to newest)
  })

  // Prepare data for chart
  const chartData = sortedHistory.map(entry => ({
    date: format(new Date(entry.date), 'MMM dd'),
    fullDate: entry.date, // Keep full date for sorting
    cost: parseFloat(entry.cost || '0'),
    cpl: parseFloat(entry.costPerWebsiteLead || '0'),
    cpc: parseFloat(entry.costPerLinkClick || '0'),
  }))

  // Add current values if available and different from latest history
  const latestHistory = sortedHistory[sortedHistory.length - 1]
  const hasNewCurrent = currentCost && (!latestHistory || 
    currentCost !== latestHistory.cost || 
    currentCPL !== latestHistory.costPerWebsiteLead || 
    currentCPC !== latestHistory.costPerLinkClick)
  
  if (hasNewCurrent) {
    chartData.push({
      date: 'Current',
      fullDate: new Date().toISOString(),
      cost: parseFloat(currentCost || '0'),
      cpl: parseFloat(currentCPL || '0'),
      cpc: parseFloat(currentCPC || '0'),
    })
  }

  // Calculate trends
  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return 0
    const lastValue = values[values.length - 1]
    const previousValue = values[values.length - 2]
    if (previousValue === 0 || lastValue === 0) return 0
    return ((lastValue - previousValue) / previousValue) * 100
  }

  const costTrend = calculateTrend(chartData.map(d => d.cost))
  const cplTrend = calculateTrend(chartData.map(d => d.cpl))
  const cpcTrend = calculateTrend(chartData.map(d => d.cpc))

  const TrendIcon = ({ trend }: { trend: number }) => {
    if (Math.abs(trend) < 0.01) return null // Don't show icon for near-zero trends
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-red-500" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-green-500" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentCost || chartData[chartData.length - 1]?.cost || 0)}</div>
            {Math.abs(costTrend) > 0.01 && (
              <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                <TrendIcon trend={costTrend} />
                <span>{Math.abs(costTrend).toFixed(1)}%</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Cost per Lead</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentCPL || chartData[chartData.length - 1]?.cpl || 0)}</div>
            {Math.abs(cplTrend) > 0.01 && (
              <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                <TrendIcon trend={cplTrend} />
                <span>{Math.abs(cplTrend).toFixed(1)}%</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Cost per Click</CardTitle>
              <TrendingDown className="h-4 w-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentCPC || chartData[chartData.length - 1]?.cpc || 0)}</div>
            {Math.abs(cpcTrend) > 0.01 && (
              <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                <TrendIcon trend={cpcTrend} />
                <span>{Math.abs(cpcTrend).toFixed(1)}%</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* History View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance History</CardTitle>
              <CardDescription>Track changes in cost metrics over time</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <History className="h-3 w-3" />
              {history.length} updates
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'chart')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chart" className="mt-4">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#888"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#888"
                    domain={[0, 'auto']}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="#3b82f6" 
                    name="Total Spend"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cpl" 
                    stroke="#10b981" 
                    name="Cost per Lead"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cpc" 
                    stroke="#f59e0b" 
                    name="Cost per Click"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="table" className="mt-4">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Total Spend</TableHead>
                      <TableHead>Cost per Lead</TableHead>
                      <TableHead>Cost per Click</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Synced</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedHistory.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {format(new Date(entry.date), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(entry.cost)}</TableCell>
                        <TableCell>{formatCurrency(entry.costPerWebsiteLead)}</TableCell>
                        <TableCell>{formatCurrency(entry.costPerLinkClick)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {entry.dataSource}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500 text-xs">
                          {entry.syncedAt && format(new Date(entry.syncedAt.toDate()), 'MMM dd, HH:mm')}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(currentCost || currentCPL || currentCPC) && (
                      <TableRow className="bg-blue-50">
                        <TableCell className="font-bold">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            Current
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">{formatCurrency(currentCost || '0')}</TableCell>
                        <TableCell className="font-bold">{formatCurrency(currentCPL || '0')}</TableCell>
                        <TableCell className="font-bold">{formatCurrency(currentCPC || '0')}</TableCell>
                        <TableCell>
                          <Badge className="text-xs">
                            Live
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500 text-xs">
                          Now
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreativeHistoryViewer