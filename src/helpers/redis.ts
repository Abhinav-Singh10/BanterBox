const upstashRedisRestUrl = process.env.UPSTASH_REDIS_REST_URL;
const authToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// methods for our custom Redis fetch function
// All these commands are supported by redis upstash 
// s stands for set in these commands
type Command = "zrange" | "sismember" | "get" | "smembers";

// we are creating a modified fetch for ourselves such that we don;t get the caching behaviour of nextjs13
export async function fetchRedis(
  command: Command, // the commands we defined earlier in type
  ...args: (string | number)[] // catching all the rest of the arguments possible
) {
  const commandUrl = `${upstashRedisRestUrl}/${command}/${args.join("/")}`;

  const response = await fetch(commandUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Error executing Redis command: ${response.statusText}`);
  }

  const data = await response.json();
  return data.result;
}
