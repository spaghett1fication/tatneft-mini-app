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
      .filter(([_, qty]) => Number(qty) > 0)
      .map(([workId, qty]) => {
        const work = WORK_TYPES.find(w => w.id === workId);
        return `${work?.name}: ${qty} ${work?.unit}`;
      });
  };

  const hasData = form.object || form.masterId || getWorksList().length > 0 || form.equipment?.length > 0 || form.welders?.length > 0 || form.installers?.length > 0;

  if (!hasData) {
    return (
      <div className="bg-slate-900 rounded-md p-6 text-center">
        <span className="text-slate-500">Заполните форму, чтобы увидеть превью</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-md p-4 border border-slate-700">
      <h3 className="font-bold text-lg mb-3 text-slate-100">Предпросмотр сводки</h3>

      <div className="space-y-2 text-base text-slate-100">
        <div><strong className="text-slate-300">Дата:</strong> {formatDate(form.date)}</div>
        <div><strong className="text-slate-300">Объект:</strong> {form.object || '—'}</div>
        <div><strong className="text-slate-300">Мастер:</strong> {form.masterId || '—'}</div>

        {getWorksList().length > 0 && (
          <div className="pt-2 border-t border-slate-700">
            <strong className="text-slate-300">Работы:</strong>
            {getWorksList().map((work, i) => (
              <div key={i} className="ml-2 text-slate-200">• {work}</div>
            ))}
          </div>
        )}

        {form.additionalWork && (
          <div className="pt-2 border-t border-slate-700">
            <strong className="text-slate-300">Доп. работа:</strong> {form.additionalWork}
          </div>
        )}

        {form.equipment?.length > 0 && (
          <div className="pt-2 border-t border-slate-700">
            <strong className="text-slate-300">Техника:</strong>
            {form.equipment.map((item, i) => {
              const equipType = EQUIPMENT_TYPES.find(e => e.id === item.type);
              return (
                <div key={i} className="ml-2 text-slate-200">
                  • {equipType?.name} {item.plateNumber && `(${item.plateNumber})`}: {item.hours} ч
                </div>
              );
            })}
          </div>
        )}

        {form.welders?.length > 0 && (
          <div className="pt-2 border-t border-slate-700">
            <strong className="text-slate-300">Сварщики ({form.welders.length}):</strong>
            {form.welders.map((welder, i) => (
              <div key={i} className="ml-2 text-slate-200">• {welder.name}: {welder.hours} ч</div>
            ))}
          </div>
        )}

        {form.installers?.length > 0 && (
          <div className="pt-2 border-t border-slate-700">
            <strong className="text-slate-300">Монтажники ({form.installers.length}):</strong>
            {form.installers.map((installer, i) => (
              <div key={i} className="ml-2 text-slate-200">• {installer.name}: {installer.hours} ч</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
