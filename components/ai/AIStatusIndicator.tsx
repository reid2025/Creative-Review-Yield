'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Sparkles, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface AIStatusIndicatorProps {
  className?: string
  showDetails?: boolean
}

export function AIStatusIndicator({ className = '', showDetails = false }: AIStatusIndicatorProps) {
  const [aiStatus, setAiStatus] = useState<'checking' | 'available' | 'unavailable' | 'error'>('checking')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    checkAIStatus()
  }, [])

  const checkAIStatus = async () => {
    try {
      // Import dynamically to avoid circular dependencies
      const { firebaseAIService } = await import('@/lib/firebase-ai-service')
      
      // Check AI health
      const health = await firebaseAIService.checkHealth()
      
      if (!health.available) {
        setAiStatus('unavailable')
        setStatusMessage(health.error || 'AI features are disabled')
        return
      }
      
      // Try to load tags to verify full functionality
      try {
        await firebaseAIService.loadAvailableTags()
        setAiStatus('available')
        setStatusMessage(`AI ready (${health.model})`)
      } catch (tagError) {
        // AI is available but tags couldn't load
        setAiStatus('available')
        setStatusMessage('AI ready (limited tag validation)')
      }
    } catch (error: any) {
      console.error('AI status check failed:', error)
      setAiStatus('error')
      setStatusMessage(error.message || 'AI service unavailable')
    }
  }

  const getStatusColor = () => {
    switch (aiStatus) {
      case 'checking':
        return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'available':
        return 'bg-green-50 text-green-700 border-green-300'
      case 'unavailable':
        return 'bg-yellow-50 text-yellow-700 border-yellow-300'
      case 'error':
        return 'bg-red-50 text-red-700 border-red-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusIcon = () => {
    switch (aiStatus) {
      case 'checking':
        return <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      case 'available':
        return <CheckCircle className="w-3 h-3" />
      case 'unavailable':
        return <AlertCircle className="w-3 h-3" />
      case 'error':
        return <XCircle className="w-3 h-3" />
      default:
        return <Sparkles className="w-3 h-3" />
    }
  }

  const getStatusText = () => {
    switch (aiStatus) {
      case 'checking':
        return 'Checking AI...'
      case 'available':
        return 'AI Ready'
      case 'unavailable':
        return 'AI Disabled'
      case 'error':
        return 'AI Error'
      default:
        return 'AI Status'
    }
  }

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`${getStatusColor()} ${className} cursor-help transition-colors`}
            >
              {getStatusIcon()}
              <span className="ml-1.5 text-xs">{getStatusText()}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{statusMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant="outline" 
        className={`${getStatusColor()} transition-colors`}
      >
        {getStatusIcon()}
        <span className="ml-1.5 text-xs font-medium">{getStatusText()}</span>
      </Badge>
      {statusMessage && (
        <span className="text-xs text-gray-500">{statusMessage}</span>
      )}
    </div>
  )
}