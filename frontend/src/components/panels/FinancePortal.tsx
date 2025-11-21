import { RolePanel } from './RolePanel'
import { ChatPanel } from '../chat/ChatPanel'
import { useIncident } from '../../context/IncidentContext'

interface FinancePortalProps {
  onToolCall?: (toolName: string, result: any) => void
}

export const FinancePortal = ({ onToolCall }: FinancePortalProps) => {
  const { incident } = useIncident()

  return (
    <RolePanel role="FINANCE">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Static UI Content */}
        {incident.isActive && (
          <div className="p-4 space-y-4 bg-slate-900/30">
          {/* Cost Analysis */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">
              Incident Cost Analysis
            </h4>
            <div className="space-y-2">
              <div className="bg-slate-800/50 rounded p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400 text-xs">Current Costs</span>
                  <span className="text-white font-bold">$25,000.00</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400 text-xs">SLA Penalty Exposure</span>
                  <span className="text-red-400 font-bold">$50,000.00</span>
                </div>
                <div className="border-t border-slate-700 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm font-semibold">Total at Risk</span>
                  <span className="text-finance font-bold text-lg">$75,000.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Impact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">
              Budget Impact
            </h4>
            <div className="bg-slate-800/50 rounded p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-xs">Incident Budget (YTD)</span>
                <span className="text-white text-sm font-semibold">78% used</span>
              </div>
              <div className="relative h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-finance to-yellow-500"
                  style={{ width: '78%' }}
                />
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Remaining: $220K of $1M annual
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-semibold text-sm">
                Pending Approvals
              </h4>
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                1
              </span>
            </div>
            <div className="bg-slate-800/50 rounded p-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="text-white text-sm font-medium">Emergency Cloud Scaling</div>
                  <div className="text-finance font-bold">$10,000</div>
                </div>
                <span className="text-xs text-gray-400">⚡ Urgent</span>
              </div>
              <div className="text-xs text-gray-400 mb-3">
                Requested by: IT Operations
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-1.5 bg-finance hover:bg-green-600 text-white text-xs font-semibold rounded transition-colors">
                  Approve
                </button>
                <button className="flex-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded transition-colors">
                  Decline
                </button>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Chat Panel */}
        <div className="flex-1 min-h-0">
          <div className="h-full p-4">
            <ChatPanel role="FINANCE" onToolCall={onToolCall} />
          </div>
        </div>
      </div>
    </RolePanel>
  )
}
