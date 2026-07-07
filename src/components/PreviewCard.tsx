// components/PreviewCard.tsx
import React from 'react';
import { Report, WORK_TYPES, EQUIPMENT_TYPES, MASTERS, Welder } from '../types';

interface PreviewCardProps {
  form: {
    date: string;
    object: string;
    masterId: string;
    works: Record<string, number>;
    additionalWork: string;
    equipmentHours: Record<string, number>;
    welders: Welder[];
    installerHours: number;
  };
}

export function PreviewCard({ form }: PreviewCardProps) {
  // Форматируем дату
  const formatDate = (date: string) => {
    return date || new Date().toISOString().split('T')[0];
  };

  // Находим имя мастера
  const getMasterName = () => {
    const master = MASTERS.find(m => m.id === form.masterId);
    return master?.name || form.masterId || '—';
  };

  // Формируем список работ
  const getWorksList = () => {
    return Object.entries(form.works)
      .filter(([_, qty]) => qty > 0)
      .map(([workId, qty]) => {
        const work = WORK_TYPES.find(w => w.id === workId);
        return `${work?.name}: ${qty} ${work?.unit}`;
      });
  };

  // Формируем список техники
  const getEquipmentList = () => {
    return Object.entries(form.equipmentHours)
      .filter(([_, hours]) => hours > 0)
      .map(([equipId, hours]) => {
        const equip = EQUIPMENT_TYPES.find(e => e.id === equipId);
        return `${equip?.name}: ${hours} ч`;
      });
  };

  const hasData = form.object || getWorksList().length > 0 || getEquipmentList().length > 0;

  if (!hasData) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <span className="text-gray-400">Заполните форму слева, чтобы увидеть превью</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="font-bold text-lg mb-3 text-gray-800">Предпросмотр отчёта</h3>

      <div className="space-y-2 text-base">
        <div><strong>Дата:</strong> {formatDate(form.date)}</div>
        <div><strong>Объект:</strong> {form.object || '—'}</div>
        <div><strong>Мастер:</strong> {getMasterName()}</div>

        {getWorksList().length > 0 && (
          <div className="pt-2 border-t">
            <strong>Работы:</strong>
            {getWorksList().map((work, i) => (
              <div key={i} className="ml-2">• {work}</div>
            ))}
          </div>
        )}

        {form.additionalWork && (
          <div className="pt-2 border-t">
            <strong>Доп. работа:</strong> {form.additionalWork}
          </div>
        )}

        {getEquipmentList().length > 0 && (
          <div className="pt-2 border-t">
            <strong>Техника:</strong>
            {getEquipmentList().map((equip, i) => (
              <div key={i} className="ml-2">• {equip}</div>
            ))}
          </div>
        )}

        {(form.welders.length > 0 || form.installerHours > 0) && (
          <div className="pt-2 border-t">
            {form.welders.length > 0 && (
              <div>
                <strong>Сварщики ({form.welders.length}):</strong>
                {form.welders.map((welder, i) => (
                  <div key={i} className="ml-2">• {welder.name}: {welder.hours} ч</div>
                ))}
              </div>
            )}
            {form.installerHours > 0 && <div><strong>Монтажники:</strong> {form.installerHours} ч</div>}
          </div>
        )}
      </div>
    </div>
  );
}