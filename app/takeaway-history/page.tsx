// ✅ Created blank takeaway history page – 2025-01-27 (by Cursor AI)

import { PageContainer, PageHeader } from "@/components/layout/PageContainer"
import { Card, CardContent } from "@/components/ui/card"
import { History } from "lucide-react"

export default function TakeawayHistoryPage() {
  return (
    <PageContainer>
      <PageHeader 
        title="Takeaway History"
        description="View your creative insights and takeaways over time"
      />
      
      <Card>
        <CardContent className="py-12 text-center">
          <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No takeaways yet</h2>
          <p className="text-gray-600">
            Your creative insights and takeaways will appear here once you start analyzing your campaigns.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  )
} 