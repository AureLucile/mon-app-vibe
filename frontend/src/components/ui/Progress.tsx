import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  indicatorClassName?: string
}

export function Progress({ value, max = 100, className, indicatorClassName }: ProgressProps) {
  const percent = Math.min((value / max) * 100, 100)

  return (
    <div className={cn('h-2 w-full rounded-full bg-gray-100 overflow-hidden', className)}>
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500',
          percent >= 70 ? 'bg-[#00A15F]' : percent >= 50 ? 'bg-[#E4751F]' : 'bg-[#E2001A]',
          indicatorClassName
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
