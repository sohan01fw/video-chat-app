import { client } from "./redis_core.js";

export async function addToQueue(queue_name, value1, value2) {
  try {
    await client.hset(queue_name, value1, value2);
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
//for rooms
export async function addToRoomQueue(queue_name, roomId, value1, value2) {
  try {
    await client.hset(`${queue_name}:${roomId}`, value1, value2);
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

//check the rooms
export async function getAllRooms() {
  try {
    const getRooms = await client.keys("rooms:*");
    for (const roomId of getRooms) {
      // const roomData = await JSON.parse(await client.hget("rooms",roomId))
      // console.log(roomData);
      const roomFields = await client.hlen(`rooms:${roomId}`);
      if (roomFields < 2) {
        return roomId;
      }
    }
    return null;
  } catch (error) {
    console.log("error while removing from the queue", error);
  }
}
//delete rooms
export async function delRooms(roomId) {
  try {
    const roomKey = `rooms:${roomId}`; // Use the roomId to form the correct key
    const roomExists = await client.exists(roomKey); // Check if the room exists

    if (!roomExists) {
      return {
        msg: "Room not found",
        status: 404,
      };
    }

    // Delete the room based on roomId
    await client.del(roomKey);

    return {
      msg: "deleted room",
      status: 200,
    };
  } catch (error) {
    console.log("error while removing from the queue", error);
    return {
      msg: "Something went wrong wile delete room",
      status: 500,
    };
  }
}
