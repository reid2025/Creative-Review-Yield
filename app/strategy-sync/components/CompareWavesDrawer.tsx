'use client'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sparkles, TrendingUp, TrendingDown, Calendar, Target, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

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

interface CompareWavesDrawerProps {
  waves: Wave[]
  onClose: () => void
}

export default function CompareWavesDrawer({ waves, onClose }: CompareWavesDrawerProps) {
  const [takeawayNotes, setTakeawayNotes] = useState('')
  const [isGeneratingTakeaway, setIsGeneratingTakeaway] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
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

  const getWinnerStatus = (value1: number, value2: number, lowerIsBetter = false) => {
    if (value1 === value2) return 'tie'
    if (lowerIsBetter) {
      return value1 < value2 ? 'winner1' : 'winner2'
    } else {
      return value1 > value2 ? 'winner1' : 'winner2'
    }
  }

  const getStatusClass = (status: string, isFirst: boolean) => {
    if (status === 'tie') return ''
    if ((status === 'winner1' && isFirst) || (status === 'winner2' && !isFirst)) {
      return 'bg-green-50 text-green-800 font-[500]'
    }
    return ''
  }

  const generateTakeaway = async () => {
    if (waves.length !== 2) {
      toast.error('Need exactly 2 waves to generate takeaway')
      return
    }

    setIsGeneratingTakeaway(true)

    // Simulate AI takeaway generation
    await new Promise(resolve => setTimeout(resolve, 2000))

    const [wave1, wave2] = waves
    const cplWinner = wave1.metrics.cpl < wave2.metrics.cpl ? wave1 : wave2
    const ctrWinner = wave1.metrics.ctr > wave2.metrics.ctr ? wave1 : wave2
    
    const generatedTakeaway = `Comparison of Wave ${wave1.waveNumber} vs Wave ${wave2.waveNumber}:

📊 Performance Summary:
• ${cplWinner === wave1 ? 'Wave ' + wave1.waveNumber : 'Wave ' + wave2.waveNumber} achieved the lowest CPL (${formatCurrency(cplWinner.metrics.cpl)})
• ${ctrWinner === wave1 ? 'Wave ' + wave1.waveNumber : 'Wave ' + wave2.waveNumber} had the highest CTR (${ctrWinner.metrics.ctr}%)

🎯 Test Focus Analysis:
• Wave ${wave1.waveNumber}: ${wave1.testFocus.join(', ')}
• Wave ${wave2.waveNumber}: ${wave2.testFocus.join(', ')}

✅ Key Takeaways:
• ${wave1.metrics.cpl < wave2.metrics.cpl ? 
  `The approach in Wave ${wave1.waveNumber} resulted in more efficient lead generation` : 
  `The approach in Wave ${wave2.waveNumber} resulted in more efficient lead generation`}
• ${wave1.metrics.ctr > wave2.metrics.ctr ? 
  `Wave ${wave1.waveNumber}'s creative elements drove higher engagement` : 
  `Wave ${wave2.waveNumber}'s creative elements drove higher engagement`}

🚀 Recommendations:
• Apply winning elements from the better-performing wave to future campaigns
• Consider A/B testing the specific changes that led to improved metrics
• Monitor performance over a longer period to confirm trends

Generated on ${new Date().toLocaleDateString()}`

    setTakeawayNotes(generatedTakeaway)
    setIsGeneratingTakeaway(false)
    toast.success('Takeaway generated successfully!')
  }

  const saveTakeaway = async () => {
    if (!takeawayNotes.trim()) {
      toast.error('Please add takeaway notes or generate them first')
      return
    }

    // TODO: Implement actual save to database
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast.success('Takeaway saved to Takeaway History!')
    onClose()
  }

  const [wave1, wave2] = waves.length === 2 ? waves : [waves[0], null]

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-[800px] sm:max-w-[800px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl font-[500] text-black font-['DM_Sans']">Compare Waves</SheetTitle>
              <SheetDescription className="font-['DM_Sans']">
                Side-by-side comparison of {waves.length} wave{waves.length > 1 ? 's' : ''}
              </SheetDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {waves.length < 2 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 font-['DM_Sans']">Select 2 waves to compare their performance</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Wave Headers */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-['DM_Sans']">Wave {wave1.waveNumber}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600 font-['DM_Sans']">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(wave1.createdAt)}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-gray-500 mb-1 font-['DM_Sans']">Test Focus</div>
                      <div className="flex flex-wrap gap-1">
                        {wave1.testFocus.map(focus => (
                          <div key={focus} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-[500] font-['DM_Sans'] rounded-full">
                            {focus}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1 font-['DM_Sans']">Changes</div>
                      <p className="text-sm text-black font-['DM_Sans']">{wave1.changeDescription}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Wave {wave2?.waveNumber}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{wave2 ? formatDate(wave2.createdAt) : 'N/A'}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Test Focus</div>
                      <div className="flex flex-wrap gap-1">
                        {wave2?.testFocus.map(focus => (
                          <Badge key={focus} variant="secondary" className="text-xs">
                            {focus}
                          </Badge>
                        )) || <span className="text-xs text-gray-400">No data</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Changes</div>
                      <p className="text-sm text-black">{wave2?.changeDescription || 'No data'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Metrics Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Spend */}
                  <div className="grid grid-cols-3 items-center">
                    <div className="text-sm font-[500] text-black">Spend</div>
                    <div className={`text-center p-2 rounded ${getStatusClass(getWinnerStatus(wave1.metrics.spend, wave2?.metrics.spend || 0, false), true)}`}>
                      {formatCurrency(wave1.metrics.spend)}
                    </div>
                    <div className={`text-center p-2 rounded ${getStatusClass(getWinnerStatus(wave1.metrics.spend, wave2?.metrics.spend || 0, false), false)}`}>
                      {wave2 ? formatCurrency(wave2.metrics.spend) : 'N/A'}
                    </div>
                  </div>

                  {/* Leads */}
                  <div className="grid grid-cols-3 items-center">
                    <div className="text-sm font-[500] text-black">Leads</div>
                    <div className={`text-center p-2 rounded ${getStatusClass(getWinnerStatus(wave1.metrics.leads, wave2?.metrics.leads || 0, false), true)}`}>
                      {formatNumber(wave1.metrics.leads)}
                    </div>
                    <div className={`text-center p-2 rounded ${getStatusClass(getWinnerStatus(wave1.metrics.leads, wave2?.metrics.leads || 0, false), false)}`}>
                      {wave2 ? formatNumber(wave2.metrics.leads) : 'N/A'}
                    </div>
                  </div>

                  {/* CPL */}
                  <div className="grid grid-cols-3 items-center">
                    <div className="text-sm font-[500] text-black">CPL</div>
                    <div className={`text-center p-2 rounded ${getStatusClass(getWinnerStatus(wave1.metrics.cpl, wave2?.metrics.cpl || 0, true), true)}`}>
                      {formatCurrency(wave1.metrics.cpl)}
                    </div>
                    <div className={`text-center p-2 rounded ${getStatusClass(getWinnerStatus(wave1.metrics.cpl, wave2?.metrics.cpl || 0, true), false)}`}>
                      {wave2 ? formatCurrency(wave2.metrics.cpl) : 'N/A'}
                    </div>
                  </div>

                  {/* CPC */}
                  <div className="grid grid-cols-3 items-center">
                    <div className="text-sm font-[500] text-black">CPC</div>
                    <div className={`text-center p-2 rounded ${getStatusClass(getWinnerStatus(wave1.metrics.cpc, wave2?.metrics.cpc || 0, true), true)}`}>
                      {formatCurrency(wave1.metrics.cpc)}
                    </div>
                    <div className={`text-center p-2 rounded ${getStatusClass(getWinnerStatus(wave1.metrics.cpc, wave2?.metrics.cpc || 0, true), false)}`}>
                      {wave2 ? formatCurrency(wave2.metrics.cpc) : 'N/A'}
                    </div>
                  </div>

                  {/* CTR */}
                  <div className="grid grid-cols-3 items-center">
                    <div className="text-sm font-[500] text-black">CTR</div>
                    <div className={`text-center p-2 rounded ${getStatusClass(getWinnerStatus(wave1.metrics.ctr, wave2?.metrics.ctr || 0, false), true)}`}>
                      {wave1.metrics.ctr}%
                    </div>
                    <div className={`text-center p-2 rounded ${getStatusClass(getWinnerStatus(wave1.metrics.ctr, wave2?.metrics.ctr || 0, false), false)}`}>
                      {wave2 ? `${wave2.metrics.ctr}%` : 'N/A'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Takeaway */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Generate Strategic Takeaway
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Generate AI-powered insights from this wave comparison
                  </p>
                  <Button 
                    onClick={generateTakeaway}
                    disabled={isGeneratingTakeaway}
                    className="gap-2"
                  >
                    {isGeneratingTakeaway ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Takeaway
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="takeaway-notes">Takeaway Notes</Label>
                  <Textarea
                    id="takeaway-notes"
                    placeholder="Your strategic takeaways and action items will appear here..."
                    value={takeawayNotes}
                    onChange={(e) => setTakeawayNotes(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setTakeawayNotes('')}>
                    Clear
                  </Button>
                  <Button onClick={saveTakeaway} disabled={!takeawayNotes.trim()}>
                    Save to Takeaway History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}