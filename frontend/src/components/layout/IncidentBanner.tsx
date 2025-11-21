import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useIncident } from '../../context/IncidentContext'

export const IncidentBanner = () => {
  const { incident } = useIncident()
  const [duration, setDuration] = useState('')

  useEffect(() => {
    if (!incident.isActive || !incident.startTime) {
      setDuration('')
      return
    }

    const updateDuration = () => {
      const now = new Date()
      const diff = now.getTime() - incident.startTime!.getTime()
      const minutes = Math.floor(diff / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }

    updateDuration()
    const interval = setInterval(updateDuration, 1000)

    return () => clearInterval(interval)
  }, [incident.isActive, incident.startTime])

  const priorityColors = {
    P1: 'bg-red-600 border-red-500',
    P2: 'bg-orange-600 border-orange-500',
    P3: 'bg-yellow-600 border-yellow-500',
    P4: 'bg-blue-600 border-blue-500'
  }

  const statusColors = {
    OPEN: 'bg-gray-500',
    INVESTIGATING: 'bg-yellow-500',
    RESOLVED: 'bg-green-500',
    CLOSED: 'bg-blue-500'
  }

  return (
    <AnimatePresence>
      {incident.isActive && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={`w-full border-l-4 ${priorityColors[incident.priority]} bg-slate-800 px-6 py-4`}
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <AlertTriangle className="text-white animate-pulse-slow" size={24} />
              <div className="flex items-center gap-3">
                <span className="text-white font-bold text-lg">Active Incident:</span>
                <span className="text-white">{incident.incidentId}</span>
                <span className="text-gray-300">-</span>
                <span className="text-white">{incident.title}</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Priority:</span>
                <span className={`px-2 py-1 rounded text-white text-sm font-semibold ${priorityColors[incident.priority]}`}>
                  {incident.priority}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Status:</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${statusColors[incident.status]} pulse-dot`} />
                  <span className="text-white text-sm font-medium">{incident.status}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Duration:</span>
                <span className="text-white text-sm font-mono">{duration}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
