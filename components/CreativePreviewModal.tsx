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
  status?: 'draft' | 'saved'
  
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
  isSubmitting?: boolean
  isFormValid?: boolean
}

export default function CreativePreviewModal({
  open,
  onOpenChange,
  creativeData,
  mode = 'preview',
  onSave,
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
          {/* Left Column - Image with Magnifying Glass */}
          <div className="w-[45%]">
            {creativeData.imageUrl && (
              <div className="h-full space-y-4 flex flex-col border rounded-lg bg-gray-50 p-6">
                <h3 className="font-semibold text-base text-gray-700">Creative Image</h3>
                <div className="bg-white rounded-lg p-4 relative overflow-visible">
                  {/* Magnifying glass container - 2x bigger */}
                  <div 
                    className="magnifier absolute w-[300px] h-[300px] border-2 border-gray-400 rounded-full pointer-events-none hidden z-50 shadow-lg"
                    style={{
                      backgroundImage: `url(${creativeData.imageUrl})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '350%',
                    }}
                  />
                  
                  {/* Image with hover detection */}
                  <div
                    className="relative rounded-lg cursor-crosshair"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const parentRect = e.currentTarget.parentElement?.getBoundingClientRect()
                      if (!parentRect) return
                      
                      const x = ((e.clientX - rect.left) / rect.width) * 100
                      const y = ((e.clientY - rect.top) / rect.height) * 100
                      const magnifier = e.currentTarget.parentElement?.querySelector('.magnifier') as HTMLElement
                      if (magnifier) {
                        magnifier.style.backgroundPosition = `${x}% ${y}%`
                        
                        // Position magnifier at cursor, allow it to go outside image bounds
                        let left = e.clientX - parentRect.left - 150 // Center on cursor (300px/2)
                        let top = e.clientY - parentRect.top - 150 // Center on cursor (300px/2)
                        
                        // Allow magnifier to go outside but keep it visible in viewport
                        left = Math.max(-150, Math.min(left, parentRect.width - 150))
                        top = Math.max(-150, Math.min(top, parentRect.height - 150))
                        
                        magnifier.style.left = `${left}px`
                        magnifier.style.top = `${top}px`
                        magnifier.style.display = 'block'
                      }
                    }}
                    onMouseLeave={(e) => {
                      const magnifier = e.currentTarget.parentElement?.querySelector('.magnifier') as HTMLElement
                      if (magnifier) {
                        magnifier.style.display = 'none'
                      }
                    }}
                  >
                    <NextImage
                      src={creativeData.imageUrl}
                      alt="Creative preview"
                      className="w-full h-full object-contain rounded"
                      width={600}
                      height={600}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <div><span className="font-semibold">Filename:</span> {creativeData.creativeFilename || 'N/A'}</div>
                  <div><span className="font-semibold">Date Added:</span> {creativeData.dateAdded || 'N/A'}</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - ALL Form Data */}
          <div className="flex-1 overflow-y-auto pr-3">
            <div className="space-y-3">
              {/* Metadata & Dates */}
              <div className="p-3 border rounded-lg bg-gray-50">
                <h3 className="mb-2 font-semibold text-sm text-gray-800 border-b pb-1">Metadata & Dates</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium ml-2">{creativeData.startDate || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-medium ml-2">{creativeData.endDate || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Designer:</span>
                    <span className="font-medium ml-2">{creativeData.designer || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date Added:</span>
                    <span className="font-medium ml-2">{creativeData.dateAdded || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Campaign Info */}
              <div className="p-3 border rounded-lg bg-gray-50">
                <h3 className="mb-2 font-semibold text-sm text-gray-800 border-b pb-1">Campaign Information</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Litigation:</span>
                    <span className="font-medium ml-2">{creativeData.litigationName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Campaign:</span>
                    <span className="font-medium ml-2">{creativeData.campaignType || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Layout:</span>
                    <span className="font-medium ml-2">{creativeData.creativeLayoutType || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Messaging:</span>
                    <span className="font-medium ml-2">{creativeData.messagingStructure || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Audience:</span>
                    <span className="font-medium ml-2">{creativeData.audiencePersona || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Trigger:</span>
                    <span className="font-medium ml-2">{creativeData.campaignTrigger || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Headlines & CTA */}
              <div className="p-3 border rounded-lg bg-gray-50 col-span-2">
                <h3 className="mb-2 font-semibold text-sm text-gray-800 border-b pb-1">Headlines & CTA</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div><span className="text-gray-600">Pre-headline:</span> <span className="font-medium">{creativeData.preheadlineText || 'N/A'}</span></div>
                  <div><span className="text-gray-600">Headline:</span> <span className="font-medium">{creativeData.headlineText || 'N/A'}</span></div>
                  <div><span className="text-gray-600">CTA Label:</span> <span className="font-medium">{creativeData.ctaLabel || 'N/A'}</span></div>
                  <div><span className="text-gray-600">CTA Verb:</span> <span className="font-medium">{creativeData.ctaVerb || 'N/A'}</span></div>
                  <div><span className="text-gray-600">CTA Style:</span> <span className="font-medium">{creativeData.ctaStyleGroup || 'N/A'}</span></div>
                  <div><span className="text-gray-600">CTA Color:</span> <span className="font-medium">{creativeData.ctaColor || 'N/A'}</span></div>
                  <div><span className="text-gray-600">CTA Position:</span> <span className="font-medium">{creativeData.ctaPosition || 'N/A'}</span></div>
                </div>
              </div>

              {/* Visual Elements */}
              <div className="p-3 border rounded-lg bg-gray-50">
                <h3 className="mb-2 font-semibold text-sm text-gray-800 border-b pb-1">Visual Elements</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Imagery Type:</span>
                    {creativeData.imageryType?.length ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {creativeData.imageryType.map((type: string) => (
                          <Badge key={type} variant="secondary" className="text-xs">{type}</Badge>
                        ))}
                      </div>
                    ) : ' N/A'}
                  </div>
                  <div>
                    <span className="text-gray-600">Background:</span>
                    {creativeData.imageryBackground?.length ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {creativeData.imageryBackground.map((bg: string) => (
                          <Badge key={bg} variant="secondary" className="text-xs">{bg}</Badge>
                        ))}
                      </div>
                    ) : ' N/A'}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="text-center">
                      <div className="text-gray-600">Question-Based</div>
                      <Badge variant={creativeData.questionBasedHeadline ? 'default' : 'outline'} className="text-sm">
                        {creativeData.questionBasedHeadline ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600">Client Brand</div>
                      <Badge variant={creativeData.clientBranding ? 'default' : 'outline'} className="text-sm">
                        {creativeData.clientBranding ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600">Icons Used</div>
                      <Badge variant={creativeData.iconsUsed ? 'default' : 'outline'} className="text-sm">
                        {creativeData.iconsUsed ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Copy Elements */}
              <div className="p-3 border rounded-lg bg-gray-50">
                <h3 className="mb-2 font-semibold text-sm text-gray-800 border-b pb-1">Copy Elements</h3>
                <div className="space-y-1.5 text-sm">
                  <div><span className="text-gray-600">Body Copy:</span> <span className="font-medium">{creativeData.bodyCopySummary || 'N/A'}</span></div>
                  <div>
                    <span className="text-gray-600">Copy Angle:</span>
                    {creativeData.copyAngle?.length ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {creativeData.copyAngle.map((angle: string) => (
                          <Badge key={angle} variant="secondary" className="text-xs">{angle}</Badge>
                        ))}
                      </div>
                    ) : ' N/A'}
                  </div>
                  <div>
                    <span className="text-gray-600">Copy Tone:</span>
                    {creativeData.copyTone?.length ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {creativeData.copyTone.map((tone: string) => (
                          <Badge key={tone} variant="secondary" className="text-xs">{tone}</Badge>
                        ))}
                      </div>
                    ) : ' N/A'}
                  </div>
                  <div>
                    <span className="text-gray-600">Headline Tags:</span>
                    {creativeData.headlineTags?.length ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {creativeData.headlineTags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    ) : ' N/A'}
                  </div>
                  <div>
                    <span className="text-gray-600">Headline Intent:</span>
                    {creativeData.headlineIntent?.length ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {creativeData.headlineIntent.map((intent: string) => (
                          <Badge key={intent} variant="secondary" className="text-xs">{intent}</Badge>
                        ))}
                      </div>
                    ) : ' N/A'}
                  </div>
                </div>
              </div>

              {/* Content Flags */}
              <div className="p-3 border rounded-lg bg-gray-50 col-span-2">
                <h3 className="mb-2 font-semibold text-sm text-gray-800 border-b pb-1">Content Flags</h3>
                <div className="grid grid-cols-6 gap-2 text-sm">
                  <div className="text-center">
                    <div className="text-gray-600">Legal Lang</div>
                    <Badge variant={creativeData.legalLanguage ? 'default' : 'outline'} className="text-sm">
                      {creativeData.legalLanguage ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Emotional</div>
                    <Badge variant={creativeData.emotionalStatement ? 'default' : 'outline'} className="text-sm">
                      {creativeData.emotionalStatement ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Dollar Amt</div>
                    <Badge variant={creativeData.dollarAmount ? 'default' : 'outline'} className="text-sm">
                      {creativeData.dollarAmount ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Stats</div>
                    <Badge variant={creativeData.statMentioned ? 'default' : 'outline'} className="text-sm">
                      {creativeData.statMentioned ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Disclaimer</div>
                    <Badge variant={creativeData.disclaimer ? 'default' : 'outline'} className="text-sm">
                      {creativeData.disclaimer ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Conditions</div>
                    <Badge variant={creativeData.conditionsListed ? 'default' : 'outline'} className="text-sm">
                      {creativeData.conditionsListed ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="p-3 border rounded-lg bg-gray-50 col-span-2">
                <h3 className="mb-2 font-semibold text-sm text-gray-800 border-b pb-1">Performance Metrics</h3>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-600">Spent</div>
                    <div className="font-bold">${creativeData.amountSpent || '0'}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-600">CPL</div>
                    <div className="font-bold">${creativeData.costPerWebsiteLead || '0'}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-600">CPC</div>
                    <div className="font-bold">${creativeData.costPerClick || '0'}</div>
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
                {creativeData.status === 'draft' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onOpenChange(false)
                      toast.info('Creative remains as draft')
                    }}
                  >
                    Keep as Draft
                  </Button>
                )}
                <Button
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
                  className={creativeData.status === 'saved' ? 'bg-gray-600' : !isFormValid ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 text-white'}
                  title={!isFormValid ? 'Complete all required fields to save' : ''}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Saving...' : creativeData.status === 'saved' ? 'Already Saved' : !isFormValid ? 'Form Incomplete' : 'Save as Final'}
                </Button>
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