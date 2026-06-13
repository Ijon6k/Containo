'use client';

import { useState } from 'react';
import { authenticate as apiAuthenticate } from '@/lib/api/auth-api';

interface UseAuthFormOptions {
  endpoint: string;
  onSuccess: () => void;
  validateBeforeSubmit?: () => string | null;
}

export function useAuthForm({ endpoint, onSuccess, validateBeforeSubmit }: UseAuthFormOptions) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (validateBeforeSubmit) {
      const validationError = validateBeforeSubmit();
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsLoading(true);

    try {
      await apiAuthenticate(endpoint, username, password);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    isLoading,
    error,
    handleSubmit,
  };
}
