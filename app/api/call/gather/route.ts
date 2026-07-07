import twilio from 'twilio'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

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

  async function extractWithFallback(prompt: string, fallback: string) {
    try {
      const result = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
      })
      const text = result.choices[0]?.message?.content
      return text ? text.trim() : fallback
    } catch (error) {
      console.error('Groq extraction failed, using fallback:', error)
      return fallback
    }
  }

  async function handleStep() {
    if (step === 'name') {
      const cleanName = await extractWithFallback(
        `Extract just the person's name from this speech, return only the name nothing else: "${speechResult}"`,
        speechResult
      )

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
      const cleanDate = await extractWithFallback(
        `Convert this spoken date to YYYY-MM-DD format. Today is ${today}. Speech: "${speechResult}". Return only the date, nothing else.`,
        speechResult
      )

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
      const cleanTime = await extractWithFallback(
        `Convert this spoken time to HH:MM 24-hour format. Speech: "${speechResult}". Return only the time like 14:00, nothing else.`,
        speechResult
      )

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
        const bookingResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXTAUTH_URL || 'http://localhost:3000' : 'http://localhost:3000'}/api/ai-booking`, {
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

        if (bookingResponse.ok) {
          twiml.say(
            { voice: 'Polly.Joanna' },
            `Your appointment has been booked for ${date} at ${time}. We will see you then. Goodbye!`
          )
        } else {
          const errorBody = await bookingResponse.text()
          console.error('ai-booking failed:', bookingResponse.status, errorBody)
          twiml.say(
            { voice: 'Polly.Joanna' },
            "Sorry, I couldn't complete the booking due to a system error. Please call back in a moment or try again."
          )
        }
      } else {
        twiml.say(
          { voice: 'Polly.Joanna' },
          'No problem. Your appointment has been cancelled. Please call again to rebook. Goodbye!'
        )
      }

      twiml.hangup()
    }
  }

  try {
    await handleStep()
  } catch (error) {
    console.error('Call gather step failed:', error)
    twiml.say(
      { voice: 'Polly.Joanna' },
      "Sorry, I'm having trouble processing that right now. Please call back in a moment."
    )
    twiml.hangup()
  }

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  })
}
