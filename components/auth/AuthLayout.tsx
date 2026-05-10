'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  badge: string;
  children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, badge, children }: AuthLayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Check saved theme first, then document attribute, then system preference
    const savedTheme = localStorage.getItem('containo_theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      const docTheme = document.documentElement.getAttribute('data-theme');
      if (docTheme) {
        setIsDarkMode(docTheme === 'dark');
      } else {
        setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('containo_theme')) setIsDarkMode(e.matches);
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const bgImage = isDarkMode ? '/asset/auth/logindark.webp' : '/asset/auth/loginlight.webp';

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-end p-6 md:p-20 lg:p-32 transition-all duration-700 bg-cover bg-center bg-no-repeat`}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className={`fixed inset-0 pointer-events-none ${isDarkMode ? 'bg-black/20' : 'bg-white/10'}`} />

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col mb-10">
          <div className="w-12 h-12 mb-6 overflow-hidden">
            <img
              src="/logo/containologo.webp"
              alt="Containo"
              className="w-full h-full object-contain"
            />
          </div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-brand font-semibold text-sm mb-4 tracking-wide"
          >
            {badge}
          </motion.span>

          <h1 className={`text-4xl md:text-5xl font-bold tracking-tight mb-3 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
            {title}
          </h1>

          <p className={`text-sm md:text-base leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            {subtitle}
          </p>
        </div>

        {children}
      </motion.div>
    </div>
  );
}
