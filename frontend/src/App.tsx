import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { IncidentProvider } from './context/IncidentContext'
import { useActivityFeed } from './hooks/useActivityFeed'
import { MainPage } from './pages/MainPage'
import { ITPage } from './pages/ITPage'
import { FinancePage } from './pages/FinancePage'
import { CustomerServicePage } from './pages/CustomerServicePage'
import { OperationsPage } from './pages/OperationsPage'
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
      <Routes>
        {/* Main landing page */}
        <Route
          path="/"
          element={
            <MainPage
              activities={activities}
              onTrigger={handleIncidentTrigger}
              onReset={handleReset}
            />
          }
        />

        {/* IT Console Page */}
        <Route
          path="/it"
          element={
            <ITPage
              activities={activities}
              onToolCall={handleToolCall('IT')}
            />
          }
        />

        {/* Finance Portal Page */}
        <Route
          path="/finance"
          element={
            <FinancePage
              activities={activities}
              onToolCall={handleToolCall('FINANCE')}
            />
          }
        />

        {/* Customer Service Page */}
        <Route
          path="/customer-service"
          element={
            <CustomerServicePage
              activities={activities}
              onToolCall={handleToolCall('CSM')}
            />
          }
        />

        {/* Operations Dashboard Page */}
        <Route
          path="/operations"
          element={
            <OperationsPage
              activities={activities}
              onToolCall={handleToolCall('OPS')}
            />
          }
        />
      </Routes>
    </IncidentProvider>
  )
}

export default App
