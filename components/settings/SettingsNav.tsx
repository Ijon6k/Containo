'use client';

import React from 'react';
import { Settings, Bell, Shield, User } from 'lucide-react';

export function SettingsNav() {
  const items = [
    { label: 'General', icon: Settings, active: true },
    { label: 'Notifications', icon: Bell, active: false },
    { label: 'Security', icon: Shield, active: false },
    { label: 'Account', icon: User, active: false },
  ];

  return (
    <div className="lg:col-span-1 flex flex-col gap-1">
      {items.map((item, i) => (
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
  );
}
