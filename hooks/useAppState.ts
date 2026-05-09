import { useState, useEffect, useCallback } from 'react';
import { Container, Volume, View } from '@/lib/types';

export const useAppState = () => {
  const [isSetup, setIsSetup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'wholesome'>('light');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [containers, setContainers] = useState<Container[]>([]);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [systemInfo, setSystemInfo] = useState<any>(null);

  const fetchContainers = useCallback(async () => {
    try {
      const res = await fetch('/api/containers');
      if (res.ok) setContainers(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchVolumes = useCallback(async () => {
    try {
      const res = await fetch('/api/volumes');
      if (res.ok) setVolumes(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchSystemInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/system');
      if (res.ok) setSystemInfo(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchContainers();
      fetchVolumes();
      fetchSystemInfo();
      const interval = setInterval(() => {
        fetchContainers();
        fetchSystemInfo();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchContainers, fetchVolumes, fetchSystemInfo]);

  useEffect(() => {
    const setup = localStorage.getItem('containo_setup');
    if (setup) setTimeout(() => setIsSetup(true), 0);
    
    const savedTheme = localStorage.getItem('containo_theme') as 'light' | 'dark' | 'wholesome';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('containo_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : prev === 'dark' ? 'wholesome' : 'light';
      return next;
    });
  };

  return {
    isSetup, setIsSetup,
    isAuthenticated, setIsAuthenticated,
    theme, setTheme, toggleTheme,
    currentView, setCurrentView,
    containers, setContainers,
    volumes, setVolumes,
    systemInfo,
    fetchContainers,
    fetchVolumes,
    fetchSystemInfo
  };
};
