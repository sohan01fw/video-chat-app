// import { Redis } from "@upstash/redis";

// export const client = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN,
// });

import dotenv from "dotenv";

import { createClient } from "redis";
dotenv.config();

dotenv.config();

export const client = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: "redis-17423.c264.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 17423,
  },
});

client.on("error", (err) => console.log("Redis Client Error", err));

await client.connect();
