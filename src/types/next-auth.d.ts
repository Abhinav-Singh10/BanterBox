// we are passing next-auth types here

import type { Session,User } from "next-auth"
import type { JWT } from "next-auth/jwt"
type UserId= string

// module declaration for basic intellisense while working
// these types are automatically inferred whenever these corresponding modules are imported in a file
declare module 'next-auth/jwt'{
    interface JWT {
        id: string
    }
}

declare module "next-auth"{
    interface Session {
        user:User & { // the and syntax here denotes that we are adding a value to the preexisiting User value
            id: UserId
        }
    }
}