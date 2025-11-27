import { useState } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { useIncident } from '../../context/IncidentContext'
import { toast } from 'sonner'

interface TriggerButtonProps {
  onTrigger: () => void
  onReset: () => void
}

export const TriggerButton = ({ onTrigger, onReset }: TriggerButtonProps) => {
  const { incident, triggerIncident, resetDemo } = useIncident()
  const [isTriggering, setIsTriggering] = useState(false)

  const handleTrigger = async () => {
    setIsTriggering(true)

    try {
      // Trigger the incident
      await triggerIncident()

      // Call the provided onTrigger callback
      onTrigger()
    } finally {
      setIsTriggering(false)
    }
  }

  const handleReset = () => {
    resetDemo()
    onReset()
    toast.success('Demo reset successfully')
  }

  if (incident.isActive) {
    return (
      <button
        onClick={handleReset}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white text-sm font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 animate-pulse-slow"
      >
        <RotateCcw size={18} />
        Reset Demo
      </button>
    )
  }

  return (
    <button
      onClick={handleTrigger}
      disabled={isTriggering}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white text-sm font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
    >
      <AlertTriangle size={18} className={isTriggering ? 'animate-pulse' : ''} />
      {isTriggering ? 'Triggering Incident...' : '🚨 Trigger Production Incident'}
    </button>
  )
}
