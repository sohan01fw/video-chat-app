import { useEffect } from "react";
import { useCallback } from "react";
import { useSocket } from "../context/SocketProvider";
import { useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";

export const Room = () => {
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMystream] = useState(null);
  const { socket } = useSocket();

  const handleJoined = useCallback((data) => {
    setRemoteSocketId(data.id);
  }, []);
  //handle incoming call
  const handleIncomingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMystream(stream);
      setRemoteSocketId(from);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket],
  );

  //Accepted incoming call
  const handleAcceptedIncomingCall = useCallback(async ({ ans }) => {
    peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleJoined);
    socket.on("call:incoming", handleIncomingCall);
    socket.on("call:accepted", handleAcceptedIncomingCall);
    return () => {
      socket.off("user:joined", handleJoined),
        socket.on("call:incoming", handleIncomingCall);
      socket.on("call:accepted", handleAcceptedIncomingCall);
    };
  }, [socket, handleJoined, handleIncomingCall, handleAcceptedIncomingCall]);

  const handleCall = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffers();
    socket.emit("call:user", { to: remoteSocketId, offer });
    setMystream(stream);
  }, [socket, remoteSocketId]);
  return (
    <div>
      hello from room.
      {myStream && (
        <ReactPlayer
          height={"300px"}
          width="400px"
          playing
          muted
          url={myStream}
        />
      )}
      <h4>{remoteSocketId ? "connected" : "No one is in room"}</h4>
      {remoteSocketId && <button onClick={handleCall}>call</button>}
    </div>
  );
};
