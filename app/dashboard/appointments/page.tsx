import { createClient } from '@/lib/supabase/server'

export default async function AllAppointmentsPage() {
  const supabase = await createClient()

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patients(id, name, phone, whatsapp)
    `)
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: true })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Appointments</h1>
        <p className="text-gray-500 mt-1">Complete appointment history</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Patient</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Time</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {appointments?.map((appointment) => (
              <tr key={appointment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {appointment.patient?.name}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {appointment.appointment_date}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {appointment.appointment_time}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'scheduled' ? 'bg-blue-50 text-blue-700' :
                    appointment.status === 'completed' ? 'bg-green-50 text-green-700' :
                    appointment.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                    'bg-gray-50 text-gray-700'
                  }`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {appointment.source === 'ai_agent' ? 'AI Agent' :
                   appointment.source === 'whatsapp' ? 'WhatsApp' : 'Manual'}
                </td>
                   <button>confirm/cancel</button>   
              </tr>
                 
            ))}
      
          </tbody>
        </table>

        {(!appointments || appointments.length === 0) && (
          <p className="text-center text-gray-400 py-12">No appointments found</p>
        )}
      </div>
      
    </div>
  )
}
