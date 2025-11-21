export type Role = 'IT' | 'OPS' | 'FINANCE' | 'CSM'

export interface IncidentState {
  isActive: boolean
  incidentId: string | null
  title: string
  priority: 'P1' | 'P2' | 'P3' | 'P4'
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED'
  startTime: Date | null
}

export interface Activity {
  id: string
  timestamp: Date
  role: Role
  roleDisplay: string
  action: string
  result: 'success' | 'error' | 'pending'
  details: string
}

export interface RolePanelProps {
  role: Role
  title: string
  onNotification?: () => void
}

export const ROLE_CONFIG = {
  IT: {
    name: 'IT',
    color: '#3B82F6',
    colorClass: 'it',
    icon: '🔧',
    userId: 'it-demo-001'
  },
  OPS: {
    name: 'Operations',
    color: '#8B5CF6',
    colorClass: 'ops',
    icon: '📊',
    userId: 'ops-demo-001'
  },
  FINANCE: {
    name: 'Finance',
    color: '#10B981',
    colorClass: 'finance',
    icon: '💰',
    userId: 'finance-demo-001'
  },
  CSM: {
    name: 'Customer Service',
    color: '#F59E0B',
    colorClass: 'csm',
    icon: '🎧',
    userId: 'csm-demo-001'
  }
} as const
