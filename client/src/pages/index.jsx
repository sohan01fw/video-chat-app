import { useState, useEffect, useCallback } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";
import cookie from "js-cookie";
import { cooki } from "../lib/process";

export function IndexPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [consent, setConsent] = useState(false);
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (cooki) {
      const data = {
        email: cooki.email,
        name: cooki.name,
        gender: cookie.gender,
      };
      socket.emit("join-queue", data);
    }
  }, []);
  const handleJoinQueue = useCallback(
    (data) => {
      const { id } = data;
      navigate(`/video-chat`);
    },
    [navigate],
  );
  const handleJoinFail = useCallback(
    (msg) => {
      alert(msg);
      navigate("/");
    },
    [navigate],
  );
  useEffect(() => {
    socket.on("join-queue", handleJoinQueue);
    socket.on("join-fail", handleJoinFail);
    return () => {
      socket.off("join-queue", handleJoinQueue),
        socket.off("join-fail", handleJoinFail);
    };
  }, [socket, handleJoinQueue, handleJoinFail]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (consent) {
        if (email === "" || name === "" || gender === "") {
          return alert("fill up all the field!");
        }
        const data = {
          email,
          name,
          gender,
        };
        //set cookies for mimic auth
        cookie.set(
          "userData",
          JSON.stringify({ email: email, name: name, gender: gender }),
          {
            SameSite: "None",
            Secure: true,
            path: "/",
          },
        );
        socket.emit("join-queue", data);
      } else {
        alert("Not allowed,Must be 18+ to enter!");
      }
    },
    [name, gender, email, consent, socket],
  );
  return (
    <div>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2 text-left">
          <label className="font-semibold">Choose a Email </label>
          <input
            value={email}
            className="p-2 rounded-xl shadow-md"
            placeholder="write your email..."
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>
        <div className="flex flex-col gap-2 text-left">
          <label className="font-semibold">Choose a Name </label>
          <input
            value={name}
            className="p-2 rounded-xl shadow-md"
            placeholder="write your name..."
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </div>
        <div className="flex flex-col gap-2 text-left">
          <label className="font-semibold">Choose a Gender </label>
          <select
            name="gender"
            value={gender}
            onChange={(e) => {
              setGender(e.target.value);
            }}
            className="rounded-xl shadow-md p-2"
          >
            <option value={""}>select gender</option>
            <option value={"male"}>Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <input
            type="checkbox"
            onChange={() => {
              setConsent(!consent);
            }}
          />
          <label> are you 18+?</label>
        </div>
        <button type="submit">Enter</button>
      </form>
    </div>
  );
}
