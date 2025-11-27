import type { ReactNode } from 'react'
import { IncidentBanner } from './IncidentBanner'

interface PageLayoutProps {
  children: ReactNode
  showIncidentBanner?: boolean
}

export const PageLayout = ({ children, showIncidentBanner = true }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Incident Banner */}
      {showIncidentBanner && <IncidentBanner />}

      {/* Main Content - No sidebar */}
      <div className="h-screen overflow-auto">
        {children}
      </div>
    </div>
  )
}
