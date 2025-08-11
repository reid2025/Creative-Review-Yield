'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Brain, 
  Activity,
  Upload,
  Sparkles,
  Target,
  Calendar,
  Clock,
  MessageSquare,
  Award,
  Zap,
  ArrowUp,
  ArrowDown,
  BarChart3,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'

// Mock data for demonstration
const mockMetrics = {
  totalCreatives: { current: 128, previous: 115, trend: 'up' },
  topPerformingLitigation: { name: 'Ozempic Campaign', metric: '$1.25 CPL' },
  aiEfficiency: { percentage: 87, trend: 'up' },
  strategySyncSessions: { current: 12, previous: 8 }
}

const mockActivities = [
  { id: 1, user: 'Sarah', action: 'uploaded 3 new Personal Injury creatives', time: '2 hours ago', avatar: '/placeholder-user.jpg' },
  { id: 2, user: 'Mike', action: 'completed Strategy Sync on Ozempic campaign', time: '4 hours ago', avatar: '/placeholder-user.jpg' },
  { id: 3, user: 'Lisa', action: 'added "Urgency Red" to CTA Color tags', time: '6 hours ago', avatar: '/placeholder-user.jpg' },
  { id: 4, user: 'Team', action: 'hit 100 uploads milestone! 🎯', time: '1 day ago', avatar: '/placeholder-user.jpg' }
]

const mockTagTrends = [
  { name: 'Blue CTA', performance: 92, trend: 'up', change: 12 },
  { name: 'Question Headlines', performance: 78, trend: 'up', change: 8 },
  { name: 'Urgency Copy', performance: 45, trend: 'down', change: -5 },
  { name: 'Testimonial', performance: 88, trend: 'up', change: 15 }
]

const mockWins = [
  { creative: 'LA County SA Campaign', performance: '0.85 CPL', improvement: '32%' },
  { creative: 'Personal Injury Quiz', performance: '2.1% CTR', improvement: '18%' },
  { creative: 'Ozempic Awareness', performance: '4.2 ROAS', improvement: '25%' }
]

function MetricCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  href 
}: {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: any
  href?: string
}) {
  const content = (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'} flex items-center mt-1`}>
            {trend === 'up' ? <ArrowUp className="h-3 w-3 mr-1" /> : trend === 'down' ? <ArrowDown className="h-3 w-3 mr-1" /> : null}
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )

  return href ? <Link href={href}>{content}</Link> : content
}

function ActivityFeedItem({ activity }: { activity: any }) {
  return (
    <div className="flex items-start space-x-3 py-3 border-b last:border-0">
      <Avatar className="h-8 w-8">
        <AvatarImage src={activity.avatar} />
        <AvatarFallback>{activity.user[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-semibold">{activity.user}</span> {activity.action}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
      </div>
    </div>
  )
}

function TagTrendItem({ tag }: { tag: any }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-3">
        <Badge variant={tag.trend === 'up' ? 'default' : 'secondary'}>
          {tag.name}
        </Badge>
        <span className="text-sm font-medium">{tag.performance}%</span>
      </div>
      <div className={`flex items-center text-xs ${tag.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {tag.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {Math.abs(tag.change)}%
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [dailyNote, setDailyNote] = useState('')
  const [teamMood, setTeamMood] = useState('')
  
  const moodEmojis = ['😊', '😐', '😔', '😤', '🎉']

  return (
    <ProtectedRoute>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Last 30 days
            </Button>
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Creatives"
            value={mockMetrics.totalCreatives.current}
            change={`+${mockMetrics.totalCreatives.current - mockMetrics.totalCreatives.previous} vs last month`}
            trend="up"
            icon={Upload}
            href="/creatives"
          />
          <MetricCard
            title="Top Performing Litigation"
            value={mockMetrics.topPerformingLitigation.name}
            change={mockMetrics.topPerformingLitigation.metric}
            trend="neutral"
            icon={Target}
            href="/creatives"
          />
          <MetricCard
            title="AI Efficiency Score"
            value={`${mockMetrics.aiEfficiency.percentage}%`}
            change="Fields auto-populated"
            trend="up"
            icon={Brain}
          />
          <MetricCard
            title="Strategy Sync Sessions"
            value={mockMetrics.strategySyncSessions.current}
            change={`+${mockMetrics.strategySyncSessions.current - mockMetrics.strategySyncSessions.previous} this week`}
            trend="up"
            icon={Activity}
            href="/takeaway-history"
          />
        </div>

        {/* Activity and Trends Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Team Activity Feed */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Team Activity Feed</CardTitle>
              <CardDescription>Real-time updates from your team</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] pr-4">
                {mockActivities.map(activity => (
                  <ActivityFeedItem key={activity.id} activity={activity} />
                ))}
              </ScrollArea>
              <Button variant="outline" className="w-full mt-4">
                Load More
              </Button>
            </CardContent>
          </Card>

          {/* Tag Trends */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Tag Trends</CardTitle>
              <CardDescription>Performance insights by tag</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockTagTrends.map(tag => (
                  <TagTrendItem key={tag.name} tag={tag} />
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/tag-glossary">View All Tags</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Team Motivation Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Daily Team Vibes */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Daily Team Vibes 💪</CardTitle>
              <CardDescription>Share goals, wins, and motivation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Daily Note</label>
                <Textarea
                  placeholder="Share today's goals, wins, or team updates..."
                  value={dailyNote}
                  onChange={(e) => setDailyNote(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Team Mood</label>
                <div className="flex space-x-2">
                  {moodEmojis.map(emoji => (
                    <Button
                      key={emoji}
                      variant={teamMood === emoji ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTeamMood(emoji)}
                      className="text-lg"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Quote of the Day</p>
                <blockquote className="italic text-muted-foreground">
                  "Great marketing is about telling a story that resonates with your audience."
                </blockquote>
              </div>
            </CardContent>
          </Card>

          {/* Celebration Corner */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Celebration Corner 🎉</CardTitle>
              <CardDescription>Recent wins and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockWins.map((win, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Award className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{win.creative}</p>
                      <p className="text-xs text-muted-foreground">
                        {win.performance} • {win.improvement} improvement
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Team Streak</span>
                  <Badge variant="secondary">
                    <Zap className="h-3 w-3 mr-1" />
                    5 days
                  </Badge>
                </div>
                <Progress value={70} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">7 days to next milestone</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Button asChild>
                <Link href="/strategy-sync">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start Strategy Sync
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/upload/single">
                  <Upload className="mr-2 h-4 w-4" />
                  Quick Upload
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/creatives">
                  <FileText className="mr-2 h-4 w-4" />
                  Browse Creatives
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/takeaway-history">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Check Takeaways
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}