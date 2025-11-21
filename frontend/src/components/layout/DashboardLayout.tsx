import type { ReactNode } from 'react'
import { IncidentBanner } from './IncidentBanner'
import { TriggerButton } from '../ui/TriggerButton'
import { ActivityFeed } from './ActivityFeed'
import type { Activity } from '../../types'

interface DashboardLayoutProps {
  children: ReactNode
  activities: Activity[]
  onTrigger: () => void
  onReset: () => void
}

export const DashboardLayout = ({ children, activities, onTrigger, onReset }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Incident Management
              </h1>
              <p className="text-gray-400 italic">
                Demonstrating ChatKit with Role-Based Access Control
              </p>
            </div>
            <TriggerButton onTrigger={onTrigger} onReset={onReset} />
          </div>
        </div>
      </div>

      {/* Incident Banner */}
      <IncidentBanner />

      {/* Main Content - 2x2 Grid + Right Sidebar */}
      <div className="flex">
        {/* Left: 2x2 Panel Grid */}
        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 p-4">
          {/* Top Left - IT Console */}
          <div>
            {Array.isArray(children) && children[0]}
          </div>

          {/* Top Right - Operations Dashboard */}
          <div>
            {Array.isArray(children) && children[1]}
          </div>

          {/* Bottom Left - Finance Portal */}
          <div>
            {Array.isArray(children) && children[2]}
          </div>

          {/* Bottom Right - CSM Portal */}
          <div>
            {Array.isArray(children) && children[3]}
          </div>
        </div>

        {/* Right: Activity Feed Sidebar */}
        <div className="w-80 p-4 overflow-hidden">
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  )
}
