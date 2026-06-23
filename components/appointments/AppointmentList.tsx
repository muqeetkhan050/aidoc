'use client'

import { useState } from 'react'
import { Appointment } from '@/types'
import AppointmentCard from './AppointmentCard'
import CancelDialog from './CancelDialog'
import MessageDialog from './MessageDialog'

export default function AppointmentList({ appointments }: { appointments: Appointment[] }) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showCancel, setShowCancel] = useState(false)
  const [showMessage, setShowMessage] = useState(false)

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No appointments for today</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onCancel={() => {
            setSelectedAppointment(appointment)
            setShowCancel(true)
          }}
          onMessage={() => {
            setSelectedAppointment(appointment)
            setShowMessage(true)
          }}
        />
      ))}

      {selectedAppointment && (
        <>
          <CancelDialog
            open={showCancel}
            onClose={() => setShowCancel(false)}
            appointment={selectedAppointment}
          />
          <MessageDialog
            open={showMessage}
            onClose={() => setShowMessage(false)}
            appointment={selectedAppointment}
          />
        </>
      )}
    </div>
  )
}