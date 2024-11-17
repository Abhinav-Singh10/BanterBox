import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { FC } from "react";

interface pageProps{}

const page: FC<pageProps>= async ({})=>{
// We will authenticate the user

const session= await getServerSession(authOptions)

    return <pre>page</pre>
}

export default page;