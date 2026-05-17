'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (type: string, payload: any) => void;
  subscribe: (type: string, callback: (payload: any) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io({
      path: '/api/ws',
      transports: ['websocket'],
      reconnectionDelay: 3000,
      reconnectionDelayMax: 10000,
    });

    s.on('connect', () => {
      setIsConnected(true);
      console.log('Socket.io Connected');
    });

    s.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket.io Disconnected');
    });

    s.on('connect_error', (err) => {
      console.error('Socket.io Error:', err.message);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const sendMessage = useCallback((type: string, payload: any) => {
    if (socket?.connected) {
      socket.emit(type, payload);
    }
  }, [socket]);

  const subscribe = useCallback((type: string, callback: (payload: any) => void) => {
    if (!socket) return () => {};

    socket.on(type, callback);

    return () => {
      socket.off(type, callback);
    };
  }, [socket]);

  return (
    <WebSocketContext.Provider value={{ isConnected, sendMessage, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWS = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWS must be used within WebSocketProvider');
  return context;
};
