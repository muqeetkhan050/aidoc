'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Appointment } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  appointment: Appointment
}

export default function CancelDialog({ open, onClose, appointment }: Props) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleCancel = async () => {
    setLoading(true)
    
    const { error } = await supabase
      .from('appointments')
      .update({ 
        status: 'cancelled',
        notes: reason ? `Cancelled: ${reason}` : appointment.notes 
      })
      .eq('id', appointment.id)

    if (!error) {
      // Add system message
      await supabase.from('messages').insert({
        appointment_id: appointment.id,
        patient_id: appointment.patient_id,
        doctor_id: appointment.doctor_id,
        content: `Appointment cancelled. Reason: ${reason || 'Not specified'}`,
        sender: 'system',
      })

      router.refresh()
      onClose()
    }
    setLoading(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cancel Appointment
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Cancelling appointment with {appointment.patient?.name} at{' '}
          {appointment.appointment_time}
        </p>
        
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for cancellation (optional)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-24"
        />

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Keep Appointment
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Cancelling...' : 'Confirm Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}