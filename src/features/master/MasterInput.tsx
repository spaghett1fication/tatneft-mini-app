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

  // Инициализация значения — просто показываем то, что в value
  useEffect(() => {
    if (value) {
      setInputValue(value);
    }
  }, [value]);

  const saveMaster = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    // Сохраняем имя мастера в историю, если его там нет
    const existingMaster = mastersHistory.find(m => m.name === trimmedName);
    if (!existingMaster) {
      const newMaster = {
        id: Date.now().toString(),
        name: trimmedName
      };
      onAddMaster(newMaster);
    }

    // Передаём имя напрямую в форму
    onChange(trimmedName);
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
