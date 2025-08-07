// ✅ Created blank lightbox page – 2025-01-27 (by Cursor AI)

import { PageContainer, PageHeader } from "@/components/layout/PageContainer"
import { Card, CardContent } from "@/components/ui/card"
import { Eye } from "lucide-react"

export default function LightboxPage() {
  return (
    <PageContainer>
      <PageHeader 
        title="Creative Lightbox"
        description="View and organize your creatives in a visual gallery"
      />
      
      <Card>
        <CardContent className="py-12 text-center">
          <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lightbox Coming Soon</h2>
          <p className="text-gray-600">
            A beautiful gallery view of all your creative assets will be available here.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  )
} 