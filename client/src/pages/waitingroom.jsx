import { useEffect } from "react";
import { useState } from "react";
import { StreamMedia } from "../lib/stream";
import { VideoStream } from "../lib/roomshandler";
import cookie from "js-cookie";
import { useSocket } from "../context/SocketProvider";

export function WaitingRoom() {
  const [mystream, setMystream] = useState();
  const { socket } = useSocket();

  const streamff = async () => {
    const email = cookie.get("email");
    const data = {
      email,
    };
    socket.emit("join-queue", data);
    const stream = await StreamMedia();
    setMystream(stream);
  };
  useEffect(() => {
    streamff();
  }, []);
  return (
    <div>
      hey from waiting room
      <div>{mystream && <VideoStream myStream={mystream} />}</div>
    </div>
  );
}
