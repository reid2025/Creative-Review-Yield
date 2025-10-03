'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FloatingInput } from '@/components/ui/floating-input'
import { FloatingSelect } from '@/components/ui/floating-select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Search,
  Plus,
  Upload,
  Save,
  Trash2,
  Download,
  Edit,
  Eye,
  Filter,
  RefreshCw,
  Settings,
  ChevronDown,
  Loader2
} from 'lucide-react'

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-league-spartan text-4xl font-bold text-gray-900 mb-2">Design System</h1>
          <p className="text-gray-600">Component library and style guide - Temporary reference page</p>
        </div>

        {/* Buttons Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">

            {/* Primary Buttons */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Primary Buttons (Default Variant)</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button>Default Button</Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Primary actions, form submissions</div>
                    <div className="text-xs text-gray-500 mt-1">Used in: Login page, Creative Library (Save Draft)</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button size="sm">Small Primary</Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Compact primary actions</div>
                    <div className="text-xs text-gray-500 mt-1">Used in: Creative Stream (filters)</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button size="lg">Large Primary</Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Main CTAs, important actions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Secondary Buttons (Outline Variant)</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button variant="outline">Outline Button</Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Secondary actions, cancel buttons</div>
                    <div className="text-xs text-gray-500 mt-1">Used in: Creative Stream (Date filter, Account filter)</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button variant="outline" size="sm">Small Outline</Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Compact secondary actions</div>
                    <div className="text-xs text-gray-500 mt-1">Used in: Creative Stream (filter buttons), Calendar controls</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ghost Buttons */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Ghost Buttons</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button variant="ghost">Ghost Button</Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Subtle actions, less emphasis</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button variant="ghost" size="sm">Small Ghost</Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Minimal actions in tight spaces</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Destructive Buttons */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Destructive Buttons</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button variant="destructive">Delete</Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Dangerous actions, deletions</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button variant="destructive" size="sm">Small Delete</Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Compact destructive actions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons with Icons */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Buttons with Icons</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Create/Add actions</div>
                    <div className="text-xs text-gray-500 mt-1">Used in: Creative Library (Add Creative)</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button variant="outline">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Search actions</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>File upload actions</div>
                    <div className="text-xs text-gray-500 mt-1">Used in: Creative Library (Upload Image)</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Save/Submit actions</div>
                    <div className="text-xs text-gray-500 mt-1">Used in: Creative Library, My Drafts</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Delete actions</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Download/Export actions</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Refresh/Reload actions</div>
                    <div className="text-xs text-gray-500 mt-1">Used in: Creative Stream (data refresh)</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Filter actions</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button variant="outline" size="sm">
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Dropdown
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Dropdown triggers</div>
                    <div className="text-xs text-gray-500 mt-1">Used in: Creative Stream (Date, Account, Campaign filters)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Icon-only Buttons */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Icon-only Buttons</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Settings/Config actions</div>
                    <div className="text-xs text-gray-500 mt-1">Used in: Creative Stream (Column settings)</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>View/Preview actions</div>
                    <div className="text-xs text-gray-500 mt-1">Used in: Creative Stream (row hover action)</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Edit actions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Button States */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Button States</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button disabled>Disabled</Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Inactive/unavailable actions</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Button>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </Button>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Processing/loading states</div>
                    <div className="text-xs text-gray-500 mt-1">Used in: Creative Stream (filtering), Creative Library (saving)</div>
                  </div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Form Fields Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Form Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">

            {/* Text Inputs */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Text Inputs</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-96">
                    <Input placeholder="Regular input" />
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Standard form inputs</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-96">
                    <FloatingInput placeholder="Floating label input" />
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Modern floating label inputs</div>
                    <div className="text-xs text-gray-500 mt-1">Used in: Creative Stream (Search bar)</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-96">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Search..." className="pl-10" />
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Search inputs with icon</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Checkboxes</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-96 flex items-center space-x-2">
                    <Checkbox id="checkbox1" />
                    <label htmlFor="checkbox1" className="text-sm">Checkbox label</label>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Multi-select options</div>
                    <div className="text-xs text-gray-500 mt-1">Used in: Creative Stream (Account/Campaign filters)</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-96 flex items-center space-x-2">
                    <Checkbox id="checkbox2" checked />
                    <label htmlFor="checkbox2" className="text-sm">Checked checkbox</label>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Selected state</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-96 flex items-center space-x-2">
                    <Checkbox id="checkbox3" disabled />
                    <label htmlFor="checkbox3" className="text-sm text-gray-400">Disabled checkbox</label>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Unavailable options</div>
                  </div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Badges & Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">

            <div>
              <h3 className="text-lg font-semibold mb-4">Status Badges</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Badge className="bg-green-500 text-white hover:bg-green-500">Active</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Active/Live status</div>
                    <div className="text-xs text-gray-500 mt-1">Used in: Creative Stream (Campaign status)</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Badge className="bg-orange-500 text-white hover:bg-orange-500">Paused</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Paused status</div>
                    <div className="text-xs text-gray-500 mt-1">Used in: Creative Stream (Campaign status)</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Badge className="bg-gray-500 text-white hover:bg-gray-500">Inactive</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Inactive/Disabled status</div>
                    <div className="text-xs text-gray-500 mt-1">Used in: Creative Stream (Campaign status)</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Published</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Published/Live status</div>
                    <div className="text-xs text-gray-500 mt-1">Used in: Creative Stream (Library status)</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Draft</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Draft status</div>
                    <div className="text-xs text-gray-500 mt-1">Used in: My Drafts</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48">
                    <Badge variant="outline">Default</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium">Usage:</div>
                    <div>Neutral/General tags</div>
                  </div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <strong>Note:</strong> This is a temporary reference page for design consistency. Use this as a guide when building new features or updating existing ones.
        </div>
      </div>
    </div>
  )
}
