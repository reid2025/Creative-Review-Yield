'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, Pin, ExternalLink, Calendar, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Takeaway {
  id: string
  campaignId: string
  title: string
  content: string
  createdAt: string
  author: string
  isPinned: boolean
  waveComparison?: {
    wave1: number
    wave2: number
  }
  tags: string[]
}

interface InsightsSectionProps {
  campaignId: string
}

// Mock pinned takeaways for this campaign
const mockTakeaways: Takeaway[] = [
  {
    id: 'takeaway-1',
    campaignId: '1',
    title: 'Question Headlines Drive 23% Better CTR',
    content: 'Wave 2 testing revealed that question-based headlines ("Did You Suffer a Personal Injury?") consistently outperform statement headlines by 23% CTR improvement. This pattern holds across all three creative variations tested.',
    createdAt: '2024-02-05T15:30:00Z',
    author: 'Sarah M.',
    isPinned: true,
    waveComparison: {
      wave1: 1,
      wave2: 2
    },
    tags: ['Headline Testing', 'CTR Optimization', 'High Impact']
  },
  {
    id: 'takeaway-2',
    campaignId: '1',
    title: 'Orange CTAs Outperform Blue by 15%',
    content: 'Comprehensive testing across Wave 2 shows orange CTA buttons generate 15% more clicks than traditional blue. The contrast against our gradient backgrounds appears to be the key factor.',
    createdAt: '2024-02-08T11:20:00Z',
    author: 'Mike K.',
    isPinned: true,
    waveComparison: {
      wave1: 1,
      wave2: 2
    },
    tags: ['CTA Optimization', 'Color Testing', 'Conversion Rate']
  },
  {
    id: 'takeaway-3',
    campaignId: '1',
    title: 'Testimonials Improve Trust but Increase CPL',
    content: 'Wave 3 testimonial testing showed higher engagement and improved conversion quality, but resulted in 8% higher CPL. Recommend using testimonials for high-value client acquisition campaigns only.',
    createdAt: '2024-02-25T09:45:00Z',
    author: 'Lisa R.',
    isPinned: true,
    waveComparison: {
      wave1: 2,
      wave2: 3
    },
    tags: ['Social Proof', 'Cost Optimization', 'Quality vs Quantity']
  }
]

export default function InsightsSection({ campaignId }: InsightsSectionProps) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleViewAllTakeaways = () => {
    router.push(`/takeaway-history?campaign=${campaignId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-[500] text-black font-['DM_Sans']">Campaign Insights</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={handleViewAllTakeaways} className="gap-2 font-['DM_Sans'] text-sm">
          <ExternalLink className="h-4 w-4" />
          View All Takeaways
        </Button>
      </div>

      <p className="text-sm text-gray-600 font-['DM_Sans']">
        Key strategic insights pinned to this campaign
      </p>

      {mockTakeaways.length === 0 ? (
        <div className="text-center py-8">
          <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-[500] text-gray-900 font-['DM_Sans'] mb-2">No Pinned Insights Yet</h3>
          <p className="text-gray-600 font-['DM_Sans'] mb-4">
            Compare waves to generate strategic takeaways for this campaign
          </p>
          <Button size="sm" className="font-['DM_Sans']">Compare Waves</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {mockTakeaways.map((takeaway) => (
            <div key={takeaway.id} className="bg-white rounded-lg border p-5 hover:shadow-sm transition-colors">
              {/* Takeaway Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <Pin className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-[500] text-black font-['DM_Sans'] mb-2">{takeaway.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-['DM_Sans']">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(takeaway.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{takeaway.author}</span>
                      </div>
                      {takeaway.waveComparison && (
                        <div className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-[500]">
                          Wave {takeaway.waveComparison.wave1} vs {takeaway.waveComparison.wave2}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Takeaway Content */}
              <div className="mb-4 ml-7">
                <p className="text-sm text-gray-700 font-['DM_Sans'] leading-relaxed">{takeaway.content}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 ml-7">
                {takeaway.tags.map((tag) => (
                  <div key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-[500] font-['DM_Sans'] rounded-full">
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Show More Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleViewAllTakeaways}
              className="text-blue-600 hover:text-blue-700 font-['DM_Sans']"
            >
              View all takeaways for this campaign →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}