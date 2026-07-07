// components/PreviewCard.tsx
import { WORK_TYPES, EQUIPMENT_TYPES, type Welder, type Installer, type EquipmentEntry } from '../types';

interface PreviewCardProps {
  form: {
    date: string;
    object: string;
    masterId: string;
    works: Record<string, number>;
    additionalWork: string;
    equipment: EquipmentEntry[];
    welders: Welder[];
    installers: Installer[];
  };
}

export function PreviewCard({ form }: PreviewCardProps) {
  const formatDate = (date: string) => {
    return date || new Date().toISOString().split('T')[0];
  };

  const getWorksList = () => {
    return Object.entries(form.works)
      .filter(([_, qty]) => qty > 0)
      .map(([workId, qty]) => {
        const work = WORK_TYPES.find(w => w.id === workId);
        return `${work?.name}: ${qty} ${work?.unit}`;
      });
  };

  const hasData = form.object || form.masterId || getWorksList().length > 0 || form.equipment.length > 0 || form.welders.length > 0 || form.installers.length > 0;

  if (!hasData) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <span className="text-gray-400">Заполните форму, чтобы увидеть превью</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="font-bold text-lg mb-3 text-gray-800">Предпросмотр сводки</h3>

      <div className="space-y-2 text-base">
        <div><strong>Дата:</strong> {formatDate(form.date)}</div>
        <div><strong>Объект:</strong> {form.object || '—'}</div>
        <div><strong>Мастер:</strong> {form.masterId || '—'}</div>

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

        {form.equipment.length > 0 && (
          <div className="pt-2 border-t">
            <strong>Техника:</strong>
            {form.equipment.map((item, i) => {
              const equipType = EQUIPMENT_TYPES.find(e => e.id === item.type);
              return (
                <div key={i} className="ml-2">
                  • {equipType?.name} {item.plateNumber && `(${item.plateNumber})`}: {item.hours} ч
                </div>
              );
            })}
          </div>
        )}

        {form.welders.length > 0 && (
          <div className="pt-2 border-t">
            <strong>Сварщики ({form.welders.length}):</strong>
            {form.welders.map((welder, i) => (
              <div key={i} className="ml-2">• {welder.name}: {welder.hours} ч</div>
            ))}
          </div>
        )}

        {form.installers.length > 0 && (
          <div className="pt-2 border-t">
            <strong>Монтажники ({form.installers.length}):</strong>
            {form.installers.map((installer, i) => (
              <div key={i} className="ml-2">• {installer.name}: {installer.hours} ч</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
