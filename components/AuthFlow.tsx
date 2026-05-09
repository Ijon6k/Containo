'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Anchor, Lock, ArrowRight, UserPlus } from 'lucide-react';

interface AuthFlowProps {
  type: 'setup' | 'login';
  onComplete: () => void;
}

export default function AuthFlow({ type, onComplete }: AuthFlowProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'setup') {
      if (password === confirmPassword && password.length > 0) {
        localStorage.setItem('containo_setup', 'true');
        onComplete();
        setPassword('');
      }
    } else {
      // In a real app, verify password here
      if (password === 'admin' || password.length > 0) {
        onComplete();
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 flex items-center justify-center mb-6 overflow-hidden">
            <img 
              src="/logo/containologo.webp" 
              alt="Containo Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-semibold text-text-main tracking-tight">Containo</h1>
          <p className="text-text-sub text-sm mt-2 text-center max-w-[280px] leading-relaxed">
            {type === 'login' ? 'Access your container management dashboard.' : 'Initialize your administrator account to secure the system.'}
          </p>
        </div>

        <div className="card p-8 shadow-sm">
          <form onSubmit={handleAction} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-main">
                {type === 'setup' ? 'Administrator Password' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub opacity-50" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full input-field py-3 pl-10 pr-4 text-sm"
                  placeholder={type === 'setup' ? "Secure password" : "Enter password"}
                  required
                />
              </div>
            </div>

            {type === 'setup' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-main">Verify Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub opacity-50" />
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full input-field py-3 pl-10 pr-4 text-sm"
                    placeholder="Repeat password"
                    required
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-brand hover:bg-brand/90 text-white py-3 rounded-md flex items-center justify-center gap-2 text-sm font-semibold shadow-sm transition-all active:scale-95 mt-2"
            >
              {type === 'setup' ? 'Initialize System' : 'Authorize Access'}
              {type === 'setup' ? <UserPlus className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
            
            {type === 'login' && (
              <div className="pt-6 text-center border-t border-ui-border mt-4">
                <p className="text-xs text-text-sub">
                  Initial default password: <span className="font-semibold text-text-main">admin</span>
                </p>
              </div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
