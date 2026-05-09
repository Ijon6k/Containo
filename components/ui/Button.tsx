import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  icon, 
  children, 
  className = '', 
  ...props 
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold rounded-md transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100';
  
  const variants = {
    primary: 'bg-brand hover:bg-brand-hover text-white shadow-sm',
    secondary: 'bg-ui-accent hover:bg-ui-accent/80 text-text-main',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm',
    ghost: 'hover:bg-ui-accent text-text-sub hover:text-text-main',
    outline: 'border border-ui-border hover:border-brand text-text-sub hover:text-brand bg-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px] uppercase tracking-wider',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon}
      {children}
    </motion.button>
  );
};
