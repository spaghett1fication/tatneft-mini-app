// features/work-type/WorkTypeSection.tsx
import React, { useState } from 'react';
import { LargeInput } from '../../components/LargeInput';
import { LargeButton } from '../../components/LargeButton';
import { WORK_TYPES, WorkTypeId } from '../../types';
import { FormSection } from '../../components/FormSection';

interface WorkTypeSectionProps {
  works: Record<WorkTypeId, number>;
  onChange: (works: Record<WorkTypeId, number>) => void;
  additionalWork: string;
  onAdditionalWorkChange: (value: string) => void;
}

export function WorkTypeSection({
  works,
  onChange,
  additionalWork,
  onAdditionalWorkChange
}: WorkTypeSectionProps) {
  const handleWorkChange = (workId: WorkTypeId, value: string) => {
    const numValue = parseFloat(value) || 0;
    onChange({ ...works, [workId]: numValue });
  };

  const hasAnyWork = Object.values(works).some(v => v > 0) || additionalWork.trim();

  return (
    <FormSection title="Виды работ">
      {WORK_TYPES.map((work) => (
        <div key={work.id} className="flex items-center gap-2">
          <span className="w-1/2 text-base">{work.name}</span>
          <LargeInput
            type="number"
            placeholder="0"
            value={works[work.id] || ''}
            onChange={(e) => handleWorkChange(work.id, e.target.value)}
            className="flex-1"
            min="0"
            step="0.1"
          />
          <span className="text-gray-500 text-sm w-12">{work.unit}</span>
        </div>
      ))}

      {/* Доп. работа вне списка */}
      <div className="pt-4 border-t">
        <LargeInput
          label="Доп. работа (вне списка)"
          placeholder="Описание других работ"
          value={additionalWork}
          onChange={(e) => onAdditionalWorkChange(e.target.value)}
        />
      </div>
    </FormSection>
  );
}