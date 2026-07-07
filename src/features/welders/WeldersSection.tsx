// features/welders/WeldersSection.tsx
import { LargeInput } from '../../components/LargeInput';
import { LargeButton } from '../../components/LargeButton';
import { FormSection } from '../../components/FormSection';
import type { Welder } from '../../types';

interface WeldersSectionProps {
  welders: Welder[];
  onChange: (welders: Welder[]) => void;
}

export function WeldersSection({ welders, onChange }: WeldersSectionProps) {
  const addWelder = () => {
    onChange([...welders, { name: '', hours: 0 }]);
  };

  const updateWelder = (index: number, field: 'name' | 'hours', value: string | number) => {
    const updated = [...welders];
    if (field === 'name') {
      updated[index].name = value as string;
    } else {
      updated[index].hours = typeof value === 'number' ? value : parseFloat(value as string) || 0;
    }
    onChange(updated);
  };

  const removeWelder = (index: number) => {
    onChange(welders.filter((_, i) => i !== index));
  };

  return (
    <FormSection title="Сварщики">
      <div className="space-y-4">
        {welders.map((welder, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-base font-medium">Сварщик #{index + 1}</span>
              <button
                type="button"
                onClick={() => removeWelder(index)}
                className="text-red-600 hover:text-red-800 px-3 py-1 rounded"
              >
                Удалить
              </button>
            </div>

            <div className="space-y-3">
              <LargeInput
                label="Фамилия"
                placeholder="Иванов И.И."
                value={welder.name}
                onChange={(e) => updateWelder(index, 'name', e.target.value)}
              />

              <div className="flex items-center gap-3">
                <span className="text-base w-24">Часы</span>
                <LargeInput
                  type="number"
                  placeholder="0"
                  value={welder.hours || ''}
                  onChange={(e) => updateWelder(index, 'hours', e.target.value)}
                  className="flex-1"
                  min="0"
                  max="24"
                  step="0.5"
                />
                <span className="text-gray-500 text-sm w-8">ч</span>
              </div>
            </div>
          </div>
        ))}

        <LargeButton
          type="button"
          variant="secondary"
          onClick={addWelder}
        >
          + Добавить сварщика
        </LargeButton>
      </div>
    </FormSection>
  );
}