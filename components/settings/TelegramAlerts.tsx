'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Key, MessageSquare, Info, RefreshCw, Save } from 'lucide-react';

interface TelegramAlertsProps {
  onSave: (token: string, chatId: string) => void;
  isLoading: boolean;
}

export function TelegramAlerts({ onSave, isLoading }: TelegramAlertsProps) {
  const [telegramToken, setTelegramToken] = useState('');
  const [chatId, setChatId] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('containo_tg_token');
    const savedId = localStorage.getItem('containo_tg_id');
    if (savedToken) setTelegramToken(savedToken);
    if (savedId) setChatId(savedId);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(telegramToken, chatId);
  };

  return (
    <div className="card p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-md bg-ui-accent flex items-center justify-center text-indigo-500">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text-main tracking-tight">Telegram Alerts</h3>
          <p className="text-xs text-text-sub font-medium">Get notified when a container crashes.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-sub uppercase tracking-wider flex items-center gap-2">
              <Key className="w-3.5 h-3.5" /> Bot Token
            </label>
            <input 
              type="password"
              value={telegramToken}
              onChange={(e) => setTelegramToken(e.target.value)}
              className="w-full input-field py-2 px-4 text-sm font-mono"
              placeholder="••••••••••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-text-sub uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" /> Chat ID
            </label>
            <input 
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="w-full input-field py-2 px-4 text-sm font-mono"
              placeholder="-10012345678"
            />
          </div>
        </div>

        <div className="p-4 bg-ui-accent/30 rounded-md border border-ui-border flex items-start gap-3">
           <Info className="w-4 h-4 text-indigo-500 mt-0.5" />
           <p className="text-xs text-text-sub leading-relaxed">
              Once enabled, Containo will send real-time logs and status updates directly to your Telegram chat.
           </p>
        </div>

        <div className="flex items-center justify-end pt-4">
          <button 
            type="submit"
            disabled={isLoading}
            className="btn-primary px-6 py-2 flex items-center gap-2 text-sm shadow-sm disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
