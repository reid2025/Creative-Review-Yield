// Main Tag Glossary page

import { TagGlossary } from '@/components/admin/TagGlossary'
import { PermissionGuard } from '@/components/admin/TagGlossary/PermissionGuard'

export default function TagGlossaryPage() {
  return (
    <PermissionGuard requireViewer>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <TagGlossary />
      </div>
    </PermissionGuard>
  )
}