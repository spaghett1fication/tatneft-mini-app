// features/installers/InstallersSection.tsx
import { LargeInput } from '../../components/LargeInput';
import { LargeButton } from '../../components/LargeButton';
import { FormSection } from '../../components/FormSection';
import type { Installer } from '../../types';

interface InstallersSectionProps {
  installers: Installer[];
  onChange: (installers: Installer[]) => void;
}

export function InstallersSection({ installers, onChange }: InstallersSectionProps) {
  const addInstaller = () => {
    onChange([...installers, { name: '', hours: 0 }]);
  };

  const updateInstaller = (index: number, field: keyof Installer, value: string | number) => {
    const updated = [...installers];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeInstaller = (index: number) => {
    onChange(installers.filter((_, i) => i !== index));
  };

  return (
    <FormSection title="Монтажники">
      <div className="space-y-3">
        {installers.map((installer, index) => (
          <div key={index} className="sub-card flex items-center gap-2">
            <div className="flex-1">
              <LargeInput
                type="text"
                placeholder="Фамилия И.О."
                value={installer.name}
                onChange={(e) => updateInstaller(index, 'name', e.target.value)}
              />
            </div>
            <div className="w-24">
              <LargeInput
                type="number"
                placeholder="0"
                value={installer.hours || ''}
                onChange={(e) => updateInstaller(index, 'hours', parseFloat(e.target.value) || 0)}
                min="0"
                max="24"
                step="0.5"
              />
            </div>
            <span className="text-slate-400 text-sm">ч</span>
            <button
              onClick={() => removeInstaller(index)}
              className="text-red-400 hover:text-red-300 px-2 py-1"
            >
              ✕
            </button>
          </div>
        ))}

        <LargeButton variant="secondary" onClick={addInstaller}>
          + Добавить монтажника
        </LargeButton>
      </div>
    </FormSection>
  );
}
