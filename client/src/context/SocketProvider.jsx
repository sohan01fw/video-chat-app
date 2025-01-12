import { createContext, useMemo, useContext } from "react";
import { io } from "socket.io-client";

const Context = createContext(null);

export const useSocket = () => {
  const socket = useContext(Context);
  return { socket };
};

export const SocketProvider = ({ children }) => {
  // Check environment mode (production or development)
  const prod_url = import.meta.env.VITE_SERVER_WEBSOCKET_PRODUCTION_URL;
  const local_url = import.meta.env.VITE_SERVER_LOCAL_URL;

  // Use correct WebSocket URL based on environment
  const socketio = useMemo(() => {
    if (import.meta.env.MODE === "production") {
      return io(prod_url); // Use production URL
    }
    return io(local_url || prod_url, {
      transports: ["websocket"], // Use WebSocket transport
      withCredentials: true, // Include credentials if needed
    }); // Use local URL or fallback to prod URL if available
  }, [prod_url, local_url]);

  return <Context.Provider value={socketio}>{children}</Context.Provider>;
};
