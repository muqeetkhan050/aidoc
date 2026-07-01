import twilio from 'twilio'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

export async function POST(request: Request) {
  const formData = await request.formData()
  const speechResult = formData.get('SpeechResult') as string
  const callerPhone = formData.get('From') as string

  const url = new URL(request.url)
  const step = url.searchParams.get('step')
  const name = url.searchParams.get('name') || ''
  const date = url.searchParams.get('date') || ''
  const time = url.searchParams.get('time') || ''

  const twiml = new twilio.twiml.VoiceResponse()

  if (step === 'name') {
    const result = await model.generateContent(
      `Extract just the person's name from this speech, return only the name nothing else: "${speechResult}"`
    )
    const cleanName = result.response.text().trim()

    const gather = twiml.gather({
      action: `/api/call/gather?step=date&name=${encodeURIComponent(cleanName)}`,
      input: ['speech'],
      speechTimeout: 'auto',
      method: 'POST',
    })
    gather.say(
      { voice: 'Polly.Joanna' },
      `Got it, ${cleanName}. What date would you like your appointment? Please say the month and day, for example June 30th.`
    )
  }

  else if (step === 'date') {
    const today = new Date().toISOString().split('T')[0]
    const result = await model.generateContent(
      `Convert this spoken date to YYYY-MM-DD format. Today is ${today}. Speech: "${speechResult}". Return only the date, nothing else.`
    )
    const cleanDate = result.response.text().trim()

    const gather = twiml.gather({
      action: `/api/call/gather?step=time&name=${encodeURIComponent(name)}&date=${encodeURIComponent(cleanDate)}`,
      input: ['speech'],
      speechTimeout: 'auto',
      method: 'POST',
    })
    gather.say(
      { voice: 'Polly.Joanna' },
      `Great, ${cleanDate}. What time would you prefer? For example, 2 PM or 10:30 AM.`
    )
  }

  else if (step === 'time') {
    const result = await model.generateContent(
      `Convert this spoken time to HH:MM 24-hour format. Speech: "${speechResult}". Return only the time like 14:00, nothing else.`
    )
    const cleanTime = result.response.text().trim()

    const gather = twiml.gather({
      action: `/api/call/gather?step=confirm&name=${encodeURIComponent(name)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(cleanTime)}`,
      input: ['speech'],
      speechTimeout: 'auto',
      method: 'POST',
    })
    gather.say(
      { voice: 'Polly.Joanna' },
      `To confirm — appointment for ${name} on ${date} at ${cleanTime}. Say yes to confirm or no to cancel.`
    )
  }

  else if (step === 'confirm') {
    const isYes = speechResult?.toLowerCase().includes('yes')

    if (isYes) {
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXTAUTH_URL || 'http://localhost:3000' : 'http://localhost:3000'}/api/ai-booking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: name,
          patient_phone: callerPhone,
          appointment_date: date,
          appointment_time: time,
          doctor_id: process.env.DOCTOR_ID,
          secret: process.env.WEBHOOK_SECRET,
        }),
      })

      twiml.say(
        { voice: 'Polly.Joanna' },
        `Your appointment has been booked for ${date} at ${time}. We will see you then. Goodbye!`
      )
    } else {
      twiml.say(
        { voice: 'Polly.Joanna' },
        'No problem. Your appointment has been cancelled. Please call again to rebook. Goodbye!'
      )
    }

    twiml.hangup()
  }

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  })
}
