// features/master/MasterInput.tsx
import { useState, useEffect } from 'react';
import { LargeInput } from '../../components/LargeInput';
import { MASTERS, type Master } from '../../types';
import { findSimilarNames } from '../../utils/fuzzySearch';

interface MasterInputProps {
  value: string;
  onChange: (masterId: string) => void;
  mastersHistory: Master[];
  onAddMaster: (master: Master) => void;
  required?: boolean;
}

export function MasterInput({ value, onChange, mastersHistory, onAddMaster, required }: MasterInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [similarMasters, setSimilarMasters] = useState<{ name: string; similarity: number }[]>([]);

  // Инициализация значения
  useEffect(() => {
    if (value) {
      const master = MASTERS.find(m => m.id === value);
      if (master) {
        setInputValue(master.name);
      } else {
        // Если masterId не из списка MASTERS, ищем в истории
        const historyMaster = mastersHistory.find(m => m.id === value);
        if (historyMaster) {
          setInputValue(historyMaster.name);
        }
      }
    }
  }, [value, mastersHistory]);

  const saveMaster = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const master = MASTERS.find(m => m.name === trimmedName);
    if (master) {
      onChange(master.id);
    } else {
      // Новый мастер - создаём
      const newMaster = {
        id: Date.now().toString(),
        name: trimmedName
      };
      onAddMaster(newMaster);
      onChange(newMaster.id);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // Сохраняем мастера сразу при вводе
    if (val.trim().length >= 3) {
      saveMaster(val);
    }

    // Ищем по fuzzy
    if (val.length >= 2) {
      const allNames = [...MASTERS.map(m => m.name), ...mastersHistory.map(m => m.name)];
      const similar = findSimilarNames(val, allNames);
      setSimilarMasters(similar);
    } else {
      setSimilarMasters([]);
    }
  };

  const handleSelectMaster = (masterName: string) => {
    setInputValue(masterName);
    saveMaster(masterName);
    setSimilarMasters([]);
  };

  const handleBlur = () => {
    // Дополнительное сохранение при уходе с поля
    saveMaster(inputValue);
  };

  return (
    <div className="relative">
      <LargeInput
        label="Мастер"
        placeholder="Газимзянов М.Г."
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        suggestions={similarMasters.map(s => s.name)}
        onSuggestionClick={handleSelectMaster}
        required={required}
      />
    </div>
  );
}
