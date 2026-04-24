'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Phone, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const workerName = searchParams.get('worker_name')
  const workerPhone = searchParams.get('worker_phone')

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground">
          Booking Confirmed!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your appointment with <span className="font-semibold text-foreground">{workerName}</span> has been scheduled successfully.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Worker Contact Details
          </h2>
          
          <div className="mt-4 flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-bold">
              {workerName?.charAt(0)}
            </div>
            
            <div className="text-center">
              <p className="font-semibold text-foreground text-lg">{workerName}</p>
              <div className="mt-2 flex items-center justify-center gap-2 text-primary font-medium text-xl">
                <Phone className="h-5 w-5" />
                <a href={`tel:${workerPhone}`}>{workerPhone}</a>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                You can call the worker to discuss any specific details or share your location.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link href="/dashboard/customer">
            <Button className="w-full gap-2">
              Go to Dashboard
              <Calendar className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full gap-2">
              Back to Home
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
