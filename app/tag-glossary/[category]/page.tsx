// Category-specific tag view page

import { notFound } from 'next/navigation'
import { TagGlossary } from '@/components/admin/TagGlossary'
import { PermissionGuard } from '@/components/admin/TagGlossary/PermissionGuard'
import { MOCK_CATEGORIES } from '@/components/admin/TagGlossary/mockData'

interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const unwrappedParams = await params
  // Validate category exists
  const category = MOCK_CATEGORIES.find(c => c.id === unwrappedParams.category)
  
  if (!category) {
    notFound()
  }

  return (
    <PermissionGuard requireViewer>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {category.displayName} Tags
          </h1>
          <p className="text-gray-600 mt-1">
            {category.description}
          </p>
        </div>
        
        <TagGlossary initialCategory={category.id} />
      </div>
    </PermissionGuard>
  )
}

// Generate static params for all categories
export async function generateStaticParams() {
  return MOCK_CATEGORIES.map((category) => ({
    category: category.id,
  }))
}

// Metadata for the page
export async function generateMetadata({ params }: CategoryPageProps) {
  const unwrappedParams = await params
  const category = MOCK_CATEGORIES.find(c => c.id === unwrappedParams.category)
  
  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  return {
    title: `${category.displayName} Tags - Tag Glossary`,
    description: category.description,
  }
}