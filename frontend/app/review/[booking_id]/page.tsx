'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { reviewsApi } from '@/lib/api'
import { ProtectedRoute } from '@/components/protected-route'
import { StarRating } from '@/components/star-rating'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft } from 'lucide-react'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'

function ReviewForm() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.booking_id as string

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      await reviewsApi.submit({
        booking_id: bookingId,
        rating,
        comment,
      })

      router.push('/dashboard/customer')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-xl font-bold text-foreground sm:text-2xl">
        Leave a review
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Help others by sharing your experience
      </p>

      {error && (
        <div className="mt-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6">
        <FieldGroup>
          <Field>
            <FieldLabel>How was it?</FieldLabel>
            <div className="mt-2">
              <StarRating value={rating} onChange={setRating} />
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="comment">Your review</FieldLabel>
            <Textarea
              id="comment"
              placeholder="What did you like or dislike?"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </Field>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Submitting...
              </>
            ) : (
              'Submit review'
            )}
          </Button>
        </FieldGroup>
      </form>
    </div>
  )
}

export default function ReviewPage() {
  return (
    <ProtectedRoute allowedRole="customer">
      <ReviewForm />
    </ProtectedRoute>
  )
}
