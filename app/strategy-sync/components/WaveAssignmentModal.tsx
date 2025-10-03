'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, Calendar, User, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface Creative {
  id: string
  campaignId: string
  accountId: string
  waveId: string
  batchId: string
  assetUrl?: string
  attributes: {
    layout?: string
    template?: string
    headline?: string
    cta?: string
    tone?: string
    background?: string
    icons?: boolean
  }
  metrics: {
    spend: number
    leads: number
    cpl: number
    cpc: number
    ctr: number
    impressions: number
    uniques: number
  }
  uploadedAt: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  sheetRowId?: string
  sheetLastUpdated?: string
}

interface WaveAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  creatives: Creative[]
  currentWaveNumber?: number
  onSaveAssignment: (assignment: WaveAssignment) => void
}

interface WaveAssignment {
  waveNumber: number
  batchId: string
  testNotes: string
  testFocus: string[]
  changeDescription: string
  reason: string
  auditLog: string
}

const testFocusOptions = [
  'Broad Targeting',
  'Brand Awareness',
  'Headline Testing',
  'CTA Optimization',
  'Imagery Testing',
  'Copy Testing',
  'Social Proof',
  'Performance Optimization',
  'Cost Reduction',
  'Targeting Refinement'
]

export default function WaveAssignmentModal({ 
  isOpen, 
  onClose, 
  creatives, 
  currentWaveNumber = 1,
  onSaveAssignment 
}: WaveAssignmentModalProps) {
  const [waveNumber, setWaveNumber] = useState(currentWaveNumber.toString())
  const [batchId, setBatchId] = useState('')
  const [testNotes, setTestNotes] = useState('')
  const [selectedTestFocus, setSelectedTestFocus] = useState<string[]>([])
  const [changeDescription, setChangeDescription] = useState('')
  const [reason, setReason] = useState('')

  const handleTestFocusToggle = (focus: string) => {
    if (selectedTestFocus.includes(focus)) {
      setSelectedTestFocus(selectedTestFocus.filter(f => f !== focus))
    } else {
      setSelectedTestFocus([...selectedTestFocus, focus])
    }
  }

  const removeTestFocus = (focus: string) => {
    setSelectedTestFocus(selectedTestFocus.filter(f => f !== focus))
  }

  const handleSave = () => {
    if (!waveNumber || !testNotes.trim() || !changeDescription.trim() || selectedTestFocus.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    const assignment: WaveAssignment = {
      waveNumber: parseInt(waveNumber),
      batchId: batchId || `batch-${waveNumber}-${Date.now()}`,
      testNotes: testNotes.trim(),
      testFocus: selectedTestFocus,
      changeDescription: changeDescription.trim(),
      reason: reason.trim(),
      auditLog: `Wave assignment changed by admin on ${new Date().toISOString()}: ${reason || 'Manual override'}`
    }

    onSaveAssignment(assignment)
    onClose()
    toast.success('Wave assignment updated successfully')
  }

  const handleCancel = () => {
    // Reset form
    setWaveNumber(currentWaveNumber.toString())
    setBatchId('')
    setTestNotes('')
    setSelectedTestFocus([])
    setChangeDescription('')
    setReason('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Wave Assignment Override
          </DialogTitle>
          <DialogDescription>
            Manually assign or reassign {creatives.length} creative{creatives.length > 1 ? 's' : ''} to a wave. 
            All changes are logged for audit purposes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Creative Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Creatives to Assign</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Count:</span> {creatives.length} creatives
                </div>
                <div>
                  <span className="text-gray-500">Current Batch:</span> {creatives[0]?.batchId || 'N/A'}
                </div>
                <div>
                  <span className="text-gray-500">Upload Date:</span>{' '}
                  {creatives[0] ? new Date(creatives[0].uploadedAt).toLocaleDateString() : 'N/A'}
                </div>
                <div>
                  <span className="text-gray-500">Current Wave:</span> {currentWaveNumber}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wave Assignment Form */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wave-number">Wave Number *</Label>
              <Select value={waveNumber} onValueChange={setWaveNumber}>
                <SelectTrigger>
                  <SelectValue placeholder="Select wave" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Wave 1</SelectItem>
                  <SelectItem value="2">Wave 2</SelectItem>
                  <SelectItem value="3">Wave 3</SelectItem>
                  <SelectItem value="4">Wave 4</SelectItem>
                  <SelectItem value="5">Wave 5</SelectItem>
                  <SelectItem value="6">Wave 6</SelectItem>
                  <SelectItem value="7">Wave 7</SelectItem>
                  <SelectItem value="8">Wave 8</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch-id">Batch ID</Label>
              <Input
                id="batch-id"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder="Auto-generated if blank"
              />
            </div>
          </div>

          {/* Test Notes */}
          <div className="space-y-2">
            <Label htmlFor="test-notes">Test Notes *</Label>
            <Textarea
              id="test-notes"
              value={testNotes}
              onChange={(e) => setTestNotes(e.target.value)}
              placeholder="Describe the testing hypothesis or approach for this wave..."
              rows={3}
            />
          </div>

          {/* Test Focus Tags */}
          <div className="space-y-3">
            <Label>Test Focus *</Label>
            <div className="grid grid-cols-3 gap-2">
              {testFocusOptions.map(focus => (
                <button
                  key={focus}
                  onClick={() => handleTestFocusToggle(focus)}
                  className={`p-2 text-sm border rounded-lg transition-colors ${
                    selectedTestFocus.includes(focus)
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {focus}
                </button>
              ))}
            </div>
            
            {selectedTestFocus.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedTestFocus.map(focus => (
                  <Badge key={focus} variant="secondary" className="cursor-pointer" onClick={() => removeTestFocus(focus)}>
                    {focus}
                    <span className="ml-1">×</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Change Description */}
          <div className="space-y-2">
            <Label htmlFor="change-description">Change Description *</Label>
            <Textarea
              id="change-description"
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              placeholder="Brief description of what changed or what's being tested in this wave..."
              rows={2}
            />
          </div>

          {/* Override Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Override Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this manual override necessary? (for audit log)"
              rows={2}
            />
          </div>

          {/* Audit Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">Audit Log</p>
                <p className="text-yellow-700">
                  This manual wave assignment will be logged with timestamp, user ID, and reason. 
                  The original automated assignment data will be preserved for comparison.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!waveNumber || !testNotes.trim() || !changeDescription.trim() || selectedTestFocus.length === 0}
          >
            Save Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}