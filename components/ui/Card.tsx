import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  animate?: boolean;
}

export const Card = ({ children, className = '', hover = false, animate = true }: CardProps) => {
  const baseStyles = 'bg-ui-bg border border-ui-border rounded-xl shadow-sm overflow-hidden';
  const hoverStyles = hover ? 'hover:border-brand/30 hover:shadow-md transition-all cursor-pointer' : '';

  if (!animate) {
    return <div className={`${baseStyles} ${hoverStyles} ${className}`}>{children}</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -2, borderColor: 'var(--brand)' } : {}}
      className={`${baseStyles} ${hoverStyles} ${className}`}
    >
      {children}
    </motion.div>
  );
};
