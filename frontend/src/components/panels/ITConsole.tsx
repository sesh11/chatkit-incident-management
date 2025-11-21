import { RolePanel } from './RolePanel'
import { ChatPanel } from '../chat/ChatPanel'
import { useIncident } from '../../context/IncidentContext'

interface ITConsoleProps {
  onToolCall?: (toolName: string, result: any) => void
}

export const ITConsole = ({ onToolCall }: ITConsoleProps) => {
  const { incident } = useIncident()

  return (
    <RolePanel role="IT">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Static UI Content */}
        {incident.isActive && (
          <div className="p-4 space-y-4 bg-slate-900/30">
          {/* System Health */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">
              System Health
            </h4>
            <div className="space-y-2">
              {/* PostgreSQL */}
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full pulse-dot" />
                  <span className="text-white text-sm font-medium">PostgreSQL Primary</span>
                </div>
                <span className="text-orange-400 text-xs font-semibold">⚠️  DEGRADED</span>
              </div>
              <div className="text-xs text-gray-400 pl-4">
                Connections: 95/100 | Latency: 3000ms
              </div>

              {/* Redis */}
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full pulse-dot" />
                  <span className="text-white text-sm font-medium">Redis Cache</span>
                </div>
                <span className="text-red-400 text-xs font-semibold">🔴 DOWN</span>
              </div>
              <div className="text-xs text-gray-400 pl-4">
                Last heartbeat: 2m ago
              </div>

              {/* API Gateway */}
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full pulse-dot" />
                  <span className="text-white text-sm font-medium">API Gateway</span>
                </div>
                <span className="text-yellow-400 text-xs font-semibold">🟡 SLOW</span>
              </div>
              <div className="text-xs text-gray-400 pl-4">
                P95: 3000ms (threshold: 500ms)
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-semibold text-sm">
                Recent Activity
              </h4>
              <span className="text-red-400 text-xs">3 alerts</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-start gap-2 text-gray-300">
                <span className="text-red-500">🔴</span>
                <span>14:23 PostgreSQL connection pool full</span>
              </div>
              <div className="flex items-start gap-2 text-gray-300">
                <span className="text-red-500">🔴</span>
                <span>14:24 Redis timeout after 5000ms</span>
              </div>
              <div className="flex items-start gap-2 text-gray-300">
                <span className="text-yellow-500">🟡</span>
                <span>14:25 API latency spike detected</span>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Chat Panel */}
        <div className="flex-1 min-h-0">
          <div className="h-full p-4">
            <ChatPanel role="IT" onToolCall={onToolCall} />
          </div>
        </div>
      </div>
    </RolePanel>
  )
}
