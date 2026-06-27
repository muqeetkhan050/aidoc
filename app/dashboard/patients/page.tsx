import { createClient } from '@/lib/supabase/server'

export default async function PatientsPage() {
  const supabase = await createClient()

  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .order('name', { ascending: true })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <p className="text-gray-500 mt-1">{patients?.length || 0} total patients</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients?.map((patient) => (
          <div
            key={patient.id}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <h3 className="font-semibold text-gray-900 text-lg">{patient.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{patient.phone}</p>
            {patient.whatsapp && (
              <p className="text-sm text-green-600 mt-1">WhatsApp: {patient.whatsapp}</p>
            )}
          </div>
        ))}
      </div>

      {(!patients || patients.length === 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No patients yet</p>
        </div>
      )}
    </div>
  )
}
