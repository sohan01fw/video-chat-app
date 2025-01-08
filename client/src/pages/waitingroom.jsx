import { useEffect } from "react";
import { useState } from "react";
import { StreamMedia } from "../lib/stream";
import { VideoStream } from "../lib/roomshandler";
import { useSocket } from "../context/SocketProvider";
import { cooki } from "../lib/process";
import { useCallback } from "react";

export function WaitingRoom() {
  const { socket } = useSocket();
  const [mystream, setMystream] = useState();
  const [start, setStart] = useState(false);

  const streamff = async () => {
    const stream = await StreamMedia();
    setMystream(stream);
    const data = {
      email: cooki.email,
      name: cooki.name,
      gender: cooki.gender,
    };
    socket.emit("join-queue", data);
  };
  useEffect(() => {
    streamff();
  }, []);

  //for to handle sockets
  const handleJoinedRoom = useCallback((data) => {
    console.log(data);
  }, []);
  useEffect(() => {
    socket.on("joined:room", handleJoinedRoom);
    return () => socket.off("joined:room", handleJoinedRoom);
  }, [socket, handleJoinedRoom]);

  //start a btn func
  const handleStart = () => {
    setStart(true);
    socket.emit("start:session");
  };

  //stop a btn func
  const handleStop = () => {
    setStart(false);
    socket.emit("end:session");
  };

  return (
    <div>
      hey from waiting room
      <div className="flex flex-row gap-5">
        <div>{mystream && <VideoStream myStream={mystream} />}</div>
        {start && (
          <div className="border border-white h-[19rem] w-[26rem]"></div>
        )}
      </div>
      <div className="m-5">
        {!start ? (
          <button onClick={handleStart}>start</button>
        ) : (
          <button onClick={handleStop}>stop</button>
        )}
      </div>
    </div>
  );
}
