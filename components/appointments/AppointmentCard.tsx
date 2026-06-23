import { Appointment } from '@/types'
import { formatTime } from '@/lib/utils'
import { Phone, MessageCircle, XCircle, Calendar } from 'lucide-react'

interface Props {
  appointment: Appointment
  onCancel: () => void
  onMessage: () => void
}

export default function AppointmentCard({ appointment, onCancel, onMessage }: Props) {
  const statusColors = {
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    no_show: 'bg-gray-50 text-gray-700 border-gray-200',
  }

  const statusLabels = {
    scheduled: 'Scheduled',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 text-lg">
              {appointment.patient?.name}
            </h3>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[appointment.status]}`}>
              {statusLabels[appointment.status]}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatTime(appointment.appointment_time)}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              {appointment.patient?.phone}
            </span>
            {appointment.patient?.whatsapp && (
              <span className="flex items-center gap-1.5 text-green-600">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </span>
            )}
          </div>

          {appointment.notes && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              {appointment.notes}
            </p>
          )}

          <div className="mt-2 text-xs text-gray-400">
            Source: {appointment.source === 'ai_agent' ? '🤖 AI Agent' : 
                     appointment.source === 'whatsapp' ? '💬 WhatsApp' : '👤 Manual'}
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4">
          <button
            onClick={onMessage}
            disabled={!appointment.patient?.whatsapp}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
          
          {appointment.status === 'scheduled' && (
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}