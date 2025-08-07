// Tag Glossary Admin Interface Client Component

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  Trash2, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Database
} from 'lucide-react'
import { PermissionGuard } from '@/components/admin/TagGlossary/PermissionGuard'
import { AuditLog } from '@/components/admin/TagGlossary/AuditLog'
import { useTagGlossary } from '@/hooks/useTagGlossary'
import { useTagAudit } from '@/hooks/useTagAudit'
import { TagEntry } from '@/types/tagGlossary'

export default function TagGlossaryAdminPage() {
  const { tags, categories } = useTagGlossary()
  const { 
    getRecentEntries, 
    clearOldEntries, 
    exportAuditLog,
    totalEntries 
  } = useTagAudit()
  
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  
  // Calculate stats
  const pendingTags = tags.filter(t => t.status === 'pending')
  const rejectedTags = tags.filter(t => t.status === 'rejected')
  const aiGeneratedTags = tags.filter(t => t.origin === 'ai-generated')
  const unusedTags = tags.filter(t => t.usageCount === 0)
  const duplicateTags = findDuplicates(tags)
  
  const handleBulkApprove = () => {
    const tagsToApprove = pendingTags.filter(t => selectedTags.has(t.id))
    if (confirm(`Approve ${tagsToApprove.length} tags?`)) {
      // Bulk approve logic here
      // console.log('Bulk approving:', tagsToApprove)
    }
  }
  
  
  const handleExportTags = () => {
    const data = JSON.stringify(tags, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tag-glossary-full-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const handleExportAudit = () => {
    const data = exportAuditLog()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tag-audit-log-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  return (
    <PermissionGuard requireAdmin>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/tag-glossary" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Tag Glossary
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tag Glossary Admin</h1>
              <p className="text-gray-600 mt-1">
                Manage tags, review submissions, and monitor activity
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportTags} className="gap-2">
                <Download className="h-4 w-4" />
                Export All
              </Button>
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </div>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Total Tags
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tags.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Pending Review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingTags.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                Rejected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedTags.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Audit Entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEntries}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Review ({pendingTags.length})</TabsTrigger>
            <TabsTrigger value="quality">Data Quality</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Pending Review Tab */}
          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tags Pending Approval</CardTitle>
                <CardDescription>
                  Review and approve or reject user-submitted tags
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingTags.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    No tags pending review.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Bulk actions */}
                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="text-sm text-gray-600">
                        {selectedTags.size} of {pendingTags.length} selected
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBulkApprove}
                          disabled={selectedTags.size === 0}
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve Selected
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* Bulk reject */}}
                          disabled={selectedTags.size === 0}
                          className="gap-2 text-red-600"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject Selected
                        </Button>
                      </div>
                    </div>
                    
                    {/* Pending tags list */}
                    <div className="space-y-2">
                      {pendingTags.map(tag => (
                        <div key={tag.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <input
                            type="checkbox"
                            checked={selectedTags.has(tag.id)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedTags)
                              if (e.target.checked) {
                                newSelected.add(tag.id)
                              } else {
                                newSelected.delete(tag.id)
                              }
                              setSelectedTags(newSelected)
                            }}
                            className="h-4 w-4"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{tag.value}</p>
                            <p className="text-sm text-gray-600">
                              {categories.find(c => c.id === tag.fieldCategory)?.displayName} • 
                              Submitted by {tag.createdBy}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Data Quality Tab */}
          <TabsContent value="quality" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Unused Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Unused Tags</CardTitle>
                  <CardDescription>
                    Tags that have never been used ({unusedTags.length})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {unusedTags.length === 0 ? (
                    <p className="text-sm text-gray-600">All tags are in use!</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {unusedTags.slice(0, 10).map(tag => (
                        <div key={tag.id} className="flex items-center justify-between text-sm">
                          <span>{tag.value}</span>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      {unusedTags.length > 10 && (
                        <p className="text-sm text-gray-600 text-center pt-2">
                          +{unusedTags.length - 10} more
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Duplicate Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Potential Duplicates</CardTitle>
                  <CardDescription>
                    Similar tags that might be duplicates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {duplicateTags.length === 0 ? (
                    <p className="text-sm text-gray-600">No duplicates found!</p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {duplicateTags.map((group, i) => (
                        <div key={i} className="text-sm border-b pb-2">
                          <p className="font-medium mb-1">Possible duplicates:</p>
                          <div className="flex flex-wrap gap-1">
                            {group.map(tag => (
                              <span key={tag.id} className="px-2 py-1 bg-gray-100 rounded">
                                {tag.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* AI Generated Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Generated Tags</CardTitle>
                  <CardDescription>
                    Tags created by AI ({aiGeneratedTags.length})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total AI tags</span>
                      <span className="font-medium">{aiGeneratedTags.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Approved</span>
                      <span className="font-medium text-green-600">
                        {aiGeneratedTags.filter(t => t.status === 'approved').length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pending</span>
                      <span className="font-medium text-yellow-600">
                        {aiGeneratedTags.filter(t => t.status === 'pending').length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Rejected</span>
                      <span className="font-medium text-red-600">
                        {aiGeneratedTags.filter(t => t.status === 'rejected').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Category Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>
                    Tags per category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map(category => {
                      const categoryTags = tags.filter(t => t.fieldCategory === category.id)
                      return (
                        <div key={category.id} className="flex justify-between text-sm">
                          <span>{category.displayName}</span>
                          <span className="font-medium">{categoryTags.length}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Audit Log Tab */}
          <TabsContent value="audit" className="space-y-4">
            <AuditLog
              entries={getRecentEntries(100)}
              onExport={handleExportAudit}
              onClearOld={(days) => {
                const removed = clearOldEntries(days)
                alert(`Removed ${removed} old audit entries`)
              }}
            />
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tag Glossary Settings</CardTitle>
                <CardDescription>
                  Configure validation rules and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Settings configuration is currently in development. 
                    Contact your administrator to modify tag validation rules.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4 opacity-50 pointer-events-none">
                  <div>
                    <h4 className="font-medium mb-2">Validation Rules</h4>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked disabled />
                        Prevent duplicate tags
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked disabled />
                        Require admin approval for new tags
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" disabled />
                        Allow special characters
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Permissions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Viewers can add tags</span>
                        <input type="checkbox" disabled />
                      </div>
                      <div className="flex justify-between">
                        <span>Designers can approve tags</span>
                        <input type="checkbox" disabled />
                      </div>
                      <div className="flex justify-between">
                        <span>Auto-approve system tags</span>
                        <input type="checkbox" checked disabled />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  )
}

// Helper function to find potential duplicates
function findDuplicates(tags: TagEntry[]): TagEntry[][] {
  const groups: TagEntry[][] = []
  const processed = new Set<string>()
  
  tags.forEach(tag => {
    if (processed.has(tag.id)) return
    
    const similar = tags.filter(t => 
      t.id !== tag.id &&
      !processed.has(t.id) &&
      t.fieldCategory === tag.fieldCategory &&
      (
        t.value.toLowerCase() === tag.value.toLowerCase() ||
        t.value.toLowerCase().includes(tag.value.toLowerCase()) ||
        tag.value.toLowerCase().includes(t.value.toLowerCase())
      )
    )
    
    if (similar.length > 0) {
      const group = [tag, ...similar]
      groups.push(group)
      group.forEach(t => processed.add(t.id))
    }
  })
  
  return groups
}