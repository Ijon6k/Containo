'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b] p-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-md bg-brand flex items-center justify-center mb-4 shadow-sm">
            <Anchor className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-main">Containo</h1>
          <p className="text-text-sub text-sm mt-1 text-center">
            {type === 'login' ? 'Welcome back! Please sign in.' : 'Setup your administrator account to get started.'}
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleAction} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-main">
                {type === 'setup' ? 'Choose a Password' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub" />
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full input-field py-2 pl-10 pr-4 text-sm"
                  placeholder={type === 'setup' ? "Enter password" : "Enter admin password"}
                  required
                />
              </div>
            </div>

            {type === 'setup' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-main">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub" />
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full input-field py-2 pl-10 pr-4 text-sm"
                    placeholder="Repeat password"
                    required
                  />
                </div>
              </div>
            )}

            <button 
              type="submit"
              className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 text-sm mt-2"
            >
              {type === 'setup' ? 'Create Account' : 'Sign In'}
              {type === 'setup' ? <UserPlus className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
            
            {type === 'login' && (
              <div className="pt-4 text-center border-t border-ui-border mt-4">
                <p className="text-xs text-text-sub">
                  Default access: <span className="font-semibold text-text-main">admin</span>
                </p>
              </div>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}
