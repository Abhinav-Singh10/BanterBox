import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { FC } from "react";
import { json } from "stream/consumers";


const page = async ({})=>{
// We will authenticate the user

const session= await getServerSession(authOptions)
    
    return <pre>{JSON.stringify(session)}</pre>
}

export default page;