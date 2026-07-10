import {createClient} from '@/lib/supabase/server'


export default async function History(){

    const supabase=await createClient();

  const today = new Date().toISOString().split('T')[0];

const { data: appointments } = await supabase
  .from('appointments')
  .select('*')
  .lt('appointment_date', today)               
  .order('appointment_date', { ascending: false })
  .order('appointment_time', { ascending: true }); 
    return(<div>


  {appointments && appointments.length > 0 ? (
    appointments.map((appointment) => (
      <div key={appointment.id}>
        <p>{appointment.patient?.name ?? "No patient"}</p>
        <p>{appointment.appointment_date}</p>
        <p>{appointment.appointment_time}</p>
      </div>
    ))
  ) : (
    <p>No past appointments found.</p>
  )}
</div>
    )
}