import express from "express";
import { Server } from "socket.io";
import { addToQueue, removeFromQueue } from "./lib/redis/redis_op.js";

const app = express();

const PORT = process.env.PORT || 9000;
const SOCKETPORT = process.env.SOCKETPORT || 9001;

app.get("/", (req, res) => {
  res.send("Hello from world!");
});
//mapping email to socket id;
const nameToSocketIdMap = new Map();
//mapping socketId to email;
const socketIdToEmailMap = new Map();
//intialize socket server
const io = new Server(SOCKETPORT, {
  cors: true,
  cookie: true,
});

//established socket connection
io.on("connection", (socket) => {
  socket.on("join-queue", async (data) => {
    const { email, name, gender } = data;
    //run map to set the value in future usecases.
    nameToSocketIdMap.set(name, socket.id);
    socketIdToEmailMap.set(socket.id, name);
    // get user data and add to the redis queue.
    const { success, status, msg } = await addToQueue(email, name);
    if (!success) {
      io.to(socket.id).emit("join-fail", msg);
    }
    io.to(socket.id).emit("join-queue", { msg, id: socket.id });

    //joined users to the room(max 2 only)
    // socket.join(roomId);
    // io.to(roomId).emit("user:joined", { email, id: socket.id });
    // io.to(socket.id).emit("join-room", data);
  });

  // socket.on("call:user", (data) => {
  //   const { to, offer } = data;
  //   io.to(to).emit("call:incoming", { id: socket.id, offer });
  // });

  // socket.on("call:accepted", (data) => {
  //   const { to, ans } = data;
  //   io.to(to).emit("call:accepted", { id: socket.id, ans });
  // });

  // //for negotiation
  // socket.on("nego:needed", (data) => {
  //   const { to, offer } = data;
  //   io.to(to).emit("nego:needed", { from: socket.id, offer });
  // });

  // socket.on("nego:done", (data) => {
  //   const { to, ans } = data;
  //   io.to(to).emit("nego:done", { from: socket.id, ans });
  // });
  socket.on("disconnecting", async () => {
    const cookies = socket.request.headers.cookie; // Raw cookie header
    console.log("Cookies:", cookies);
    console.log("disconnect");
    await removeFromQueue(socket.id);
  });
});

app.listen(PORT, () => {
  console.log(`server is working ${PORT}`);
});
