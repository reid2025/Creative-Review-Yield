'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'

interface Account {
  id: string
  name: string
  status: 'active' | 'paused' | 'archived'
}

interface Campaign {
  id: string
  accountId: string
  name: string
  status: 'active' | 'paused' | 'archived'
  createdAt: string
  updatedAt: string
  lastSyncedAt?: string
  totalCreatives: number
  totalWaves: number
  totalLeads: number
}

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

interface CampaignHeaderProps {
  account: Account
  campaign: Campaign
  waves: Wave[]
}

export default function CampaignHeader({ account, campaign, waves }: CampaignHeaderProps) {
  const formatLastUpdated = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Prepare chart data from waves
  const chartData = waves.map((wave) => ({
    name: `Wave ${wave.waveNumber}`,
    spend: Math.round(wave.metrics.spend),
    cpl: Math.round(wave.metrics.cpl * 100) / 100,
    cpc: Math.round(wave.metrics.cpc * 100) / 100
  }))

  return (
    <div className="space-y-6">
      {/* Slim Header Row */}
      <div className="flex items-center justify-between py-4 border-b border-gray-200">
        {/* Left: Campaign Name + Status */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-[500] text-black font-['DM_Sans']">{campaign.name}</h2>
          <Badge className={getStatusColor(campaign.status)}>
            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
          </Badge>
        </div>
        
        {/* Right: Inline capsule stats */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-['DM_Sans']">Total Creatives:</span>
            <span className="text-sm font-[500] text-black font-['DM_Sans']">{campaign.totalCreatives}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-['DM_Sans']">Total Waves:</span>
            <span className="text-sm font-[500] text-black font-['DM_Sans']">{campaign.totalWaves}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-['DM_Sans']">Total Leads:</span>
            <span className="text-sm font-[500] text-black font-['DM_Sans']">{campaign.totalLeads.toLocaleString()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-['DM_Sans']">Last Updated:</span>
            <span className="text-sm font-[500] text-black font-['DM_Sans']">{formatLastUpdated(campaign.lastSyncedAt)}</span>
          </div>
        </div>
      </div>

      {/* Slim Mini Chart */}
      {waves.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="h-24 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  fontSize={11}
                  className="text-gray-600 font-['DM_Sans']"
                />
                <YAxis hide />
                <Line 
                  type="monotone" 
                  dataKey="spend" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                  name="Spend"
                />
                <Line 
                  type="monotone" 
                  dataKey="cpl" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                  name="CPL"
                />
                <Line 
                  type="monotone" 
                  dataKey="cpc" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                  name="CPC"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Compact Chart Legend */}
          <div className="flex items-center justify-center gap-4 text-xs font-['DM_Sans']">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-blue-500"></div>
              <span className="text-gray-700">Spend</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-green-500"></div>
              <span className="text-gray-700">CPL</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-orange-500"></div>
              <span className="text-gray-700">CPC</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}