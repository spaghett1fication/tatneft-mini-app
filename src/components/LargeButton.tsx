// components/LargeButton.tsx
import React from 'react';

interface LargeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  fullWidth?: boolean;
}

export function LargeButton({
  variant = 'primary',
  fullWidth = true,
  className = '',
  children,
  ...props
}: LargeButtonProps) {
  const variants: Record<string, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success'
  };

  return (
    <button
      className={`
        btn
        ${variants[variant]}
        ${fullWidth ? 'w-full' : 'w-auto'}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
