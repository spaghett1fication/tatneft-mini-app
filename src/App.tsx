// App.tsx
import React, { useState, useEffect } from 'react';
import { WORK_TYPES, EQUIPMENT_TYPES, MASTERS, Master, WorkTypeId, EquipmentTypeId, Welder } from './types';
import { useTelegram } from './hooks/useTelegram';
import { useReports, useObjectsHistory, useMasters } from './hooks/useLocalStorage';
import { ObjectInput } from './features/object/ObjectInput';
import { MasterInput } from './features/master/MasterInput';
import { WorkTypeSection } from './features/work-type/WorkTypeSection';
import { EquipmentSection } from './features/equipment/EquipmentSection';
import { WeldersSection } from './features/welders/WeldersSection';
import { InstallersSection } from './features/installers/InstallersSection';
import { LargeButton } from './components/LargeButton';
import { LargeInput } from './components/LargeInput';
import { PreviewCard } from './components/PreviewCard';
import { AdminPanel } from './features/admin/AdminPanel';

function App() {
  const { user, haptic } = useTelegram();
  const { reports, setReports } = useReports();
  const { objects, setObjects } = useObjectsHistory();
  const { masters, setMasters } = useMasters();

  // Состояние админ-панели
  const [showAdmin, setShowAdmin] = useState(false);

  // Состояние формы
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    object: '',
    masterId: '',
    works: {} as Record<WorkTypeId, number>,
    additionalWork: '',
    equipmentHours: {} as Partial<Record<EquipmentTypeId, number>>,
    welders: [] as Welder[],
    installerHours: 0
  });

  // Режим редактирования
  const [editId, setEditId] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Автоскрытие статуса
  useEffect(() => {
    if (showStatus) {
      const timer = setTimeout(() => setShowStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showStatus]);

  // Валидация
  const validateForm = (): string | null => {
    if (!form.date) return 'Укажите дату';
    if (!form.object.trim()) return 'Введите объект';
    if (!form.masterId) return 'Выберите мастера';

    const hasWork = Object.values(form.works).some(v => v > 0) || form.additionalWork.trim();
    if (!hasWork) return 'Укажите хотя бы один вид работ';

    // Валидация сварщиков
    for (let i = 0; i < form.welders.length; i++) {
      const welder = form.welders[i];
      if (!welder.name.trim()) {
        return `Укажите фамилию сварщика #${i + 1}`;
      }
      if (welder.hours <= 0) {
        return `Укажите часы для сварщика "${welder.name}"`;
      }
    }

    return null;
  };

  // Сохранить
  const handleSave = () => {
    const error = validateForm();
    if (error) {
      setShowStatus({ message: error, type: 'error' });
      haptic('error');
      return;
    }

    const report = {
      id: editId || Date.now().toString(),
      timestamp: new Date().toISOString(),
      userId: user?.id?.toString() || 'demo',
      ...form,
      works: form.works as Record<WorkTypeId, number>,
      equipmentHours: form.equipmentHours as Partial<Record<EquipmentTypeId, number>>,
      welders: form.welders
    };

    if (editId) {
      setReports(reports.map(r => r.id === editId ? report : r));
      setEditId(null);
    } else {
      setReports([...reports, report]);
    }

    // Сброс формы
    setForm({
      date: new Date().toISOString().split('T')[0],
      object: '',
      masterId: '',
      works: {} as Record<WorkTypeId, number>,
      additionalWork: '',
      equipmentHours: {} as Partial<Record<EquipmentTypeId, number>>,
      welders: [],
      installerHours: 0
    });

    setShowStatus({ message: '✓ Отчёт сохранён', type: 'success' });
    haptic('success');
  };

  // Экспорт в Excel
  const handleExport = () => {
    // Получаем только свои отчёты (если не админ)
    const myReports = reports; // Упрощено

    const headers = [
      'Дата', 'Объект', 'Мастер',
      ...WORK_TYPES.map(w => w.column),
      'Доп. (вне списка)',
      ...EQUIPMENT_TYPES.map(e => e.column),
      'Сварщики (чел)', 'Сварщики ФИО', 'Сварщики (ч)',
      'Монтажник (ч)'
    ];

    const rows = myReports.map(r => {
      const weldersCount = r.welders?.length || 0;
      const weldersNames = r.welders?.map(w => w.name).join(', ') || '';
      const weldersTotalHours = r.welders?.reduce((sum, w) => sum + w.hours, 0) || 0;

      return [
        r.date,
        r.object,
        MASTERS.find(m => m.id === r.masterId)?.name || r.masterId,
        ...WORK_TYPES.map(w => r.works[w.id] || 0),
        r.additionalWork || '',
        ...EQUIPMENT_TYPES.map(e => r.equipmentHours[e.id] || 0),
        weldersCount,
        weldersNames,
        weldersTotalHours,
        r.installerHours
      ];
    });

    const csvContent = '﻿' + [headers, ...rows]
      .map(row => row.join('\t'))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tatneft_reports_${form.date}.csv`;
    link.click();

    haptic('success');
  };

  // Удаление отчета
  const handleDeleteReport = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
    if (editId === id) {
      setEditId(null);
      // Сброс формы
      setForm({
        date: new Date().toISOString().split('T')[0],
        object: '',
        masterId: '',
        works: {} as Record<WorkTypeId, number>,
        additionalWork: '',
        equipmentHours: {} as Partial<Record<EquipmentTypeId, number>>,
        welders: [],
        installerHours: 0
      });
    }
    haptic('success');
  };

  // Редактирование отчета из админ-панели
  const handleEditFromAdmin = (report: Report) => {
    setEditId(report.id);
    setForm({
      date: report.date,
      object: report.object,
      masterId: report.masterId,
      works: report.works,
      additionalWork: report.additionalWork || '',
      equipmentHours: report.equipmentHours,
      welders: report.welders || [],
      installerHours: report.installerHours
    });
    setShowAdmin(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Хедер */}
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Отчёт о работе
        </h1>
        <div className="flex justify-center gap-4 mt-2">
          <LargeButton variant="secondary" onClick={() => setShowAdmin(true)} className="w-auto px-6">
            Админ ({reports.length})
          </LargeButton>
          <LargeButton variant="success" onClick={handleExport} className="w-auto px-6">
            Экспорт в Excel
          </LargeButton>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex flex-col lg:flex-row gap-6 p-4 max-w-7xl mx-auto">
        {/* Форма слева */}
        <div className="flex-1 bg-white rounded-lg p-6 shadow-sm">
          {/* Статус */}
          {showStatus && (
            <div className={`
              mb-4 p-4 rounded-lg text-center font-medium
              ${showStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
            `}>
              {showStatus.message}
            </div>
          )}

          {/* Дата */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2">Дата *</label>
            <LargeInput
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          {/* Объект */}
          <div className="mb-6">
            <ObjectInput
              value={form.object}
              onChange={(object) => setForm({ ...form, object })}
              objectsHistory={objects}
              onAddObject={(obj) => {
                if (!objects.includes(obj)) {
                  setObjects([obj, ...objects.slice(0, 49)]);
                }
              }}
            />
          </div>

          {/* Мастер */}
          <div className="mb-6">
            <MasterInput
              value={form.masterId}
              onChange={(masterId) => setForm({ ...form, masterId })}
              mastersHistory={masters}
              onAddMaster={(newMaster: Master) => {
                if (!masters.some(m => m.name === newMaster.name)) {
                  setMasters([newMaster.name, ...masters.slice(0, 19)]);
                }
              }}
            />
          </div>

          {/* Работы */}
          <div className="mb-6">
            <WorkTypeSection
              works={form.works}
              onChange={(works) => setForm({ ...form, works })}
              additionalWork={form.additionalWork}
              onAdditionalWorkChange={(additionalWork) => setForm({ ...form, additionalWork })}
            />
          </div>

          {/* Техника */}
          <div className="mb-6">
            <EquipmentSection
              equipmentHours={form.equipmentHours}
              onChange={(equipmentHours) => setForm({ ...form, equipmentHours })}
            />
          </div>

          {/* Сварщики */}
          <div className="mb-6">
            <WeldersSection
              welders={form.welders}
              onChange={(welders) => setForm({ ...form, welders })}
            />
          </div>

          {/* Монтажники */}
          <div className="mb-6">
            <InstallersSection
              hours={form.installerHours}
              onChange={(installerHours) => setForm({ ...form, installerHours })}
            />
          </div>

          {/* Кнопка сохранить */}
          <LargeButton variant="primary" onClick={handleSave}>
            {editId ? 'Обновить отчёт' : 'Сохранить отчёт'}
          </LargeButton>
        </div>

        {/* Превью справа */}
        <div className="w-full lg:w-96">
          <PreviewCard form={form} />

          {/* Сохранённые отчёты */}
          {reports.length > 0 && (
            <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Сохранённые ({reports.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {reports.map(report => (
                  <div
                    key={report.id}
                    className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setEditId(report.id);
                      setForm({
                        date: report.date,
                        object: report.object,
                        masterId: report.masterId,
                        works: report.works,
                        additionalWork: report.additionalWork || '',
                        equipmentHours: report.equipmentHours,
                        welders: report.welders || [],
                        installerHours: report.installerHours
                      });
                    }}
                  >
                    <div className="font-medium">
                      {report.date} • {report.object}
                    </div>
                    <div className="text-sm text-gray-500">
                      {MASTERS.find(m => m.id === report.masterId)?.name || report.masterId}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Админ-панель */}
      {showAdmin && (
        <AdminPanel
          reports={reports}
          onDeleteReport={handleDeleteReport}
          onEditReport={handleEditFromAdmin}
          onClose={() => setShowAdmin(false)}
        />
      )}
    </div>
  );
}

export default App;