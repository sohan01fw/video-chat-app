import { useState, useEffect, useCallback } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

export function IndexPage() {
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");
  const { socket } = useSocket();
  const navigate = useNavigate();

  const handleJoinRoom = useCallback(
    (data) => {
      navigate(data.roomId);
    },
    [navigate],
  );
  useEffect(() => {
    socket.on("join-room", handleJoinRoom);
    return () => socket.off("join-room", handleJoinRoom);
  }, [socket, handleJoinRoom]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const data = { email, roomId };
      socket.emit("join-room", data);
    },
    [email, roomId, socket],
  );
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <input
          value={roomId}
          onChange={(e) => {
            setRoomId(e.target.value);
          }}
        />
        <button type="submit">Enter</button>
      </form>
    </div>
  );
}
