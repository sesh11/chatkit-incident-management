import type { ReactNode } from 'react'
import { ActivityFeed } from './ActivityFeed'
import { IncidentBanner } from './IncidentBanner'
import type { Activity } from '../../types'

interface PageLayoutProps {
  children: ReactNode
  activities: Activity[]
  showIncidentBanner?: boolean
}

export const PageLayout = ({ children, activities, showIncidentBanner = true }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Incident Banner */}
      {showIncidentBanner && <IncidentBanner />}

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Left: Main Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>

        {/* Right: Activity Feed Sidebar */}
        <div className="w-80 p-4 overflow-hidden border-l border-slate-700">
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  )
}
