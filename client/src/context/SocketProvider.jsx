import { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const Context = createContext(null);

export const useSocket = () => {
  const socket = useContext(Context);
  return { socket };
};

export const SocketProvider = ({ children }) => {
  const prod_url = import.meta.env.VITE_SERVER_WEBSOCKET_PRODUCTION_URL;
  const local_url = import.meta.env.VITE_SERVER_LOCAL_URL;
  const socketio = useMemo(
    () => io(local_url ? local_url : prod_url),
    [prod_url, local_url],
  );
  return <Context.Provider value={socketio}>{children}</Context.Provider>;
};
