// this file is reponsible for all the authentication 

import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { db } from "./db";
import GoogleProvider from "next-auth/providers/google";

// helper function to get local googleCreds
function getGoogleCredentials(){
    const clientId= process.env.GOOGLE_CLIENT_ID
    const clientSecret= process.env.GOOGLE_CLIENT_SECRET

    if (!clientId || clientId.length===0 ) {
        throw new Error('Missing GOOGLE_CLIENT_ID')
    }

    if (!clientSecret || clientSecret.length===0 ) {
        throw new Error('Missing GOOGLE_CLIENT_SECRET')
    }
    return {clientId, clientSecret}
}

export const authOptions: NextAuthOptions={
    // what adapter means is everytime somebody calls this auth if they login with their google account for ex, then a certain action with out DB will be taken automatically
    // In our case the user data will be put into the DB automatically (email and pass)
    // Adpater is gonna be one which we can install
    adapter: UpstashRedisAdapter(db),
    session:{
        // if we choose jwt, it means we don;t handle the session on the database, the reason for it is so we can verify the session in middleware later on, to protect our 
        // routes way more easily if we kept our session in the database
        strategy:"jwt"
    },
    pages:{
        signIn:'/login' // we can give in a path in here for signIn handling
    },
    // Here we decide what we want our users to login with : email, pass , socialmedia, google? etc.
    // Since we are going with the login with the google route we are going to need to define the providers for the same
    providers: [
        // the google provider takes in a client id and a secret
        // its a good idea to setup a function to get these local variable that would help us in case we forget to provide them when in production
        GoogleProvider({
            clientId: getGoogleCredentials().clientId,
            clientSecret: getGoogleCredentials().clientSecret,
        }),
    ],
    // Last thing to pass inside the auth = callbacks, useful for triggering certain actions that next-auth can detect
    callbacks: {
        // here we explicitly make jwt key async
        async jwt({token,user}){ // token and user are automatically provided by the next auth
            // Checking if there is any user in our database
            const dbUser= (await db.get(`user: ${token.id}`)) as User | null// this token.id variable authomatically generated up the UpstashRedisApapter

            if(!dbUser){
                // Since there is no previous user in our db we assign a new token for the current user
                token.id= user!.id // ! means the user must exist 
                return token
            }

            // if the User does exist then 
            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image,
            }
        },
        // acessible throughtout after the jwt auth
        async session({session,token}){ // session,token from nextAuth
            
            if(token){
                session.user.id=token.id
            // after defining the next auth defining file , now what values the token can have are known
            // In these lines above and below we are appending the values that the token has access to on to the session, this is so that we have access to these values
            // throughtout the session
            session.user.name= token.name
            session.user.email= token.email
            session.user.image= token.picture
            }
            return session;
        },
        // This section is for when the user has signed in and we want to redirect them
        redirect(){ // this expects a sting
            return '/dashboard'  // the place to redirect after a sucessful login
        }

    
    },

}