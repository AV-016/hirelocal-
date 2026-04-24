'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { WorkerCard } from '@/components/worker-card'
import { workersApi, type Worker } from '@/lib/api'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, MapPin, Search, Filter, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pincode = searchParams.get('pincode') || ''
  const skill = searchParams.get('skill') || ''

  const [workers, setWorkers] = useState<Worker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWorkers() {
      if (!pincode || !skill) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const data = await workersApi.search(pincode, skill)
        setWorkers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch workers')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkers()
  }, [pincode, skill])

  if (!pincode || !skill) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="rounded-full bg-amber-500/10 p-6 mb-6">
           <AlertCircle className="h-12 w-12 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Missing Search Details</h2>
        <p className="mt-2 text-muted-foreground max-w-sm">
          Please select both a pincode and a service type from the home page to find experts.
        </p>
        <Link href="/" className="mt-8">
          <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">
            Go back to Home
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.03]" />
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] bg-primary rounded-full bg-blob translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] bg-blue-500 rounded-full bg-blob -translate-x-1/2 translate-y-1/2" />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-border">
          <div className="flex items-start gap-4">
            <button
              onClick={() => router.back()}
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card hover:bg-muted transition-colors shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                {skill}s <span className="text-primary">Available</span>
              </h1>
              <div className="mt-1 flex items-center gap-2 text-muted-foreground font-medium">
                <div className="flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-lg text-sm">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span>Near {pincode}</span>
                </div>
                <span className="text-border">|</span>
                <span className="text-sm font-bold text-foreground/70">{workers.length} results found</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl gap-2 h-11 px-5">
               <Filter className="h-4 w-4" />
               Filter
            </Button>
            <Link href="/">
               <Button variant="outline" className="rounded-xl h-11 px-5">
                  Change Location
               </Button>
            </Link>
          </div>
        </div>

        {/* Results Container */}
        <div className="mt-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Spinner className="h-10 w-10 text-primary" />
              <p className="mt-4 text-muted-foreground font-medium animate-pulse">Searching for experts...</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-center animate-shake">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-4" />
              <h3 className="text-lg font-bold text-destructive">Search Failed</h3>
              <p className="mt-1 text-destructive/80">{error}</p>
              <Button variant="outline" className="mt-6 border-destructive/20" onClick={() => window.location.reload()}>
                 Try Again
              </Button>
            </div>
          ) : workers.length === 0 ? (
            <div className="py-24 text-center rounded-3xl border-2 border-dashed border-border bg-card/50 backdrop-blur-sm">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                 <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">No {skill.toLowerCase()}s found</h3>
              <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
                We couldn&apos;t find any verified professionals in <span className="font-bold text-foreground">{pincode}</span> right now.
              </p>
              <div className="mt-10 flex justify-center gap-4">
                <Link href="/">
                  <Button className="rounded-xl px-8">Change Pincode</Button>
                </Link>
                <Button variant="outline" className="rounded-xl px-8" onClick={() => router.back()}>
                   Try another service
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {workers.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
