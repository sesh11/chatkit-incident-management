import { Toaster } from 'sonner'
import { IncidentProvider } from './context/IncidentContext'
import { useActivityFeed } from './hooks/useActivityFeed'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { ITConsole } from './components/panels/ITConsole'
import { OpsDashboard } from './components/panels/OpsDashboard'
import { FinancePortal } from './components/panels/FinancePortal'
import { CSMPortal } from './components/panels/CSMPortal'
import { ROLE_CONFIG } from './types'

function App() {
  const { activities, addActivity, clearActivities } = useActivityFeed()

  const handleToolCall = (role: keyof typeof ROLE_CONFIG) => (toolName: string, result: any) => {
    const roleConfig = ROLE_CONFIG[role]

    // Determine result status
    let resultStatus: 'success' | 'error' | 'pending' = 'success'
    if (result.error) {
      resultStatus = 'error'
    }

    // Add activity to feed
    addActivity({
      role,
      roleDisplay: roleConfig.name,
      action: formatToolName(toolName),
      result: resultStatus,
      details: result.error || formatResult(result)
    })
  }

  const formatToolName = (toolName: string): string => {
    return toolName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatResult = (result: any): string => {
    if (result.message) return result.message
    if (result.status) return `Status: ${result.status}`
    if (result.incident_id) return `Incident: ${result.incident_id}`
    return 'Completed'
  }

  const handleIncidentTrigger = () => {
    // Add system activity when incident is triggered
    addActivity({
      role: 'IT',
      roleDisplay: 'System',
      action: 'Incident Created',
      result: 'success',
      details: 'INC-001 - Production Database Slowdown'
    })
  }

  const handleReset = () => {
    // Clear all activities when demo is reset
    clearActivities()
  }

  return (
    <IncidentProvider>
      <Toaster position="top-right" richColors closeButton />
      <DashboardLayout activities={activities} onTrigger={handleIncidentTrigger} onReset={handleReset}>
        <ITConsole onToolCall={handleToolCall('IT')} />
        <OpsDashboard onToolCall={handleToolCall('OPS')} />
        <FinancePortal onToolCall={handleToolCall('FINANCE')} />
        <CSMPortal onToolCall={handleToolCall('CSM')} />
      </DashboardLayout>
    </IncidentProvider>
  )
}

export default App
