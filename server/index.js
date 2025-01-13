import express from "express";
import { Server } from "socket.io";
import {
  addToQueue,
  addToRoomQueue,
  delRooms,
  getAllRooms,
  removeFromQueue,
} from "./lib/redis/redis_op.js";
import short from "short-uuid";
import dotenv from "dotenv";
import https from "https";
import fs from "fs";

const app = express();

const PORT = 9001;
// const SOCKETPORT = 9001;

dotenv.config();
app.get("/", (req, res) => {
  res.send("Hello from world!");
});
//certificate
const cert = fs.readFileSync("./etc/cert.pem");
const key = fs.readFileSync("./etc/key.pem");

//mapping email to socket id;
const emailToSocketIdMap = new Map();
//mapping socketId to email;
const socketIdToEmailMap = new Map();
//mapping socketId to name;
const socketIdToNameMap = new Map();

// Create HTTPS server
const server = https.createServer({ cert, key }, app);
//intialize socket server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

//established socket connection
io.on("connection", (socket) => {
  socket.on("join-queue", async (data) => {
    const { email, name, gender } = data;
    //run map to set the value in future usecases.
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);
    socketIdToNameMap.set(socket.id, name);
    // get user data and add to the redis queue.
    const queue_name = "users_queue";
    const { success, status, msg } = await addToQueue(queue_name, email, name);
    if (!success) {
      io.to(socket.id).emit("join-fail", msg);
    }
    io.to(socket.id).emit("join-queue", { msg, id: socket.id });

    //joined users to the room(max 2 only)
    // socket.join(roomId);
    // io.to(roomId).emit("user:joined", { email, id: socket.id });
  });
  socket.on("start:session", async () => {
    const email = socketIdToEmailMap.get(socket.id);
    //remove user from the queue
    await removeFromQueue(email);
    //check any of the room is fill up or not
    const roomId = await getAllRooms();
    //join the room
    socket.join(roomId);

    //check socket inside room
    const room = io.sockets.adapter.rooms.get(roomId);
    if (room.size === 2) {
      io.to(roomId).emit("joined:room", {
        email: email,
        msg: "hi you are connected to the room",
        socketId: socket.id,
      });
      await delRooms(roomId);
    }

    //if no any room is available then create new one and join on it
    if (roomId === null) {
      const email = socketIdToEmailMap.get(socket.id);
      //remove user from the queue
      await removeFromQueue(email);
      const roomId = short.generate();
      const queue_name = "rooms";
      const name = socketIdToNameMap.get(socket.id);
      //add user to the room queue
      const { success, status, msg } = await addToRoomQueue(
        queue_name,
        roomId,
        email,
        name,
      );
      if (status === 200) {
        //check any of the room is fill up or not
        const roomId = await getAllRooms();
        //join the room
        socket.join(roomId);
      }
    }
  });

  socket.on("call:user", (data) => {
    const { to, offer } = data;
    const e = socketIdToEmailMap.get(socket.id);
    io.to(to).emit("call:incoming", { id: socket.id, offer });
  });

  socket.on("call:accepted", (data) => {
    const { to, ans } = data;
    io.to(to).emit("call:accepted", { id: socket.id, ans });
  });

  // //for negotiation
  socket.on("nego:needed", (data) => {
    const { to, offer } = data;
    console.log("negoneed", data);
    io.to(to).emit("nego:needed", { id: socket.id, offer });
  });

  socket.on("nego:done", (data) => {
    const { to, ans } = data;
    console.log("nego:done", data);
    io.to(to).emit("nego:done", { id: socket.id, ans });
  });
  socket.on("end:session", () => {});
  socket.on("disconnecting", async () => {
    // await removeFromQueue(socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`server is working ${PORT}`);
});
