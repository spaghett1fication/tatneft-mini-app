// hooks/useLocalStorage.ts
import { useState } from 'react';
import type { Report } from '../types';

const REPORTS_KEY = 'tatneft_reports';
const OBJECTS_KEY = 'tatneft_objects_history';
const MASTERS_KEY = 'tatneft_masters';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Ошибка чтения из localStorage: ${key}`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Ошибка записи в localStorage: ${key}`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Хуки для конкретных данных
export function useReports() {
  const [reports, setReports] = useLocalStorage<Report[]>(REPORTS_KEY, []);
  return { reports, setReports };
}

export function useObjectsHistory() {
  const [objects, setObjects] = useLocalStorage<string[]>(OBJECTS_KEY, []);
  return { objects, setObjects };
}

export function useMasters() {
  const [masters, setMasters] = useLocalStorage<string[]>(MASTERS_KEY, []);
  return { masters, setMasters };
}