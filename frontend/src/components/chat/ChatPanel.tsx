import { useState } from 'react'
import { Send } from 'lucide-react'
import type { Role } from '../../types'
import { ROLE_CONFIG } from '../../types'



interface ChatPanelProps {
  role: Role
  onToolCall?: (toolName: string, result: any) => void
}

export const ChatPanel = ({ role, onToolCall }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const roleConfig = ROLE_CONFIG[role]

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      // Call backend API
      const response = await fetch('/api/simple-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': role,
          'X-User-Id': roleConfig.userId
        },
        body: JSON.stringify({ message: userMessage })
      })

      const data = await response.json()

      // Add assistant response
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])

      // Notify about tool calls
      if (data.tool_calls && data.tool_calls.length > 0) {
        data.tool_calls.forEach((toolCall: { name: string; output: any }) => {
          onToolCall?.(toolCall.name, toolCall.output)
        })
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-lg overflow-hidden">
      {/* Chat Header */}
      <div
        className="px-4 py-3 border-b flex items-center gap-2"
        style={{
          backgroundColor: `${roleConfig.color}15`,
          borderColor: `${roleConfig.color}40`
        }}
      >
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm">Agent</h4>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div></div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-gray-100'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 px-4 py-2 rounded-lg">
              <span className="text-sm text-gray-400">
                thinking<span className="animate-pulse">...</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Type a message...`}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
            style={{
              backgroundColor: roleConfig.color,
              opacity: (!input.trim() || isLoading) ? 0.5 : 1
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
