import { getScoreColor } from '@/lib/utils'

interface ScoreCircleProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
}

export function ScoreCircle({ score, size = 'md', showLabel, label }: ScoreCircleProps) {
  const sizeMap = { sm: 80, md: 120, lg: 160 }
  const strokeMap = { sm: 6, md: 8, lg: 10 }
  const fontSizeMap = { sm: 'text-lg', md: 'text-3xl', lg: 'text-4xl' }

  const s = sizeMap[size]
  const stroke = strokeMap[size]
  const radius = (s - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 5) * circumference
  const colorClass = getScoreColor(score)

  const strokeColor =
    score >= 3.5 ? '#059669' : score >= 2.5 ? '#D97706' : '#DC2626'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: s, height: s }}>
        <svg width={s} height={s} className="-rotate-90">
          <circle
            cx={s / 2}
            cy={s / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={stroke}
          />
          <circle
            cx={s / 2}
            cy={s / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${fontSizeMap[size]} ${colorClass}`}>
            {score.toFixed(1)}
          </span>
        </div>
      </div>
      {showLabel && label && (
        <span className="text-sm text-gray-500 font-medium">{label}</span>
      )}
    </div>
  )
}
