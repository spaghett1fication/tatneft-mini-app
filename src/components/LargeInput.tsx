// components/LargeInput.tsx
import React, { forwardRef } from 'react';

interface LargeInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label?: string;
  error?: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  required?: boolean;
}

export const LargeInput = forwardRef<
  HTMLInputElement | HTMLSelectElement,
  LargeInputProps
>(({ label, error, suggestions, onSuggestionClick, required, className = '', ...props }, ref) => {
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  return (
    <div className="relative">
      {label && (
        <label className="block text-lg font-medium mb-2 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        ref={ref as any}
        className={`
          w-full px-4 py-4 text-lg rounded-lg border-2
          focus:border-blue-500 focus:outline-none bg-white
          ${error ? 'border-red-500' : required ? 'border-blue-400' : 'border-gray-300'}
          ${className}
        `}
        {...props}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {error && (
        <span className="text-red-500 text-sm mt-1 block">{error}</span>
      )}
      {suggestions && suggestions.length > 0 && showSuggestions && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-3 text-lg hover:bg-gray-100 cursor-pointer border-b last:border-0"
              onMouseDown={() => onSuggestionClick?.(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

LargeInput.displayName = 'LargeInput';