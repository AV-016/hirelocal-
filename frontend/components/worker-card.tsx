import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Star, BadgeCheck } from 'lucide-react'
import type { Worker } from '@/lib/api'

interface WorkerCardProps {
  worker: Worker
}

export function WorkerCard({ worker }: WorkerCardProps) {
  return (
    <Link
      href={`/worker/${worker.id}`}
      className="group block rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-base font-semibold text-foreground">
          {worker.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-medium text-foreground group-hover:text-primary">
              {worker.name}
            </h3>
            {worker.verified && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />
            )}
          </div>
          
          <div className="mt-0.5 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium text-foreground">
                {Number(worker.avg_rating || 0).toFixed(1)}
              </span>
            </div>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">
              {worker.experience} yrs exp
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        <Badge variant="secondary" className="font-normal">
          {worker.skill}
        </Badge>
        <span className="text-sm font-semibold text-foreground">
          ₹{worker.hourly_rate}<span className="font-normal text-muted-foreground">/hr</span>
        </span>
      </div>
    </Link>
  )
}
