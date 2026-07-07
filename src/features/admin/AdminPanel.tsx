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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Архив сводок</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Поиск по объекту или мастеру..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
          />
          <div className="mt-2 text-sm text-gray-600">
            Всего сводок: {reports.length} | Показано: {filteredReports.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Сводки не найдены
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex gap-4 mb-2">
                        <span className="font-semibold text-gray-700">
                          {formatDate(report.date)}
                        </span>
                        <span className="text-gray-600">
                          {report.object}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Мастер: {MASTERS.find(m => m.id === report.masterId)?.name || report.masterId}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditReport(report)}
                        className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Удалить эту сводку?')) {
                            onDeleteReport(report.id);
                          }
                        }}
                        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 pt-3 border-t text-sm">
                    <div>
                      <div className="text-gray-500">Работы</div>
                      <div className="font-semibold">{getTotalWorks(report)} ед.</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Техника</div>
                      <div className="font-semibold">{getTotalEquipmentHours(report).toFixed(1)} ч</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Сварщики</div>
                      <div className="font-semibold">{report.welders?.length || 0} чел.</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Монтажники</div>
                      <div className="font-semibold">{report.installers?.length || 0} чел.</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <LargeButton variant="secondary" onClick={onClose}>
            Закрыть
          </LargeButton>
        </div>
      </div>
    </div>
  );
}
