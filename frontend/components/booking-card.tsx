'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  ArrowUpRight, 
  Clock, 
  User, 
  Briefcase, 
  CreditCard,
  FileText
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Booking } from '@/lib/api'

interface BookingCardProps {
  booking: Booking
  role: 'customer' | 'worker'
  onConfirm?: (id: string) => void
  onCancel?: (id: string) => void
  onComplete?: (id: string) => void
  isLoading?: boolean
}

const statusConfig: Record<string, { label: string, color: string, icon: any }> = {
  pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-200/50', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-500/10 text-blue-600 border-blue-200/50', icon: CheckCircle2 },
  completed: { label: 'Completed', color: 'bg-green-500/10 text-green-600 border-green-200/50', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/10 text-red-600 border-red-200/50', icon: XCircle },
}

export function BookingCard({
  booking,
  role,
  onConfirm,
  onCancel,
  onComplete,
  isLoading,
}: BookingCardProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const displayName = role === 'customer' ? booking.worker_name : booking.customer_name
  const config = statusConfig[booking.status] || { label: booking.status, color: 'bg-muted', icon: Calendar }

  return (
    <div className="group relative rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/20 hover:shadow-md animate-fade-in">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-base font-bold text-foreground">
              {displayName?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="truncate font-bold text-foreground text-lg">{displayName}</p>
              <div className="flex items-center gap-2">
                 <Badge variant="secondary" className="font-normal text-[10px] uppercase tracking-wider h-5">
                  {booking.skill_required}
                </Badge>
              </div>
            </div>
          </div>
          
          <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-tighter ${config.color} border flex items-center gap-1`}>
            <config.icon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-xl">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground/80">{formatDate(booking.scheduled_date)}</span>
          </div>
          {role === 'customer' && booking.status === 'confirmed' && (
             <div className="flex items-center gap-2 text-sm text-primary bg-primary/5 px-3 py-2 rounded-xl font-bold">
                <ArrowUpRight className="h-4 w-4" />
                Expert is Coming
             </div>
          )}
        </div>

        {booking.description && (
          <div className="rounded-xl bg-muted/20 p-3">
            <p className="line-clamp-2 text-sm text-muted-foreground italic leading-relaxed">
              &ldquo;{booking.description}&rdquo;
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex gap-2">
            {role === 'worker' && booking.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  className="rounded-xl px-4 font-bold shadow-md shadow-primary/20"
                  onClick={() => onConfirm?.(booking.id)}
                  disabled={isLoading}
                >
                  Accept Job
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-xl text-destructive hover:bg-destructive/5"
                  onClick={() => onCancel?.(booking.id)}
                  disabled={isLoading}
                >
                  Decline
                </Button>
              </>
            )}
            {role === 'worker' && booking.status === 'confirmed' && (
              <Button
                size="sm"
                className="rounded-xl px-4 font-bold bg-blue-600 hover:bg-blue-700"
                onClick={() => onComplete?.(booking.id)}
                disabled={isLoading}
              >
                Mark as Completed
              </Button>
            )}
            {role === 'customer' && booking.status === 'completed' && !booking.has_review && (
              <Link href={`/review/${booking.id}`}>
                <Button size="sm" variant="outline" className="rounded-xl gap-2 font-bold border-primary/20 text-primary hover:bg-primary/5">
                  <MessageSquare className="h-4 w-4" />
                  Leave Feedback
                </Button>
              </Link>
            )}
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                 View Details
                 <ArrowUpRight className="h-3 w-3" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Booking Details</DialogTitle>
                <DialogDescription>
                  Detailed overview of this service appointment.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Status Banner */}
                <div className={`rounded-2xl border px-4 py-3 flex items-center justify-between ${config.color}`}>
                   <div className="flex items-center gap-2">
                      <config.icon className="h-5 w-5" />
                      <span className="font-bold uppercase tracking-wider text-sm">{config.label}</span>
                   </div>
                   <span className="text-xs font-medium opacity-70">ID: {booking.id.slice(0, 8)}...</span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {role === 'customer' ? 'Professional' : 'Customer'}
                      </p>
                      <p className="font-bold text-foreground text-lg">{displayName}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        Service Type
                      </p>
                      <p className="font-bold text-foreground text-lg">{booking.skill_required}</p>
                   </div>
                </div>

                <div className="space-y-3">
                   <div className="flex items-start gap-3">
                      <div className="rounded-full bg-muted p-2 mt-0.5">
                         <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Scheduled For</p>
                        <p className="text-sm font-medium text-foreground">{formatFullDate(booking.scheduled_date)}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <div className="rounded-full bg-muted p-2 mt-0.5">
                         <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase">Booked On</p>
                        <p className="text-sm font-medium text-foreground">{formatFullDate(booking.created_at)}</p>
                      </div>
                   </div>
                </div>

                <div className="rounded-2xl border border-border bg-muted/20 p-4">
                   <p className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      Work Description
                   </p>
                   <p className="text-sm text-foreground leading-relaxed italic">
                      &ldquo;{booking.description}&rdquo;
                   </p>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                   <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <span className="font-bold text-foreground">Total Charged</span>
                   </div>
                   <span className="text-2xl font-black text-primary">
                      ₹{Number(booking.total_amount || user?.hourly_rate || 0).toLocaleString('en-IN')}
                   </span>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-2">
                <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
                  Close
                </Button>
                {role === 'customer' && booking.status === 'completed' && !booking.has_review && (
                   <Link href={`/review/${booking.id}`}>
                      <Button className="rounded-xl gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Leave Feedback
                      </Button>
                   </Link>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
