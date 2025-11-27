import { PageLayout } from '../components/layout/PageLayout'
import { BackButton } from '../components/ui/BackButton'
import { ChatKitPanel } from '../components/chat/ChatKitPanel'
import { MetricTile } from '../components/ui/MetricTile'
import { useIncident } from '../context/IncidentContext'
import { Building2, Store, User } from 'lucide-react'
import type { Activity } from '../types'
import { ActivityFeed } from '../components/layout/ActivityFeed'

interface CustomerServicePageProps {
  activities: Activity[]
  onToolCall?: (toolName: string, result: any) => void
}

export const CustomerServicePage = ({ activities, onToolCall }: CustomerServicePageProps) => {
  const { incident } = useIncident()

  return (
    <PageLayout>
      <div className="h-full bg-white">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Customer Service Portal</h2>
          <BackButton />
        </div>

        {/* Main Content */}
        <div className="h-[calc(100vh-110px)] px-6 pb-6 flex flex-row gap-4 overflow-hidden">
          {/* LEFT: Metrics Panel */}
          <div className="flex-1 overflow-y-auto">
                {incident.isActive && (
                  <div className="p-3 space-y-2 bg-gray-50 rounded-xl">
                    {/* Impact Assessment */}
                    <div>
                      <h4 className="text-gray-900 font-semibold text-base mb-2">
                        Customer Impact Assessment
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                      <MetricTile
                        icon={<Building2 size={24} className="text-orange-600" />}
                        value="50"
                        label="Enterprise"
                        color="#C2410C"
                        subtext="High Impact"
                      />
                      <MetricTile
                        icon={<Store size={24} className="text-orange-500" />}
                        value="200"
                        label="SMB"
                        color="#EA580C"
                        subtext="Medium Impact"
                      />
                      <MetricTile
                        icon={<User size={24} className="text-blue-600" />}
                        value="250"
                        label="Free"
                        color="#2563EB"
                        subtext="Low Impact"
                      />
                    </div>
                  </div>

                  {/* Top Affected Customers */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-gray-900 font-semibold text-base">
                        Top Affected Customers
                      </h4>
                      <button className="text-orange-600 text-sm font-medium hover:underline">View All →</button>
                    </div>
                    <div className="space-y-2">
                      {/* Customer 1 */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                              AC
                            </div>
                            <div>
                              <div className="text-gray-900 font-medium">Acme Corp</div>
                              <div className="text-sm text-gray-600">99.9% SLA</div>
                            </div>
                          </div>
                          <span className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full font-medium">
                            At Risk
                          </span>
                        </div>
                      </div>

                      {/* Customer 2 */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                              TS
                            </div>
                            <div>
                              <div className="text-gray-900 font-medium">TechStart Inc</div>
                              <div className="text-sm text-gray-600">99.5% SLA</div>
                            </div>
                          </div>
                          <span className="bg-yellow-100 text-yellow-700 text-sm px-3 py-1 rounded-full font-medium">
                            At Risk
                          </span>
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
              <ChatKitPanel role="CSM" onToolCall={onToolCall} />
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
