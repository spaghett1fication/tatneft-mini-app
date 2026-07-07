// features/master/MasterInput.tsx
import { useState, useEffect } from 'react';
import { LargeInput } from '../../components/LargeInput';
import { MASTERS, type Master } from '../../types';
import { findSimilarNames } from '../../utils/fuzzySearch';

interface MasterInputProps {
  value: string;
  onChange: (masterId: string) => void;
  mastersHistory: string[];
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
        // Если masterId не из списка MASTERS, это новый мастер
        const historyMaster = mastersHistory.find(m => m === value);
        if (historyMaster) {
          setInputValue(historyMaster);
        }
      }
    }
  }, [value, mastersHistory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // Ищем по fuzzy
    if (val.length >= 2) {
      const allNames = [...MASTERS.map(m => m.name), ...mastersHistory];
      const similar = findSimilarNames(val, allNames);
      setSimilarMasters(similar);
    } else {
      setSimilarMasters([]);
    }
  };

  const handleSelectMaster = (masterName: string) => {
    const master = MASTERS.find(m => m.name === masterName);
    if (master) {
      onChange(master.id);
      setInputValue(master.name);
    } else {
      // Новый мастер - создаём
      const newMaster = {
        id: Date.now().toString(),
        name: masterName
      };
      onAddMaster(newMaster);
      onChange(newMaster.id);
      setInputValue(masterName);
    }
    setSimilarMasters([]);
  };

  const handleBlur = () => {
    // Сохраняем мастера при уходе с поля
    if (inputValue.trim()) {
      const master = MASTERS.find(m => m.name === inputValue.trim());
      if (master) {
        onChange(master.id);
      } else {
        // Новый мастер
        const newMaster = {
          id: Date.now().toString(),
          name: inputValue.trim()
        };
        onAddMaster(newMaster);
        onChange(newMaster.id);
      }
    }
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
