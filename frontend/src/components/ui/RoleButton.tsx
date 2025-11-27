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
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(path)}
      className="relative overflow-hidden rounded-2xl p-10 text-center transition-all shadow-lg hover:shadow-2xl"
      style={{
        backgroundColor: config.color,
      }}
    >
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="text-3xl font-bold text-white">
          {config.name}
        </div>
      </div>
    </motion.button>
  )
}
