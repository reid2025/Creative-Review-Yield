'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useCreativeData, EnhancedCreative } from '@/contexts/CreativeDataContext'
import { useGoogleAuth } from '@/contexts/GoogleAuthContext'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FloatingInput } from '@/components/ui/floating-input'
import { Eye, ImageOff, AlertCircle, Loader2, Grid3X3, Table2, RefreshCw, Search } from 'lucide-react'
import CreativePreviewModal from '@/components/CreativePreviewModal'
import { MasonryGrid } from '@/components/creative-library/VisualGrid'

interface CreativeLibraryTableProps {
  metadataFilters: {
    account: string[]
    campaign: string[]
    campaignType: string[]
    litigation: string[]
    designer: string[]
    status: string[]
    tags: string[]
  }
  performanceFilters: {
    dateRange: { from?: Date; to?: Date; preset: string }
    totalSpendMin: number | null
    totalSpendMax: number | null
    cplMin: number | null
    cplMax: number | null
    cpcMin: number | null
    cpcMax: number | null
    markedAsTopAd: 'yes' | 'no' | 'any'
    optimization: 'yes' | 'no' | 'any'
  }
  ctaFilters: {
    ctaVerb: string[]
    ctaStyleGroup: string[]
    ctaColor: string[]
    ctaPosition: string[]
  }
  attributesFilters: {
    creativeLayoutType: string[]
    messagingStructure: string[]
    imageryType: string[]
    imageryBackground: string[]
    questionBasedHeadline: 'yes' | 'no' | 'any'
    clientBranding: 'yes' | 'no' | 'any'
    iconsUsed: 'yes' | 'no' | 'any'
    headlineTags: string[]
    copyAngle: string[]
    copyTone: string[]
    legalLanguage: 'yes' | 'no' | 'any'
    amountMentioned: 'yes' | 'no' | 'any'
    statMentioned: 'yes' | 'no' | 'any'
    emotionalStatement: 'yes' | 'no' | 'any'
    disclaimer: 'yes' | 'no' | 'any'
    conditionsListed: 'yes' | 'no' | 'any'
  }
  onViewChange?: (view: 'grid' | 'table') => void
}

export const CreativeLibraryTable: React.FC<CreativeLibraryTableProps> = ({
  metadataFilters,
  performanceFilters,
  ctaFilters,
  attributesFilters,
  onViewChange
}) => {
  const router = useRouter()
  const { user, isAuthenticated } = useGoogleAuth()
  const { enhancedCreatives, isLoading, isError, getImageUrlForCreative } = useCreativeData()
  const [activeTab, setActiveTab] = useState<'grid' | 'table'>('table')
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [selectedCreative, setSelectedCreative] = useState<EnhancedCreative | null>(null)

  const handleViewChange = (view: 'grid' | 'table') => {
    setActiveTab(view)
    onViewChange?.(view)
  }
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCreatives = useMemo(() => {
    return enhancedCreatives.filter((creative: EnhancedCreative) => {
      const formData = creative.formData || {}
      
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesFilename = creative.creativeFilename?.toLowerCase().includes(searchLower)
        const matchesAccount = formData.accountName?.toLowerCase().includes(searchLower)
        const matchesCampaign = formData.campaignName?.toLowerCase().includes(searchLower)
        const matchesLitigation = formData.litigationName?.toLowerCase().includes(searchLower)
        
        if (!matchesFilename && !matchesAccount && !matchesCampaign && !matchesLitigation) {
          return false
        }
      }
      
      // Metadata filters
      if (metadataFilters.account.length > 0 && !metadataFilters.account.includes(formData.accountName)) {
        return false
      }
      if (metadataFilters.campaign.length > 0 && !metadataFilters.campaign.includes(formData.campaignName)) {
        return false
      }
      if (metadataFilters.campaignType.length > 0 && !metadataFilters.campaignType.includes(formData.campaignType)) {
        return false
      }
      if (metadataFilters.litigation.length > 0 && !metadataFilters.litigation.includes(formData.litigationName)) {
        return false
      }
      if (metadataFilters.designer.length > 0 && !metadataFilters.designer.includes(formData.designer)) {
        return false
      }
      if (metadataFilters.status.length > 0 && !metadataFilters.status.includes(creative.status)) {
        return false
      }
      if (metadataFilters.tags.length > 0) {
        const creativeTags = Array.isArray(formData.tags) ? formData.tags : []
        if (!metadataFilters.tags.some(tag => creativeTags.includes(tag))) {
          return false
        }
      }
      
      // Performance filters
      if (performanceFilters.totalSpendMin !== null && 
          (formData.totalSpend === undefined || formData.totalSpend < performanceFilters.totalSpendMin)) {
        return false
      }
      if (performanceFilters.totalSpendMax !== null && 
          (formData.totalSpend === undefined || formData.totalSpend > performanceFilters.totalSpendMax)) {
        return false
      }
      if (performanceFilters.cplMin !== null && 
          (formData.cpl === undefined || formData.cpl < performanceFilters.cplMin)) {
        return false
      }
      if (performanceFilters.cplMax !== null && 
          (formData.cpl === undefined || formData.cpl > performanceFilters.cplMax)) {
        return false
      }
      if (performanceFilters.cpcMin !== null && 
          (formData.cpc === undefined || formData.cpc < performanceFilters.cpcMin)) {
        return false
      }
      if (performanceFilters.cpcMax !== null && 
          (formData.cpc === undefined || formData.cpc > performanceFilters.cpcMax)) {
        return false
      }
      if (performanceFilters.markedAsTopAd !== 'any') {
        const isTopAd = formData.markedAsTopAd === true
        if (performanceFilters.markedAsTopAd === 'yes' && !isTopAd) return false
        if (performanceFilters.markedAsTopAd === 'no' && isTopAd) return false
      }
      if (performanceFilters.optimization !== 'any') {
        const hasOptimization = formData.optimization === true
        if (performanceFilters.optimization === 'yes' && !hasOptimization) return false
        if (performanceFilters.optimization === 'no' && hasOptimization) return false
      }
      
      // CTA filters
      if (ctaFilters.ctaVerb.length > 0 && 
          !ctaFilters.ctaVerb.includes(formData.ctaVerb)) {
        return false
      }
      if (ctaFilters.ctaStyleGroup.length > 0 && 
          !ctaFilters.ctaStyleGroup.includes(formData.ctaStyleGroup)) {
        return false
      }
      if (ctaFilters.ctaColor.length > 0 && 
          !ctaFilters.ctaColor.includes(formData.ctaColor)) {
        return false
      }
      if (ctaFilters.ctaPosition.length > 0 && 
          !ctaFilters.ctaPosition.includes(formData.ctaPosition)) {
        return false
      }
      
      // Attributes filters
      if (attributesFilters.creativeLayoutType.length > 0 && 
          !attributesFilters.creativeLayoutType.includes(formData.creativeLayoutType)) {
        return false
      }
      if (attributesFilters.messagingStructure.length > 0 && 
          !attributesFilters.messagingStructure.includes(formData.messagingStructure)) {
        return false
      }
      if (attributesFilters.imageryType.length > 0) {
        const creativeImageryTypes = Array.isArray(formData.imageryType) ? formData.imageryType : []
        if (!attributesFilters.imageryType.some(filter => creativeImageryTypes.includes(filter))) {
          return false
        }
      }
      if (attributesFilters.imageryBackground.length > 0) {
        const creativeImageryBg = Array.isArray(formData.imageryBackground) ? formData.imageryBackground : []
        if (!attributesFilters.imageryBackground.some(filter => creativeImageryBg.includes(filter))) {
          return false
        }
      }
      if (attributesFilters.headlineTags.length > 0) {
        const creativeHeadlineTags = Array.isArray(formData.headlineTags) ? formData.headlineTags : []
        if (!attributesFilters.headlineTags.some(filter => creativeHeadlineTags.includes(filter))) {
          return false
        }
      }
      if (attributesFilters.copyAngle.length > 0) {
        const creativeCopyAngles = Array.isArray(formData.copyAngle) ? formData.copyAngle : []
        if (!attributesFilters.copyAngle.some(filter => creativeCopyAngles.includes(filter))) {
          return false
        }
      }
      if (attributesFilters.copyTone.length > 0) {
        const creativeCopyTones = Array.isArray(formData.copyTone) ? formData.copyTone : []
        if (!attributesFilters.copyTone.some(filter => creativeCopyTones.includes(filter))) {
          return false
        }
      }
      
      // Boolean attribute filters
      if (attributesFilters.questionBasedHeadline !== 'any') {
        const hasQuestionHeadline = formData.questionBasedHeadline === true
        if (attributesFilters.questionBasedHeadline === 'yes' && !hasQuestionHeadline) return false
        if (attributesFilters.questionBasedHeadline === 'no' && hasQuestionHeadline) return false
      }
      if (attributesFilters.clientBranding !== 'any') {
        const hasClientBranding = formData.clientBranding === true
        if (attributesFilters.clientBranding === 'yes' && !hasClientBranding) return false
        if (attributesFilters.clientBranding === 'no' && hasClientBranding) return false
      }
      if (attributesFilters.iconsUsed !== 'any') {
        const hasIcons = formData.iconsUsed === true
        if (attributesFilters.iconsUsed === 'yes' && !hasIcons) return false
        if (attributesFilters.iconsUsed === 'no' && hasIcons) return false
      }
      if (attributesFilters.legalLanguage !== 'any') {
        const hasLegalLanguage = formData.legalLanguage === true
        if (attributesFilters.legalLanguage === 'yes' && !hasLegalLanguage) return false
        if (attributesFilters.legalLanguage === 'no' && hasLegalLanguage) return false
      }
      if (attributesFilters.amountMentioned !== 'any') {
        const hasAmount = formData.amountMentioned === true
        if (attributesFilters.amountMentioned === 'yes' && !hasAmount) return false
        if (attributesFilters.amountMentioned === 'no' && hasAmount) return false
      }
      if (attributesFilters.statMentioned !== 'any') {
        const hasStat = formData.statMentioned === true
        if (attributesFilters.statMentioned === 'yes' && !hasStat) return false
        if (attributesFilters.statMentioned === 'no' && hasStat) return false
      }
      if (attributesFilters.emotionalStatement !== 'any') {
        const hasEmotional = formData.emotionalStatement === true
        if (attributesFilters.emotionalStatement === 'yes' && !hasEmotional) return false
        if (attributesFilters.emotionalStatement === 'no' && hasEmotional) return false
      }
      if (attributesFilters.disclaimer !== 'any') {
        const hasDisclaimer = formData.disclaimer === true
        if (attributesFilters.disclaimer === 'yes' && !hasDisclaimer) return false
        if (attributesFilters.disclaimer === 'no' && hasDisclaimer) return false
      }
      if (attributesFilters.conditionsListed !== 'any') {
        const hasConditions = formData.conditionsListed === true
        if (attributesFilters.conditionsListed === 'yes' && !hasConditions) return false
        if (attributesFilters.conditionsListed === 'no' && hasConditions) return false
      }
      
      return true
    })
  }, [enhancedCreatives, metadataFilters, performanceFilters, ctaFilters, attributesFilters, searchQuery])


  const handleViewCreative = (creative: EnhancedCreative) => {
    setSelectedCreative(creative)
    setPreviewModalOpen(true)
  }

  const handleEditCreative = (creative: EnhancedCreative) => {
    router.push(`/creative-library/creative-details?edit=${creative.id}`)
  }

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>Please sign in to view your creative library.</AlertDescription>
      </Alert>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load creative data</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="bg-white rounded">
      <div className="px-[30px] py-[30px]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-league-spartan text-3xl text-gray-900 font-bold">Creative Library</h1>
            <p className="text-gray-600 text-sm mt-1">Curated collection of saved creative ads and their performance data</p>
          </div>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewChange('grid')}
              className="flex items-center gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              Visual Grid
            </Button>
            <Button
              variant={activeTab === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewChange('table')}
              className="flex items-center gap-2"
            >
              <Table2 className="h-4 w-4" />
              Data Table
            </Button>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Total: <strong>{enhancedCreatives.length}</strong></span>
            <span>Showing: <strong>{filteredCreatives.length}</strong></span>
          </div>
        </div>
        
        {/* Filter Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm mb-4">
          {/* Search Bar - Full Width */}
          <div className="relative">
            <FloatingInput
              label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <>
          {activeTab === 'grid' ? (
            <MasonryGrid 
              creatives={filteredCreatives}
              onEditCreative={handleEditCreative}
              hasFilters={false}
              getImageUrlForCreative={getImageUrlForCreative}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
              <div className="w-full">
                <ScrollArea className="h-full">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50 z-10 border-b">
                      <TableRow className="h-12 hover:bg-gray-50">
                        <TableHead className="w-12 text-center"></TableHead>
                        <TableHead className="px-4 text-xs text-gray-700 uppercase tracking-wide w-20">IMAGE</TableHead>
                        <TableHead className="px-4 text-xs text-gray-700 uppercase tracking-wide min-w-[150px]">ACCOUNT</TableHead>
                        <TableHead className="px-4 text-xs text-gray-700 uppercase tracking-wide min-w-[250px]">CAMPAIGN</TableHead>
                        <TableHead className="px-4 text-xs text-gray-700 uppercase tracking-wide w-20 text-center">HISTORY</TableHead>
                        <TableHead className="px-4 text-xs text-gray-700 uppercase tracking-wide min-w-[180px]">PERFORMANCE</TableHead>
                        <TableHead className="px-4 text-xs text-gray-700 uppercase tracking-wide w-24 text-center">STATUS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCreatives.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-32 text-center">
                            <div className="flex flex-col items-center justify-center py-8">
                              <ImageOff className="h-8 w-8 text-gray-400 mb-3" />
                              <h3 className="text-sm font-medium text-gray-900 mb-1">
                                {enhancedCreatives.length === 0 ? "No saved creatives yet" : "No creatives match current filters"}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {enhancedCreatives.length === 0 ? "Start by saving creatives from the Creative Stream" : "Try adjusting your filter criteria"}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCreatives.map((creative) => {
                          const formData = creative.formData || {}
                          
                          return (
                            <TableRow 
                              key={creative.id} 
                              className="h-16 hover:bg-gray-50 transition-colors border-b border-gray-100 group"
                            >
                              {/* Edit Eye Icon Column - Exact copy from Creative Stream */}
                              <TableCell className="px-2 text-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-center">
                                  <button
                                    onClick={() => handleViewCreative(creative)}
                                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    title="View Creative"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                </div>
                              </TableCell>
                              
                              {/* Image Column - Exact copy from Creative Stream */}
                              <TableCell className="px-4">
                                {getImageUrlForCreative(creative) ? (
                                  <img
                                    src={getImageUrlForCreative(creative)}
                                    alt={creative.creativeFilename || formData.creativeFilename}
                                    className="h-12 w-12 object-cover rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                                  />
                                ) : (
                                  <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <ImageOff className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </TableCell>
                              
                              {/* Account Column - Exact copy from Creative Stream */}
                              <TableCell className="px-4">
                                <div className="text-sm text-gray-900">{formData.accountName || '-'}</div>
                              </TableCell>
                              
                              {/* Campaign Column - Exact copy from Creative Stream */}
                              <TableCell className="px-4">
                                <div className="text-sm text-gray-900 line-clamp-1">{formData.campaignName || '-'}</div>
                              </TableCell>
                              
                              {/* History Column - Exact copy from Creative Stream */}
                              <TableCell className="px-4 text-center">
                                <div className="text-sm text-gray-600">
                                  {creative.googleSheetsData?.recordCount || 0} entry
                                </div>
                              </TableCell>
                              
                              {/* Performance Column - Exact copy from Creative Stream */}
                              <TableCell className="px-4">
                                <div className="space-y-2">
                                  <div className="cursor-pointer">
                                    <div className="flex gap-3 items-center text-sm">
                                      <div>
                                        <span className="text-gray-500">CPL:</span>
                                        <span className="text-gray-900 ml-1">${formData.cpl ? formData.cpl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
                                      </div>
                                      <span className="text-gray-300">|</span>
                                      <div>
                                        <span className="text-gray-500">CPC:</span>
                                        <span className="text-gray-900 ml-1">${formData.cpc ? formData.cpc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {creative.lastSaved?.toDate?.()?.toLocaleDateString() || 'No date'}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              
                              {/* Status Column - Exact copy from Creative Stream */}
                              <TableCell className="px-4 text-center">
                                <div className="flex justify-center items-center gap-1">
                                  <Badge 
                                    className="text-xs px-2 py-1 rounded-full bg-green-500 text-white"
                                  >
                                    Active
                                  </Badge>
                                  <Badge 
                                    className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700"
                                  >
                                    {creative.status.charAt(0).toUpperCase() + creative.status.slice(1).toLowerCase()}
                                  </Badge>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Creative Preview Modal */}
      {selectedCreative && (
        <CreativePreviewModal
          open={previewModalOpen}
          onOpenChange={setPreviewModalOpen}
          mode="view"
          creativeData={{
            id: selectedCreative.id,
            creativeFilename: selectedCreative.creativeFilename,
            imageUrl: getImageUrlForCreative(selectedCreative),
            status: selectedCreative.status,
            // Performance data from Google Sheets
            creativeHistory: selectedCreative.googleSheetsData?.performanceHistory || [],
            amountSpent: selectedCreative.formData?.totalSpend,
            costPerWebsiteLead: selectedCreative.formData?.cpl,
            costPerClick: selectedCreative.formData?.cpc,
            // Include all form data
            ...selectedCreative.formData
          }}
        />
      )}
      </div>
    </div>
  )
}