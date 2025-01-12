// import { Redis } from "@upstash/redis";

// export const client = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN,
// });

import dotenv from "dotenv";

import { createClient } from "redis";
dotenv.config();

export const client = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_SOCKET_HOST,
    port: 17423,
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));

await client.connect();

// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar
