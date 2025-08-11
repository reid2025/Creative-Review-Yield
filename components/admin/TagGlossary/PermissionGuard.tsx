'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, User, Eye, Edit, Trash2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface PermissionGuardProps {
  children: ReactNode
  requireViewer?: boolean
  requireEditor?: boolean
  requireAdmin?: boolean
}

// Mock user permissions - in production, this would come from Firebase/auth
const mockUserPermissions = {
  canView: true,
  canEdit: true, 
  canDelete: false,
  canManagePermissions: false,
  role: 'editor' // viewer, editor, admin
}

const getPermissionLevel = (user: any) => {
  // In production, this would check user's actual permissions from Firebase
  return mockUserPermissions
}

export function PermissionGuard({ 
  children, 
  requireViewer = false,
  requireEditor = false,
  requireAdmin = false 
}: PermissionGuardProps) {
  const { user } = useAuth()
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              You must be signed in to access the Tag Glossary.
            </p>
            <Link href="/auth/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const permissions = getPermissionLevel(user)

  // Check permission requirements
  if (requireAdmin && !permissions.canManagePermissions) {
    return <PermissionDenied requiredLevel="Admin" currentLevel={permissions.role} />
  }

  if (requireEditor && !permissions.canEdit) {
    return <PermissionDenied requiredLevel="Editor" currentLevel={permissions.role} />
  }

  if (requireViewer && !permissions.canView) {
    return <PermissionDenied requiredLevel="Viewer" currentLevel={permissions.role} />
  }

  // Wrap children with permission context
  return (
    <div>
      {/* Permission indicator */}
      <div className="mb-4">
        <PermissionIndicator permissions={permissions} />
      </div>
      
      {/* Render children with permission context */}
      <div data-permissions={JSON.stringify(permissions)}>
        {children}
      </div>
    </div>
  )
}

function PermissionDenied({ requiredLevel, currentLevel }: { requiredLevel: string, currentLevel: string }) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Insufficient Permissions
          </h2>
          <p className="text-gray-600 mb-4">
            You need <strong>{requiredLevel}</strong> access to view this content.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Your current role: <Badge variant="outline">{currentLevel}</Badge>
          </p>
          <div className="flex space-x-3 justify-center">
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
            <Button>Request Access</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PermissionIndicator({ permissions }: { permissions: any }) {
  const getPermissionColor = (level: string) => {
    switch (level) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'editor': return 'bg-blue-100 text-blue-800'
      case 'viewer': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Access Level:</span>
              <Badge className={getPermissionColor(permissions.role)}>
                {permissions.role.charAt(0).toUpperCase() + permissions.role.slice(1)}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Eye className={`h-3 w-3 ${permissions.canView ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={permissions.canView ? 'text-green-600' : 'text-gray-400'}>View</span>
            </div>
            <div className="flex items-center space-x-1">
              <Edit className={`h-3 w-3 ${permissions.canEdit ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className={permissions.canEdit ? 'text-blue-600' : 'text-gray-400'}>Edit</span>
            </div>
            <div className="flex items-center space-x-1">
              <Trash2 className={`h-3 w-3 ${permissions.canDelete ? 'text-red-500' : 'text-gray-400'}`} />
              <span className={permissions.canDelete ? 'text-red-600' : 'text-gray-400'}>Delete</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className={`h-3 w-3 ${permissions.canManagePermissions ? 'text-purple-500' : 'text-gray-400'}`} />
              <span className={permissions.canManagePermissions ? 'text-purple-600' : 'text-gray-400'}>Admin</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}