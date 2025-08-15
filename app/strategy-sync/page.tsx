'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import NextImage from 'next/image'
import { 
  collection,
  getDocs,
  query,
  where,
  documentId,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'

// Icons
import { 
  Brain,
  TrendingUp,
  Target,
  Lightbulb,
  Download,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Users,
  DollarSign,
  MousePointerClick,
  ImageIcon
} from 'lucide-react'

interface Creative {
  id: string
  creativeFilename?: string
  imageUrl?: string
  litigationName?: string
  campaignType?: string
  designer?: string
  startDate?: string
  endDate?: string
  amountSpent?: string
  costPerClick?: string
  costPerWebsiteLead?: string
  markedAsTopAd?: boolean
  status?: 'draft' | 'saved'
  
  // Creative details
  creativeLayoutType?: string
  imageryType?: string[]
  imageryBackground?: string[]
  messagingStructure?: string
  
  // Headlines & CTA
  preheadlineText?: string
  headlineText?: string
  headlineTags?: string[]
  headlineIntent?: string[]
  ctaLabel?: string
  ctaVerb?: string
  ctaStyleGroup?: string
  ctaColor?: string
  ctaPosition?: string
  
  // Copy elements
  bodyCopySummary?: string
  copyAngle?: string[]
  copyTone?: string[]
  audiencePersona?: string
  campaignTrigger?: string
  
  // Flags
  questionBasedHeadline?: boolean
  clientBranding?: boolean
  iconsUsed?: boolean
  legalLanguage?: boolean
  emotionalStatement?: boolean
  dollarAmount?: boolean
  statMentioned?: boolean
  disclaimer?: boolean
  conditionsListed?: boolean
}

interface AnalysisSection {
  title: string
  icon: React.ReactNode
  insights: string[]
  recommendations?: string[]
  confidence?: number
}

export default function StrategySyncPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State
  const [selectedCreatives, setSelectedCreatives] = useState<Creative[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [userTakeaway, setUserTakeaway] = useState('')
  const [savingTakeaway, setSavingTakeaway] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisSections, setAnalysisSections] = useState<AnalysisSection[]>([])
  const [analysisStarted, setAnalysisStarted] = useState(false)
  
  // Get creative IDs from URL
  const creativeIds = searchParams.get('creatives')?.split(',') || []
  
  // Fetch selected creatives from Firebase
  useEffect(() => {
    const fetchCreatives = async () => {
      console.log('useEffect triggered', {
        creativeIds,
        analysisStarted,
        timestamp: new Date().toISOString()
      })
      
      if (creativeIds.length === 0) {
        setLoading(false)
        return
      }
      
      try {
        const q = query(
          collection(db, 'creatives'),
          where(documentId(), 'in', creativeIds)
        )
        
        const snapshot = await getDocs(q)
        const creativesData: Creative[] = []
        
        snapshot.forEach((doc) => {
          const data = doc.data()
          creativesData.push({
            id: doc.id,
            ...data.formData,
            imageUrl: data.imageUrl,
            status: data.status
          } as Creative)
        })
        
        console.log('Fetched creatives:', creativesData.length)
        setSelectedCreatives(creativesData)
        
        // Auto-start analysis if we have creatives and haven't started yet
        if (creativesData.length >= 3 && !analysisStarted) {
          console.log('Scheduling analysis start...')
          setTimeout(() => startAnalysis(creativesData), 500)
        }
      } catch (error) {
        console.error('Error fetching creatives:', error)
        toast.error('Failed to load selected creatives')
      } finally {
        setLoading(false)
      }
    }
    
    fetchCreatives()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creativeIds]) // Remove analysisStarted from dependencies to prevent loops
  
  // Calculate statistics
  const statistics = useMemo(() => {
    if (selectedCreatives.length === 0) return null
    
    const litigationTypes = [...new Set(selectedCreatives.map(c => c.litigationName).filter(Boolean))]
    const campaignTypes = [...new Set(selectedCreatives.map(c => c.campaignType).filter(Boolean))]
    const designers = [...new Set(selectedCreatives.map(c => c.designer).filter(Boolean))]
    
    const avgCPC = selectedCreatives.reduce((sum, c) => sum + parseFloat(c.costPerClick || '0'), 0) / selectedCreatives.length
    const avgCPL = selectedCreatives.reduce((sum, c) => sum + parseFloat(c.costPerWebsiteLead || '0'), 0) / selectedCreatives.length
    const totalSpent = selectedCreatives.reduce((sum, c) => sum + parseFloat(c.amountSpent || '0'), 0)
    
    const topAds = selectedCreatives.filter(c => c.markedAsTopAd).length
    
    return {
      totalCreatives: selectedCreatives.length,
      litigationTypes,
      campaignTypes,
      designers,
      avgCPC: avgCPC.toFixed(2),
      avgCPL: avgCPL.toFixed(2),
      totalSpent: totalSpent.toFixed(2),
      topAds,
      topAdPercentage: Math.round((topAds / selectedCreatives.length) * 100)
    }
  }, [selectedCreatives])
  
  // Perform analysis
  const startAnalysis = async (creatives: Creative[]) => {
    console.log('startAnalysis called', {
      analyzing,
      analysisStarted,
      creativesCount: creatives.length,
      timestamp: new Date().toISOString()
    })
    
    // Prevent multiple simultaneous analyses
    if (analyzing || analysisStarted) {
      console.log('Analysis already in progress, skipping...')
      return
    }
    
    setAnalysisStarted(true)
    setAnalyzing(true)
    setAnalysisProgress(0)
    console.log('Starting analysis...')
    
    // Simulate AI analysis with progressive updates
    const sections: AnalysisSection[] = []
    
    // Section 1: Pattern Recognition (20%)
    console.log('Analyzing patterns...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    setAnalysisProgress(20)
    console.log('Progress: 20%')
    
    const patternInsights = analyzePatterns(creatives)
    sections.push({
      title: 'Pattern Recognition',
      icon: <Brain className="w-5 h-5" />,
      insights: patternInsights,
      confidence: 0.85
    })
    setAnalysisSections([...sections])
    
    // Section 2: Campaign Performance (40%)
    console.log('Analyzing performance...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    setAnalysisProgress(40)
    console.log('Progress: 40%')
    
    const performanceInsights = analyzePerformance(creatives)
    sections.push({
      title: 'Performance Analysis',
      icon: <TrendingUp className="w-5 h-5" />,
      insights: performanceInsights.insights,
      recommendations: performanceInsights.recommendations,
      confidence: 0.92
    })
    setAnalysisSections([...sections])
    
    // Section 3: Litigation Insights (60%)
    console.log('Analyzing litigation insights...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    setAnalysisProgress(60)
    console.log('Progress: 60%')
    
    const litigationInsights = analyzeLitigation(creatives)
    sections.push({
      title: 'Litigation-Specific Insights',
      icon: <Target className="w-5 h-5" />,
      insights: litigationInsights,
      confidence: 0.78
    })
    setAnalysisSections([...sections])
    
    // Section 4: Cross-Campaign Opportunities (80%)
    console.log('Analyzing cross-campaign opportunities...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    setAnalysisProgress(80)
    console.log('Progress: 80%')
    
    const opportunities = analyzeCrossOpportunities(creatives)
    sections.push({
      title: 'Cross-Campaign Opportunities',
      icon: <Lightbulb className="w-5 h-5" />,
      insights: opportunities.insights,
      recommendations: opportunities.recommendations,
      confidence: 0.88
    })
    setAnalysisSections([...sections])
    
    // Section 5: Optimization Recommendations (100%)
    console.log('Generating optimization recommendations...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    setAnalysisProgress(100)
    console.log('Progress: 100%')
    
    const optimizations = generateOptimizations(creatives)
    sections.push({
      title: 'Optimization Recommendations',
      icon: <Sparkles className="w-5 h-5" />,
      insights: optimizations.insights,
      recommendations: optimizations.recommendations,
      confidence: 0.95
    })
    setAnalysisSections([...sections])
    
    setAnalyzing(false)
    setAnalysisComplete(true)
    console.log('Analysis complete!')
    toast.success('Analysis complete! Review insights below.')
  }
  
  // Analysis functions
  const analyzePatterns = (creatives: Creative[]): string[] => {
    const insights: string[] = []
    
    // CTA Color patterns
    const ctaColors = creatives.map(c => c.ctaColor).filter(Boolean)
    const colorCounts = ctaColors.reduce((acc, color) => {
      acc[color!] = (acc[color!] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const dominantColor = Object.entries(colorCounts)
      .sort(([,a], [,b]) => b - a)[0]
    
    if (dominantColor && dominantColor[1] > creatives.length / 2) {
      insights.push(`${dominantColor[1]} out of ${creatives.length} creatives use ${dominantColor[0]} CTAs - showing strong consistency`)
    }
    
    // Layout patterns
    const layouts = creatives.map(c => c.creativeLayoutType).filter(Boolean)
    const layoutCounts = layouts.reduce((acc, layout) => {
      acc[layout!] = (acc[layout!] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    Object.entries(layoutCounts).forEach(([layout, count]) => {
      if (count >= 2) {
        insights.push(`${count} creatives use ${layout} layout - consider this as a tested pattern`)
      }
    })
    
    // Question-based headlines
    const questionHeadlines = creatives.filter(c => c.questionBasedHeadline).length
    if (questionHeadlines > 0) {
      insights.push(`${questionHeadlines} creatives use question-based headlines (${Math.round((questionHeadlines / creatives.length) * 100)}% of selection)`)
    }
    
    // Imagery patterns
    const imageryTypes = creatives.flatMap(c => c.imageryType || [])
    const imageryCount = imageryTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const topImagery = Object.entries(imageryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
    
    if (topImagery.length > 0) {
      insights.push(`Most common imagery: ${topImagery.map(([type, count]) => `${type} (${count})`).join(', ')}`)
    }
    
    // Copy tone consistency
    const copyTones = creatives.flatMap(c => c.copyTone || [])
    const toneCount = copyTones.reduce((acc, tone) => {
      acc[tone] = (acc[tone] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const dominantTone = Object.entries(toneCount)
      .sort(([,a], [,b]) => b - a)[0]
    
    if (dominantTone) {
      insights.push(`"${dominantTone[0]}" is the dominant copy tone, appearing in ${dominantTone[1]} creatives`)
    }
    
    return insights
  }
  
  const analyzePerformance = (creatives: Creative[]) => {
    const insights: string[] = []
    const recommendations: string[] = []
    
    // Find top performers
    const withMetrics = creatives.filter(c => c.costPerClick && c.costPerWebsiteLead)
    const sortedByCPC = [...withMetrics].sort((a, b) => 
      parseFloat(a.costPerClick!) - parseFloat(b.costPerClick!)
    )
    
    if (sortedByCPC.length > 0) {
      const bestCPC = sortedByCPC[0]
      const worstCPC = sortedByCPC[sortedByCPC.length - 1]
      
      insights.push(`Best CPC: $${bestCPC.costPerClick} (${bestCPC.creativeFilename}) - analyze this creative's elements`)
      
      if (parseFloat(worstCPC.costPerClick!) > parseFloat(bestCPC.costPerClick!) * 2) {
        insights.push(`CPC varies by ${Math.round((parseFloat(worstCPC.costPerClick!) / parseFloat(bestCPC.costPerClick!) - 1) * 100)}% - significant optimization opportunity`)
        recommendations.push(`Apply elements from "${bestCPC.creativeFilename}" to underperforming creatives`)
      }
    }
    
    // Top ads analysis
    const topAds = creatives.filter(c => c.markedAsTopAd)
    if (topAds.length > 0) {
      const topAdElements = {
        ctaColors: topAds.map(c => c.ctaColor).filter(Boolean),
        layouts: topAds.map(c => c.creativeLayoutType).filter(Boolean),
        copyTones: topAds.flatMap(c => c.copyTone || [])
      }
      
      insights.push(`${topAds.length} creatives marked as top ads - analyzing common elements`)
      
      if (topAdElements.ctaColors.length > 0) {
        const mostCommonCTA = mode(topAdElements.ctaColors)
        recommendations.push(`Test "${mostCommonCTA}" CTA color in underperforming ads`)
      }
    }
    
    // Campaign type performance
    const campaignGroups = groupBy(creatives, 'campaignType')
    Object.entries(campaignGroups).forEach(([campaign, group]) => {
      if (group.length >= 2) {
        const avgCPC = average(group.map(c => parseFloat(c.costPerClick || '0')))
        insights.push(`${campaign} campaigns average CPC: $${avgCPC.toFixed(2)}`)
      }
    })
    
    return { insights, recommendations }
  }
  
  const analyzeLitigation = (creatives: Creative[]): string[] => {
    const insights: string[] = []
    
    // Group by litigation
    const litigationGroups = groupBy(creatives, 'litigationName')
    
    Object.entries(litigationGroups).forEach(([litigation, group]) => {
      if (group.length >= 2) {
        // Analyze patterns within litigation
        const avgCPC = average(group.map(c => parseFloat(c.costPerClick || '0')))
        const avgCPL = average(group.map(c => parseFloat(c.costPerWebsiteLead || '0')))
        
        insights.push(`${litigation}: ${group.length} creatives, Avg CPC: $${avgCPC.toFixed(2)}, Avg CPL: $${avgCPL.toFixed(2)}`)
        
        // Check for consistent elements
        const ctaVerbs = group.map(c => c.ctaVerb).filter(Boolean)
        if (ctaVerbs.length > 0) {
          const commonVerb = mode(ctaVerbs)
          if (ctaVerbs.filter(v => v === commonVerb).length > group.length / 2) {
            insights.push(`${litigation} performs well with "${commonVerb}" CTA verb`)
          }
        }
        
        // Check for disclaimer requirements
        const withDisclaimer = group.filter(c => c.disclaimer).length
        if (withDisclaimer === group.length) {
          insights.push(`${litigation} requires disclaimer text in all creatives`)
        }
      }
    })
    
    // Cross-litigation comparisons
    if (Object.keys(litigationGroups).length > 1) {
      insights.push(`Analyzing ${Object.keys(litigationGroups).length} different litigation types for cross-pollination opportunities`)
    }
    
    return insights
  }
  
  const analyzeCrossOpportunities = (creatives: Creative[]) => {
    const insights: string[] = []
    const recommendations: string[] = []
    
    // Find successful elements not used everywhere
    const topPerformers = creatives
      .filter(c => c.markedAsTopAd || (c.costPerClick && parseFloat(c.costPerClick) < average(creatives.map(cr => parseFloat(cr.costPerClick || '100')))))
    
    const underutilized: Record<string, string[]> = {}
    
    // Check CTAs
    const successfulCTAs = topPerformers.map(c => c.ctaLabel).filter(Boolean)
    const allCTAs = creatives.map(c => c.ctaLabel).filter(Boolean)
    
    successfulCTAs.forEach(cta => {
      const usage = allCTAs.filter(c => c === cta).length / creatives.length
      if (usage < 0.5 && usage > 0.1) {
        underutilized.cta = cta
        insights.push(`"${cta}" CTA shows strong performance but only used in ${Math.round(usage * 100)}% of creatives`)
        recommendations.push(`Test "${cta}" CTA in more campaigns`)
      }
    })
    
    // Check messaging structures
    const successfulStructures = topPerformers.map(c => c.messagingStructure).filter(Boolean)
    const uniqueStructures = [...new Set(successfulStructures)]
    
    uniqueStructures.forEach(structure => {
      const usage = creatives.filter(c => c.messagingStructure === structure).length
      if (usage < creatives.length / 2) {
        insights.push(`"${structure}" messaging structure shows promise - currently in ${usage} creatives`)
        recommendations.push(`Expand "${structure}" messaging to other campaigns`)
      }
    })
    
    // Cross-campaign type opportunities
    const campaignTypes = [...new Set(creatives.map(c => c.campaignType).filter(Boolean))]
    if (campaignTypes.length > 1) {
      insights.push(`Opportunity to test successful elements across ${campaignTypes.length} campaign types`)
      
      // Find elements unique to one campaign type
      campaignTypes.forEach(campaign => {
        const campaignCreatives = creatives.filter(c => c.campaignType === campaign)
        const otherCreatives = creatives.filter(c => c.campaignType !== campaign)
        
        // Check if this campaign has unique successful elements
        const campaignTopAds = campaignCreatives.filter(c => c.markedAsTopAd).length
        const campaignTopRate = campaignTopAds / campaignCreatives.length
        const otherTopRate = otherCreatives.filter(c => c.markedAsTopAd).length / otherCreatives.length
        
        if (campaignTopRate > otherTopRate * 1.5 && campaignTopRate > 0.3) {
          recommendations.push(`${campaign} campaigns show ${Math.round(campaignTopRate * 100)}% top ad rate - apply learnings to other campaigns`)
        }
      })
    }
    
    return { insights, recommendations }
  }
  
  const generateOptimizations = (creatives: Creative[]) => {
    const insights: string[] = []
    const recommendations: string[] = []
    
    // A/B testing suggestions
    const elements = {
      ctaColors: [...new Set(creatives.map(c => c.ctaColor).filter(Boolean))],
      ctaVerbs: [...new Set(creatives.map(c => c.ctaVerb).filter(Boolean))],
      layouts: [...new Set(creatives.map(c => c.creativeLayoutType).filter(Boolean))],
      headlines: creatives.filter(c => c.questionBasedHeadline).length > 0
    }
    
    if (elements.ctaColors.length > 1) {
      recommendations.push(`A/B test: ${elements.ctaColors.slice(0, 3).join(' vs ')} CTA colors`)
    }
    
    if (elements.headlines) {
      const questionRate = creatives.filter(c => c.questionBasedHeadline).length / creatives.length
      if (questionRate > 0.3 && questionRate < 0.7) {
        recommendations.push('A/B test: Question-based vs statement headlines')
      }
    }
    
    // Performance gap analysis
    const metrics = creatives.filter(c => c.costPerClick && c.costPerWebsiteLead)
    if (metrics.length >= 3) {
      const cpcValues = metrics.map(c => parseFloat(c.costPerClick!))
      // const avgCPC = average(cpcValues) // Not used in this section
      const minCPC = Math.min(...cpcValues)
      const maxCPC = Math.max(...cpcValues)
      
      if (maxCPC > minCPC * 3) {
        insights.push(`3x performance gap identified between best and worst CPC`)
        recommendations.push('Priority: Optimize high-CPC creatives using elements from top performers')
      }
    }
    
    // Quick wins
    const noImages = creatives.filter(c => !c.imageUrl).length
    if (noImages > 0) {
      recommendations.push(`Quick win: ${noImages} creatives missing images - add visuals`)
    }
    
    const noCTA = creatives.filter(c => !c.ctaLabel).length
    if (noCTA > 0) {
      recommendations.push(`Quick win: ${noCTA} creatives missing CTA labels - add clear calls-to-action`)
    }
    
    // Strategic recommendations
    insights.push(`Analysis based on ${creatives.length} creatives across ${statistics?.litigationTypes.length || 0} litigation types`)
    
    if (statistics && statistics.topAdPercentage < 20) {
      insights.push(`Only ${statistics.topAdPercentage}% marked as top ads - room for improvement`)
      recommendations.push('Review and implement patterns from current top performers')
    }
    
    return { insights, recommendations }
  }
  
  // Helper functions
  const mode = (arr: string[]): string => {
    const counts = arr.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || ''
  }
  
  const average = (arr: number[]): number => {
    if (arr.length === 0) return 0
    return arr.reduce((sum, val) => sum + val, 0) / arr.length
  }
  
  const groupBy = <T,>(arr: T[], key: keyof T): Record<string, T[]> => {
    return arr.reduce((groups, item) => {
      const val = item[key] as string
      if (val) {
        groups[val] = groups[val] || []
        groups[val].push(item)
      }
      return groups
    }, {} as Record<string, T[]>)
  }
  
  // Save takeaway
  const saveTakeaway = async () => {
    if (!userTakeaway.trim()) {
      toast.error('Please add your takeaway notes')
      return
    }
    
    setSavingTakeaway(true)
    
    try {
      const takeawayData = {
        userId: user?.uid || 'anonymous',
        creativeIds,
        creativesCount: selectedCreatives.length,
        litigationTypes: statistics?.litigationTypes || [],
        campaignTypes: statistics?.campaignTypes || [],
        userNotes: userTakeaway,
        aiInsights: analysisSections.map(section => ({
          title: section.title || '',
          insights: section.insights || [],
          recommendations: section.recommendations || [],
          confidence: section.confidence || 0
        })),
        metrics: {
          avgCPC: statistics?.avgCPC || '0',
          avgCPL: statistics?.avgCPL || '0',
          totalSpent: statistics?.totalSpent || '0',
          topAdPercentage: statistics?.topAdPercentage || 0
        },
        createdAt: serverTimestamp(),
        status: 'active'
      }
      
      await addDoc(collection(db, 'takeaways'), takeawayData)
      
      toast.success('Takeaway saved successfully!')
      
      // Redirect to takeaway history
      setTimeout(() => {
        router.push('/takeaway-history')
      }, 1500)
      
    } catch (error) {
      console.error('Error saving takeaway:', error)
      toast.error('Failed to save takeaway')
    } finally {
      setSavingTakeaway(false)
    }
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }
  
  // No creatives selected
  if (selectedCreatives.length < 3) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Not Enough Creatives Selected
            </h2>
            <p className="text-gray-600 mb-6">
              Strategy Sync requires at least 3 creatives for meaningful analysis.
              You currently have {selectedCreatives.length} selected.
            </p>
            <Button onClick={() => router.push('/creatives')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back to Select Creatives
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Strategy Sync Analysis</h1>
          <p className="text-gray-600 mt-1">
            Analyzing {selectedCreatives.length} creatives from {statistics?.litigationTypes.length || 0} litigation types
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/creatives')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {analysisComplete && (
            <>
              <Button 
                variant="outline"
                onClick={() => {
                  console.log('Rerun analysis triggered')
                  setAnalysisComplete(false)
                  setAnalysisStarted(false)
                  setAnalysisSections([])
                  setAnalysisProgress(0)
                  setTimeout(() => startAnalysis(selectedCreatives), 100)
                }}
              >
                <Brain className="mr-2 h-4 w-4" />
                Rerun Analysis
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button onClick={() => document.getElementById('takeaway-section')?.scrollIntoView({ behavior: 'smooth' })}>
                <Save className="mr-2 h-4 w-4" />
                Save Takeaway
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Left Sidebar - Selected Creatives */}
        <div className="col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-sm">Selected Creatives</CardTitle>
              <CardDescription className="text-xs">
                {selectedCreatives.length} items for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {selectedCreatives.map((creative) => (
                    <div key={creative.id} className="relative group">
                      {creative.imageUrl ? (
                        <div className="relative aspect-square bg-gray-100 rounded overflow-hidden">
                          <NextImage
                            src={creative.imageUrl}
                            alt={creative.creativeFilename || 'Creative'}
                            fill
                            className="object-cover"
                          />
                          {creative.markedAsTopAd && (
                            <Badge className="absolute top-1 right-1 text-xs" variant="default">
                              Top
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <p className="text-xs mt-1 truncate">{creative.creativeFilename}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Context Distribution */}
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="text-xs text-gray-600">
                  <span className="font-semibold">Litigation Types:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {statistics?.litigationTypes.map(lit => (
                      <Badge key={lit} variant="outline" className="text-xs">
                        {lit}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  <span className="font-semibold">Campaign Types:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {statistics?.campaignTypes.map(camp => (
                      <Badge key={camp} variant="secondary" className="text-xs">
                        {camp}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Analysis Results */}
        <div className="col-span-3 space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg CPC</p>
                    <p className="text-2xl font-bold">${statistics?.avgCPC}</p>
                  </div>
                  <MousePointerClick className="h-8 w-8 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg CPL</p>
                    <p className="text-2xl font-bold">${statistics?.avgCPL}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold">${statistics?.totalSpent}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Top Ads</p>
                    <p className="text-2xl font-bold">{statistics?.topAdPercentage}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-yellow-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Controls */}
          {!analyzing && selectedCreatives.length >= 3 && !analysisComplete && (
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Ready to Analyze</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Click to start analyzing {selectedCreatives.length} creatives
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      console.log('Manual analysis start triggered')
                      setAnalysisStarted(false) // Reset the flag
                      setTimeout(() => startAnalysis(selectedCreatives), 100)
                    }}
                    className="gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    Start Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Progress */}
          {analyzing && (
            <Card>
              <CardContent className="py-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                      <span className="font-medium">Analyzing creatives...</span>
                    </div>
                    <span className="text-sm text-gray-600">{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                  <p className="text-sm text-gray-600">
                    AI is analyzing patterns, performance metrics, and generating insights...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Results */}
          {analysisSections.length > 0 && (
            <Accordion type="single" collapsible className="space-y-4" defaultValue="item-0">
              {analysisSections.map((section, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        {section.icon}
                        <span className="font-semibold">{section.title}</span>
                      </div>
                      {section.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(section.confidence * 100)}% confidence
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {/* Insights */}
                      <div>
                        <h4 className="font-medium mb-2 text-sm text-gray-700">Key Insights</h4>
                        <ul className="space-y-2">
                          {section.insights.map((insight, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Recommendations */}
                      {section.recommendations && section.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 text-sm text-gray-700">Recommendations</h4>
                          <ul className="space-y-2">
                            {section.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          {/* User Takeaway Section */}
          {analysisComplete && (
            <Card id="takeaway-section">
              <CardHeader>
                <CardTitle>Your Strategic Takeaway</CardTitle>
                <CardDescription>
                  Summarize key insights and action items from this analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your key takeaways, action items, and strategic decisions based on this analysis..."
                  value={userTakeaway}
                  onChange={(e) => setUserTakeaway(e.target.value)}
                  rows={6}
                  className="w-full"
                />
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Tips for effective takeaways</AlertTitle>
                  <AlertDescription className="mt-2 space-y-1">
                    <li>Focus on actionable insights that can be implemented</li>
                    <li>Note specific creative elements to test or replicate</li>
                    <li>Include performance targets based on the analysis</li>
                    <li>Mention team members to involve using @mentions</li>
                  </AlertDescription>
                </Alert>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setUserTakeaway('')}
                    disabled={!userTakeaway || savingTakeaway}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={saveTakeaway}
                    disabled={!userTakeaway.trim() || savingTakeaway}
                  >
                    {savingTakeaway ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Takeaway
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}