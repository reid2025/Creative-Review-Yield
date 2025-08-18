'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { tagService, TAG_CATEGORIES, type Tag, type TagCategory } from '@/lib/firebase-tag-service'
import { useGoogleAuth } from '@/contexts/GoogleAuthContext'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

export default function TagGlossaryPage() {
  const { user } = useGoogleAuth()
  const router = useRouter()
  const [tags, setTags] = useState<Tag[]>([])
  const [categories, setCategories] = useState<TagCategory[]>(TAG_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  // Form states
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [newTag, setNewTag] = useState({
    label: '',
    value: '',
    category: '',
    fieldName: ''
  })

  // Check authentication
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // Fetch all tags on mount
  useEffect(() => {
    if (user) {
      fetchTags()
    }
  }, [user])

  const fetchTags = async () => {
    try {
      setLoading(true)
      const allTags = await tagService.getAllTags()
      setTags(allTags)
      
      // Group tags by category
      const categoriesWithTags = TAG_CATEGORIES.map(cat => ({
        ...cat,
        tags: allTags.filter(tag => tag.fieldName === cat.fieldName)
      }))
      setCategories(categoriesWithTags)
    } catch (error) {
      console.error('Error fetching tags:', error)
      toast.error('Failed to load tags')
    } finally {
      setLoading(false)
    }
  }

  // Filter tags based on search and category
  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tag.value.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || tag.fieldName === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Group filtered tags by category
  const groupedTags = categories.map(cat => ({
    ...cat,
    tags: filteredTags.filter(tag => tag.fieldName === cat.fieldName)
  })).filter(cat => cat.tags.length > 0)

  // Add tag handler
  const handleAddTag = async () => {
    if (!newTag.label || !newTag.category) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      // Always convert value to kebab-case with proper normalization
      const toKebabCase = (str: string) => {
        return str
          .normalize('NFD')                           // Normalize to NFD form
          .replace(/[\u0300-\u036f]/g, '')           // Remove diacritics/accents
          .toLowerCase()                               // Convert to lowercase
          .replace(/[^a-z0-9]+/g, '-')                // Replace non-alphanumeric with dash
          .replace(/-+/g, '-')                        // Collapse multiple dashes
          .replace(/^-|-$/g, '')                      // Trim leading/trailing dashes
      }
      
      const value = newTag.value 
        ? toKebabCase(newTag.value)
        : toKebabCase(newTag.label)
      const category = categories.find(c => c.fieldName === newTag.category)
      
      if (!category) {
        toast.error('Invalid category selected')
        return
      }

      await tagService.createTag({
        label: newTag.label,
        value: value,
        fieldName: category.fieldName,
        createdBy: user?.uid || 'unknown'
      })

      toast.success('Tag created successfully')
      setShowAddDialog(false)
      setNewTag({ label: '', value: '', category: '', fieldName: '' })
      fetchTags()
    } catch (error) {
      console.error('Error creating tag:', error)
      toast.error('Failed to create tag')
    }
  }

  // Edit tag handler
  const handleEditTag = async () => {
    if (!selectedTag) return

    try {
      // Ensure value is in kebab-case
      const formattedValue = selectedTag.value.toLowerCase().replace(/\s+/g, '-')
      
      await tagService.updateTag(selectedTag.id, {
        label: selectedTag.label,
        value: formattedValue
      })

      toast.success('Tag updated successfully')
      setShowEditDialog(false)
      setSelectedTag(null)
      fetchTags()
    } catch (error) {
      console.error('Error updating tag:', error)
      toast.error('Failed to update tag')
    }
  }

  // Delete tag handler
  const handleDeleteTag = async () => {
    if (!selectedTag) return

    try {
      // Use permanent delete to remove from Firebase completely
      await tagService.permanentlyDeleteTag(selectedTag.id)
      toast.success('Tag deleted successfully')
      setShowDeleteDialog(false)
      setSelectedTag(null)
      fetchTags()
    } catch (error) {
      console.error('Error deleting tag:', error)
      toast.error('Failed to delete tag')
    }
  }

  // Export tags handler
  const exportTags = () => {
    const dataStr = JSON.stringify(tags, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `tags-export-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast.success('Tags exported successfully')
  }


  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tag Glossary</h1>
            <p className="text-muted-foreground">Manage all tags used in creative uploads</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportTags}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Tag
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <Separator className="my-1" />
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.fieldName}>
                      {cat.displayName} ({cat.tags.length})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tags by Category */}
        <div className="space-y-6">
          {loading ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">Loading tags...</p>
              </CardContent>
            </Card>
          ) : groupedTags.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No tags found</p>
              </CardContent>
            </Card>
          ) : (
            groupedTags.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">{category.displayName}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        {category.allowMultiple ? 'Multi-Select' : 'Single-Select'}
                      </Badge>
                      <Badge variant="outline">
                        {category.tags.length} tags
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {category.tags.map((tag) => (
                      <div
                        key={tag.id}
                        className="group inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <span className="text-sm">{tag.label}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-1">
                          <button
                            onClick={() => {
                              setSelectedTag(tag)
                              setShowEditDialog(true)
                            }}
                            className="p-0.5 hover:bg-gray-300 rounded"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedTag(tag)
                              setShowDeleteDialog(true)
                            }}
                            className="p-0.5 hover:bg-red-200 rounded text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add Tag Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tag</DialogTitle>
              <DialogDescription>
                Create a new tag for use in creative uploads
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newTag.category}
                  onValueChange={(value) => setNewTag({ ...newTag, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.fieldName}>
                        {cat.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">Display Label</Label>
                <Input
                  id="label"
                  value={newTag.label}
                  onChange={(e) => setNewTag({ ...newTag, label: e.target.value })}
                  placeholder="e.g., Single Image"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="value">Value (optional)</Label>
                <Input
                  id="value"
                  value={newTag.value}
                  onChange={(e) => {
                    // Auto-convert to kebab-case as user types
                    const converted = e.target.value.toLowerCase().replace(/\s+/g, '-')
                    setNewTag({ ...newTag, value: converted })
                  }}
                  placeholder="e.g., single-image (auto-generated if empty)"
                />
                {newTag.value && newTag.value.includes(' ') && (
                  <p className="text-xs text-muted-foreground">
                    Spaces will be converted to dashes: {newTag.value.toLowerCase().replace(/\s+/g, '-')}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTag}>Add Tag</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Tag Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tag</DialogTitle>
              <DialogDescription>
                Update tag information
              </DialogDescription>
            </DialogHeader>
            {selectedTag && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-label">Display Label</Label>
                  <Input
                    id="edit-label"
                    value={selectedTag.label}
                    onChange={(e) => setSelectedTag({ ...selectedTag, label: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-value">Value</Label>
                  <Input
                    id="edit-value"
                    value={selectedTag.value}
                    onChange={(e) => {
                      // Auto-convert to kebab-case as user types
                      const converted = e.target.value.toLowerCase().replace(/\s+/g, '-')
                      setSelectedTag({ ...selectedTag, value: converted })
                    }}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditTag}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Tag Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Tag</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this tag?
              </DialogDescription>
            </DialogHeader>
            {selectedTag && (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium">{selectedTag.label}</p>
                  <p className="text-sm text-muted-foreground">Value: {selectedTag.value}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteTag}>
                Delete Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}