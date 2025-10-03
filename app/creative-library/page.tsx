'use client'

import { useState, useMemo } from 'react'
import { useCreativeData } from '@/contexts/CreativeDataContext'

// Components
import { PerformanceAccordion } from '@/components/creative-library/PerformanceAccordion'
import { CTAAccordion } from '@/components/creative-library/CTAAccordion'
import { AttributesAccordion } from '@/components/creative-library/AttributesAccordion'
import { LayoutStructureAccordion } from '@/components/creative-library/LayoutStructureAccordion'
import { CopyHeadlineAccordion } from '@/components/creative-library/CopyHeadlineAccordion'
import { BrandDesignAccordion } from '@/components/creative-library/BrandDesignAccordion'
import { CTAGridAccordion } from '@/components/creative-library/CTAGridAccordion'
import { CreativeLibraryTable } from '@/components/creative-library/CreativeLibraryTable'
import MetadataAccordion from '@/components/creative-library/MetadataAccordion'


export default function CreativeLibraryPage() {
  const { enhancedCreatives } = useCreativeData()

  // Generate dynamic filter options from actual creative data
  const dynamicFilterOptions = useMemo(() => {
    const options = {
      ctaVerb: new Set<string>(),
      ctaStyleGroup: new Set<string>(), 
      ctaColor: new Set<string>(),
      ctaPosition: new Set<string>(),
      creativeLayoutType: new Set<string>(),
      messagingStructure: new Set<string>(),
      imageryType: new Set<string>(),
      imageryBackground: new Set<string>(),
      headlineTags: new Set<string>(),
      copyAngle: new Set<string>(),
      copyTone: new Set<string>(),
      account: new Set<string>(),
      campaign: new Set<string>(),
      campaignType: new Set<string>(),
      litigation: new Set<string>(),
      designer: new Set<string>(),
      status: new Set<string>(),
      tags: new Set<string>()
    }

    enhancedCreatives.forEach(creative => {
      const formData = creative.formData || {}
      
      // CTA options
      if (formData.ctaVerb) options.ctaVerb.add(formData.ctaVerb)
      if (formData.ctaStyleGroup) options.ctaStyleGroup.add(formData.ctaStyleGroup)
      if (formData.ctaColor) options.ctaColor.add(formData.ctaColor)
      if (formData.ctaPosition) options.ctaPosition.add(formData.ctaPosition)
      
      // Attributes options
      if (formData.creativeLayoutType) options.creativeLayoutType.add(formData.creativeLayoutType)
      if (formData.messagingStructure) options.messagingStructure.add(formData.messagingStructure)
      
      // Handle arrays
      if (Array.isArray(formData.imageryType)) {
        formData.imageryType.forEach(type => options.imageryType.add(type))
      }
      if (Array.isArray(formData.imageryBackground)) {
        formData.imageryBackground.forEach(bg => options.imageryBackground.add(bg))
      }
      if (Array.isArray(formData.headlineTags)) {
        formData.headlineTags.forEach(tag => options.headlineTags.add(tag))
      }
      if (Array.isArray(formData.copyAngle)) {
        formData.copyAngle.forEach(angle => options.copyAngle.add(angle))
      }
      if (Array.isArray(formData.copyTone)) {
        formData.copyTone.forEach(tone => options.copyTone.add(tone))
      }
      
      // Metadata options
      if (formData.accountName) options.account.add(formData.accountName)
      if (formData.campaignName) options.campaign.add(formData.campaignName)
      if (formData.campaignType) options.campaignType.add(formData.campaignType)
      if (formData.litigationName) options.litigation.add(formData.litigationName)
      if (formData.designer) options.designer.add(formData.designer)
      if (creative.status) options.status.add(creative.status)
      if (Array.isArray(formData.tags)) {
        formData.tags.forEach(tag => options.tags.add(tag))
      }
    })

    // Convert Sets to sorted arrays
    return {
      ctaVerb: Array.from(options.ctaVerb).sort(),
      ctaStyleGroup: Array.from(options.ctaStyleGroup).sort(),
      ctaColor: Array.from(options.ctaColor).sort(),
      ctaPosition: Array.from(options.ctaPosition).sort(),
      creativeLayoutType: Array.from(options.creativeLayoutType).sort(),
      messagingStructure: Array.from(options.messagingStructure).sort(),
      imageryType: Array.from(options.imageryType).sort(),
      imageryBackground: Array.from(options.imageryBackground).sort(),
      headlineTags: Array.from(options.headlineTags).sort(),
      copyAngle: Array.from(options.copyAngle).sort(),
      copyTone: Array.from(options.copyTone).sort(),
      account: Array.from(options.account).sort(),
      campaign: Array.from(options.campaign).sort(),
      campaignType: Array.from(options.campaignType).sort(),
      litigation: Array.from(options.litigation).sort(),
      designer: Array.from(options.designer).sort(),
      status: Array.from(options.status).sort(),
      tags: Array.from(options.tags).sort()
    }
  }, [enhancedCreatives])

  // Metadata filters
  const [metadataFilters, setMetadataFilters] = useState({
    account: [] as string[],
    campaign: [] as string[],
    campaignType: [] as string[],
    litigation: [] as string[],
    designer: [] as string[],
    status: [] as string[],
    tags: [] as string[]
  })

  const [performanceFilters, setPerformanceFilters] = useState({
    dateRange: {
      preset: 'all'
    },
    totalSpendMin: null,
    totalSpendMax: null,
    cplMin: null,
    cplMax: null,
    cpcMin: null,
    cpcMax: null,
    markedAsTopAd: 'any' as 'yes' | 'no' | 'any',
    optimization: 'any' as 'yes' | 'no' | 'any'
  })

  const [ctaFilters, setCTAFilters] = useState({
    ctaVerb: [] as string[],
    ctaStyleGroup: [] as string[],
    ctaColor: [] as string[],
    ctaPosition: [] as string[]
  })

  const [attributesFilters, setAttributesFilters] = useState({
    creativeLayoutType: [] as string[],
    messagingStructure: [] as string[],
    imageryType: [] as string[],
    imageryBackground: [] as string[],
    questionBasedHeadline: 'any' as 'yes' | 'no' | 'any',
    clientBranding: 'any' as 'yes' | 'no' | 'any',
    iconsUsed: 'any' as 'yes' | 'no' | 'any',
    headlineTags: [] as string[],
    copyAngle: [] as string[],
    copyTone: [] as string[],
    legalLanguage: 'any' as 'yes' | 'no' | 'any',
    amountMentioned: 'any' as 'yes' | 'no' | 'any',
    statMentioned: 'any' as 'yes' | 'no' | 'any',
    emotionalStatement: 'any' as 'yes' | 'no' | 'any',
    disclaimer: 'any' as 'yes' | 'no' | 'any',
    conditionsListed: 'any' as 'yes' | 'no' | 'any'
  })

  // State to control which accordion is open (only one at a time)
  const [openAccordion, setOpenAccordion] = useState<'metadata' | 'performance' | 'cta' | 'attributes' | null>(null)
  
  // State to track current view (grid or table)
  const [currentView, setCurrentView] = useState<'grid' | 'table'>('grid')

  // Visual Grid specific filters (separate from table filters)
  const [visualGridFilters, setVisualGridFilters] = useState({
    metadata: {
      account: [] as string[],
      campaign: [] as string[],
      campaignType: [] as string[],
      litigation: [] as string[],
      designer: [] as string[],
      status: [] as string[],
      tags: [] as string[]
    },
    layoutStructure: {
      creativeLayoutType: [] as string[],
      messagingStructure: [] as string[],
      imageryType: [] as string[],
      imageryBackground: [] as string[]
    },
    copyHeadline: {
      questionBasedHeadline: 'any' as 'yes' | 'no' | 'any',
      emotionalStatement: 'any' as 'yes' | 'no' | 'any',
      amountMentioned: 'any' as 'yes' | 'no' | 'any',
      statMentioned: 'any' as 'yes' | 'no' | 'any',
      disclaimer: 'any' as 'yes' | 'no' | 'any',
      conditionsListed: 'any' as 'yes' | 'no' | 'any',
      copyAngle: [] as string[],
      copyTone: [] as string[]
    },
    brandDesign: {
      clientBranding: 'any' as 'yes' | 'no' | 'any',
      iconsUsed: 'any' as 'yes' | 'no' | 'any',
      headlineTags: [] as string[]
    },
    cta: {
      ctaVerb: [] as string[],
      ctaStyleGroup: [] as string[],
      ctaColor: [] as string[],
      ctaPosition: [] as string[]
    }
  })

  // State to control which accordion is open for Visual Grid
  const [visualGridOpenAccordion, setVisualGridOpenAccordion] = useState<'metadata' | 'layoutStructure' | 'copyHeadline' | 'brandDesign' | 'cta' | null>(null)

  // Check if any filters are active
  const hasActiveFilters = () => {
    if (currentView === 'table') {
      // Check metadata filters
      const hasMetadataFilters =
        metadataFilters.account.length > 0 ||
        metadataFilters.campaign.length > 0 ||
        metadataFilters.campaignType.length > 0 ||
        metadataFilters.litigation.length > 0 ||
        metadataFilters.designer.length > 0 ||
        metadataFilters.status.length > 0 ||
        metadataFilters.tags.length > 0

      // Check performance filters
      const hasPerformanceFilters =
        performanceFilters.dateRange.preset !== 'all' ||
        performanceFilters.totalSpendMin !== null ||
        performanceFilters.totalSpendMax !== null ||
        performanceFilters.cplMin !== null ||
        performanceFilters.cplMax !== null ||
        performanceFilters.cpcMin !== null ||
        performanceFilters.cpcMax !== null ||
        performanceFilters.markedAsTopAd !== 'any' ||
        performanceFilters.optimization !== 'any'

      // Check CTA filters
      const hasCTAFilters =
        ctaFilters.ctaVerb.length > 0 ||
        ctaFilters.ctaStyleGroup.length > 0 ||
        ctaFilters.ctaColor.length > 0 ||
        ctaFilters.ctaPosition.length > 0

      // Check attributes filters
      const hasAttributesFilters =
        attributesFilters.creativeLayoutType.length > 0 ||
        attributesFilters.messagingStructure.length > 0 ||
        attributesFilters.imageryType.length > 0 ||
        attributesFilters.imageryBackground.length > 0 ||
        attributesFilters.questionBasedHeadline !== 'any' ||
        attributesFilters.clientBranding !== 'any' ||
        attributesFilters.iconsUsed !== 'any' ||
        attributesFilters.headlineTags.length > 0 ||
        attributesFilters.copyAngle.length > 0 ||
        attributesFilters.copyTone.length > 0 ||
        attributesFilters.legalLanguage !== 'any' ||
        attributesFilters.amountMentioned !== 'any' ||
        attributesFilters.statMentioned !== 'any' ||
        attributesFilters.emotionalStatement !== 'any' ||
        attributesFilters.disclaimer !== 'any' ||
        attributesFilters.conditionsListed !== 'any'

      return hasMetadataFilters || hasPerformanceFilters || hasCTAFilters || hasAttributesFilters
    } else {
      // Check Visual Grid filters
      const hasMetadataFilters =
        visualGridFilters.metadata.account.length > 0 ||
        visualGridFilters.metadata.campaign.length > 0 ||
        visualGridFilters.metadata.campaignType.length > 0 ||
        visualGridFilters.metadata.litigation.length > 0 ||
        visualGridFilters.metadata.designer.length > 0 ||
        visualGridFilters.metadata.status.length > 0 ||
        visualGridFilters.metadata.tags.length > 0

      const hasLayoutStructureFilters =
        visualGridFilters.layoutStructure.creativeLayoutType.length > 0 ||
        visualGridFilters.layoutStructure.messagingStructure.length > 0 ||
        visualGridFilters.layoutStructure.imageryType.length > 0 ||
        visualGridFilters.layoutStructure.imageryBackground.length > 0

      const hasCopyHeadlineFilters =
        visualGridFilters.copyHeadline.questionBasedHeadline !== 'any' ||
        visualGridFilters.copyHeadline.emotionalStatement !== 'any' ||
        visualGridFilters.copyHeadline.amountMentioned !== 'any' ||
        visualGridFilters.copyHeadline.statMentioned !== 'any' ||
        visualGridFilters.copyHeadline.disclaimer !== 'any' ||
        visualGridFilters.copyHeadline.conditionsListed !== 'any' ||
        visualGridFilters.copyHeadline.copyAngle.length > 0 ||
        visualGridFilters.copyHeadline.copyTone.length > 0

      const hasBrandDesignFilters =
        visualGridFilters.brandDesign.clientBranding !== 'any' ||
        visualGridFilters.brandDesign.iconsUsed !== 'any' ||
        visualGridFilters.brandDesign.headlineTags.length > 0

      const hasCTAFilters =
        visualGridFilters.cta.ctaVerb.length > 0 ||
        visualGridFilters.cta.ctaStyleGroup.length > 0 ||
        visualGridFilters.cta.ctaColor.length > 0 ||
        visualGridFilters.cta.ctaPosition.length > 0

      return hasMetadataFilters || hasLayoutStructureFilters || hasCopyHeadlineFilters || hasBrandDesignFilters || hasCTAFilters
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    if (currentView === 'table') {
      setMetadataFilters({
        account: [],
        campaign: [],
        campaignType: [],
        litigation: [],
        designer: [],
        status: [],
        tags: []
      })

      setPerformanceFilters({
        dateRange: { preset: 'all' },
        totalSpendMin: null,
        totalSpendMax: null,
        cplMin: null,
        cplMax: null,
        cpcMin: null,
        cpcMax: null,
        markedAsTopAd: 'any',
        optimization: 'any'
      })

      setCTAFilters({
        ctaVerb: [],
        ctaStyleGroup: [],
        ctaColor: [],
        ctaPosition: []
      })

      setAttributesFilters({
        creativeLayoutType: [],
        messagingStructure: [],
        imageryType: [],
        imageryBackground: [],
        questionBasedHeadline: 'any',
        clientBranding: 'any',
        iconsUsed: 'any',
        headlineTags: [],
        copyAngle: [],
        copyTone: [],
        legalLanguage: 'any',
        amountMentioned: 'any',
        statMentioned: 'any',
        emotionalStatement: 'any',
        disclaimer: 'any',
        conditionsListed: 'any'
      })

      // Close all accordions
      setOpenAccordion(null)
    } else {
      // Clear Visual Grid filters
      setVisualGridFilters({
        metadata: {
          account: [],
          campaign: [],
          campaignType: [],
          litigation: [],
          designer: [],
          status: [],
          tags: []
        },
        layoutStructure: {
          creativeLayoutType: [],
          messagingStructure: [],
          imageryType: [],
          imageryBackground: []
        },
        copyHeadline: {
          questionBasedHeadline: 'any',
          emotionalStatement: 'any',
          amountMentioned: 'any',
          statMentioned: 'any',
          disclaimer: 'any',
          conditionsListed: 'any',
          copyAngle: [],
          copyTone: []
        },
        brandDesign: {
          clientBranding: 'any',
          iconsUsed: 'any',
          headlineTags: []
        },
        cta: {
          ctaVerb: [],
          ctaStyleGroup: [],
          ctaColor: [],
          ctaPosition: []
        }
      })

      // Close all accordions
      setVisualGridOpenAccordion(null)
    }
  }

  return (
    <div className="flex h-screen -m-[30px] overflow-hidden bg-black">
      {/* Left section - 20% black - full height - Show filters for both views but different content */}
      <div className="w-[20%] bg-black h-full py-8 px-4">
        <div className="h-full flex flex-col">
          {/* Filter Header */}
          <div className="mb-4" data-filter-header="true">
            <h2 className="text-white text-xl font-semibold mb-2" style={{ color: '#ffffff !important' }}>Filter Creatives</h2>
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="text-base underline transition-colors hover:opacity-75"
                style={{ color: '#ffffff !important' }}
              >
                Clear Filters
              </button>
            )}
          </div>
          
          {/* Scrollable Accordions */}
          <div className="space-y-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500">
          
          {/* Data Table Filters */}
          {currentView === 'table' && (
            <>
              <aside 
                className="w-full rounded-[30px] p-[10px] filters-sidebar"
                style={{ backgroundColor: '#151515' }}
              >
                <MetadataAccordion
              selectedAccount={metadataFilters.account}
              setSelectedAccount={(value) => setMetadataFilters(prev => ({ ...prev, account: value }))}
              selectedCampaign={metadataFilters.campaign}
              setSelectedCampaign={(value) => setMetadataFilters(prev => ({ ...prev, campaign: value }))}
              selectedCampaignType={metadataFilters.campaignType}
              setSelectedCampaignType={(value) => setMetadataFilters(prev => ({ ...prev, campaignType: value }))}
              selectedLitigation={metadataFilters.litigation}
              setSelectedLitigation={(value) => setMetadataFilters(prev => ({ ...prev, litigation: value }))}
              selectedDesigner={metadataFilters.designer}
              setSelectedDesigner={(value) => setMetadataFilters(prev => ({ ...prev, designer: value }))}
              selectedStatus={metadataFilters.status}
              setSelectedStatus={(value) => setMetadataFilters(prev => ({ ...prev, status: value }))}
              selectedTags={metadataFilters.tags}
              setSelectedTags={(value) => setMetadataFilters(prev => ({ ...prev, tags: value }))}
              isOpen={openAccordion === 'metadata'}
              onToggle={() => setOpenAccordion(openAccordion === 'metadata' ? null : 'metadata')}
              dynamicOptions={dynamicFilterOptions}
            />
          </aside>
          
          <aside 
            id="creative-filters"
            className="w-full rounded-[30px] p-[10px] filters-sidebar"
            style={{ backgroundColor: '#151515' }}
          >
            <PerformanceAccordion
              filters={performanceFilters}
              onChange={(updates) => 
                setPerformanceFilters(prev => ({ ...prev, ...updates }))
              }
              isOpen={openAccordion === 'performance'}
              onToggle={() => setOpenAccordion(openAccordion === 'performance' ? null : 'performance')}
            />
          </aside>
          
          <aside 
            className="w-full rounded-[30px] p-[10px] filters-sidebar"
            style={{ backgroundColor: '#151515' }}
          >
            <CTAAccordion
              filters={ctaFilters}
              onChange={(updates) => 
                setCTAFilters(prev => ({ ...prev, ...updates }))
              }
              isOpen={openAccordion === 'cta'}
              onToggle={() => setOpenAccordion(openAccordion === 'cta' ? null : 'cta')}
              dynamicOptions={dynamicFilterOptions}
            />
          </aside>
          
          <aside 
            className="w-full rounded-[30px] p-[10px] filters-sidebar"
            style={{ backgroundColor: '#151515' }}
          >
            <AttributesAccordion
              filters={attributesFilters}
              onChange={(updates) => 
                setAttributesFilters(prev => ({ ...prev, ...updates }))
              }
              isOpen={openAccordion === 'attributes'}
              onToggle={() => setOpenAccordion(openAccordion === 'attributes' ? null : 'attributes')}
              dynamicOptions={dynamicFilterOptions}
            />
          </aside>
            </>
          )}

          {/* Visual Grid Filters - 5 Cards */}
          {currentView === 'grid' && (
            <>
              <aside 
                className="w-full rounded-[30px] p-[10px] filters-sidebar"
                style={{ backgroundColor: '#151515' }}
              >
                <MetadataAccordion
                  selectedAccount={visualGridFilters.metadata.account}
                  setSelectedAccount={(value) => setVisualGridFilters(prev => ({ 
                    ...prev, 
                    metadata: { ...prev.metadata, account: value }
                  }))}
                  selectedCampaign={visualGridFilters.metadata.campaign}
                  setSelectedCampaign={(value) => setVisualGridFilters(prev => ({ 
                    ...prev, 
                    metadata: { ...prev.metadata, campaign: value }
                  }))}
                  selectedCampaignType={visualGridFilters.metadata.campaignType}
                  setSelectedCampaignType={(value) => setVisualGridFilters(prev => ({ 
                    ...prev, 
                    metadata: { ...prev.metadata, campaignType: value }
                  }))}
                  selectedLitigation={visualGridFilters.metadata.litigation}
                  setSelectedLitigation={(value) => setVisualGridFilters(prev => ({ 
                    ...prev, 
                    metadata: { ...prev.metadata, litigation: value }
                  }))}
                  selectedDesigner={visualGridFilters.metadata.designer}
                  setSelectedDesigner={(value) => setVisualGridFilters(prev => ({ 
                    ...prev, 
                    metadata: { ...prev.metadata, designer: value }
                  }))}
                  selectedStatus={visualGridFilters.metadata.status}
                  setSelectedStatus={(value) => setVisualGridFilters(prev => ({ 
                    ...prev, 
                    metadata: { ...prev.metadata, status: value }
                  }))}
                  selectedTags={visualGridFilters.metadata.tags}
                  setSelectedTags={(value) => setVisualGridFilters(prev => ({ 
                    ...prev, 
                    metadata: { ...prev.metadata, tags: value }
                  }))}
                  isOpen={visualGridOpenAccordion === 'metadata'}
                  onToggle={() => setVisualGridOpenAccordion(visualGridOpenAccordion === 'metadata' ? null : 'metadata')}
                  dynamicOptions={dynamicFilterOptions}
                />
              </aside>

              <aside 
                className="w-full rounded-[30px] p-[10px] filters-sidebar"
                style={{ backgroundColor: '#151515' }}
              >
                <LayoutStructureAccordion
                  filters={visualGridFilters.layoutStructure}
                  onChange={(updates) => 
                    setVisualGridFilters(prev => ({ ...prev, layoutStructure: { ...prev.layoutStructure, ...updates } }))
                  }
                  isOpen={visualGridOpenAccordion === 'layoutStructure'}
                  onToggle={() => setVisualGridOpenAccordion(visualGridOpenAccordion === 'layoutStructure' ? null : 'layoutStructure')}
                  dynamicOptions={dynamicFilterOptions}
                />
              </aside>

              <aside 
                className="w-full rounded-[30px] p-[10px] filters-sidebar"
                style={{ backgroundColor: '#151515' }}
              >
                <CopyHeadlineAccordion
                  filters={visualGridFilters.copyHeadline}
                  onChange={(updates) => 
                    setVisualGridFilters(prev => ({ ...prev, copyHeadline: { ...prev.copyHeadline, ...updates } }))
                  }
                  isOpen={visualGridOpenAccordion === 'copyHeadline'}
                  onToggle={() => setVisualGridOpenAccordion(visualGridOpenAccordion === 'copyHeadline' ? null : 'copyHeadline')}
                  dynamicOptions={dynamicFilterOptions}
                />
              </aside>

              <aside 
                className="w-full rounded-[30px] p-[10px] filters-sidebar"
                style={{ backgroundColor: '#151515' }}
              >
                <BrandDesignAccordion
                  filters={visualGridFilters.brandDesign}
                  onChange={(updates) => 
                    setVisualGridFilters(prev => ({ ...prev, brandDesign: { ...prev.brandDesign, ...updates } }))
                  }
                  isOpen={visualGridOpenAccordion === 'brandDesign'}
                  onToggle={() => setVisualGridOpenAccordion(visualGridOpenAccordion === 'brandDesign' ? null : 'brandDesign')}
                  dynamicOptions={dynamicFilterOptions}
                />
              </aside>

              <aside 
                className="w-full rounded-[30px] p-[10px] filters-sidebar"
                style={{ backgroundColor: '#151515' }}
              >
                <CTAGridAccordion
                  filters={visualGridFilters.cta}
                  onChange={(updates) => 
                    setVisualGridFilters(prev => ({ ...prev, cta: { ...prev.cta, ...updates } }))
                  }
                  isOpen={visualGridOpenAccordion === 'cta'}
                  onToggle={() => setVisualGridOpenAccordion(visualGridOpenAccordion === 'cta' ? null : 'cta')}
                  dynamicOptions={dynamicFilterOptions}
                />
              </aside>
            </>
          )}
          
          </div>
        </div>
      </div>
      
      {/* Right section - 80% default light gray - with border radius - full height */}
      <div className={`flex-1 bg-[#e5e5e5] ${currentView === 'table' ? 'rounded-tl-[28px] rounded-bl-[28px]' : 'rounded-l-[28px]'} p-[30px] h-full overflow-hidden`}>
        <CreativeLibraryTable
          metadataFilters={currentView === 'table' ? metadataFilters : visualGridFilters.metadata}
          performanceFilters={currentView === 'table' ? performanceFilters : {
            dateRange: { preset: 'all' },
            totalSpendMin: null,
            totalSpendMax: null,
            cplMin: null,
            cplMax: null,
            cpcMin: null,
            cpcMax: null,
            markedAsTopAd: 'any' as 'yes' | 'no' | 'any',
            optimization: 'any' as 'yes' | 'no' | 'any'
          }}
          ctaFilters={currentView === 'table' ? ctaFilters : visualGridFilters.cta}
          attributesFilters={currentView === 'table' ? attributesFilters : {
            creativeLayoutType: visualGridFilters.layoutStructure.creativeLayoutType,
            messagingStructure: visualGridFilters.layoutStructure.messagingStructure,
            imageryType: visualGridFilters.layoutStructure.imageryType,
            imageryBackground: visualGridFilters.layoutStructure.imageryBackground,
            questionBasedHeadline: visualGridFilters.copyHeadline.questionBasedHeadline,
            clientBranding: visualGridFilters.brandDesign.clientBranding,
            iconsUsed: visualGridFilters.brandDesign.iconsUsed,
            headlineTags: visualGridFilters.brandDesign.headlineTags,
            copyAngle: visualGridFilters.copyHeadline.copyAngle,
            copyTone: visualGridFilters.copyHeadline.copyTone,
            legalLanguage: 'any' as 'yes' | 'no' | 'any',
            amountMentioned: visualGridFilters.copyHeadline.amountMentioned,
            statMentioned: visualGridFilters.copyHeadline.statMentioned,
            emotionalStatement: visualGridFilters.copyHeadline.emotionalStatement,
            disclaimer: visualGridFilters.copyHeadline.disclaimer,
            conditionsListed: visualGridFilters.copyHeadline.conditionsListed
          }}
          onViewChange={setCurrentView}
        />
      </div>
    </div>
  )
}