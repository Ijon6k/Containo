"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (type: string, payload: any) => void;
  subscribe: (type: string, callback: (payload: any) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

// Global WebSocket provider — connects to socket.io at /api/ws on mount.
// Socket stored in a ref (not state) to avoid unnecessary re-renders.
// Only `isConnected` triggers re-renders when connection status changes.
export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const s = io({
      path: "/api/ws",
      transports: ["websocket"],
      reconnectionDelay: 3000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current = s;

    s.on("connect", () => {
      setIsConnected(true);
      if (process.env.NODE_ENV === 'development') {
        console.log("Socket.io Connected");
      }
    });

    s.on("disconnect", () => {
      setIsConnected(false);
      if (process.env.NODE_ENV === 'development') {
        console.log("Socket.io Disconnected");
      }
    });

    s.on("connect_error", (err) => {
      if (process.env.NODE_ENV === 'development') {
        console.error("Socket.io Error:", err.message);
      }
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Stable identity — reads latest socket from ref, no render needed
  const sendMessage = useCallback((type: string, payload: any) => {
    socketRef.current?.emit(type, payload);
  }, []);

  // Changes identity only on connect/disconnect (2x per session)
  const subscribe = useCallback(
    (type: string, callback: (payload: any) => void) => {
      if (!socketRef.current) return () => {};

      socketRef.current.on(type, callback);

      return () => {
        socketRef.current?.off(type, callback);
      };
    },
    // isConnected is intentionally included as a dependency — it triggers
    // subscribe identity change so consumers re-subscribe after connect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isConnected],
  );

  return (
    <WebSocketContext.Provider value={{ isConnected, sendMessage, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWS = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error("useWS must be used within WebSocketProvider");
  return context;
};
