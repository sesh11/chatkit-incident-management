import { PageLayout } from '../components/layout/PageLayout'
import { RoleButton } from '../components/ui/RoleButton'
import { TriggerButton } from '../components/ui/TriggerButton'
import type { Activity } from '../types'

interface MainPageProps {
  activities: Activity[]
  onTrigger: () => void
  onReset: () => void
}

export const MainPage = ({ activities, onTrigger, onReset }: MainPageProps) => {
  return (
    <PageLayout activities={activities}>
      <div className="min-h-screen bg-white p-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Incident Management
              </h1>
              <p className="text-gray-600 italic">
                Demonstrating shared agent infrastructure using ChatKit Advanced Integration
              </p>
            </div>
            <TriggerButton onTrigger={onTrigger} onReset={onReset} />
          </div>
        </div>

        {/* Centered Role Selection Grid */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Select a Department
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <RoleButton role="IT" path="/it" />
            <RoleButton role="OPS" path="/operations" />
            <RoleButton role="FINANCE" path="/finance" />
            <RoleButton role="CSM" path="/customer-service" />
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
