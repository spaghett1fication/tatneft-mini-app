// features/admin/AdminPanel.tsx
import { useState } from 'react';
import type { Report } from '../../types';
import { MASTERS } from '../../types';
import { LargeButton } from '../../components/LargeButton';

interface AdminPanelProps {
  reports: Report[];
  onDeleteReport: (id: string) => void;
  onEditReport: (report: Report) => void;
  onClose: () => void;
}

export function AdminPanel({ reports, onDeleteReport, onEditReport, onClose }: AdminPanelProps) {
  const [filter, setFilter] = useState('');

  const filteredReports = reports.filter(r =>
    r.object.toLowerCase().includes(filter.toLowerCase()) ||
    MASTERS.find(m => m.id === r.masterId)?.name.toLowerCase().includes(filter.toLowerCase())
  );

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU');
  };

  const getTotalWorks = (report: Report) => {
    return Object.values(report.works).reduce((sum, val) => sum + val, 0);
  };

  const getTotalEquipmentHours = (report: Report) => {
    return report.equipment?.reduce((sum, e) => sum + e.hours, 0) || 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-md max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-100">Архив сводок</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-4 border-b border-slate-700">
          <input
            type="text"
            placeholder="Поиск по объекту или мастеру..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="field-input"
          />
          <div className="mt-2 text-sm text-slate-400">
            Всего сводок: {reports.length} | Показано: {filteredReports.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Сводки не найдены
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div key={report.id} className="border border-slate-700 rounded-md p-4 bg-slate-900">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex gap-4 mb-2">
                        <span className="font-semibold text-slate-200">
                          {formatDate(report.date)}
                        </span>
                        <span className="text-slate-300">
                          {report.object}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">
                        Мастер: {MASTERS.find(m => m.id === report.masterId)?.name || report.masterId}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditReport(report)}
                        className="px-4 py-2 text-sm text-emerald-400 hover:bg-slate-700 rounded"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Удалить эту сводку?')) {
                            onDeleteReport(report.id);
                          }
                        }}
                        className="px-4 py-2 text-sm text-red-400 hover:bg-slate-700 rounded"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 pt-3 border-t border-slate-700 text-sm">
                    <div>
                      <div className="text-slate-500">Работы</div>
                      <div className="font-semibold text-slate-200">{getTotalWorks(report)} ед.</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Техника</div>
                      <div className="font-semibold text-slate-200">{getTotalEquipmentHours(report).toFixed(1)} ч</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Сварщики</div>
                      <div className="font-semibold text-slate-200">{report.welders?.length || 0} чел.</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Монтажники</div>
                      <div className="font-semibold text-slate-200">{report.installers?.length || 0} чел.</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-700">
          <LargeButton variant="secondary" onClick={onClose}>
            Закрыть
          </LargeButton>
        </div>
      </div>
    </div>
  );
}
