import { client } from "./redis_core.js";

export async function addToQueue(queue_name, value1, value2) {
  try {
    await client.hSet(queue_name, value1, value2);
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
    await client.hSet(`${queue_name}:${roomId}`, value1, value2);
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
    const User = await client.hExists("users_queue", id);
    if (User) {
      const addUser = await client.hDel("users_queue", id);
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
      const roomFields = await client.hLen(`rooms:${roomId}`);
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
    const roomKey = `rooms:${roomId}`;
    const roomExists = await client.keys("rooms:*");

    // Check if the hash is empty (indicating the room doesn't exist)
    if (Object.keys(roomExists).length === 0) {
      return {
        msg: "Room not found",
        status: 404,
      };
    }

    // Delete the room based on roomId
    const delRoom = await client.del(roomExists);

    return {
      msg: "Deleted room",
      status: 200,
    };
  } catch (error) {
    console.log("Error while removing from the queue:", error);
    return {
      msg: "Something went wrong while deleting the room",
      status: 500,
    };
  }
}
