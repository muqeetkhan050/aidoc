export interface Patient {
  id: string
  name: string
  phone: string
  whatsapp: string | null
  doctor_id: string
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  source: 'ai_agent' | 'whatsapp' | 'manual'
  notes: string | null
  created_at: string
  patient?: Patient
}

export interface Message {
  id: string
  appointment_id: string
  patient_id: string
  doctor_id: string
  content: string
  sender: 'doctor' | 'patient' | 'system'
  created_at: string
}
