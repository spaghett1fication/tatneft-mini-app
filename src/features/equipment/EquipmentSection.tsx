// features/equipment/EquipmentSection.tsx
import { LargeInput } from '../../components/LargeInput';
import { LargeButton } from '../../components/LargeButton';
import { EQUIPMENT_TYPES, type EquipmentTypeId, type EquipmentEntry } from '../../types';
import { FormSection } from '../../components/FormSection';

interface EquipmentSectionProps {
  equipment: EquipmentEntry[];
  onChange: (equipment: EquipmentEntry[]) => void;
}

export function EquipmentSection({ equipment, onChange }: EquipmentSectionProps) {
  const addEquipment = () => {
    onChange([...equipment, { type: EQUIPMENT_TYPES[0].id, hours: 0, plateNumber: '' }]);
  };

  const updateEquipment = (index: number, field: keyof EquipmentEntry, value: string | number) => {
    const updated = [...equipment];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeEquipment = (index: number) => {
    onChange(equipment.filter((_, i) => i !== index));
  };

  const formatPlateNumber = (value: string): string => {
    // Убираем все кроме букв, цифр и пробелов
    let cleaned = value.toUpperCase().replace(/[^А-ЯA-Z0-9\s]/g, '');

    // Если только цифры - максимум 4 символа
    if (/^\d+$/.test(cleaned)) {
      return cleaned.slice(0, 4);
    }

    // Формат АБ123В116 (2 буквы, 3 цифры, 1 буква, пробел, 3 цифры)
    // Удаляем пробелы для обработки
    cleaned = cleaned.replace(/\s/g, '');

    let result = '';
    let letterCount = 0;
    let digitCount = 0;

    for (let i = 0; i < cleaned.length && result.length < 12; i++) {
      const char = cleaned[i];
      const isDigit = /\d/.test(char);
      const isLetter = /[А-ЯA-Z]/.test(char);

      if (result.length < 2 && isLetter) {
        result += char;
        letterCount++;
      } else if (result.length >= 2 && result.length < 5 && isDigit) {
        result += char;
        digitCount++;
      } else if (result.length === 5 && isLetter) {
        result += char + ' ';
      } else if (result.length > 6 && isDigit && result.length < 10) {
        result += char;
      }
    }

    return result.trim();
  };

  return (
    <FormSection title="Техника">
      <div className="space-y-3">
        {equipment.map((item, index) => (
          <div key={index} className="sub-card">
            <div className="flex items-center gap-2">
              <select
                value={item.type}
                onChange={(e) => updateEquipment(index, 'type', e.target.value as EquipmentTypeId)}
                className="field-select flex-1"
              >
                {EQUIPMENT_TYPES.map((equip) => (
                  <option key={equip.id} value={equip.id}>
                    {equip.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removeEquipment(index)}
                className="text-red-400 hover:text-red-300 px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <LargeInput
                  type="text"
                  placeholder="Гос номер (АБ123В 116 или 1234)"
                  value={item.plateNumber}
                  onChange={(e) => updateEquipment(index, 'plateNumber', formatPlateNumber(e.target.value))}
                />
              </div>
              <div className="w-24">
                <LargeInput
                  type="number"
                  placeholder="0"
                  value={item.hours || ''}
                  onChange={(e) => updateEquipment(index, 'hours', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="24"
                  step="0.5"
                />
              </div>
              <span className="text-slate-400 text-sm">ч</span>
            </div>
          </div>
        ))}

        <LargeButton variant="secondary" onClick={addEquipment}>
          + Добавить технику
        </LargeButton>
      </div>
    </FormSection>
  );
}
