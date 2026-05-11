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
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io({
      path: '/api/ws',
      transports: ['websocket'], // force websocket for performance
      reconnectionDelay: 3000,
      reconnectionDelayMax: 10000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket.io Connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket.io Disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.io Error:', err.message);
    });

    socketRef.current = socket;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((type: string, payload: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(type, payload);
    }
  }, []);

  const subscribe = useCallback((type: string, callback: (payload: any) => void) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on(type, callback);

    return () => {
      if (socketRef.current) {
        socketRef.current.off(type, callback);
      }
    };
  }, []);

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
