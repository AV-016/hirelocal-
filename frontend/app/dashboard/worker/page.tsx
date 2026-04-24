'use client'

import { useEffect, useState, useCallback } from 'react'
import { bookingsApi, type Booking } from '@/lib/api'
import { ProtectedRoute } from '@/components/protected-route'
import { BookingCard } from '@/components/booking-card'
import { Spinner } from '@/components/ui/spinner'
import { Star, Wallet, Briefcase, Bell, Settings, TrendingUp } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

function StatCard({ title, value, icon: Icon, color, subValue }: { title: string, value: string | number, icon: any, color: string, subValue?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={`rounded-xl p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          {subValue && <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>}
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
    </div>
  )
}

function WorkerDashboardContent() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await bookingsApi.getMy()
      setBookings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleConfirm = async (id: string) => {
    try {
      setIsActionLoading(true)
      await bookingsApi.confirm(id)
      const data = await bookingsApi.getMy()
      setBookings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm booking')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleCancel = async (id: string) => {
    try {
      setIsActionLoading(true)
      await bookingsApi.cancel(id)
      const data = await bookingsApi.getMy()
      setBookings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleComplete = async (id: string) => {
    try {
      setIsActionLoading(true)
      await bookingsApi.complete(id)
      const data = await bookingsApi.getMy()
      setBookings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete booking')
    } finally {
      setIsActionLoading(false)
    }
  }

  const completedBookings = bookings.filter((b) => b.status === 'completed')
  const completedCount = completedBookings.length
  const totalEarnings = completedBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0)
  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const activeCount = bookings.filter((b) => b.status === 'confirmed').length

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.03]" />
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] bg-primary rounded-full bg-blob translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] bg-blue-500 rounded-full bg-blob -translate-x-1/2 translate-y-1/2" />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground">
                Expert Dashboard
              </h1>
              <p className="mt-1 text-muted-foreground text-lg">
                Manage your availability and service requests.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-xl">
                 <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-xl">
                 <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <StatCard 
              title="Total Earned" 
              value={`₹${totalEarnings.toLocaleString('en-IN')}`} 
              icon={Wallet} 
              color="bg-green-500/10 text-green-500"
              subValue={`${completedCount} jobs done`}
            />
            <StatCard 
              title="Avg Rating" 
              value={Number(user?.avg_rating || 0).toFixed(1)} 
              icon={Star} 
              color="bg-amber-500/10 text-amber-500"
              subValue="Based on recent reviews"
            />
             <StatCard 
              title="Pending" 
              value={pendingCount} 
              icon={Bell} 
              color="bg-blue-500/10 text-blue-500"
              subValue="New requests"
            />
             <StatCard 
              title="Active" 
              value={activeCount} 
              icon={Briefcase} 
              color="bg-purple-500/10 text-purple-500"
              subValue="Ongoing jobs"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                Recent Requests
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">
                  {bookings.length}
                </span>
              </h2>

              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              {!error && bookings.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-border p-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">No requests yet</h3>
                  <p className="mt-2 text-muted-foreground max-w-xs mx-auto">
                    Keep your profile updated. New job requests from customers will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      role="worker"
                      onConfirm={handleConfirm}
                      onCancel={handleCancel}
                      onComplete={handleComplete}
                      isLoading={isActionLoading}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="aspect-video relative group cursor-pointer">
                   <video 
                     className="h-full w-full object-cover" 
                     controls
                   >
                     <source src="/HireLocal_Finding_Local_Experts_Made_Easy.mp4" type="video/mp4" />
                   </video>
                </div>
                <div className="p-4">
                   <h3 className="font-bold text-foreground">Expert Guide</h3>
                   <p className="text-xs text-muted-foreground mt-1">
                      Learn how to grow your business on HireLocal.
                   </p>
                </div>
              </div>

               <div className="rounded-3xl bg-slate-900 dark:bg-card p-6 text-white overflow-hidden relative isolate border border-border shadow-xl">
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Growth Tip</span>
                  </div>
                  <h3 className="text-lg font-bold">Boost Visibility</h3>
                  <p className="mt-2 text-white/70 text-sm">
                    Workers with a detailed bio and at least 3 reviews are 4x more likely to be booked.
                  </p>
                  <Button variant="secondary" size="sm" className="mt-4 w-full font-bold bg-white text-slate-900 hover:bg-slate-100">
                    Update Profile
                  </Button>
               </div>

               <div className="rounded-3xl border border-border p-6 bg-card">
                  <h3 className="font-bold text-foreground">Performance</h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground uppercase">Response Rate</span>
                        <span className="font-bold text-foreground">98%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                         <div className="h-full bg-primary w-[98%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground uppercase">Completion Rate</span>
                        <span className="font-bold text-foreground">85%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 w-[85%]" />
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WorkerDashboardPage() {
  return (
    <ProtectedRoute allowedRole="worker">
      <WorkerDashboardContent />
    </ProtectedRoute>
  )
}
