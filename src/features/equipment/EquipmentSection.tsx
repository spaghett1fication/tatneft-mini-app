// features/equipment/EquipmentSection.tsx
import React from 'react';
import { LargeInput } from '../../components/LargeInput';
import { LargeButton } from '../../components/LargeButton';
import { EQUIPMENT_TYPES, EquipmentTypeId } from '../../types';
import { FormSection } from '../../components/FormSection';

interface EquipmentSectionProps {
  equipmentHours: Partial<Record<EquipmentTypeId, number>>;
  onChange: (equipment: Partial<Record<EquipmentTypeId, number>>) => void;
}

export function EquipmentSection({ equipmentHours, onChange }: EquipmentSectionProps) {
  const handleHoursChange = (equipId: EquipmentTypeId, value: string) => {
    const numValue = parseFloat(value) || 0;
    if (numValue > 0) {
      onChange({ ...equipmentHours, [equipId]: numValue });
    } else {
      const newEquip = { ...equipmentHours };
      delete newEquip[equipId];
      onChange(newEquip);
    }
  };

  const activeEquipment = Object.entries(equipmentHours).filter(([_, hours]) => hours > 0);

  return (
    <FormSection title="Техника">
      <div className="space-y-3">
        {EQUIPMENT_TYPES.map((equip) => (
          <div key={equip.id} className="flex items-center gap-2">
            <span className="w-2/5 text-base">{equip.name}</span>
            <LargeInput
              type="number"
              placeholder="0"
              value={equipmentHours[equip.id] || ''}
              onChange={(e) => handleHoursChange(equip.id, e.target.value)}
              className="flex-1"
              min="0"
              max="24"
              step="0.5"
            />
            <span className="text-gray-500 text-sm w-12">ч</span>
          </div>
        ))}
      </div>
    </FormSection>
  );
}