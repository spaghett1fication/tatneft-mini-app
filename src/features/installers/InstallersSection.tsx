// features/installers/InstallersSection.tsx
import React from 'react';
import { LargeInput } from '../../components/LargeInput';
import { FormSection } from '../../components/FormSection';

interface InstallersSectionProps {
  hours: number;
  onChange: (hours: number) => void;
}

export function InstallersSection({ hours, onChange }: InstallersSectionProps) {
  return (
    <FormSection title="Монтажники">
      <div className="flex items-center gap-3">
        <span className="text-base">Часы</span>
        <LargeInput
          type="number"
          placeholder="0"
          value={hours || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="flex-1"
          min="0"
          max="24"
          step="0.5"
        />
        <span className="text-gray-500 text-sm">ч</span>
      </div>
    </FormSection>
  );
}