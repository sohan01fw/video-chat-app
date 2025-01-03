import { client } from "./redis_core.js";

export async function addToQueue(email, name) {
  try {
    await client.hset("users_queue", email, name);
    return {
      success: true,
      msg: "successfully added to the queue",
      status: 200,
    };
  } catch (error) {
    console.log("error while adding to the queue", error);
    return {
      success: false,
      msg: "error while adding to the queue",
      status: 500,
    };
  }
}

export async function removeFromQueue(id) {
  try {
    const User = await client.hexists("users_queue", id);
    if (User) {
      const addUser = await client.hdel("users_queue", 0, id);
    }
  } catch (error) {
    console.log("error while removing from the queue", error);
  }
}
