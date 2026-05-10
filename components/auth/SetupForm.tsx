'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthForm } from '@/hooks/useAuthForm';

interface SetupFormProps {
  onComplete: () => void;
}

export default function SetupForm({ onComplete }: SetupFormProps) {
  const [confirmPassword, setConfirmPassword] = useState('');

  const {
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    error,
    handleSubmit,
  } = useAuthForm({
    endpoint: '/api/auth/setup',
    onSuccess: onComplete,
    validateBeforeSubmit: () => {
      if (username.trim().length < 3) {
        return 'Username must be at least 3 characters';
      }
      if (password.length < 6) {
        return 'Password must be at least 6 characters';
      }
      if (password.includes(' ')) {
        return 'Password cannot contain spaces';
      }
      if (password !== confirmPassword) {
        return 'Passwords do not match';
      }
      return null;
    },
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-medium"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-main/80">
            Username
          </label>
          <div className="relative group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full py-4 pl-12 pr-4 text-base transition-all bg-transparent border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 border-ui-border text-text-main placeholder:text-text-sub focus:border-brand bg-ui-bg/10 backdrop-blur-sm"
              placeholder="Enter username"
              required
            />
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors text-zinc-500 group-focus-within:text-brand pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-main/80">
            Password
          </label>
          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-4 pl-12 pr-12 text-base transition-all bg-transparent border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 border-ui-border text-text-main placeholder:text-text-sub focus:border-brand bg-ui-bg/10 backdrop-blur-sm"
              placeholder="Enter your password"
              required
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors text-zinc-500 group-focus-within:text-brand pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:text-brand transition-colors text-zinc-500"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-main/80">Verify Password</label>
          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full py-4 pl-12 pr-4 text-base transition-all bg-transparent border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 border-ui-border text-text-main placeholder:text-text-sub focus:border-brand bg-ui-bg/10 backdrop-blur-sm"
              placeholder="Repeat password"
              required
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors text-zinc-500 group-focus-within:text-brand pointer-events-none" />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-brand hover:bg-brand/90 text-white py-4 rounded-xl flex items-center justify-center gap-2 text-base font-bold shadow-xl shadow-brand/20 transition-all active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
          <>
            Initialize Account
            <UserPlus className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}
