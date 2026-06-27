import { createClient } from '@/lib/supabase/server'
import AppointmentList from '@/components/appointments/AppointmentList'
import {formatDate} from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patients(id, name, phone, whatsapp)
    `)
    .eq('appointment_date', today)
    .order('appointment_time', { ascending: true })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Today's Appointments</h1>
        <p className="text-gray-500 mt-1">{formatDate(today)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AppointmentList appointments={appointments || []} />
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Today</span>
                <span className="font-medium">{appointments?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Scheduled</span>
                <span className="font-medium text-blue-600">
                  {appointments?.filter(a => a.status === 'scheduled').length || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Completed</span>
                <span className="font-medium text-green-600">
                  {appointments?.filter(a => a.status === 'completed').length || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}