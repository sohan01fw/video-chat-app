import { useEffect } from "react";
import { useState } from "react";
import { StreamMedia } from "../lib/stream";
import { VideoStream } from "../lib/roomshandler";
import { useSocket } from "../context/SocketProvider";
import { useCallback } from "react";
import peer from "../service/peer";
import cookie from "js-cookie";

export function WaitingRoom() {
  const { socket } = useSocket();
  const [mystream, setMystream] = useState(null);
  const [start, setStart] = useState(false);
  const [ready, setReady] = useState(false);
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  //handle remote stream
  useEffect(() => {
    peer.peer.addEventListener("track", async (d) => {
      const remoteStream = d.streams;
      setRemoteStream(remoteStream);
    });
  }, []);

  //ready state(add the user to queue for waiting to start session)
  const handleReady = useCallback(async () => {
    //get user from cookie
    const cookies = cookie.get("userData");
    const cooki = JSON.parse(cookies);

    const data = {
      email: cooki.email,
      name: cooki.name,
      gender: cooki.gender,
    };
    socket.emit("join-queue", data);
    //permission to open video and audio in browser
    const stream = await StreamMedia();
    setMystream(stream);
    setReady(true);
  }, [socket]);

  //start session
  const handleStart = useCallback(async () => {
    //sending media stream to peer2peer through webrtc.
    for (const track of mystream.getTracks()) {
      peer.peer.addTrack(track, mystream);
      // console.log("track", track);
    }
    setStart(true);
    socket.emit("start:session"); //socket to start session
  }, [socket, mystream]);

  //user joined the room
  const handleJoinedRoom = useCallback(
    async (data) => {
      const { socketId } = data;
      setRemoteSocketId(socketId); //here socketId is ths id of user who joined.
      // create offer
      const offer = await peer.getOffers(); //here we just creating an offer
      //emit the offer to other user
      socket.emit("call:user", { to: remoteSocketId, offer });
    },
    [socket, remoteSocketId],
  );
  //handling incoming call from another user
  const handleIncomingCall = useCallback(
    async (data) => {
      const { id, offer } = data;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMystream(stream);
      setRemoteSocketId(id); //here id is from where call is comming
      //create answer
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: id, ans }); //emit answer to recieve the call accepted
    },
    [socket],
  );

  //handle call accepted function
  const handleCallAccepted = useCallback(async (data) => {
    const { ans } = data;
    await peer.setRemoteDescription(ans);
  }, []);

  const handleNegotiation = useCallback(async () => {
    //create offer
    const offer = await peer.getOffers();

    //emit to 2nd peer
    socket.emit("nego:needed", { to: remoteSocketId, offer });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    if (peer.peer.signalingState === "have-local-offer") {
      // Safe to negotiate
      console.log("ok its has local offer now");
      peer.peer.addEventListener("negotiationneeded", handleNegotiation);
    }
    return () =>
      peer.peer.removeEventListener("negotiationneeded", handleNegotiation);
  }, [handleNegotiation]);

  const handleNegotitaionNeeded = useCallback(
    async (data) => {
      const { id, offer } = data;
      //create answer
      const ans = await peer.getAnswer(offer);

      //emitting socket id to first user/peer
      socket.emit("nego:done", { to: id, ans });
    },
    [socket],
  );

  const handleDoneNego = useCallback(async (data) => {
    const { ans } = data;
    await peer.setRemoteDescription(ans);
    console.log("nego done");
  }, []);

  useEffect(() => {
    socket.on("joined:room", handleJoinedRoom);
    socket.on("call:incoming", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("nego:needed", handleNegotitaionNeeded);
    socket.on("nego:done", handleDoneNego);
    return () => {
      socket.off("joined:room", handleJoinedRoom);
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
    setRemoteStream(null);
    socket.emit("end:session");
  };

  return (
    <div>
      hey from waiting room
      <div className="flex flex-row gap-5">
        {mystream && (
          <div className="border border-blue-400 h-[19rem] w-[26rem]">
            <VideoStream myStream={mystream} />
          </div>
        )}
        {remoteStream && (
          <div className="border border-red-500 h-[19rem] w-[26rem]">
            <VideoStream myStream={mystream} />
          </div>
        )}
      </div>
      <div className="m-5">
        {ready === false && <button onClick={handleReady}>ready</button>}
        {ready &&
          (!start ? (
            <button onClick={handleStart}>start</button>
          ) : (
            <button onClick={handleStop}>stop</button>
          ))}
      </div>
    </div>
  );
}
