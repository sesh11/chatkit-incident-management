import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { Role } from '../../types'
import { ROLE_CONFIG } from '../../types'

interface RolePanelProps {
  role: Role
  children: ReactNode
}

export const RolePanel = ({ role, children }: RolePanelProps) => {
  const config = ROLE_CONFIG[role]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col rounded-lg border-8 border-slate-600"
      style={{
        backgroundColor: `${config.color}20`,
        borderColor: `${config.color}40`,
      }}
    >
      {/* Panel Header */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{
          backgroundColor: `${config.color}10`,
          borderColor: `${config.color}40`,
        }}
      >
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-white font-semibold text-sm">{config.name}</h3>
          </div>
        </div>
        <span
          className="px-2 py-1 rounded text-xs font-bold"
          style={{
            backgroundColor: `${config.color}30`,
            color: config.color,
          }}
        >
          {role}
        </span>
      </div>

      {/* Panel Content */}
      <div className="flex-1 flex flex-col p-4">
        {children}
      </div>
    </motion.div>
  )
}
