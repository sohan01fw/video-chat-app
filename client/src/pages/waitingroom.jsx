import { useEffect } from "react";
import { useState } from "react";
import { StreamMedia } from "../lib/stream";
import { VideoStream } from "../lib/roomshandler";
import { useSocket } from "../context/SocketProvider";
import { cooki } from "../lib/process";
import { useCallback } from "react";
import peer from "../service/peer";

export function WaitingRoom() {
  const { socket } = useSocket();
  const [mystream, setMystream] = useState(null);
  const [start, setStart] = useState(false);
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  //for the inital load of the page(user joins the queue)
  const streamff = useCallback(async () => {
    const data = {
      email: cooki.email,
      name: cooki.name,
      gender: cooki.gender,
    };
    socket.emit("join-queue", data);
  }, [socket]);
  useEffect(() => {
    streamff();
  }, [streamff]);

  //handle remote stream
  useEffect(() => {
    peer.peer.addEventListener("track", async (d) => {
      const remoteStream = d.streams;
      setRemoteStream(remoteStream);
    });
  }, []);

  //start session
  const handleStart = useCallback(async () => {
    //permission to open video and audio in browser
    const stream = await StreamMedia();
    setMystream(stream);
    for (const track of mystream.getTracks()) {
      peer.peer.addTrack(track, stream);
    }
    setStart(true);
    socket.emit("start:session"); //socket to start session
  }, [socket, mystream]);

  //user joined the room
  const handleJoinedRoom = useCallback(
    async (data) => {
      const { socketId } = data;
      setRemoteSocketId(socketId);
      //create offer
      const offer = await peer.getOffers(); //here we just creating an offer
      //emit the offer to other user
      socket.emit("call:user", { to: socketId, offer });
    },
    [socket],
  );
  //handling incoming call from another user
  const handleIncomingCall = useCallback(
    async (data) => {
      const { id, offer } = data;
      //permission to open video and audio in browser
      const stream = await StreamMedia();
      setMystream(stream);
      setRemoteSocketId(id);
      //create answer
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: id, ans }); //emit answer to recieve the call accepted
    },
    [socket],
  );

  //handle call accepted function
  const handleCallAccepted = useCallback((data) => {
    const { id, ans } = data;
    // peer.setLocalDescription(ans);
    console.log("callaccepted", id);
  }, []);

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

  //handle negotiation and emit done .
  const handleNegotitaionNeeded = useCallback(
    async (data) => {
      const { offer } = data;
      const ans = await peer.getAnswer(offer);
      socket.emit("nego:done", { to: remoteSocketId, ans });
    },
    [socket, remoteSocketId],
  );
  //handle done negotiation
  const handleDoneNego = useCallback((data) => {
    const { ans } = data;
    peer.setLocalDescription(ans);
    console.log("negotiation done");
  }, []);
  useEffect(() => {
    socket.on("joined:room", handleJoinedRoom);
    socket.on("call:incoming", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("nego:needed", handleNegotitaionNeeded);
    socket.on("nego:done", handleDoneNego);
    return () => {
      socket.off("joined:room", handleJoinedRoom),
        socket.off("call:incoming", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("nego:needed", handleNegotitaionNeeded);
      socket.off("nego:done", handleDoneNego);
    };
  }, [
    socket,
    handleJoinedRoom,
    handleIncomingCall,
    handleCallAccepted,
    handleNegotitaionNeeded,
    handleDoneNego,
  ]);

  //stop session btn func
  const handleStop = () => {
    setMystream(null);
    setStart(false);
    socket.emit("end:session");
  };

  return (
    <div>
      hey from waiting room
      <div className="flex flex-row gap-5">
        <div>{mystream && <VideoStream myStream={mystream} />}</div>
        {remoteStream && (
          <div className="border border-white h-[19rem] w-[26rem]">
            <VideoStream myStream={mystream} />
          </div>
        )}
      </div>
      <div className="m-5">
        {!start ? (
          <button onClick={handleStart}>ready</button>
        ) : (
          <button onClick={handleStop}>stop</button>
        )}
      </div>
    </div>
  );
}
