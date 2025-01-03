import { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const Context = createContext(null);

export const useSocket = () => {
  const socket = useContext(Context);
  return { socket };
};

export const SocketProvider = ({ children }) => {
  const socketio = useMemo(() => io("ws://localhost:9001"), []);
  return <Context.Provider value={socketio}>{children}</Context.Provider>;
};
