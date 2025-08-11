// ✅ Created blank strategy sync page – 2025-01-27 (by Cursor AI)

import { PageContainer, PageHeader } from "@/components/layout/PageContainer"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw } from "lucide-react"

export default function StrategySyncPage() {
  return (
    <PageContainer>
      <PageHeader 
        title="Strategy Sync"
        description="Align your creative strategy with campaign performance data"
      />
      
      <Card>
        <CardContent className="py-12 text-center">
          <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Strategy Sync Coming Soon</h2>
          <p className="text-gray-600">
            Connect your creative insights with strategic decision-making tools.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  )
} 