'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthForm } from '@/hooks/useAuthForm';

interface LoginFormProps {
  onComplete: () => void;
}

export default function LoginForm({ onComplete }: LoginFormProps) {
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
    endpoint: '/api/auth/login',
    onSuccess: onComplete,
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-md bg-danger-bg border border-danger/20 text-danger text-base font-medium"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-base font-semibold text-text-secondary">
            Username
          </label>
          <div className="relative group">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full py-4 pl-12 pr-4 text-lg transition-all bg-surface2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand/20 text-text-primary placeholder:text-text-tertiary focus:border-brand"
              placeholder="Enter username"
              required
            />
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors text-text-tertiary group-focus-within:text-brand pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-base font-semibold text-text-secondary">
            Password
          </label>
          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-4 pl-12 pr-12 text-lg transition-all bg-surface2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand/20 text-text-primary placeholder:text-text-tertiary focus:border-brand"
              placeholder="Enter your password"
              required
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors text-text-tertiary group-focus-within:text-brand pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:text-brand transition-colors text-text-tertiary"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-brand hover:bg-brand-hover text-white py-4 rounded-sm flex items-center justify-center gap-2 text-lg font-semibold shadow-xl shadow-brand/20 transition-all active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
          <>
            Authorize Access
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}
