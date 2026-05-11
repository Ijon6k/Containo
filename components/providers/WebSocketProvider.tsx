'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

interface WSMessage {
  type: string;
  payload: any;
}

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (type: string, payload: any) => void;
  subscribe: (type: string, callback: (payload: any) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<string, Set<(payload: any) => void>>>(new Map());

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const ws = new WebSocket(`${protocol}//${host}/api/ws`);

    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket Connected');
    };

    ws.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data);
        const callbacks = listenersRef.current.get(type);
        if (callbacks) {
          callbacks.forEach(cb => cb(payload));
        }
      } catch (e) {
        console.error('WS Parse Error:', e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setTimeout(connect, 3000);
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  const subscribe = useCallback((type: string, callback: (payload: any) => void) => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, new Set());
    }
    listenersRef.current.get(type)!.add(callback);

    return () => {
      const callbacks = listenersRef.current.get(type);
      if (callbacks) {
        callbacks.delete(callback);
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
