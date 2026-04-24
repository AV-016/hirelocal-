'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, ShieldCheck, Zap, Users, Star, ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { toast } from 'sonner'

export default function LandingPage() {
  const router = useRouter()
  const [pincode, setPincode] = useState('')
  const [skill, setSkill] = useState('')

  const [supportedPincodes, setSupportedPincodes] = useState<string[]>([])

  useEffect(() => {
    async function fetchPincodes() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/workers/pincodes`)
        if (response.ok) {
          const data = await response.json()
          setSupportedPincodes(data)
        }
      } catch (err) {
        console.error('Failed to fetch pincodes:', err)
      }
    }
    fetchPincodes()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pincode || !skill) {
      toast.error('Please enter both Pincode and Service Type')
      return
    }

    if (pincode.length !== 6) {
      toast.error('Pincode must be exactly 6 digits')
      return
    }

    if (!supportedPincodes.includes(pincode)) {
      toast.error(`Service not available in ${pincode} yet.`, {
        description: 'Try 824101 or 823001 for testing.'
      })
      return
    }

    router.push(`/search?pincode=${pincode}&skill=${skill}`)
  }

  const skills = ['Plumber', 'Electrician', 'Painter', 'Carpenter', 'Cleaner', 'Mechanic']

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Global Background Decorations */}
      <div className="fixed inset-0 -z-10 bg-grid-pattern opacity-[0.02]" />
      
      {/* Animated Floating Background Icons */}
      <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] animate-float-slow opacity-[0.03] text-primary">
          <Zap size={120} />
        </div>
        <div className="absolute top-[60%] left-[15%] animate-float-medium opacity-[0.02] text-blue-500">
          <Search size={150} />
        </div>
        <div className="absolute top-[20%] right-[10%] animate-float-slow opacity-[0.03] text-primary">
          <ShieldCheck size={140} />
        </div>
        <div className="absolute top-[70%] right-[20%] animate-float-medium opacity-[0.02] text-blue-500">
          <Star size={100} />
        </div>
        <div className="absolute top-[40%] left-[40%] animate-float-slow opacity-[0.01] text-foreground">
          <Users size={200} />
        </div>
      </div>

      <div className="fixed top-0 left-0 -z-10 h-[1000px] w-[1000px] bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="fixed bottom-0 right-0 -z-10 h-[800px] w-[800px] bg-blue-500/5 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
      
      {/* Abstract floating shapes */}
      <div className="absolute top-1/4 left-10 h-12 w-12 rounded-xl bg-primary/10 rotate-12 animate-bounce opacity-20 hidden lg:block" />
      <div className="absolute top-1/3 right-20 h-20 w-20 rounded-full border border-primary/20 animate-pulse opacity-20 hidden lg:block" />
      <div className="absolute bottom-1/4 left-1/4 h-8 w-8 rounded bg-blue-500/10 -rotate-12 animate-bounce opacity-20 hidden lg:block" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(34,197,94,0.08)_0%,rgba(255,255,255,0)_100%)]" />
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mt-8 text-4xl font-bold tracking-tight text-foreground sm:text-6xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Find the Best <span className="text-primary">Local Experts</span> for Your Home
            </h1>
            
            <p className="mt-6 text-lg leading-8 text-muted-foreground animate-slide-up" style={{ animationDelay: '0.2s' }}>
              HireLocal connects you with verified professionals in your neighborhood. Get help in minutes, not days.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <form onSubmit={handleSearch} className="flex w-full max-w-2xl flex-col sm:flex-row items-center gap-2 rounded-2xl border border-border bg-background p-2 shadow-2xl focus-within:ring-2 focus-within:ring-primary/20">
                <div className="flex flex-1 items-center gap-2 px-3 w-full sm:w-auto">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="text" 
                    placeholder="Pincode" 
                    className="border-0 bg-transparent p-0 text-lg focus-visible:ring-0" 
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>
                <div className="h-8 w-px bg-border hidden sm:block" />
                <div className="flex flex-1 items-center gap-2 px-3 w-full sm:w-auto">
                  <Select value={skill} onValueChange={setSkill}>
                    <SelectTrigger className="w-full border-0 bg-transparent shadow-none text-lg focus:ring-0 px-0 h-auto">
                      <SelectValue placeholder="Select Service" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border bg-card/95 backdrop-blur-xl">
                      {skills.map((s) => (
                        <SelectItem key={s} value={s} className="rounded-xl focus:bg-primary/10">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" size="lg" className="rounded-xl px-8 w-full sm:w-auto shadow-lg shadow-primary/20">
                  Search
                </Button>
              </form>

              {supportedPincodes.length > 0 && (
                <p className="mt-3 text-xs text-muted-foreground animate-fade-in">
                  Popular: {supportedPincodes.slice(0, 3).join(', ')}
                </p>
              )}
            </div>

            <div className="mt-12 flex items-center justify-center gap-x-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="inline-block h-8 w-8 rounded-full border-2 border-background bg-muted" />
                ))}
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                <span className="text-foreground font-bold">500+</span> experts already joined
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to get the job done
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A complete platform built for transparency, speed, and reliability.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mt-24 lg:max-w-none lg:grid-cols-3">
            {[
              {
                title: 'Verified Professionals',
                desc: 'Every worker goes through a verification process to ensure your safety and quality of work.',
                icon: ShieldCheck,
                color: 'bg-blue-500/10 text-blue-500'
              },
              {
                title: 'Hyperlocal Search',
                desc: 'Find workers within your exact pincode, minimizing wait times and travel costs.',
                icon: MapPin,
                color: 'bg-green-500/10 text-green-500'
              },
              {
                title: 'Secure Bookings',
                desc: 'Book appointments, track status, and leave reviews all in one secure platform.',
                icon: Users,
                color: 'bg-purple-500/10 text-purple-500'
              }
            ].map((feature, i) => (
              <div key={i} className="relative flex flex-col rounded-3xl border border-border bg-background p-8 transition-all hover:shadow-lg hover:-translate-y-1">
                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 sm:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-x-12 gap-y-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Get your home fixed in <span className="text-primary">3 simple steps</span>
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                We've simplified the process of finding and hiring home service professionals.
              </p>

              <dl className="mt-10 space-y-8">
                {[
                  { step: '01', title: 'Search by Pincode', desc: 'Enter your location to see all available experts in your area.' },
                  { step: '02', title: 'Choose & Book', desc: 'Compare profiles, ratings, and rates. Book an appointment that fits your schedule.' },
                  { step: '03', title: 'Get it Fixed', desc: 'The professional arrives, completes the job, and you leave a review.' }
                ].map((item, i) => (
                  <div key={i} className="relative pl-16">
                    <dt className="text-xl font-bold text-foreground">
                      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-background font-black">
                        {item.step}
                      </div>
                      {item.title}
                    </dt>
                    <dd className="mt-2 text-muted-foreground">{item.desc}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl bg-muted overflow-hidden shadow-2xl border-4 border-white">
                <video 
                  className="h-full w-full object-cover" 
                  controls 
                  poster="/hero-video-poster.png"
                  autoPlay
                  muted
                  loop
                >
                  <source src="/HireLocal_Finding_Local_Experts_Made_Easy.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-2xl bg-primary/10 -z-10" />
              <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full bg-primary/5 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-16 overflow-hidden relative isolate shadow-2xl">
             <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-[0.03]" />
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                   <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                     Ready to get started?
                   </h2>
                   <p className="mt-4 text-lg text-muted-foreground">
                     Whether you need a job done or you're looking to offer your skills, joining HireLocal takes less than 2 minutes.
                   </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
                   <Link href="/signup">
                      <Button size="lg" className="rounded-xl px-12 h-14 text-lg shadow-xl shadow-primary/20">
                        Join Now
                      </Button>
                   </Link>
                   <Link href="/login">
                      <Button size="lg" variant="outline" className="rounded-xl px-12 h-14 text-lg">
                        Login
                      </Button>
                   </Link>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="relative isolate overflow-hidden bg-primary px-6 py-24 shadow-2xl rounded-3xl sm:px-24 xl:py-32">
          <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Are you a skilled professional?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-lg leading-8 text-white/80">
            Join HireLocal today and start getting high-quality job leads from your own neighborhood.
          </p>
          <div className="mt-10 flex justify-center gap-x-6">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="font-bold">
                Join as a Worker
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 font-medium">
                Learn more <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          {/* Background circles */}
          <svg
            viewBox="0 0 1024 1024"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
            aria-hidden="true"
          >
            <circle cx="512" cy="512" r="512" fill="url(#circle)" fillOpacity="0.7" />
            <defs>
              <radialGradient id="circle">
                <stop stopColor="white" />
                <stop offset="1" stopColor="#22c55e" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xl font-black text-primary">hirelocal</div>
          <p className="text-sm text-muted-foreground">
            &copy; 2026 HireLocal. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
