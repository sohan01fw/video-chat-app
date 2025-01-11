import Redis from "ioredis";

export const client = new Redis(
  `rediss://default:${process.env.UPSTASH_REDIS_REST_TOKEN}@${process.env.UPSTASH_REDIS_REST_URL}:6379`,
);
