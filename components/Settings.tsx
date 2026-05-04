'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  User, 
  Globe, 
  Save, 
  MessageSquare,
  Key,
  Shield,
  Smartphone,
  RefreshCw,
  ChevronRight,
  Info
} from 'lucide-react';

interface SettingsProps {
  addToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function SettingsView({ addToast }: SettingsProps) {
  const [telegramToken, setTelegramToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      addToast('Settings updated successfully');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-text-main">Settings</h2>
        <p className="text-text-sub text-sm">Configure notifications, security, and connection endpoints.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Nav */}
        <div className="lg:col-span-1 flex flex-col gap-1">
          {[
            { label: 'General', icon: Settings, active: true },
            { label: 'Notifications', icon: Bell, active: false },
            { label: 'Security', icon: Shield, active: false },
            { label: 'Account', icon: User, active: false },
          ].map((item, i) => (
            <button 
              key={i}
              className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                item.active 
                  ? 'bg-ui-accent text-text-main' 
                  : 'text-text-sub hover:text-text-main hover:bg-ui-accent/50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
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

            <form onSubmit={handleSave} className="space-y-6">
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

          <div className="card p-6 flex items-center justify-between opacity-70">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-ui-accent flex items-center justify-center text-text-sub">
                   <Globe className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="text-sm font-bold text-text-main">Docker Engine</h3>
                   <p className="text-xs text-text-sub mt-0.5">unix:///var/run/docker.sock</p>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
