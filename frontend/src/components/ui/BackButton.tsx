import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const BackButton = () => {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate('/')}
      className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
    >
      <ArrowLeft size={18} />
      <span>Back to Main</span>
    </button>
  )
}
