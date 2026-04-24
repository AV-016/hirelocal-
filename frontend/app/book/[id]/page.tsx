'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { workersApi, bookingsApi, type Worker } from '@/lib/api'
import { ProtectedRoute } from '@/components/protected-route'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, BadgeCheck } from 'lucide-react'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import Link from 'next/link'

function BookingForm() {
  const params = useParams()
  const router = useRouter()
  const workerId = params.id as string

  const [worker, setWorker] = useState<Worker | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    scheduled_date: '',
    scheduled_time: '',
    description: '',
  })

  useEffect(() => {
    async function fetchWorker() {
      try {
        setIsLoading(true)
        const data = await workersApi.getById(workerId)
        setWorker(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch worker details')
      } finally {
        setIsLoading(false)
      }
    }

    if (workerId) {
      fetchWorker()
    }
  }, [workerId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!worker) return

    try {
      setIsSubmitting(true)
      setError(null)

      const scheduledDateTime = `${formData.scheduled_date}T${formData.scheduled_time}`

      const response = await bookingsApi.create({
        worker_id: workerId,
        skill_required: worker.skill,
        description: formData.description,
        scheduled_date: scheduledDateTime,
      })

      router.push(`/book/success?worker_name=${encodeURIComponent(response.worker_name)}&worker_phone=${encodeURIComponent(response.worker_phone)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (error && !worker) {
    return (
      <div className="mx-auto max-w-md px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4 text-center text-sm text-destructive">
          {error}
        </div>
        <div className="mt-4 text-center">
          <Link href="/">
            <Button variant="outline" size="sm">Go home</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!worker) return null

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

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
        Book appointment
      </h1>

      {/* Worker summary */}
      <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-card p-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
          {worker.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-medium text-foreground">{worker.name}</p>
            {worker.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
          </div>
          <p className="text-sm text-muted-foreground">
            {worker.skill} · ₹{worker.hourly_rate}/hr
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6">
        <FieldGroup>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="scheduled_date">Date</FieldLabel>
              <Input
                id="scheduled_date"
                type="date"
                min={minDate}
                value={formData.scheduled_date}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_date: e.target.value })
                }
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="scheduled_time">Time</FieldLabel>
              <Input
                id="scheduled_time"
                type="time"
                value={formData.scheduled_time}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_time: e.target.value })
                }
                required
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="description">What do you need help with?</FieldLabel>
            <Textarea
              id="description"
              placeholder="Describe the work..."
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </Field>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Booking...
              </>
            ) : (
              'Confirm booking'
            )}
          </Button>
        </FieldGroup>
      </form>
    </div>
  )
}

export default function BookingPage() {
  return (
    <ProtectedRoute allowedRole="customer">
      <BookingForm />
    </ProtectedRoute>
  )
}
