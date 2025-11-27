import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface MetricTileProps {
  value: string | number
  label: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  color?: string
  subtext?: string
}

export const MetricTile = ({
  value,
  label,
  icon,
  trend,
  color = '#6B7280',
  subtext
}: MetricTileProps) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUp size={16} className="text-green-600" />
    if (trend === 'down') return <ArrowDown size={16} className="text-red-600" />
    return null
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 hover:shadow-xl transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        {icon && (
          <div
            className="p-2 rounded-xl"
            style={{ backgroundColor: `${color}15` }}
          >
            {icon}
          </div>
        )}
        {getTrendIcon()}
      </div>

      <div className="mt-1">
        <div
          className="text-3xl font-bold mb-2"
          style={{ color }}
        >
          {value}
        </div>
        <div className="text-sm font-medium text-gray-600">
          {label}
        </div>
        {subtext && (
          <div className="text-xs text-gray-500 mt-1">
            {subtext}
          </div>
        )}
      </div>
    </motion.div>
  )
}
