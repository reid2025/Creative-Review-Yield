'use client'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Image as ImageIcon, Check, Clock } from 'lucide-react'
import { useState } from 'react'
import NextImage from 'next/image'

interface Wave {
  id: string
  campaignId: string
  waveNumber: number
  batchId: string
  createdAt: string
  uploaderIds: string[]
  testNotes?: string
  testFocus: string[]
  changeDescription: string
  resultNotes?: string
  metrics: {
    spend: number
    leads: number
    cpl: number
    cpc: number
    ctr: number
    uniques: number
    impressions: number
  }
  creativesCount: number
}

interface Creative {
  id: string
  campaignId: string
  accountId: string
  waveId: string
  batchId: string
  assetUrl?: string
  attributes: {
    layout?: string
    template?: string
    headline?: string
    cta?: string
    tone?: string
    background?: string
    icons?: boolean
  }
  metrics: {
    spend: number
    leads: number
    cpl: number
    cpc: number
    ctr: number
    impressions: number
    uniques: number
  }
  uploadedAt: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  sheetRowId?: string
  sheetLastUpdated?: string
}

interface CreativesTableProps {
  wave: Wave
  onClose: () => void
}

// Mock creatives data for the wave
const mockCreatives: Creative[] = [
  {
    id: 'creative-1',
    campaignId: '1',
    accountId: 'acc-1',
    waveId: 'wave-1',
    batchId: 'batch-1',
    assetUrl: '/api/placeholder/300/200',
    attributes: {
      layout: 'Hero Banner',
      template: 'Legal Standard',
      headline: 'Injured in an Accident? Get Help Now',
      cta: 'Get Free Consultation',
      tone: 'Urgent',
      background: 'Gradient Blue',
      icons: true
    },
    metrics: {
      spend: 2340,
      leads: 67,
      cpl: 34.93,
      cpc: 1.87,
      ctr: 4.2,
      impressions: 45230,
      uniques: 8940
    },
    uploadedAt: '2024-01-15T10:30:00Z',
    status: 'active',
    sheetRowId: 'row-123',
    sheetLastUpdated: '2024-03-10T09:30:00Z'
  },
  {
    id: 'creative-2',
    campaignId: '1',
    accountId: 'acc-1',
    waveId: 'wave-1',
    batchId: 'batch-1',
    assetUrl: '/api/placeholder/300/200',
    attributes: {
      layout: 'Split Screen',
      template: 'Legal Premium',
      headline: 'Did You Suffer a Personal Injury?',
      cta: 'Call Now for Justice',
      tone: 'Professional',
      background: 'White Clean',
      icons: false
    },
    metrics: {
      spend: 1890,
      leads: 52,
      cpl: 36.35,
      cpc: 2.14,
      ctr: 3.8,
      impressions: 38750,
      uniques: 7420
    },
    uploadedAt: '2024-01-15T11:15:00Z',
    status: 'active',
    sheetRowId: 'row-124',
    sheetLastUpdated: '2024-03-10T09:30:00Z'
  },
  {
    id: 'creative-3',
    campaignId: '1',
    accountId: 'acc-1',
    waveId: 'wave-1',
    batchId: 'batch-1',
    attributes: {
      layout: 'Vertical Stack',
      template: 'Legal Modern',
      headline: 'Maximum Compensation for Your Injuries',
      cta: 'Start Your Case',
      tone: 'Confident',
      background: 'Dark Theme',
      icons: true
    },
    metrics: {
      spend: 3140,
      leads: 89,
      cpl: 35.28,
      cpc: 1.92,
      ctr: 4.5,
      impressions: 52340,
      uniques: 10230
    },
    uploadedAt: '2024-01-15T14:20:00Z',
    status: 'active',
    sheetRowId: 'row-125',
    sheetLastUpdated: '2024-03-10T09:30:00Z'
  }
]

export default function CreativesTable({ wave, onClose }: CreativesTableProps) {
  const [selectedCreatives, setSelectedCreatives] = useState<string[]>([])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'draft':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSelectCreative = (creativeId: string) => {
    if (selectedCreatives.includes(creativeId)) {
      setSelectedCreatives(selectedCreatives.filter(id => id !== creativeId))
    } else {
      setSelectedCreatives([...selectedCreatives, creativeId])
    }
  }

  const handleSelectAll = () => {
    if (selectedCreatives.length === mockCreatives.length) {
      setSelectedCreatives([])
    } else {
      setSelectedCreatives(mockCreatives.map(c => c.id))
    }
  }

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-[1200px] sm:max-w-[1200px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl font-[500] text-black">
                Wave {wave.waveNumber} Creatives
              </SheetTitle>
              <SheetDescription>
                {mockCreatives.length} creatives in this wave
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
              {selectedCreatives.length > 0 && (
                <Button variant="outline" size="sm">
                  Select for Compare ({selectedCreatives.length})
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Wave Summary Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Wave Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Created</div>
                <div className="text-sm font-[500] text-black">{formatDate(wave.createdAt)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Test Focus</div>
                <div className="flex flex-wrap gap-1">
                  {wave.testFocus.slice(0, 2).map(focus => (
                    <Badge key={focus} variant="secondary" className="text-xs">
                      {focus}
                    </Badge>
                  ))}
                  {wave.testFocus.length > 2 && (
                    <span className="text-xs text-gray-400">+{wave.testFocus.length - 2}</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Total Spend</div>
                <div className="text-sm font-[500] text-black">{formatCurrency(wave.metrics.spend)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Avg CPL</div>
                <div className="text-sm font-[500] text-black">{formatCurrency(wave.metrics.cpl)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Creatives Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCreatives.length === mockCreatives.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Creative ID</TableHead>
                  <TableHead>Attributes</TableHead>
                  <TableHead>Spend</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>CPL</TableHead>
                  <TableHead>CPC</TableHead>
                  <TableHead>CTR</TableHead>
                  <TableHead>Impressions</TableHead>
                  <TableHead>Uniques</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCreatives.map((creative) => (
                  <TableRow key={creative.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCreatives.includes(creative.id)}
                        onCheckedChange={() => handleSelectCreative(creative.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                        {creative.assetUrl ? (
                          <NextImage
                            src={creative.assetUrl}
                            alt="Creative preview"
                            width={64}
                            height={48}
                            className="object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{creative.id}</TableCell>
                    <TableCell>
                      <div className="space-y-1 max-w-[200px]">
                        <div className="text-xs">
                          <span className="text-gray-500">Layout:</span> {creative.attributes.layout}
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Template:</span> {creative.attributes.template}
                        </div>
                        <div className="text-xs truncate">
                          <span className="text-gray-500">Headline:</span> {creative.attributes.headline}
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">CTA:</span> {creative.attributes.cta}
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Tone:</span> {creative.attributes.tone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-[500]">{formatCurrency(creative.metrics.spend)}</TableCell>
                    <TableCell className="font-[500]">{formatNumber(creative.metrics.leads)}</TableCell>
                    <TableCell className="font-[500]">{formatCurrency(creative.metrics.cpl)}</TableCell>
                    <TableCell className="font-[500]">{formatCurrency(creative.metrics.cpc)}</TableCell>
                    <TableCell className="font-[500]">{creative.metrics.ctr}%</TableCell>
                    <TableCell className="font-[500]">{formatNumber(creative.metrics.impressions)}</TableCell>
                    <TableCell className="font-[500]">{formatNumber(creative.metrics.uniques)}</TableCell>
                    <TableCell className="text-sm">{formatDate(creative.uploadedAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(creative.status)}>
                          {creative.status.charAt(0).toUpperCase() + creative.status.slice(1)}
                        </Badge>
                        {creative.sheetLastUpdated && (
                          <div className="flex items-center gap-1">
                            <Check className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-gray-500">Synced</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Action Bar */}
        {selectedCreatives.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-[500] text-black">
                {selectedCreatives.length} creative{selectedCreatives.length > 1 ? 's' : ''} selected
              </span>
              <Button size="sm" variant="outline">
                Add to Cross-Campaign Compare
              </Button>
              <Button size="sm" variant="outline">
                Export Selected
              </Button>
              <Button size="sm" onClick={() => setSelectedCreatives([])}>
                Clear Selection
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}