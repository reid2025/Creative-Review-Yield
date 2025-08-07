// ✅ Upload mode selection page – 2025-01-27 (by Cursor AI)

import Link from "next/link"
import { FileText, Layers } from "lucide-react"
import { PageContainer, PageHeader } from "@/components/layout/PageContainer"

export default function UploadPage() {
  return (
    <PageContainer withBackground={false} withShadow={false} withBorder={false}>
      <PageHeader 
        title="How would you like to upload creatives today?"
        description="Choose the upload method that works best for your workflow"
        className="text-center"
      />

      {/* Upload Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        
        {/* Bulk Upload Card */}
        <Link href="/upload/bulk" className="group">
          <div className="bg-white border-[1px] border-neutral-800/30 rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Layers className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Bulk Upload</h3>
            <p className="text-gray-600 mb-6">Upload and tag multiple creatives at once</p>
            <div className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium group-hover:bg-gray-800 transition-colors">
              Continue
            </div>
          </div>
        </Link>

        {/* Single Upload Card */}
        <Link href="/upload/single" className="group">
          <div className="bg-white border-[1px] border-neutral-800/30 rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Single Upload</h3>
            <p className="text-gray-600 mb-6">Upload and tag one creative at a time</p>
            <div className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium group-hover:bg-gray-800 transition-colors">
              Continue
            </div>
          </div>
        </Link>

      </div>
    </PageContainer>
  )
} 