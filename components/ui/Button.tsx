import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  children?: React.ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-sm transition-colors disabled:opacity-40 disabled:pointer-events-none';

  const variants: Record<string, string> = {
    primary: 'bg-brand hover:bg-brand-hover text-white',
    secondary: 'bg-surface2 hover:bg-hover text-text-secondary hover:text-text-primary border border-border',
    danger: 'bg-danger hover:bg-danger/80 text-white',
    ghost: 'hover:bg-hover text-text-secondary hover:text-text-primary',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 h-8 text-sm',
    md: 'px-4 h-9 text-base',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
