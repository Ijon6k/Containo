import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, X } from 'lucide-react';
import { Container } from '@/lib/types';

interface LogModalProps {
  container: Container | null;
  onClose: () => void;
}

export const LogModal = ({ container, onClose }: LogModalProps) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container) {
      setLogs([]);
      return;
    }

    setIsLoading(true);
    setLogs([]);
    
    const eventSource = new EventSource(`/api/containers/${container.id}/logs`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.log) {
          setLogs(prev => {
            const newLogs = [...prev, data.log];
            if (newLogs.length > 500) {
              return newLogs.slice(newLogs.length - 500);
            }
            return newLogs;
          });
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to parse log line', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error', err);
    };

    return () => {
      eventSource.close();
    };
  }, [container]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <AnimatePresence>
      {container && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl h-[80vh] flex flex-col bg-surface border border-border rounded-md shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
              <div className="flex items-center gap-3">
                <ScrollText className="w-5 h-5 text-brand" />
                <h3 className="font-semibold text-text-primary">Logs: {container.name}</h3>
              </div>
              <button onClick={onClose}>
                <X className="w-6 h-6 text-text-tertiary hover:text-danger transition-colors" />
              </button>
            </div>
            <div ref={scrollRef} className="flex-1 bg-black p-6 overflow-y-auto font-mono text-sm text-text-secondary">
              {logs.length === 0 ? (
                <div className="text-text-tertiary italic">
                  {isLoading ? 'Fetching logs...' : 'No logs available for this container.'}
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="py-0.5 border-b border-border/50 whitespace-pre-wrap">{log}</div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
