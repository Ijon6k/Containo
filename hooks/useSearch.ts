import { useState, useMemo } from 'react';
import { Container } from '@/lib/types';

export const useSearch = (containers: Container[]) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContainers = useMemo(() => {
    return containers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.image.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [containers, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredContainers
  };
};
