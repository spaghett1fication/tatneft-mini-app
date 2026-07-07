// features/master/MasterInput.tsx
import React, { useState, useEffect } from 'react';
import { LargeInput } from '../../components/LargeInput';
import { MASTERS, Master } from '../../types';
import { findSimilarNames } from '../../utils/fuzzySearch';

interface MasterInputProps {
  value: string;
  onChange: (masterId: string) => void;
  mastersHistory: string[];
  onAddMaster: (master: Master) => void;
}

export function MasterInput({ value, onChange, mastersHistory, onAddMaster }: MasterInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [similarMasters, setSimilarMasters] = useState<{ name: string; similarity: number }[]>([]);

  // Инициализация значения
  useEffect(() => {
    if (value) {
      const master = MASTERS.find(m => m.id === value);
      if (master) setInputValue(master.name);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // Ищем по fuzzy
    if (val.length >= 2) {
      const allNames = [...MASTERS.map(m => m.name), ...mastersHistory];
      const similar = findSimilarNames(val, allNames);
      setSimilarMasters(similar);
      setShowSuggestions(true);
    } else {
      setSimilarMasters([]);
      setShowSuggestions(false);
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
    }
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <LargeInput
        label="Мастер *"
        placeholder="Газимзянов М.Г."
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => similarMasters.length > 0 && setShowSuggestions(true)}
        suggestions={similarMasters.map(s => s.name)}
        onSuggestionClick={handleSelectMaster}
        required
      />
    </div>
  );
}