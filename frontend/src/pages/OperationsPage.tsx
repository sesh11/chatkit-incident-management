import { PageLayout } from '../components/layout/PageLayout'
import { BackButton } from '../components/ui/BackButton'
import { RolePanel } from '../components/panels/RolePanel'
import { ChatKitPanel } from '../components/chat/ChatKitPanel'
import { useIncident } from '../context/IncidentContext'
import type { Activity } from '../types'

interface OperationsPageProps {
  activities: Activity[]
  onToolCall?: (toolName: string, result: any) => void
}

export const OperationsPage = ({ activities, onToolCall }: OperationsPageProps) => {
  const { incident } = useIncident()

  return (
    <PageLayout activities={activities}>
      <div className="h-full p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Operations Dashboard</h2>
          <BackButton />
        </div>

        {/* Main Content */}
        <div className="h-[calc(100vh-150px)]">
          <RolePanel role="OPS">
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Static UI Content */}
              {incident.isActive && (
                <div className="p-4 space-y-4 bg-slate-900/30">
                  {/* Business Impact Overview */}
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-3">
                      Business Impact Overview
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {/* Affected Customers */}
                      <div className="bg-slate-800/50 rounded p-3 text-center">
                        <div className="text-2xl font-bold text-ops">500</div>
                        <div className="text-xs text-gray-400 mt-1">Affected Customers</div>
                      </div>

                      {/* SLA Breaches */}
                      <div className="bg-slate-800/50 rounded p-3 text-center">
                        <div className="text-2xl font-bold text-red-400">12</div>
                        <div className="text-xs text-gray-400 mt-1">SLA Violations</div>
                      </div>

                      {/* Priority */}
                      <div className="bg-slate-800/50 rounded p-3 text-center">
                        <div className="text-2xl font-bold text-orange-400">{incident.priority}</div>
                        <div className="text-xs text-gray-400 mt-1">Current Priority</div>
                      </div>
                    </div>
                  </div>

                  {/* Incident Timeline */}
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-3">
                      Incident Timeline
                    </h4>
                    <div className="bg-slate-800/50 rounded p-3">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-gray-400">14:23</span>
                        <span className="text-gray-400">Now</span>
                      </div>
                      <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-500 to-orange-500 animate-pulse"
                          style={{ width: '65%' }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-300">
                        <span>Detected</span>
                        <span>Set P2</span>
                        <span>Investigating</span>
                      </div>
                    </div>
                  </div>

                  {/* Team Status */}
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                      Team Status
                      <span className="ml-auto text-ops text-xs">5 engineers active</span>
                    </h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            S
                          </div>
                          <span className="text-white">Sarah (IT)</span>
                        </div>
                        <span className="text-gray-400">Investigating</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                            M
                          </div>
                          <span className="text-white">Mike (DevOps)</span>
                        </div>
                        <span className="text-gray-400">Deploying fix</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ChatKit Panel */}
              <div className="flex-1 min-h-0">
                <div className="h-full p-4">
                  <ChatKitPanel role="OPS" onToolCall={onToolCall} />
                </div>
              </div>
            </div>
          </RolePanel>
        </div>
      </div>
    </PageLayout>
  )
}
