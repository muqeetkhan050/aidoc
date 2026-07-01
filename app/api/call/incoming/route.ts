import twilio from 'twilio'

export async function POST() {
  const twiml = new twilio.twiml.VoiceResponse()

  twiml.say(
    { voice: 'Polly.Joanna' },
    "Hello! I'm the doctor's AI receptionist. I can help you book an appointment."
  )

  const gather = twiml.gather({
    action: '/api/call/gather?step=name',
    input: ['speech'],
    speechTimeout: 'auto',
    method: 'POST',
  })

  gather.say(
    { voice: 'Polly.Joanna' },
    'Please say your full name.'
  )

  return new Response(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  })
}
