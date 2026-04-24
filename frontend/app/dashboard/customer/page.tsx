'use client'

import { useEffect, useState } from 'react'
import { bookingsApi, type Booking } from '@/lib/api'
import { ProtectedRoute } from '@/components/protected-route'
import { BookingCard } from '@/components/booking-card'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import { Calendar, Clock, CheckCircle2, Search, ArrowRight } from 'lucide-react'

function StatCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={`rounded-xl p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-2xl font-bold text-foreground">{value}</span>
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
    </div>
  )
}

function CustomerDashboardContent() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBookings() {
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
    }

    fetchBookings()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  const pendingCount = bookings.filter(b => b.status === 'pending').length
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
  const completedCount = bookings.filter(b => b.status === 'completed').length

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
                Hello, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="mt-1 text-muted-foreground text-lg">
                Manage your service appointments and expert help.
              </p>
            </div>
            <Link href="/">
              <Button size="lg" className="rounded-xl gap-2 shadow-lg shadow-primary/20">
                <Search className="h-4 w-4" />
                Find New Workers
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard 
              title="Pending Approval" 
              value={pendingCount} 
              icon={Clock} 
              color="bg-amber-500/10 text-amber-500" 
            />
            <StatCard 
              title="Confirmed" 
              value={confirmedCount} 
              icon={Calendar} 
              color="bg-blue-500/10 text-blue-500" 
            />
            <StatCard 
              title="Completed" 
              value={completedCount} 
              icon={CheckCircle2} 
              color="bg-green-500/10 text-green-500" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main List */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                Recent Bookings
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
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">No bookings yet</h3>
                  <p className="mt-2 text-muted-foreground max-w-xs mx-auto">
                    When you book a professional, your appointment history will appear here.
                  </p>
                  <Link href="/" className="mt-6 inline-block">
                    <Button variant="outline">Find workers</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} role="customer" />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar / Quick Actions */}
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
                   <h3 className="font-bold text-foreground">Platform Tour</h3>
                   <p className="text-xs text-muted-foreground mt-1">
                      Learn how to get the most out of HireLocal in 60 seconds.
                   </p>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-900 dark:bg-card p-6 text-white overflow-hidden relative isolate border border-border shadow-xl">
                  <h3 className="text-lg font-bold">Help Center</h3>
                  <p className="mt-2 text-white/80 text-sm">
                    Need assistance with your booking or have a problem?
                  </p>
                  <Button variant="secondary" size="sm" className="mt-4 w-full font-bold bg-white text-slate-900 hover:bg-slate-100">
                    Contact Support
                  </Button>
                  <ArrowRight className="absolute -bottom-4 -right-4 h-24 w-24 text-white/10 -z-10" />
              </div>

              <div className="rounded-3xl border border-border p-6 bg-card">
                  <h3 className="font-bold text-foreground">Quick Tips</h3>
                  <ul className="mt-4 space-y-4 text-sm text-muted-foreground">
                    <li className="flex gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      Always confirm the total cost before the work starts.
                    </li>
                    <li className="flex gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      Share your exact location after the booking is confirmed.
                    </li>
                    <li className="flex gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      Review your expert to help other neighbors!
                    </li>
                  </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute allowedRole="customer">
      <CustomerDashboardContent />
    </ProtectedRoute>
  )
}
