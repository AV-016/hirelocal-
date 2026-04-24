'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi, type SignupData } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'

const SKILLS = [
  'Plumber',
  'Electrician',
  'Carpenter',
  'Painter',
  'AC Technician',
  'Appliance Repair',
  'Pest Control',
  'Cleaning',
]



export default function SignupPage() {
  const router = useRouter()

  const [formData, setFormData] = useState<SignupData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    pincode: '',
    role: 'customer',
    skill: '',
    experience: 0,
    hourly_rate: 0,
    bio: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isWorker = formData.role === 'worker'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      setError(null)

      const submitData: SignupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        pincode: formData.pincode,
        role: formData.role,
      }

      if (isWorker) {
        submitData.skill = formData.skill
        submitData.experience = formData.experience
        submitData.hourly_rate = formData.hourly_rate
        submitData.bio = formData.bio
      }

      await authApi.signup(submitData)
      router.push('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Create an account
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isWorker ? 'Start getting local jobs' : 'Find skilled workers near you'}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Role tabs */}
        <div className="mb-6 flex rounded-lg border border-border p-1">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'customer' })}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              !isWorker
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            I need help
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'worker' })}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isWorker
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            I offer services
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <Input
                id="name"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </Field>



            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="pincode">Pincode</FieldLabel>
                <Input
                  id="pincode"
                  placeholder="400001"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  required
                  pattern="[0-9]{6}"
                />
              </Field>
            </div>

            {isWorker && (
              <>
                <Field>
                  <FieldLabel htmlFor="skill">What do you do?</FieldLabel>
                  <Select
                    value={formData.skill}
                    onValueChange={(value) => setFormData({ ...formData, skill: value })}
                  >
                    <SelectTrigger id="skill">
                      <SelectValue placeholder="Select your skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILLS.map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel htmlFor="experience">Experience (yrs)</FieldLabel>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      max="50"
                      placeholder="5"
                      value={formData.experience || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })
                      }
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="hourly_rate">Rate (per hr)</FieldLabel>
                    <Input
                      id="hourly_rate"
                      type="number"
                      min="0"
                      placeholder="500"
                      value={formData.hourly_rate || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, hourly_rate: parseInt(e.target.value) || 0 })
                      }
                      required
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="bio">About you</FieldLabel>
                  <Textarea
                    id="bio"
                    placeholder="Tell customers about your experience..."
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </Field>
              </>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </FieldGroup>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
