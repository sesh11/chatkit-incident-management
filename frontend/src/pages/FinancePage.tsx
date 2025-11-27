import { PageLayout } from '../components/layout/PageLayout'
import { BackButton } from '../components/ui/BackButton'
import { ChatKitPanel } from '../components/chat/ChatKitPanel'
import { MetricTile } from '../components/ui/MetricTile'
import { useIncident } from '../context/IncidentContext'
import { DollarSign, AlertTriangle, TrendingUp } from 'lucide-react'
import type { Activity } from '../types'
import { ActivityFeed } from '../components/layout/ActivityFeed'

interface FinancePageProps {
  activities: Activity[]
  onToolCall?: (toolName: string, result: any) => void
}

export const FinancePage = ({ activities, onToolCall }: FinancePageProps) => {
  const { incident } = useIncident()

  return (
    <PageLayout>
      <div className="h-full bg-white">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Finance Portal</h2>
          <BackButton />
        </div>

        {/* Main Content */}
        <div className="h-[calc(100vh-110px)] px-6 pb-6 flex flex-row gap-4 overflow-hidden">
          {/* LEFT: Metrics Panel */}
          <div className="flex-1 overflow-y-auto">
                {incident.isActive && (
                  <div className="p-3 space-y-2 bg-gray-50 rounded-xl">
                    {/* Cost Analysis */}
                    <div>
                      <h4 className="text-gray-900 font-semibold text-base mb-2">
                        Incident Cost Analysis
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                      <MetricTile
                        icon={<DollarSign size={24} className="text-green-600" />}
                        value="$25,000"
                        label="Current Costs"
                        color="#047857"
                      />
                      <MetricTile
                        icon={<AlertTriangle size={24} className="text-red-600" />}
                        value="$50,000"
                        label="SLA Penalty Exposure"
                        color="#DC2626"
                      />
                      <MetricTile
                        icon={<TrendingUp size={24} className="text-green-600" />}
                        value="$75,000"
                        label="Total at Risk"
                        color="#047857"
                      />
                    </div>
                  </div>

                  {/* Budget Impact */}
                  <div>
                    <h4 className="text-gray-900 font-semibold text-base mb-2">
                      Budget Impact
                    </h4>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-600 text-sm">Incident Budget (YTD)</span>
                        <span className="text-gray-900 font-bold">78% used</span>
                      </div>
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-600 to-yellow-500"
                          style={{ width: '78%' }}
                        />
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Remaining: $220K of $1M annual
                      </div>
                    </div>
                  </div>

                  {/* Pending Approvals */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-gray-900 font-semibold text-base">
                        Pending Approvals
                      </h4>
                      <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-bold">
                        1
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-gray-900 font-medium">Emergency Cloud Scaling</div>
                          <div className="text-green-600 font-bold text-lg mt-1">$10,000</div>
                        </div>
                        <span className="text-sm text-orange-600 font-medium">⚡ Urgent</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-4">
                        Requested by: IT Operations
                      </div>
                    </div>
                  </div>
                </div>
                )}
          </div>

          {/* CENTER: ChatKit Panel */}
          <div className="w-80 flex-shrink-0 overflow-hidden">
            <div className="h-full rounded-xl border-4 border-gray-200 bg-white shadow-inner overflow-hidden">
              <ChatKitPanel role="FINANCE" onToolCall={onToolCall} />
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
