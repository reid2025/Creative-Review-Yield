'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Sparkles, 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Eye, 
  Download, 
  Save, 
  RefreshCw,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Users,
  Zap,
  MessageSquare,
  FileText,
  Lightbulb,
  ArrowRight,
  Clock,
  Award
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { toast } from 'sonner'

// Mock creative data - in production, this would come from Firebase/API
const mockSelectedCreatives = [
  {
    id: '1',
    filename: 'ozempic-quiz-v2.png',
    imageUrl: '/placeholder.jpg',
    litigation: 'Ozempic Campaign',
    campaignType: 'Mass Tort',
    layoutType: 'Quiz',
    headlineText: 'Are You Eligible for Ozempic Compensation?',
    ctaColor: 'Blue',
    ctaPosition: 'Bottom Center',
    costPerLead: 25.50,
    performance: 'high',
    tags: ['Quiz', 'Blue CTA', 'Legal', 'Question-based']
  },
  {
    id: '3',
    filename: 'sa-campaign-card.png',
    imageUrl: '/placeholder.jpg',
    litigation: 'LA County SA',
    campaignType: 'SA (Sexual Abuse)',
    layoutType: 'Card',
    headlineText: 'Confidential Legal Support Available',
    ctaColor: 'Blue',
    ctaPosition: 'Bottom Right',
    costPerLead: 18.90,
    performance: 'high',
    tags: ['Card', 'Blue CTA', 'Empathetic', 'Professional']
  },
  {
    id: '5',
    filename: 'wage-claim-carousel.png',
    imageUrl: '/placeholder.jpg',
    litigation: 'Wage Claim Campaign',
    campaignType: 'Personal Injury',
    layoutType: 'Carousel',
    headlineText: 'Unpaid Wages? Fight for What You Earned',
    ctaColor: 'Orange',
    ctaPosition: 'Bottom Left',
    costPerLead: 32.40,
    performance: 'high',
    tags: ['Carousel', 'Orange CTA', 'Motivational', 'Rights-focused']
  }
]

// Mock AI insights
const mockAIInsights = {
  patternRecognition: {
    visualElements: [
      "67% of selected creatives use question-based headlines",
      "High-performing creatives favor bottom CTA placement (83%)",
      "Blue CTAs appear 67% more in high-performing creatives",
      "Card and quiz layouts show 40% better engagement"
    ],
    messagingPatterns: [
      "Empathetic tone correlates with 35% higher conversion in SA campaigns",
      "Direct question format increases click-through by 28%",
      "Professional language works better than casual in legal contexts",
      "Rights-focused messaging drives action in wage claim campaigns"
    ],
    performanceCorrelations: [
      "Average CPL: $25.60 (15% below industry benchmark)",
      "Question headlines: 22% better performance than statements",
      "Bottom-positioned CTAs: 18% higher conversion rate",
      "Blue color scheme: 31% better performance in legal campaigns"
    ]
  },
  strategicInsights: {
    audienceAlignment: [
      "Selected creatives target empathy-driven audience segments",
      "Legal messaging resonates with information-seeking behavior",
      "Question format aligns with problem-aware audience stage",
      "Professional tone builds trust in high-stakes decisions"
    ],
    campaignCoherence: [
      "Strong thematic consistency across SA and legal campaigns",
      "Color psychology: Blues convey trust, orange creates urgency",
      "Layout diversity maintains visual interest while staying professional",
      "Messaging strategy focuses on support rather than confrontation"
    ],
    marketPositioning: [
      "Premium positioning through professional design and empathetic messaging",
      "Educational approach positions brand as helpful resource",
      "Trust-building elements (confidentiality, support) differentiate from aggressive competitors",
      "Multi-format strategy captures audience at different engagement levels"
    ]
  },
  contextualRecommendations: {
    campaignTypeInsights: [
      "SA Campaign Analysis: Soft color palettes (blues) increase engagement by 35%",
      "Mass Tort Analysis: Question-based headlines improve conversion by 28%",
      "Personal Injury Analysis: Rights-focused messaging drives 42% more action"
    ],
    litigationSpecific: [
      "Ozempic Campaign: Blue CTAs outperform red by 31% in this context",
      "LA County SA: Empathy-focused copy increases leads by 45%",
      "Wage Claims: Motivational language improves engagement by 38%"
    ],
    crossLitigationOpportunities: [
      "Blue CTA success in SA campaigns suggests testing in Personal Injury",
      "Question headline format from Ozempic could work in other Mass Tort campaigns",
      "Empathetic messaging from SA could enhance other legal campaign types"
    ]
  },
  optimizationRecommendations: [
    {
      category: "A/B Testing Suggestions",
      items: [
        "Test red vs blue CTAs in wage claim campaigns",
        "Compare question vs statement headlines in SA campaigns",
        "Try top vs bottom CTA placement in quiz layouts",
        "Test urgency vs empathy messaging across campaign types"
      ]
    },
    {
      category: "Visual Element Optimizations",
      items: [
        "Increase CTA button size by 15-20% for better mobile visibility",
        "Add subtle shadow effects to CTAs for better contrast",
        "Consider warm color accents to balance professional blue theme",
        "Test icon usage in headlines for improved scanability"
      ]
    },
    {
      category: "Copy Variations",
      items: [
        "Develop 3 headline variations: question, statement, benefit-focused",
        "Create urgency variants: 'Limited time' vs 'Act now' vs 'Don't wait'",
        "Test emotional appeal levels: high empathy vs professional neutrality",
        "A/B test CTA text: 'Get Help' vs 'Learn More' vs 'Start Now'"
      ]
    },
    {
      category: "Performance Improvement Opportunities",
      items: [
        "Optimize loading speed - current 2.3s could improve to 1.5s",
        "Enhanced mobile responsiveness could increase mobile conversions by 25%",
        "Add trust signals (testimonials, certifications) for credibility boost",
        "Implement exit-intent popups with alternative offers"
      ]
    }
  ]
}

type AnalysisPhase = 'selecting' | 'analyzing' | 'completed'

export default function StrategySyncPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  
  const [phase, setPhase] = useState<AnalysisPhase>('selecting')
  const [selectedCreatives, setSelectedCreatives] = useState(mockSelectedCreatives)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [aiInsights, setAiInsights] = useState(mockAIInsights)
  const [userTakeaways, setUserTakeaways] = useState('')
  const [takeawayTitle, setTakeawayTitle] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [activeInsightTab, setActiveInsightTab] = useState('patterns')
  const [isSaving, setIsSaving] = useState(false)

  // Check if creatives were passed from Creatives page
  useEffect(() => {
    const selectedIds = searchParams.get('selected')
    if (selectedIds && selectedCreatives.length === 0) {
      // In production, fetch the selected creatives by IDs
      setSelectedCreatives(mockSelectedCreatives)
      setPhase('analyzing')
      startAnalysis()
    }
  }, [searchParams, selectedCreatives.length])

  const startAnalysis = async () => {
    setPhase('analyzing')
    setAnalysisProgress(0)
    
    // Simulate AI analysis with progress updates
    const steps = [
      'Analyzing visual patterns...',
      'Identifying messaging themes...',
      'Calculating performance correlations...',
      'Generating strategic insights...',
      'Creating optimization recommendations...',
      'Finalizing analysis...'
    ]
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setAnalysisProgress((i + 1) / steps.length * 100)
      toast.info(steps[i])
    }
    
    setPhase('completed')
    toast.success('Analysis completed! Review your strategic insights below.')
  }

  const handleSaveTakeaway = async () => {
    if (!takeawayTitle.trim()) {
      toast.error('Please enter a title for your takeaway')
      return
    }

    setIsSaving(true)
    
    try {
      // Simulate save to Firebase
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const takeaway = {
        id: `takeaway_${Date.now()}`,
        title: takeawayTitle,
        creatives: selectedCreatives,
        aiInsights: aiInsights,
        userTakeaways: userTakeaways,
        createdAt: new Date().toISOString(),
        createdBy: user?.displayName || 'User'
      }
      
      console.log('Saving takeaway:', takeaway)
      
      toast.success('Takeaway saved successfully!')
      setShowSaveDialog(false)
      
      // Redirect to takeaway history
      setTimeout(() => {
        window.location.href = '/takeaway-history'
      }, 1000)
      
    } catch (error) {
      toast.error('Failed to save takeaway')
    } finally {
      setIsSaving(false)
    }
  }

  const exportToPDF = () => {
    toast.info('PDF export coming soon!')
  }

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'patterns': return <BarChart3 className="h-4 w-4" />
      case 'strategic': return <Target className="h-4 w-4" />
      case 'contextual': return <Brain className="h-4 w-4" />
      case 'optimization': return <TrendingUp className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  if (phase === 'selecting') {
    return (
      <ProtectedRoute>
        <PageContainer>
          <PageHeader 
            title="Strategy Sync"
            description="AI-powered creative analysis for strategic insights"
          />
          
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Creatives to Analyze</h2>
              <p className="text-gray-600 mb-6">
                Choose at least 3 creatives from your gallery to start AI-powered strategic analysis.
              </p>
              <div className="flex space-x-4 justify-center">
                <Link href="/creatives">
                  <Button>
                    <Eye className="h-4 w-4 mr-2" />
                    Browse Creatives
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => {
                  setSelectedCreatives(mockSelectedCreatives)
                  startAnalysis()
                }}>
                  <Zap className="h-4 w-4 mr-2" />
                  Analyze Demo Creatives
                </Button>
              </div>
            </CardContent>
          </Card>
        </PageContainer>
      </ProtectedRoute>
    )
  }

  if (phase === 'analyzing') {
    return (
      <ProtectedRoute>
        <PageContainer>
          <PageHeader 
            title="Strategy Sync"
            description="AI Analysis in Progress..."
          />
          
          <Card>
            <CardContent className="py-12">
              <div className="max-w-md mx-auto text-center">
                <div className="relative mb-6">
                  <Brain className="w-16 h-16 text-blue-500 mx-auto animate-pulse" />
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                    <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold mb-2">AI Analyzing Your Creatives</h2>
                <p className="text-gray-600 mb-6">
                  Extracting patterns, insights, and strategic recommendations...
                </p>
                
                <div className="space-y-4">
                  <Progress value={analysisProgress} className="h-3" />
                  <p className="text-sm text-gray-500">
                    {Math.round(analysisProgress)}% Complete
                  </p>
                </div>
                
                <div className="mt-8 text-left">
                  <h3 className="font-medium mb-3">Selected Creatives ({selectedCreatives.length}):</h3>
                  <div className="space-y-2">
                    {selectedCreatives.map(creative => (
                      <div key={creative.id} className="flex items-center space-x-3 text-sm">
                        <img 
                          src={creative.imageUrl}
                          alt={creative.filename}
                          className="w-8 h-8 rounded object-cover"
                        />
                        <span className="flex-1">{creative.filename}</span>
                        <Badge variant="outline" className="text-xs">
                          {creative.campaignType}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </PageContainer>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <PageContainer>
        <div className="flex items-center justify-between mb-6">
          <PageHeader 
            title="Strategy Sync Analysis"
            description={`Strategic insights from ${selectedCreatives.length} creatives`}
          />
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={exportToPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={() => setShowSaveDialog(true)}>
              <Save className="h-4 w-4 mr-2" />
              Save Takeaway
            </Button>
          </div>
        </div>

        {/* Analysis Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Selected Creatives */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Selected Creatives</CardTitle>
                <CardDescription>{selectedCreatives.length} creatives analyzed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedCreatives.map(creative => (
                  <div key={creative.id} className="flex items-start space-x-3">
                    <img 
                      src={creative.imageUrl}
                      alt={creative.filename}
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{creative.filename}</p>
                      <p className="text-xs text-muted-foreground">{creative.litigation}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          ${creative.costPerLead} CPL
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Context Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Context Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium mb-1">Campaign Types:</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Mass Tort</span>
                      <Badge variant="secondary" className="text-xs">33%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>SA (Sexual Abuse)</span>
                      <Badge variant="secondary" className="text-xs">33%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Personal Injury</span>
                      <Badge variant="secondary" className="text-xs">33%</Badge>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <p className="font-medium mb-1">Performance Distribution:</p>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-2 bg-green-200 rounded-full flex-1">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <span className="text-xs">High: 100%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All selected creatives are high performers
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - AI Insights */}
          <div className="lg:col-span-3">
            <Tabs value={activeInsightTab} onValueChange={setActiveInsightTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="patterns" className="flex items-center space-x-2">
                  {getInsightIcon('patterns')}
                  <span className="hidden sm:inline">Patterns</span>
                </TabsTrigger>
                <TabsTrigger value="strategic" className="flex items-center space-x-2">
                  {getInsightIcon('strategic')}
                  <span className="hidden sm:inline">Strategic</span>
                </TabsTrigger>
                <TabsTrigger value="contextual" className="flex items-center space-x-2">
                  {getInsightIcon('contextual')}
                  <span className="hidden sm:inline">Contextual</span>
                </TabsTrigger>
                <TabsTrigger value="optimization" className="flex items-center space-x-2">
                  {getInsightIcon('optimization')}
                  <span className="hidden sm:inline">Optimize</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="patterns" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Pattern Recognition Analysis</span>
                    </CardTitle>
                    <CardDescription>
                      Common visual and messaging elements across your selected creatives
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Visual Elements */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Eye className="h-4 w-4 mr-2" />
                        Visual Elements
                      </h4>
                      <div className="space-y-2">
                        {aiInsights.patternRecognition.visualElements.map((insight, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Messaging Patterns */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Messaging Patterns
                      </h4>
                      <div className="space-y-2">
                        {aiInsights.patternRecognition.messagingPatterns.map((insight, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Performance Correlations */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Performance Correlations
                      </h4>
                      <div className="space-y-2">
                        {aiInsights.patternRecognition.performanceCorrelations.map((insight, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <Award className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="strategic" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Strategic Insights</span>
                    </CardTitle>
                    <CardDescription>
                      High-level strategic analysis and market positioning insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Audience Alignment
                      </h4>
                      <div className="space-y-2">
                        {aiInsights.strategicInsights.audienceAlignment.map((insight, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Zap className="h-4 w-4 mr-2" />
                        Campaign Coherence
                      </h4>
                      <div className="space-y-2">
                        {aiInsights.strategicInsights.campaignCoherence.map((insight, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3 flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        Market Positioning
                      </h4>
                      <div className="space-y-2">
                        {aiInsights.strategicInsights.marketPositioning.map((insight, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <ArrowRight className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contextual" className="space-y-4 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="h-5 w-5" />
                      <span>Context-Aware Analytics</span>
                    </CardTitle>
                    <CardDescription>
                      Litigation and campaign type specific recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-3">Campaign Type Insights</h4>
                      <div className="space-y-3">
                        {aiInsights.contextualRecommendations.campaignTypeInsights.map((insight, index) => (
                          <div key={index} className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-blue-900">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Litigation-Specific Analysis</h4>
                      <div className="space-y-3">
                        {aiInsights.contextualRecommendations.litigationSpecific.map((insight, index) => (
                          <div key={index} className="bg-green-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-green-900">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Cross-Litigation Opportunities</h4>
                      <div className="space-y-3">
                        {aiInsights.contextualRecommendations.crossLitigationOpportunities.map((insight, index) => (
                          <div key={index} className="bg-purple-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-purple-900">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="optimization" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiInsights.optimizationRecommendations.map((category, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base">{category.category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-start space-x-2">
                              <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm">{item}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* User Takeaways Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Your Strategic Takeaways</span>
                </CardTitle>
                <CardDescription>
                  Add your own insights, conclusions, and action items based on the AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="What are your key takeaways from this analysis? What actions will you take? Any additional insights or patterns you noticed?"
                  value={userTakeaways}
                  onChange={(e) => setUserTakeaways(e.target.value)}
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Save Takeaway Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Strategy Sync Takeaway</DialogTitle>
              <DialogDescription>
                Save this analysis and your takeaways for future reference and team collaboration.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="takeaway-title">Takeaway Title</Label>
                <Input
                  id="takeaway-title"
                  placeholder="e.g., Q1 Campaign Analysis - Blue CTAs & Question Headlines"
                  value={takeawayTitle}
                  onChange={(e) => setTakeawayTitle(e.target.value)}
                />
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Included in takeaway:</strong></p>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>{selectedCreatives.length} analyzed creatives</li>
                  <li>Complete AI analysis and insights</li>
                  <li>Your strategic takeaways and notes</li>
                  <li>Performance metrics and recommendations</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTakeaway} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Takeaway
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </ProtectedRoute>
  )
}