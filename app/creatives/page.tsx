// ✅ Created blank creatives page – 2025-01-27 (by Cursor AI)

import { PageContainer, PageHeader } from "@/components/layout/PageContainer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "lucide-react"
import Link from "next/link"

export default function CreativesPage() {
  return (
    <PageContainer>
      <PageHeader 
        title="All Creatives"
        description="Browse and manage your uploaded creative assets"
      />
      
      <Card>
        <CardContent className="py-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No creatives uploaded yet</h2>
          <p className="text-gray-600 mb-6">
            Start by uploading your first creative to see it appear here.
          </p>
          <Link href="/upload">
            <Button>Upload Creative</Button>
          </Link>
        </CardContent>
      </Card>
    </PageContainer>
  )
} 