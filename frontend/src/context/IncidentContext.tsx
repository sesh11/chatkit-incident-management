import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { IncidentState } from '../types'

interface IncidentContextType {
  incident: IncidentState
  triggerIncident: () => Promise<void>
  resetDemo: () => void
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined)

export const useIncident = () => {
  const context = useContext(IncidentContext)
  if (!context) {
    throw new Error('useIncident must be used within IncidentProvider')
  }
  return context
}

interface IncidentProviderProps {
  children: ReactNode
}

export const IncidentProvider = ({ children }: IncidentProviderProps) => {
  const [incident, setIncident] = useState<IncidentState>({
    isActive: false,
    incidentId: null,
    title: '',
    priority: 'P2',
    status: 'OPEN',
    startTime: null
  })

  const triggerIncident = async () => {
    // Simulate API call to create incident
    const newIncident: IncidentState = {
      isActive: true,
      incidentId: 'INC-001',
      title: 'Production Database Slowdown',
      priority: 'P2',
      status: 'INVESTIGATING',
      startTime: new Date()
    }

    setIncident(newIncident)
  }

  const resetDemo = () => {
    setIncident({
      isActive: false,
      incidentId: null,
      title: '',
      priority: 'P2',
      status: 'OPEN',
      startTime: null
    })
  }

  return (
    <IncidentContext.Provider value={{ incident, triggerIncident, resetDemo }}>
      {children}
    </IncidentContext.Provider>
  )
}
