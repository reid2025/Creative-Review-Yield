'use client'

import { UserMenu } from '@/components/UserMenu'

export function HeaderActions() {
  return (
    <div className="flex items-center gap-4">
      <UserMenu />
    </div>
  )
}