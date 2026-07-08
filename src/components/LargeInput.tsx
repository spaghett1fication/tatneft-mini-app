// components/LargeInput.tsx
import React, { forwardRef } from 'react';

interface LargeInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label?: string;
  error?: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  required?: boolean;
  compact?: boolean;
}

export const LargeInput = forwardRef<
  HTMLInputElement | HTMLSelectElement,
  LargeInputProps
>(({ label, error, suggestions, onSuggestionClick, required, compact, className = '', ...props }, ref) => {
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  return (
    <div className="relative">
      {label && (
        <label className="field-label">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <input
        ref={ref as any}
        className={`
          ${compact ? 'field-input-compact' : 'field-input'}
          ${error ? '!border-red-500' : ''}
          ${className}
        `}
        {...props}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {error && (
        <span className="text-red-400 text-sm mt-1 block">{error}</span>
      )}
      {suggestions && suggestions.length > 0 && showSuggestions && (
        <div className="suggestions">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
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
