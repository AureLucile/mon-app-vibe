import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-700',
        success: 'bg-[#00A15F]/10 text-[#00A15F] border border-[#00A15F]/20',
        warning: 'bg-[#E4751F]/10 text-[#E4751F] border border-[#E4751F]/20',
        danger: 'bg-[#E2001A]/10 text-[#E2001A] border border-[#E2001A]/20',
        info: 'bg-[#009EE0]/10 text-[#009EE0] border border-[#009EE0]/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />
}

export function ScoreBadge({ score }: { score: number }) {
  const variant = score >= 3.5 ? 'success' : score >= 2.5 ? 'warning' : 'danger'
  return <Badge variant={variant}>{score.toFixed(1)}/5</Badge>
}
