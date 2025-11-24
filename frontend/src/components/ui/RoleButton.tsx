import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Role } from '../../types'
import { ROLE_CONFIG } from '../../types'

interface RoleButtonProps {
  role: Role
  path: string
}

export const RoleButton = ({ role, path }: RoleButtonProps) => {
  const navigate = useNavigate()
  const config = ROLE_CONFIG[role]

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => navigate(path)}
      className="relative overflow-hidden rounded-xl p-8 text-left transition-all hover:shadow-2xl"
      style={{
        backgroundColor: `${config.color}20`,
        borderWidth: '3px',
        borderColor: `${config.color}60`,
      }}
    >
      {/* Background Gradient */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${config.color} 0%, transparent 100%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div
          className="text-4xl font-bold mb-2"
          style={{ color: config.color }}
        >
          {config.name}
        </div>
        <div className="text-gray-400 text-sm mb-4">
          {config.userId}
        </div>
        <div
          className="inline-block px-3 py-1 rounded-full text-xs font-bold"
          style={{
            backgroundColor: `${config.color}30`,
            color: config.color,
          }}
        >
          {role}
        </div>
      </div>
    </motion.button>
  )
}
