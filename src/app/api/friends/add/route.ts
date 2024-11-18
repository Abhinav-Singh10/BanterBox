import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addFriendValidator } from "@/lib/validations/add-friend";
import { Session } from "inspector/promises";
import { getServerSession } from "next-auth";
import { z } from "zod";

// To handle routes declared in the nextjs api folder
// I export async function called the http method we want to handle
export async function POST(req: Request) {
  // handling the logic of interacting with the database
  try {
    const body = await req.json();

    const { email: emailToAdd } = addFriendValidator.parse(body.email);

    // I need to prevent nextjs 13th caching (on api routes) behaviour here by using the cache: 'no-store' flag
    const RESTResponse = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/get/user:email:${emailToAdd}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN},
          {
            cache:'no-store'
        }`,
        },
      }
    );

    const idToAdd = (await fetchRedis(
      'get', // this will give me the id of the email i wanna sent friend request to
      `user:email:${emailToAdd}`
    )) as string


    if (!idToAdd) {
      // If the user tries to add someone who doesn't exist
      return new Response("This Person doesn't exist", { status: 400 });
    }

    // Next I need to decipher who is sending this request from the server side, as on the client side it would be very unsafe
    const session = await getServerSession(authOptions);

    if (!session) {
      // If there is no session then the request is invalid
      return new Response("Unauthorized", { status: 401 });
    }

    // if the user tries to add themselves
    if (session.user.id === idToAdd) {
      return new Response("You can't add yourself as a friend", {
        status: 400,
      });
    }

    // Created a custom helper "fetchRedis" function to interact with our DB, and also to work around the api route caching behaviour of nextJS
    // This behaviour is because in nextJs the get request is cached

    // Checking if the user has already requested the id
    const isAlreadyAdded = (await fetchRedis(
      "sismember", // implemented by upstash it returns a boolean value
      `user:${idToAdd}:incoming_friend_requests`, // this is the set to check if the next values resides in it or not
      session.user.id
      // above I am simply making a check to see if the current session user is already a member of the requestedId's incoming friend requests
    )) as 0 | 1;
    if (isAlreadyAdded) {
      return new Response('Already added this user', { status: 400 })
    }


    // Checking if the user is already a friend of the id
    const isAlreadyFriends = (await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    )) as 0 | 1;

    if (isAlreadyFriends) {
      return new Response('Already friends with this user', { status: 400 })
    }

    // valid request, i.e I will now snd a friend request

    // inserting where to add, what to add
    await db.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);
    
    return new Response('OK')

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request payload', { status: 422 })
    }

    return new Response('Invalid request', { status: 400 })
  }
}
