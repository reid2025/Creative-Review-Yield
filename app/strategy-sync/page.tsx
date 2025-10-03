'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CampaignTimeline from './components/CampaignTimeline'

export default function StrategySyncPage() {
  const [activeTab, setActiveTab] = useState('campaign-timeline')

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="font-league-spartan text-3xl font-bold text-black">Strategy Sync</h1>
        <p className="text-gray-600 mt-1">
          Track campaign waves, compare performance, and generate strategic takeaways
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="campaign-timeline" className="font-[500]">
            Campaign Timeline
          </TabsTrigger>
          <TabsTrigger value="creative-compare" className="font-[500]" disabled>
            Creative Compare
            <span className="ml-2 text-xs text-gray-500">(Coming Soon)</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaign-timeline" className="mt-6">
          <CampaignTimeline />
        </TabsContent>

        <TabsContent value="creative-compare" className="mt-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-[500] text-gray-900 mb-2">
              Creative Compare Coming Soon
            </h2>
            <p className="text-gray-600">
              Cross-campaign creative comparison functionality will be available in a future update.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}