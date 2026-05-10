'use client';

import { useState } from 'react';

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
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      onSuccess();
    } catch (err: any) {
      setError(err.message);
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
