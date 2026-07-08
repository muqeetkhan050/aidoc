import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";


export async function POST(request: Request){

 const {id}= await request.json();

 const supabase = await createClient();


 const {error}= await supabase
   .from("appointments")
   .delete()
   .eq("id",id);


 if(error){
   return NextResponse.json(
    {error:error.message},
    {status:500}
   );
 }


 return NextResponse.json({
   message:"Appointment deleted"
 });

}