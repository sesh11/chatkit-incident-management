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
      <div className="min-h-screen bg-slate-900 p-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Incident Management Demo
              </h1>
              <p className="text-gray-400 italic">
                Demonstrating ChatKit with Role-Based Access Control
              </p>
            </div>
            <TriggerButton onTrigger={onTrigger} onReset={onReset} />
          </div>
        </div>

        {/* Role Selection Grid */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Select a Department
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <RoleButton role="IT" path="/it" />
            <RoleButton role="OPS" path="/operations" />
            <RoleButton role="FINANCE" path="/finance" />
            <RoleButton role="CSM" path="/customer-service" />
          </div>

          {/* Info Section */}
          <div className="mt-12 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-3">
              About This Demo
            </h3>
            <p className="text-gray-400 mb-2">
              This demo showcases ChatKit's powerful role-based access control system.
              Each department has its own AI assistant with specific tools and permissions.
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
              <li><span className="text-blue-400 font-semibold">IT</span>: Manage infrastructure and technical incidents</li>
              <li><span className="text-purple-400 font-semibold">Operations</span>: Handle operational workflows and monitoring</li>
              <li><span className="text-green-400 font-semibold">Finance</span>: Access financial data and cost analysis</li>
              <li><span className="text-orange-400 font-semibold">Customer Service</span>: Manage customer communications</li>
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
