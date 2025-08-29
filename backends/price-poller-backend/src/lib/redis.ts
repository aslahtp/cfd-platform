import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const REDIS_HOST =
  process.env.REDIS_HOST ||
  "redis-17842.c91.us-east-1-3.ec2.redns.redis-cloud.com";
const REDIS_PORT = Number(process.env.REDIS_PORT || 17842);
const REDIS_USERNAME = process.env.REDIS_USERNAME || "default";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "REPLACE_ME";

export const redis = createClient({
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
});

let ready = false;

redis.on("ready", () => {
  ready = true;
});

redis.on("end", () => {
  ready = false;
});

redis.on("error", (err) => {
  console.warn("[redis] error:", err?.message);
});

export async function ensureRedis() {
  if (redis.isOpen) {
    ready = true;
    return true;
  }
  try {
    await redis.connect();
    ready = true;
    return true;
  } catch (e) {
    console.warn("[redis] connect failed:", (e as Error).message);
    ready = false;
    return false;
  }
}

export function isRedisReady() {
  return ready && redis.isOpen;
}

export async function publishJson(channel: string, payload: unknown) {
  if (!isRedisReady()) {
    try {
      const str = JSON.stringify(payload);
      console.warn(
        "[redis] skip publish (not ready)",
        channel,
        `${str.length}b`
      );
    } catch {
      console.warn("[redis] skip publish (not ready)", channel);
    }
    return;
  }
  try {
    const str = JSON.stringify(payload);
    console.log("[redis] publish", channel, `${str.length}b`);
    await redis.publish(channel, str);
    console.log("[redis] published", channel);
  } catch (e) {
    console.warn("[redis] publish failed", channel, (e as Error).message);
  }
}
