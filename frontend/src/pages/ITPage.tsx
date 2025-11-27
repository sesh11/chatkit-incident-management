import { PageLayout } from '../components/layout/PageLayout'
import { BackButton } from '../components/ui/BackButton'
import { ChatKitPanel } from '../components/chat/ChatKitPanel'
import { MetricTile } from '../components/ui/MetricTile'
import { useIncident } from '../context/IncidentContext'
import { Database, Activity as ActivityIcon, Zap } from 'lucide-react'
import type { Activity } from '../types'
import { ActivityFeed } from '../components/layout/ActivityFeed'

interface ITPageProps {
  activities: Activity[]
  onToolCall?: (toolName: string, result: any) => void
}

export const ITPage = ({ activities, onToolCall }: ITPageProps) => {
  const { incident } = useIncident()

  return (
    <PageLayout>
      <div className="h-full bg-white">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">IT Console</h2>
          <BackButton />
        </div>

        {/* Main Content */}
        <div className="h-[calc(100vh-110px)] px-6 pb-6 flex flex-row gap-4 overflow-hidden">
          {/* LEFT: Metrics Panel */}
          <div className="flex-1 overflow-y-auto">
                {incident.isActive && (
                  <div className="p-3 space-y-2 bg-gray-50 rounded-xl">
                    {/* System Health */}
                    <div>
                      <h4 className="text-gray-900 font-semibold text-base mb-2">
                        System Health
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                      <MetricTile
                        icon={<Database size={24} className="text-orange-600" />}
                        value="DEGRADED"
                        label="PostgreSQL Primary"
                        color="#EA580C"
                        subtext="95/100 connections | 3000ms latency"
                      />
                      <MetricTile
                        icon={<Database size={24} className="text-red-600" />}
                        value="DOWN"
                        label="Redis Cache"
                        color="#DC2626"
                        subtext="Last heartbeat: 2m ago"
                      />
                      <MetricTile
                        icon={<Zap size={24} className="text-yellow-600" />}
                        value="SLOW"
                        label="API Gateway"
                        color="#D97706"
                        subtext="P95: 3000ms (threshold: 500ms)"
                      />
                    </div>
                  </div>

                  {/* Recent Alerts */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-gray-900 font-semibold text-base">
                        Recent Activity
                      </h4>
                      <span className="text-red-600 font-medium text-sm">3 alerts</span>
                    </div>
                    <div className="space-y-1">
                      <div className="bg-white rounded-lg p-2 border border-gray-200">
                        <div className="flex items-start gap-2 text-gray-700">
                          <span className="text-red-500">🔴</span>
                          <span className="text-sm">14:23 PostgreSQL connection pool full</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-gray-200">
                        <div className="flex items-start gap-2 text-gray-700">
                          <span className="text-red-500">🔴</span>
                          <span className="text-sm">14:24 Redis timeout after 5000ms</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-gray-200">
                        <div className="flex items-start gap-2 text-gray-700">
                          <span className="text-yellow-500">🟡</span>
                          <span className="text-sm">14:25 API latency spike detected</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                )}
          </div>

          {/* CENTER: ChatKit Panel */}
          <div className="w-80 flex-shrink-0 overflow-hidden">
            <div className="h-full rounded-xl border-4 border-gray-200 bg-white shadow-inner overflow-hidden">
              <ChatKitPanel role="IT" onToolCall={onToolCall} />
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
