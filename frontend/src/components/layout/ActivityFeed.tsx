import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import type { Activity } from '../../types'
import { ROLE_CONFIG } from '../../types'

interface ActivityFeedProps {
  activities: Activity[]
}

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [activities])

  const getResultIcon = (result: Activity['result']) => {
    switch (result) {
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />
      case 'error':
        return <XCircle size={16} className="text-red-500" />
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4 h-full flex flex-col shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
        <span className="ml-auto text-sm text-gray-600">{activities.length} events</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3">
        {activities.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>No activity yet</p>
            <p className="text-sm">Trigger an incident to see actions</p>
          </div>
        ) : (
          activities.map((activity) => {
            const roleConfig = ROLE_CONFIG[activity.role]
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all border border-gray-100"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{roleConfig.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-600 font-mono">
                        {formatTime(activity.timestamp)}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-xs font-semibold"
                        style={{
                          backgroundColor: `${roleConfig.color}20`,
                          color: roleConfig.color
                        }}
                      >
                        {activity.roleDisplay}
                      </span>
                      {getResultIcon(activity.result)}
                    </div>
                    <p className="text-gray-900 text-sm font-medium">{activity.action}</p>
                    {activity.details && (
                      <p className="text-gray-600 text-xs mt-1 truncate">{activity.details}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}
