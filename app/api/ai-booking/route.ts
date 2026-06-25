import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Service role client for AI (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      patient_name, 
      patient_phone, 
      whatsapp_number, 
      appointment_date, 
      appointment_time,
      doctor_id,  // Which doctor this is for
      secret 
    } = body

    // Verify webhook secret
    if (secret !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate required fields
    if (!patient_name || !patient_phone || !appointment_date || !appointment_time || !doctor_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Find or create patient
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('phone', patient_phone)
      .eq('doctor_id', doctor_id)
      .single()

    let patientId = existingPatient?.id

    if (!patientId) {
      const { data: newPatient, error: patientError } = await supabase
        .from('patients')
        .insert({
          name: patient_name,
          phone: patient_phone,
          whatsapp: whatsapp_number || patient_phone,
          doctor_id,
        })
        .select('id')
        .single()

      if (patientError) throw patientError
      patientId = newPatient!.id
    }

    // 2. Create appointment
    const { data: appointment, error: apptError } = await supabase
      .from('appointments')
      .insert({
        patient_id: patientId,
        doctor_id,
        appointment_date,
        appointment_time,
        status: 'scheduled',
        source: 'ai_agent',
      })
      .select()
      .single()

    if (apptError) throw apptError

    // 3. Add system message
    await supabase.from('messages').insert({
      appointment_id: appointment.id,
      patient_id: patientId,
      doctor_id,
      content: `Appointment booked via AI call. Date: ${appointment_date}, Time: ${appointment_time}`,
      sender: 'system',
    })

    return NextResponse.json({ 
      success: true, 
      appointment_id: appointment.id,
      message: 'Appointment booked successfully' 
    })

  } catch (error) {
    console.error('AI Booking Error:', error)
    return NextResponse.json(
      { error: 'Failed to book appointment' }, 
      { status: 500 }
    )
  }
}