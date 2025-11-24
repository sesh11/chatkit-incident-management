import { ChatKit, useChatKit } from '@openai/chatkit-react'
import { useEffect } from 'react'
import type { Role } from '../../types'
import { ROLE_CONFIG } from '../../types'

interface ChatKitPanelProps {
  role: Role
  onToolCall?: (toolName: string, result: any) => void
}

export const ChatKitPanel = ({ role }: ChatKitPanelProps) => {
  const roleConfig = ROLE_CONFIG[role]

  // Note: onToolCall will be implemented once we understand ChatKit's event system better

  // CustomApiConfig - uses OUR custom backend at /api/chat
  const { control } = useChatKit({
    api: {
      url: '/api/chat',  // Point to our custom backend endpoint
      domainKey: 'local-dev-placeholder',  // Placeholder for local development
      fetch(input: RequestInfo | URL, init?: RequestInit) {
        // Inject authentication headers into all ChatKit requests
        return fetch(input, {
          ...init,
          headers: {
            ...init?.headers,
            'X-User-Role': role,
            'X-User-Id': roleConfig.userId,
            'Content-Type': 'application/json',
          },
        });
      },
    },
  })

  // Debug logging
  useEffect(() => {
    console.log('[ChatKitPanel] Control state:', control ? 'READY' : 'NOT READY')
    console.log('[ChatKitPanel] Control object:', control)
    console.log('[ChatKitPanel] Role:', role)
  }, [control, role])

  return (
    <div className="flex flex-col h-full">
      {/* ChatKit Widget */}
      <div className="flex-1 overflow-hidden rounded-lg border-2" style={{ borderColor: `${roleConfig.color}40` }}>
        {control ? (
          <ChatKit
            control={control}
            className="h-full w-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white">
            <div className="text-center">
              <div className="animate-pulse mb-2">⚙️</div>
              <div>Connecting to custom backend...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
