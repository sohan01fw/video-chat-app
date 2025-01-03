import { useEffect } from "react";
import { useCallback } from "react";
import { useSocket } from "../context/SocketProvider";
import { useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";

export const Room = () => {
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMystream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const { socket } = useSocket();

  //join the user
  const handleJoined = useCallback((data) => {
    setRemoteSocketId(data.id);
  }, []);

  //handle remote stream
  useEffect(() => {
    peer.peer.addEventListener("track", async (d) => {
      const remoteStream = d.streams;
      setRemoteStream(remoteStream);
    });
  }, []);

  //handle incoming call
  const handleIncomingCall = useCallback(
    async (data) => {
      const { id, offer } = data;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMystream(stream);
      setRemoteSocketId(id);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: id, ans });
    },
    [socket],
  );

  //Accepted incoming call
  const handleAcceptedIncomingCall = useCallback(async ({ ans }) => {
    peer.setLocalDescription(ans);
  }, []);

  //handle negotiation;
  const handleNegotitaionNeeded = useCallback(
    async (data) => {
      const { offer } = data;
      const ans = await peer.getAnswer(offer);
      socket.emit("nego:done", { to: remoteSocketId, ans });
    },
    [socket, remoteSocketId],
  );
  const handleDoneNego = useCallback((data) => {
    const { ans } = data;
    peer.setLocalDescription(ans);
    console.log("negotiation done");
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleJoined);
    socket.on("call:incoming", handleIncomingCall);
    socket.on("call:accepted", handleAcceptedIncomingCall);
    socket.on("nego:needed", handleNegotitaionNeeded);
    socket.on("nego:done", handleDoneNego);
    return () => {
      socket.off("user:joined", handleJoined),
        socket.off("call:incoming", handleIncomingCall);
      socket.off("call:accepted", handleAcceptedIncomingCall);
      socket.off("nego:needed", handleNegotitaionNeeded);
      socket.off("nego:done", handleDoneNego);
    };
  }, [
    socket,
    handleJoined,
    handleNegotitaionNeeded,
    handleIncomingCall,
    handleAcceptedIncomingCall,
    handleDoneNego,
  ]);

  //handle call on btn click.
  const handleCall = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMystream(stream);
    const offer = await peer.getOffers();
    socket.emit("call:user", { to: remoteSocketId, offer });
  }, [socket, remoteSocketId]);

  //handling negotiation
  const handleNegotiation = useCallback(async () => {
    //create offer for it
    const offer = await peer.getOffers();
    socket.emit("nego:needed", { to: remoteSocketId, offer });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegotiation);

    return () =>
      peer.peer.removeEventListener("negotiationneeded", handleNegotiation);
  }, [handleNegotiation]);

  //handle stream
  const handleStream = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

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
      {remoteStream && (
        <ReactPlayer
          height={"300px"}
          width="400px"
          playing
          muted
          url={myStream}
        />
      )}
      <h4>{remoteSocketId ? "connected" : "No one is in room"}</h4>
      {myStream && remoteSocketId && (
        <button onClick={handleStream}>stream video</button>
      )}
      {remoteSocketId && <button onClick={handleCall}>call</button>}
    </div>
  );
};
