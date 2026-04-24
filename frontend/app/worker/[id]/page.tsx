'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { workersApi, reviewsApi, type Worker, type Review } from '@/lib/api'
import { ReviewCard } from '@/components/review-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Star, BadgeCheck, ArrowLeft, MapPin } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'

export default function WorkerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const workerId = params.id as string

  const [worker, setWorker] = useState<Worker | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)
        const [workerData, reviewsData] = await Promise.all([
          workersApi.getById(workerId),
          reviewsApi.getByWorkerId(workerId),
        ])
        setWorker(workerData)
        setReviews(reviewsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch worker details')
      } finally {
        setIsLoading(false)
      }
    }

    if (workerId) {
      fetchData()
    }
  }, [workerId])

  const handleBookNow = () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    router.push(`/book/${workerId}`)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (error || !worker) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4 text-center text-sm text-destructive">
          {error || 'Worker not found'}
        </div>
        <div className="mt-4 text-center">
          <Link href="/">
            <Button variant="outline" size="sm">Go home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Profile Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted text-xl font-semibold text-foreground">
            {worker.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                {worker.name}
              </h1>
              {worker.verified && (
                <BadgeCheck className="h-5 w-5 text-primary" />
              )}
            </div>
            
            <div className="mt-1 flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="font-normal">
                {worker.skill}
              </Badge>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">{worker.experience} yrs</span>
            </div>

            <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">{Number(worker.avg_rating || 0).toFixed(1)}</span>
                <span>({reviews.length} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{worker.pincode}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
          <p className="text-lg font-semibold text-foreground">
            ₹{worker.hourly_rate}<span className="text-sm font-normal text-muted-foreground">/hr</span>
          </p>
          {user?.role !== 'worker' && (
            <Button onClick={handleBookNow} className="shrink-0">
              Book now
            </Button>
          )}
        </div>
      </div>

      {/* Bio */}
      {worker.bio && (
        <div className="mt-8 border-t border-border pt-6">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            About
          </h2>
          <p className="mt-3 leading-relaxed text-foreground">
            {worker.bio}
          </p>
        </div>
      )}

      {/* Reviews */}
      <div className="mt-8 border-t border-border pt-6">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Reviews
        </h2>

        {reviews.length === 0 ? (
          <p className="mt-4 text-muted-foreground">No reviews yet</p>
        ) : (
          <div className="mt-4 space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
