import { PageLayout } from '../components/layout/PageLayout'
import { BackButton } from '../components/ui/BackButton'
import { ChatKitPanel } from '../components/chat/ChatKitPanel'
import { MetricTile } from '../components/ui/MetricTile'
import { useIncident } from '../context/IncidentContext'
import { Users, AlertTriangle, Clock } from 'lucide-react'
import type { Activity } from '../types'
import { ActivityFeed } from '../components/layout/ActivityFeed'

interface OperationsPageProps {
  activities: Activity[]
  onToolCall?: (toolName: string, result: any) => void
}

export const OperationsPage = ({ activities, onToolCall }: OperationsPageProps) => {
  const { incident } = useIncident()

  return (
    <PageLayout>
      <div className="h-full bg-white">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Operations Dashboard</h2>
          <BackButton />
        </div>

        {/* Main Content */}
        <div className="h-[calc(100vh-110px)] px-6 pb-6 flex flex-row gap-4 overflow-hidden">
          {/* LEFT: Metrics Panel */}
          <div className="flex-1 overflow-y-auto">
                {incident.isActive && (
                  <div className="p-3 space-y-2 bg-gray-50 rounded-xl">
                    {/* Business Impact Overview */}
                    <div>
                      <h4 className="text-gray-900 font-semibold text-base mb-2">
                        Business Impact Overview
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                      <MetricTile
                        icon={<Users size={24} className="text-purple-600" />}
                        value="500"
                        label="Affected Customers"
                        color="#6D28D9"
                      />
                      <MetricTile
                        icon={<AlertTriangle size={24} className="text-red-600" />}
                        value="12"
                        label="SLA Violations"
                        color="#DC2626"
                      />
                      <MetricTile
                        icon={<Clock size={24} className="text-orange-600" />}
                        value={incident.priority}
                        label="Current Priority"
                        color="#EA580C"
                      />
                    </div>
                  </div>

                  {/* Incident Timeline */}
                  <div>
                    <h4 className="text-gray-900 font-semibold text-base mb-2">
                      Incident Timeline
                    </h4>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">14:23</span>
                        <span className="text-gray-600">Now</span>
                      </div>
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-orange-500 animate-pulse"
                          style={{ width: '65%' }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-sm text-gray-700">
                        <span>Detected</span>
                        <span>Set P2</span>
                        <span>Investigating</span>
                      </div>
                    </div>
                  </div>
                </div>
                )}
          </div>

          {/* CENTER: ChatKit Panel */}
          <div className="w-80 flex-shrink-0 overflow-hidden">
            <div className="h-full rounded-xl border-4 border-gray-200 bg-white shadow-inner overflow-hidden">
              <ChatKitPanel role="OPS" onToolCall={onToolCall} />
            </div>
          </div>

          {/* RIGHT: Activity Feed */}
          <div className="w-80 flex-shrink-0 overflow-hidden">
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
