import express from "express";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 8000;
const SOCKETPORT = process.env.SOCKETPORT || 8001;

app.get("/", (req, res) => {
  res.send("Hello from world!");
});
//mapping email to socket id;
const emailToSocketIdMap = new Map();
//mapping socketId to email;
const socketIdToEmailMap = new Map();
//intialize socket server
const io = new Server(SOCKETPORT, {
  cors: true,
});

//established socket connection
io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    const { email, roomId } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);
    socket.join(roomId);
    io.to(roomId).emit("user:joined", { email, id: socket.id });
    io.to(socket.id).emit("join-room", data);
  });

  socket.on("call:user", (data) => {
    const { to, offer } = data;
    io.to(to).emit("call:incoming", { id: socket.id, offer });
  });

  socket.on("call:accepted", (data) => {
    const { to, ans } = data;
    io.to(to).emit("call:accepted", { id: socket.id, ans });
  });

  //for negotiation
  socket.on("nego:needed", (data) => {
    const { to, offer } = data;
    io.to(to).emit("nego:needed", { from: socket.id, offer });
  });

  socket.on("nego:done", (data) => {
    const { to, ans } = data;
    io.to(to).emit("nego:done", { from: socket.id, ans });
  });
});

app.listen(PORT, () => {
  console.log(`server is working ${PORT}`);
});
