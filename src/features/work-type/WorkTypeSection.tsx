// features/work-type/WorkTypeSection.tsx
import { useState } from 'react';
import { LargeInput } from '../../components/LargeInput';
import { WORK_TYPES, type WorkTypeId } from '../../types';
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
  const [isExpanded, setIsExpanded] = useState(false);

  const handleWorkChange = (workId: WorkTypeId, value: string) => {
    const numValue = parseFloat(value) || 0;
    onChange({ ...works, [workId]: numValue });
  };

  // Подсчёт заполненных видов работ
  const filledWorksCount = Object.values(works).filter(v => v > 0).length;

  return (
    <FormSection title="Виды работ">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
      >
        <span className="text-base font-medium">
          {isExpanded ? 'Свернуть список' : 'Развернуть список'}
          {filledWorksCount > 0 && ` — заполнено: ${filledWorksCount}`}
        </span>
        <span className="text-xl text-gray-500">
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {isExpanded && (
        <div className="space-y-2 mt-3">
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
        </div>
      )}

      {/* Доп. работа вне списка */}
      <div className="pt-4 border-t mt-4">
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
