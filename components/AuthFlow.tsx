'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, UserPlus, Eye, EyeOff } from 'lucide-react';

interface AuthFlowProps {
  type: 'setup' | 'login';
  onComplete: () => void;
}

export default function AuthFlow({ type, onComplete }: AuthFlowProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Detect system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'setup') {
      if (password === confirmPassword && password.length > 0) {
        localStorage.setItem('containo_setup', 'true');
        onComplete();
        setPassword('');
      }
    } else {
      if (password === 'admin' || password.length > 0) {
        onComplete();
      }
    }
  };

  const bgImage = isDarkMode ? '/asset/auth/logindark.webp' : '/asset/auth/loginlight.webp';

  return (
    <div 
      className={`min-h-screen w-full flex items-center justify-end p-6 md:p-20 lg:p-32 transition-all duration-700 bg-cover bg-center bg-no-repeat`}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Subtle Overlay to ensure readability if needed, though the image should be designed for this */}
      <div className={`fixed inset-0 pointer-events-none ${isDarkMode ? 'bg-black/20' : 'bg-white/10'}`} />

      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col mb-10">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-brand font-semibold text-sm mb-4 tracking-wide"
          >
            {type === 'login' ? 'Welcome back' : 'Get started'}
          </motion.span>
          
          <h1 className={`text-4xl md:text-5xl font-bold tracking-tight mb-3 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
            {type === 'login' ? 'Sign in to Containo' : 'Setup Administrator'}
          </h1>
          
          <p className={`text-sm md:text-base leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {type === 'login' 
              ? 'Access your container management dashboard.' 
              : 'Initialize your administrator account to secure the system.'}
          </p>
        </div>

        <form onSubmit={handleAction} className="space-y-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={`text-sm font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>
                {type === 'setup' ? 'Administrator Password' : 'Password'}
              </label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isDarkMode ? 'text-zinc-500 group-focus-within:text-brand' : 'text-zinc-400 group-focus-within:text-brand'}`} />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full py-4 pl-12 pr-12 text-base transition-all bg-transparent border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 ${
                    isDarkMode 
                      ? 'border-zinc-800 text-white placeholder:text-zinc-600 focus:border-brand bg-black/20 backdrop-blur-sm' 
                      : 'border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-brand bg-white/50 backdrop-blur-sm'
                  }`}
                  placeholder="Enter your password"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:text-brand transition-colors ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {type === 'setup' && (
              <div className="space-y-2">
                <label className={`text-sm font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>Verify Password</label>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isDarkMode ? 'text-zinc-500 group-focus-within:text-brand' : 'text-zinc-400 group-focus-within:text-brand'}`} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full py-4 pl-12 pr-4 text-base transition-all bg-transparent border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 ${
                      isDarkMode 
                        ? 'border-zinc-800 text-white placeholder:text-zinc-600 focus:border-brand bg-black/20 backdrop-blur-sm' 
                        : 'border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-brand bg-white/50 backdrop-blur-sm'
                    }`}
                    placeholder="Repeat password"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-brand hover:bg-brand/90 text-white py-4 rounded-xl flex items-center justify-center gap-2 text-base font-bold shadow-xl shadow-brand/20 transition-all active:scale-[0.98]"
          >
            {type === 'setup' ? 'Initialize System' : 'Authorize Access'}
            {type === 'setup' ? <UserPlus className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </button>
          
          {type === 'login' && (
            <div className="space-y-6 pt-2">
              <div className="relative flex items-center py-2">
                <div className={`flex-grow border-t ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}></div>
                <span className={`flex-shrink mx-4 text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>or</span>
                <div className={`flex-grow border-t ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}></div>
              </div>
              
              <div className="text-center">
                <p className={`text-xs font-medium ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Initial default password: <span className="font-bold text-brand">admin</span>
                </p>
              </div>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
