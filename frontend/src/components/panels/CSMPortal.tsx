import { RolePanel } from './RolePanel'
import { ChatPanel } from '../chat/ChatPanel'
import { useIncident } from '../../context/IncidentContext'

interface CSMPortalProps {
  onToolCall?: (toolName: string, result: any) => void
}

export const CSMPortal = ({ onToolCall }: CSMPortalProps) => {
  const { incident } = useIncident()

  return (
    <RolePanel role="CSM">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Static UI Content */}
        {incident.isActive && (
          <div className="p-4 space-y-4 bg-slate-900/30">
          {/* Impact Assessment */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">
              Customer Impact Assessment
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {/* Enterprise */}
              <div className="bg-slate-800/50 rounded p-3 text-center">
                <div className="text-xl">🏢</div>
                <div className="text-2xl font-bold text-csm mt-1">50</div>
                <div className="text-xs text-gray-400 mt-1">Enterprise</div>
                <div className="text-xs text-red-400 mt-1">High Impact</div>
              </div>

              {/* SMB */}
              <div className="bg-slate-800/50 rounded p-3 text-center">
                <div className="text-xl">🏪</div>
                <div className="text-2xl font-bold text-orange-400 mt-1">200</div>
                <div className="text-xs text-gray-400 mt-1">SMB</div>
                <div className="text-xs text-yellow-400 mt-1">Medium</div>
              </div>

              {/* Free */}
              <div className="bg-slate-800/50 rounded p-3 text-center">
                <div className="text-xl">👤</div>
                <div className="text-2xl font-bold text-gray-400 mt-1">250</div>
                <div className="text-xs text-gray-400 mt-1">Free</div>
                <div className="text-xs text-blue-400 mt-1">Low</div>
              </div>
            </div>
          </div>

          {/* Top Affected Customers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-semibold text-sm">
                Top Affected Customers
              </h4>
              <button className="text-csm text-xs hover:underline">View All →</button>
            </div>
            <div className="space-y-2">
              {/* Customer 1 */}
              <div className="bg-slate-800/50 rounded p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">
                      AC
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">Acme Corp</div>
                      <div className="text-xs text-gray-400">99.9% SLA</div>
                    </div>
                  </div>
                  <span className="text-red-400 text-xs">
                    At Risk
                  </span>
                </div>
              </div>

              {/* Customer 2 */}
              <div className="bg-slate-800/50 rounded p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs">
                      TS
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">TechStart Inc</div>
                      <div className="text-xs text-gray-400">99.5% SLA</div>
                    </div>
                  </div>
                  <span className="text-yellow-400 text-xs">
                    At Risk
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Communication Status */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-2">
              Communication Status
            </h4>
            <div className="bg-slate-800/50 rounded p-3 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Notifications Sent:</span>
                <span className="text-white font-bold">0</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Last Update:</span>
                <span className="text-gray-500">Never</span>
              </div>
              <button className="w-full mt-2 px-4 py-2 bg-csm hover:bg-orange-600 text-white text-sm font-semibold rounded transition-colors">
                Send Status Update
              </button>
            </div>
          </div>
          </div>
        )}

        {/* Chat Panel */}
        <div className="flex-1 min-h-0">
          <div className="h-full p-4">
            <ChatPanel role="CSM" onToolCall={onToolCall} />
          </div>
        </div>
      </div>
    </RolePanel>
  )
}
