// features/object/ObjectInput.tsx
import { useState, useEffect } from 'react';
import { LargeInput } from '../../components/LargeInput';

interface ObjectInputProps {
  value: string;
  onChange: (value: string) => void;
  objectsHistory: string[];
  onAddObject: (object: string) => void;
  required?: boolean;
}

export function ObjectInput({ value, onChange, objectsHistory, onAddObject, required }: ObjectInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (value.length >= 2) {
      const filtered = objectsHistory
        .filter(obj => obj.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [value, objectsHistory]);

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setSuggestions([]);
  };

  const handleBlur = () => {
    if (value.trim() && !objectsHistory.includes(value.trim())) {
      onAddObject(value.trim());
    }
  };

  return (
    <LargeInput
      label="Объект"
      placeholder="КНС 171, ЛДНС с УПС..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      suggestions={suggestions}
      onSuggestionClick={handleSelectSuggestion}
      onBlur={handleBlur}
      required={required}
    />
  );
}