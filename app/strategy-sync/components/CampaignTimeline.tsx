'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CampaignHeader from './CampaignHeader'
import FiltersAndControls from './FiltersAndControls'
import WavesList from './WavesList'
import DetailsInspector from './DetailsInspector'
import CompareWavesDrawer from './CompareWavesDrawer'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Database, ChevronDown } from 'lucide-react'

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

// Mock data for demonstration
const mockAccounts: Account[] = [
  { id: '1', name: 'TSEC Master', status: 'active' },
  { id: '2', name: 'Legal Partners LLC', status: 'active' },
  { id: '3', name: 'Injury Law Group', status: 'active' }
]

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    accountId: '1',
    name: 'AFFF',
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-03-10',
    lastSyncedAt: '2024-03-10T09:30:00Z',
    totalCreatives: 24,
    totalWaves: 4,
    totalLeads: 1250
  },
  {
    id: '2',
    accountId: '1',
    name: 'EcoShield',
    status: 'active',
    createdAt: '2024-02-01',
    updatedAt: '2024-03-08',
    lastSyncedAt: '2024-03-08T14:20:00Z',
    totalCreatives: 18,
    totalWaves: 3,
    totalLeads: 890
  },
  {
    id: '3',
    accountId: '1',
    name: 'Lung Cancer',
    status: 'paused',
    createdAt: '2024-01-20',
    updatedAt: '2024-03-05',
    lastSyncedAt: '2024-03-05T11:15:00Z',
    totalCreatives: 32,
    totalWaves: 5,
    totalLeads: 2150
  },
  {
    id: '4',
    accountId: '2',
    name: 'Personal Injury Q1',
    status: 'active',
    createdAt: '2024-01-10',
    updatedAt: '2024-03-12',
    lastSyncedAt: '2024-03-12T16:45:00Z',
    totalCreatives: 28,
    totalWaves: 4,
    totalLeads: 1680
  }
]

const mockWaves: Wave[] = [
  {
    id: '1',
    campaignId: '1',
    waveNumber: 1,
    batchId: 'batch-1',
    createdAt: '2024-01-15T10:00:00Z',
    uploaderIds: ['user-1'],
    testNotes: 'Initial launch with broad targeting',
    testFocus: ['Broad Targeting', 'Brand Awareness'],
    changeDescription: 'Campaign launch with hero creative variations',
    resultNotes: 'Strong initial performance, high CTR but need to optimize CPL',
    metrics: {
      spend: 15420,
      leads: 428,
      cpl: 36.02,
      cpc: 2.14,
      ctr: 3.8,
      uniques: 45230,
      impressions: 187340
    },
    creativesCount: 6
  },
  {
    id: '2',
    campaignId: '1',
    waveNumber: 2,
    batchId: 'batch-2',
    createdAt: '2024-02-01T14:30:00Z',
    uploaderIds: ['user-1', 'user-2'],
    testNotes: 'Testing question-based headlines vs statement headlines',
    testFocus: ['Headline Testing', 'CTA Optimization'],
    changeDescription: 'Added question-based headlines and updated CTA colors',
    resultNotes: 'Question headlines performed 23% better on CTR, orange CTAs outperformed blue',
    metrics: {
      spend: 12890,
      leads: 402,
      cpl: 32.06,
      cpc: 1.89,
      ctr: 4.2,
      uniques: 38940,
      impressions: 164200
    },
    creativesCount: 8
  },
  {
    id: '3',
    campaignId: '1',
    waveNumber: 3,
    batchId: 'batch-3',
    createdAt: '2024-02-20T11:15:00Z',
    uploaderIds: ['user-2'],
    testNotes: 'Testing testimonial vs statistic-based copy',
    testFocus: ['Copy Testing', 'Social Proof'],
    changeDescription: 'Introduced client testimonials and case study statistics',
    resultNotes: 'Testimonials improved conversion but increased CPL slightly',
    metrics: {
      spend: 18640,
      leads: 420,
      cpl: 44.38,
      cpc: 2.31,
      ctr: 3.9,
      uniques: 52100,
      impressions: 203870
    },
    creativesCount: 10
  },
  {
    id: '4',
    campaignId: '1',
    waveNumber: 4,
    batchId: 'batch-4',
    createdAt: '2024-03-01T09:45:00Z',
    uploaderIds: ['user-1', 'user-3'],
    testNotes: 'Optimizing based on previous learnings',
    testFocus: ['Performance Optimization', 'Cost Reduction'],
    changeDescription: 'Applied best-performing elements from previous waves',
    resultNotes: 'Best performing wave so far - 28% improvement in CPL',
    metrics: {
      spend: 16230,
      leads: 512,
      cpl: 31.70,
      cpc: 1.95,
      ctr: 4.8,
      uniques: 41850,
      impressions: 195420
    },
    creativesCount: 12
  }
]

export default function CampaignTimeline() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [selectedWave, setSelectedWave] = useState<Wave | null>(null)
  const [selectedWaves, setSelectedWaves] = useState<Wave[]>([])
  const [showCompareDrawer, setShowCompareDrawer] = useState(false)
  const [selectedCreative, setSelectedCreative] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    dateRange: '',
    status: '',
    wave: '',
    testFocus: '',
    attributes: '',
    hasHistory: '',
    showAdvanced: false
  })
  const [sortBy, setSortBy] = useState('newest')
  const [showCount, setShowCount] = useState(25)
  const [currentPage, setCurrentPage] = useState(1)

  // Initialize from URL params
  useEffect(() => {
    const accountId = searchParams.get('account')
    const campaignId = searchParams.get('campaign')
    const waveId = searchParams.get('wave')

    if (accountId) {
      const account = mockAccounts.find(a => a.id === accountId)
      if (account) setSelectedAccount(account)
    }

    if (campaignId && selectedAccount) {
      const campaign = mockCampaigns.find(c => c.id === campaignId)
      if (campaign) setSelectedCampaign(campaign)
    }

    if (waveId && selectedCampaign) {
      const wave = mockWaves.find(w => w.id === waveId)
      if (wave) setSelectedWave(wave)
    }
  }, [searchParams, selectedAccount, selectedCampaign])

  // Update URL when selections change
  const updateURL = (updates: { account?: string | null, campaign?: string | null, wave?: string | null }) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Get available campaigns for selected account
  const availableCampaigns = selectedAccount 
    ? mockCampaigns.filter(c => c.accountId === selectedAccount.id)
    : []

  // Get waves for selected campaign
  const availableWaves = selectedCampaign
    ? mockWaves.filter(w => w.campaignId === selectedCampaign.id)
    : []

  // Reset campaign when account changes
  useEffect(() => {
    if (selectedAccount) {
      setSelectedCampaign(null)
    }
  }, [selectedAccount])

  const handleAccountChange = (accountId: string | null) => {
    const account = accountId ? mockAccounts.find(a => a.id === accountId) : null
    setSelectedAccount(account || null)
    setSelectedCampaign(null)
    setSelectedWave(null)
    updateURL({ account: accountId, campaign: null, wave: null })
  }

  const handleCampaignChange = (campaignId: string | null) => {
    const campaign = campaignId ? availableCampaigns.find(c => c.id === campaignId) : null
    setSelectedCampaign(campaign || null)
    setSelectedWave(null)
    updateURL({ campaign: campaignId, wave: null })
  }

  const handleWaveSelect = (wave: Wave) => {
    setSelectedWave(wave)
    setSelectedCreative(null) // Reset creative selection when wave changes
    updateURL({ wave: wave.id })
  }

  const handleWaveCompare = (wave: Wave) => {
    if (selectedWaves.find(w => w.id === wave.id)) {
      setSelectedWaves(selectedWaves.filter(w => w.id !== wave.id))
    } else if (selectedWaves.length < 2) {
      setSelectedWaves([...selectedWaves, wave])
    }

    if (selectedWaves.length === 1 && !selectedWaves.find(w => w.id === wave.id)) {
      setShowCompareDrawer(true)
    }
  }

  const handleCreativeSelect = (creativeId: string) => {
    setSelectedCreative(creativeId)
  }

  const filteredWaves = availableWaves.filter(wave => {
    if (filters.search && !wave.changeDescription.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.wave && wave.waveNumber.toString() !== filters.wave) {
      return false
    }
    if (filters.testFocus && !wave.testFocus.some(focus => focus.toLowerCase().includes(filters.testFocus.toLowerCase()))) {
      return false
    }
    if (filters.hasHistory === 'yes' && !wave.resultNotes) {
      return false
    }
    if (filters.hasHistory === 'no' && wave.resultNotes) {
      return false
    }
    return true
  })

  const sortedWaves = [...filteredWaves].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'leads':
        return b.metrics.leads - a.metrics.leads
      case 'cpl':
        return a.metrics.cpl - b.metrics.cpl
      case 'ctr':
        return b.metrics.ctr - a.metrics.ctr
      case 'spend':
        return b.metrics.spend - a.metrics.spend
      default:
        return 0
    }
  })

  return (
    <div className="bg-white rounded-[2px]">
      <div className="px-[30px] py-[30px]">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="font-league-spartan text-3xl text-gray-900 font-bold">Strategy Sync</h1>
          <p className="text-gray-600 text-sm mt-1 font-['DM_Sans']">Campaign Timeline</p>
        </div>

        {/* Top Filter Bar - Account & Campaign Selection */}
        <div className="flex items-center gap-4 mb-6">
          <div className="min-w-48">
            <Select 
              value={selectedAccount?.id || ''} 
              onValueChange={(value) => handleAccountChange(value || null)}
            >
              <SelectTrigger className="h-11 pl-4 pr-12 bg-white border border-gray-200 hover:border-gray-300 rounded-lg font-[500] font-['DM_Sans'] text-black appearance-none [&>span]:truncate">
                <SelectValue placeholder="Select Account" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-black" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {mockAccounts.map(account => {
                  const campaignCount = mockCampaigns.filter(c => c.accountId === account.id).length
                  return (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{account.name}</span>
                        <span className="text-xs text-gray-500 ml-2">({campaignCount} campaigns)</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-44">
            <Select 
              value={selectedCampaign?.id || ''} 
              onValueChange={(value) => handleCampaignChange(value || null)}
              disabled={!selectedAccount}
            >
              <SelectTrigger className="h-11 pl-4 pr-12 bg-white border border-gray-200 hover:border-gray-300 rounded-lg font-[500] font-['DM_Sans'] text-black disabled:opacity-50 appearance-none [&>span]:truncate">
                <SelectValue placeholder="Select Campaign" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-black" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {availableCampaigns.map(campaign => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Placeholder State or Campaign Content */}
        {!selectedCampaign ? (
          <div className="text-center py-20">
            <div className="mx-auto mb-6 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Database className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-[500] text-gray-900 font-['DM_Sans'] mb-2">
              Select an account and campaign to view timeline
            </h2>
            <p className="text-gray-600 font-['DM_Sans']">
              Choose from the dropdowns above to see wave-by-wave campaign progression
            </p>
          </div>
        ) : (
          <>
            {/* Campaign Header + Mini Chart (full width above columns) */}
            <CampaignHeader 
              account={selectedAccount!}
              campaign={selectedCampaign}
              waves={sortedWaves}
            />
            
            {/* Controls Row (full width) */}
            <FiltersAndControls
              filters={filters}
              onFiltersChange={setFilters}
              sortBy={sortBy}
              onSortChange={setSortBy}
              showCount={showCount}
              onShowCountChange={setShowCount}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalItems={sortedWaves.length}
            />

            {/* Two-Column Layout */}
            <div className="flex gap-6 mt-6">
              {/* LEFT COLUMN - Waves Timeline */}
              <div className="flex-1 min-w-0"> {/* flex-1 gives ~66% width, min-w-0 prevents overflow */}
                <WavesList
                  waves={sortedWaves}
                  selectedWave={selectedWave}
                  selectedWaves={selectedWaves}
                  onWaveSelect={handleWaveSelect}
                  onWaveCompare={handleWaveCompare}
                />
              </div>

              {/* RIGHT COLUMN - Details Inspector */}
              <div className="w-80 flex-shrink-0"> {/* Fixed width ~34% */}
                <DetailsInspector
                  selectedWave={selectedWave}
                  selectedCreative={selectedCreative}
                  onCreativeSelect={handleCreativeSelect}
                  onOpenCreativeLibrary={(creativeId) => {
                    // Navigate to Creative Library with pre-filter
                    window.open(`/creative-library?creative=${creativeId}`, '_blank')
                  }}
                />
              </div>
            </div>
          </>
        )}

        {/* Compare Waves Drawer */}
        {showCompareDrawer && (
          <CompareWavesDrawer
            waves={selectedWaves}
            onClose={() => {
              setShowCompareDrawer(false)
              setSelectedWaves([])
            }}
          />
        )}
      </div>
    </div>
  )
}