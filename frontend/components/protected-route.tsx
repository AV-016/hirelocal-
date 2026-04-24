'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { Spinner } from '@/components/ui/spinner'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRole?: 'customer' | 'worker'
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
    if (!isLoading && isAuthenticated && allowedRole && user?.role !== allowedRole) {
      router.push(user?.role === 'worker' ? '/dashboard/worker' : '/dashboard/customer')
    }
  }, [isLoading, isAuthenticated, router, allowedRole, user])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (allowedRole && user?.role !== allowedRole) {
    return null
  }

  return <>{children}</>
}
