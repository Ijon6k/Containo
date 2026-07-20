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
    <div className="bg-surface border border-border rounded-md p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-sm bg-hover flex items-center justify-center text-brand">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-text-primary">Telegram Alerts</h3>
          <p className="text-sm text-text-secondary">Get notified when a container crashes.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
              <Key className="w-3.5 h-3.5" /> Bot Token
            </label>
            <input 
              type="password"
              value={telegramToken}
              onChange={(e) => setTelegramToken(e.target.value)}
              className="w-full py-2 px-4 text-base font-mono bg-surface2 border border-border rounded-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              placeholder="••••••••••••••••"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" /> Chat ID
            </label>
            <input 
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="w-full py-2 px-4 text-base font-mono bg-surface2 border border-border rounded-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              placeholder="-10012345678"
            />
          </div>
        </div>

        <div className="p-4 bg-hover rounded-sm border border-border flex items-start gap-3">
          <Info className="w-4 h-4 text-brand mt-0.5" />
          <p className="text-sm text-text-secondary leading-relaxed">
            Once enabled, Containo will send real-time logs and status updates directly to your Telegram chat.
          </p>
        </div>

        <div className="flex items-center justify-end pt-4">
          <button 
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-brand hover:bg-brand-hover text-white rounded-sm flex items-center gap-2 text-base font-medium shadow-sm transition-all disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
