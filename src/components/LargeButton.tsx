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
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white'
  };

  return (
    <button
      className={`
        ${fullWidth ? 'w-full' : ''}
        px-4 py-4 text-lg font-medium rounded-lg
        ${variants[variant]}
        transition-colors duration-200
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}