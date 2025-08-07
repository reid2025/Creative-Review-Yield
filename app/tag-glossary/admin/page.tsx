// Tag Glossary Admin Interface

import dynamic from 'next/dynamic'

// Force dynamic rendering to prevent build-time pre-rendering
export const runtime = 'nodejs'

const TagGlossaryAdminPage = dynamic(
  () => import('./TagGlossaryAdminClient'),
  { 
    loading: () => <div>Loading...</div>
  }
)

export default function Page() {
  return <TagGlossaryAdminPage />
}