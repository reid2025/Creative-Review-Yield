'use client'

import NextImage from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CreativeHistoryViewer } from './CreativeHistoryViewer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Icons
import { ArrowLeft, Save, Edit, History, FileText } from 'lucide-react'

interface CreativeData {
  // Basic info
  id?: string
  creativeFilename?: string
  imageUrl?: string
  dateAdded?: string
  status?: 'draft' | 'saved' | 'published'
  
  // Metadata & Dates
  startDate?: string
  endDate?: string
  designer?: string
  
  // Campaign Info
  litigationName?: string
  campaignType?: string
  creativeLayoutType?: string
  messagingStructure?: string
  audiencePersona?: string
  campaignTrigger?: string
  
  // Headlines & CTA
  preheadlineText?: string
  headlineText?: string
  ctaLabel?: string
  ctaVerb?: string
  ctaStyleGroup?: string
  ctaColor?: string
  ctaPosition?: string
  
  // Visual Elements
  imageryType?: string[]
  imageryBackground?: string[]
  questionBasedHeadline?: boolean
  clientBranding?: boolean
  iconsUsed?: boolean
  
  // Copy Elements
  bodyCopySummary?: string
  copyAngle?: string[]
  copyTone?: string[]
  headlineTags?: string[]
  headlineIntent?: string[]
  
  // Content Flags
  legalLanguage?: boolean
  emotionalStatement?: boolean
  dollarAmount?: boolean
  statMentioned?: boolean
  disclaimer?: boolean
  conditionsListed?: boolean
  
  // Performance Metrics
  amountSpent?: string
  costPerWebsiteLead?: string
  costPerClick?: string
  
  // Status flags
  markedAsTopAd?: boolean
  needsOptimization?: boolean
  pinNoteForStrategySync?: boolean
  
  // Notes
  designerRemarks?: string
  internalNotes?: string
  uploadGoogleDocLink?: string
  
  // Google Sheets Sync fields
  accountName?: string
  campaignName?: string
  creativeHistory?: Array<{
    date: string
    cost: string
    costPerWebsiteLead: string
    costPerLinkClick: string
    syncedAt: { toDate: () => Date } | Date
    dataSource: string
  }>
  lastSyncedAt?: { toDate: () => Date } | Date
  syncSource?: string
}

interface CreativePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  creativeData: CreativeData
  mode?: 'preview' | 'view' // preview = from upload form, view = from creatives page
  onSave?: () => void
  onPublish?: () => void
  isSubmitting?: boolean
  isFormValid?: boolean
}

export default function CreativePreviewModal({
  open,
  onOpenChange,
  creativeData,
  mode = 'preview',
  onSave,
  onPublish,
  isSubmitting = false,
  isFormValid = true
}: CreativePreviewModalProps) {
  const router = useRouter()
  
  const handleEdit = () => {
    if (creativeData.id) {
      router.push(`/upload/single?edit=${creativeData.id}`)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {mode === 'preview' ? 'Preview Creative Upload' : 'Creative Details'}
          </DialogTitle>
          <DialogDescription asChild>
            <div>
              {mode === 'preview' ? 'Review all information before saving.' : 'View creative details and performance metrics.'}
              <span className="ml-2">Current status: 
                {creativeData.status === 'draft' ? (
                  <Badge variant="outline" className="ml-1 bg-yellow-50 text-yellow-700 border-yellow-300">Draft</Badge>
                ) : (
                  <Badge variant="outline" className="ml-1 bg-green-50 text-green-700 border-green-300">Saved</Badge>
                )}
              </span>
              {creativeData.markedAsTopAd && (
                <Badge variant="default" className="ml-2">Top Ad</Badge>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Creative Details
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2" disabled={!creativeData.creativeHistory || creativeData.creativeHistory.length === 0}>
              <History className="h-4 w-4" />
              Performance History
              {creativeData.creativeHistory && creativeData.creativeHistory.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
                  {creativeData.creativeHistory.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4">
            <div className="flex gap-6" style={{ height: 'calc(75vh - 150px)' }}>
          {/* Left Column - Image */}
          <div className="w-[45%]">
            {creativeData.imageUrl && (
              <div className="h-full border rounded-lg bg-gray-50 p-6">
                <div className="bg-white rounded-lg p-4 h-full">
                  <NextImage
                    src={creativeData.imageUrl}
                    alt="Creative preview"
                    className="w-full h-full object-contain rounded"
                    width={600}
                    height={600}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Form Summary matching exact form structure */}
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4 pb-8">
              
              {/* 1. Metadata & Campaign Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-base text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-500 rounded"></div>
                  Metadata & Campaign Info
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Creative Filename</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.creativeFilename || 'N/A'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Date Added</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.dateAdded || 'N/A'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Account Name</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.accountName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Designer</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.designer || 'N/A'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Litigation Name</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.litigationName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Campaign Type</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.campaignType || 'N/A'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Start Date</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.startDate || 'N/A'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">End Date</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.endDate || 'N/A'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Campaign Name</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.campaignName || 'N/A'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Marked as Top Ad</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.markedAsTopAd ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center py-2">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Needs Optimization</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.needsOptimization ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>


              {/* 2. Message & Targeting Insights */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-base text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-purple-500 rounded"></div>
                  Message & Targeting Insights
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Creative Layout Type</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.creativeLayoutType || 'N/A'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Messaging Structure</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.messagingStructure || 'N/A'}</span>
                  </div>
                  <div className="flex items-start py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Imagery Type</span>
                    <div className="flex-1">
                      {creativeData.imageryType?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {creativeData.imageryType.map((type: string) => (
                            <Badge key={type} variant="secondary" className="text-xs">{type}</Badge>
                          ))}
                        </div>
                      ) : <span className="text-sm text-gray-900 font-semibold">N/A</span>}
                    </div>
                  </div>
                  <div className="flex items-start py-2">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Imagery Background</span>
                    <div className="flex-1">
                      {creativeData.imageryBackground?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {creativeData.imageryBackground.map((bg: string) => (
                            <Badge key={bg} variant="secondary" className="text-xs">{bg}</Badge>
                          ))}
                        </div>
                      ) : <span className="text-sm text-gray-900 font-semibold">N/A</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Headline & CTA */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-base text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-orange-500 rounded"></div>
                  Headline & CTA
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Preheadline Text</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.preheadlineText || 'N/A'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Headline Text</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.headlineText || 'N/A'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">CTA Label</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.ctaLabel || 'N/A'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">CTA Verb</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.ctaVerb || 'N/A'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">CTA Style Group</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.ctaStyleGroup || 'N/A'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">CTA Color</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.ctaColor || 'N/A'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">CTA Position</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.ctaPosition || 'N/A'}</span>
                  </div>
                  <div className="flex items-start py-2">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Headline Tags</span>
                    <div className="flex-1">
                      {creativeData.headlineTags?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {creativeData.headlineTags.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      ) : <span className="text-sm text-gray-900 font-semibold">N/A</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Copy Drivers & Content Elements */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-base text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-red-500 rounded"></div>
                  Copy Drivers & Content Elements
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Body Copy Summary</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.bodyCopySummary || 'N/A'}</span>
                  </div>
                  <div className="flex items-start py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Copy Angle</span>
                    <div className="flex-1">
                      {creativeData.copyAngle?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {creativeData.copyAngle.map((angle: string) => (
                            <Badge key={angle} variant="secondary" className="text-xs">{angle}</Badge>
                          ))}
                        </div>
                      ) : <span className="text-sm text-gray-900 font-semibold">N/A</span>}
                    </div>
                  </div>
                  <div className="flex items-start py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Copy Tone</span>
                    <div className="flex-1">
                      {creativeData.copyTone?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {creativeData.copyTone.map((tone: string) => (
                            <Badge key={tone} variant="secondary" className="text-xs">{tone}</Badge>
                          ))}
                        </div>
                      ) : <span className="text-sm text-gray-900 font-semibold">N/A</span>}
                    </div>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Legal Language</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.legalLanguage ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Emotional Statement</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.emotionalStatement ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Dollar Amount</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.dollarAmount ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Statistics Mentioned</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.statMentioned ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Disclaimer</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.disclaimer ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Conditions Listed</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.conditionsListed ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Question-Based Headline</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.questionBasedHeadline ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Client Branding</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.clientBranding ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center py-2">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Icons Used</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.iconsUsed ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* 5. Additional Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm" style={{marginBottom: '30px'}}>
                <h3 className="font-semibold text-base text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gray-400 rounded"></div>
                  Additional Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Designer Remarks</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.designerRemarks || 'N/A'}</span>
                  </div>
                  <div className="flex items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Internal Notes</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">{creativeData.internalNotes || 'N/A'}</span>
                  </div>
                  <div className="flex items-center py-2">
                    <span className="text-sm text-gray-600 font-medium w-1/3">Google Doc Link</span>
                    <span className="text-sm text-gray-900 font-semibold flex-1">
                      {creativeData.uploadGoogleDocLink ? (
                        <a href={creativeData.uploadGoogleDocLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {creativeData.uploadGoogleDocLink}
                        </a>
                      ) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Indicator (only for preview mode) */}
              {mode === 'preview' && (
                <div className={`p-3 border-2 rounded-lg col-span-2 ${!isFormValid ? 'bg-yellow-50 border-yellow-300' : creativeData.status === 'draft' ? 'bg-blue-50 border-blue-300' : 'bg-green-50 border-green-300'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-base text-gray-700">Save Status</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {!isFormValid 
                          ? 'Please complete all required fields before saving as final'
                          : creativeData.status === 'draft' 
                          ? 'This will save the creative as final and remove it from drafts'
                          : 'Creative has been saved successfully'}
                      </p>
                    </div>
                    {!isFormValid ? (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">Form Incomplete</Badge>
                    ) : creativeData.status === 'draft' ? (
                      <Badge variant="default" className="bg-green-600">Ready to Save</Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-700">Saved</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Notes (only for view mode) */}
              {mode === 'view' && (creativeData.designerRemarks || creativeData.internalNotes) && (
                <div className="p-3 border rounded-lg bg-gray-50 col-span-2">
                  <h3 className="mb-2 font-semibold text-sm text-gray-800 border-b pb-1">Additional Notes</h3>
                  <div className="space-y-2 text-sm">
                    {creativeData.designerRemarks && (
                      <div>
                        <span className="text-gray-600">Designer Remarks:</span>
                        <p className="font-medium mt-1">{creativeData.designerRemarks}</p>
                      </div>
                    )}
                    {creativeData.internalNotes && (
                      <div>
                        <span className="text-gray-600">Internal Notes:</span>
                        <p className="font-medium mt-1">{creativeData.internalNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <div style={{ height: 'calc(75vh - 150px)', overflowY: 'auto' }}>
              {creativeData.creativeHistory && creativeData.creativeHistory.length > 0 ? (
                <CreativeHistoryViewer
                  history={creativeData.creativeHistory}
                  currentCost={creativeData.amountSpent}
                  currentCPL={creativeData.costPerWebsiteLead}
                  currentCPC={creativeData.costPerClick}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No performance history available</p>
                    <p className="text-sm text-gray-500 mt-2">
                      History will appear here after syncing from Google Sheets
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between mt-6">
          {mode === 'preview' ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Edit
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (creativeData.status === 'saved') {
                      onOpenChange(false)
                      toast.info('Creative already saved')
                    } else if (!isFormValid) {
                      toast.error('Please complete all required fields before saving')
                    } else {
                      onOpenChange(false)
                      onSave?.()
                    }
                  }}
                  disabled={isSubmitting || creativeData.status === 'saved' || !isFormValid}
                  title={!isFormValid ? 'Complete all required fields to save' : ''}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Saving...' : creativeData.status === 'saved' ? 'Already Saved' : !isFormValid ? 'Form Incomplete' : 'Save as Draft'}
                </Button>

                {onPublish && (
                  <Button
                    onClick={() => {
                      if (!isFormValid) {
                        toast.error('Please complete all required fields before publishing')
                      } else {
                        onOpenChange(false)
                        onPublish()
                      }
                    }}
                    disabled={isSubmitting || !isFormValid}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    title={!isFormValid ? 'Complete all required fields to publish' : ''}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Publishing...' : 'Publish Creative'}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Creative
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}