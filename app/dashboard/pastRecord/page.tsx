import {createClient} from '@/lib/supabase/server'



export default async function PastRecordPage(){
    const supabase=await createClient()

    const now=new Date()
    const today=now.toISOString().split('T')[0]
    const currentTime = now.toTimeString().split(' ')[0] 
    const {data: appointments}=await supabase.from('appointments').select(`*,patient:patients(id,name,phone,whatsapp)`).or(`appointment_date.lt.${today},and(appointment_date.eq.${today},appointment_time.lt.${currentTime})`).order('appointment_date',{ascending:false}).order('appointment_time',{ascending:true})





    return(
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Past Records</h1>
                <p className="text-gray-500 mt-1">Complete past records history</p>
                <div>{appointments?.map((appointment)=>{
                           return <div key={appointment.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4 p-4">
                            <p className="text-gray-600"><span className="font-semibold">Patient:</span> {appointment.patient?.name}</p>
                            <p className="text-gray-600"><span className="font-semibold">Date:</span> {appointment.appointment_date}</p>
                            <p className="text-gray-600"><span className="font-semibold">Time:</span> {appointment.appointment_time}</p>
                            <p className="text-gray-600"><span className="font-semibold">Status:</span> {appointment.status}</p>

                        </div> 
                })}</div>
            </div>
        </div>
    )
}