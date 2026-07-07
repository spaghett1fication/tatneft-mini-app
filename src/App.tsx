// App.tsx
import { useState, useEffect } from 'react';
import { WORK_TYPES, EQUIPMENT_TYPES, MASTERS, type Master, type WorkTypeId, type EquipmentEntry, type Welder, type Installer, type Report } from './types';
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

  const [showAdmin, setShowAdmin] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    object: '',
    masterId: '',
    works: {} as Record<WorkTypeId, number>,
    additionalWork: '',
    equipment: [] as EquipmentEntry[],
    welders: [] as Welder[],
    installers: [] as Installer[]
  });

  const [editId, setEditId] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (showStatus) {
      const timer = setTimeout(() => setShowStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showStatus]);

  const validateForm = (): string | null => {
    if (!form.date) return 'Укажите дату';
    if (!form.object.trim()) return 'Введите объект';
    if (!form.masterId) return 'Выберите мастера';

    // Разрешаем сводку без работ, сварщиков и монтажников
    // Только проверяем заполненность, если они есть

    for (let i = 0; i < form.welders.length; i++) {
      const welder = form.welders[i];
      if (!welder.name.trim()) {
        return `Укажите фамилию сварщика #${i + 1}`;
      }
      if (welder.hours <= 0) {
        return `Укажите часы для сварщика "${welder.name}"`;
      }
    }

    for (let i = 0; i < form.installers.length; i++) {
      const installer = form.installers[i];
      if (!installer.name.trim()) {
        return `Укажите фамилию монтажника #${i + 1}`;
      }
      if (installer.hours <= 0) {
        return `Укажите часы для монтажника "${installer.name}"`;
      }
    }

    for (let i = 0; i < form.equipment.length; i++) {
      const eq = form.equipment[i];
      if (eq.hours <= 0) {
        return `Укажите часы для техники #${i + 1}`;
      }
    }

    return null;
  };

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
      ...form
    };

    if (editId) {
      setReports(reports.map(r => r.id === editId ? report : r));
      setEditId(null);
    } else {
      setReports([...reports, report]);
    }

    setForm({
      date: new Date().toISOString().split('T')[0],
      object: '',
      masterId: '',
      works: {} as Record<WorkTypeId, number>,
      additionalWork: '',
      equipment: [],
      welders: [],
      installers: []
    });

    setShowStatus({ message: '✓ Сводка сохранена', type: 'success' });
    haptic('success');
  };

  const handleExport = () => {
    const headers = [
      'Дата', 'Объект', 'Мастер',
      ...WORK_TYPES.map(w => w.column),
      'Доп. (вне списка)',
      'Техника (тип)', 'Гос номер', 'Часы техники',
      'Сварщики (чел)', 'Сварщики ФИО', 'Сварщики (ч)',
      'Монтажники (чел)', 'Монтажники ФИО', 'Монтажники (ч)'
    ];

    const rows = reports.map(r => {
      const weldersCount = r.welders?.length || 0;
      const weldersNames = r.welders?.map(w => w.name).join(', ') || '';
      const weldersTotalHours = r.welders?.reduce((sum, w) => sum + w.hours, 0) || 0;

      const installersCount = r.installers?.length || 0;
      const installersNames = r.installers?.map(i => i.name).join(', ') || '';
      const installersTotalHours = r.installers?.reduce((sum, i) => sum + i.hours, 0) || 0;

      const equipmentTypes = r.equipment?.map(e => EQUIPMENT_TYPES.find(t => t.id === e.type)?.name || e.type).join('; ') || '';
      const equipmentPlates = r.equipment?.map(e => e.plateNumber).join('; ') || '';
      const equipmentHours = r.equipment?.reduce((sum, e) => sum + e.hours, 0) || 0;

      return [
        r.date,
        r.object,
        MASTERS.find(m => m.id === r.masterId)?.name || r.masterId,
        ...WORK_TYPES.map(w => r.works[w.id] || 0),
        r.additionalWork || '',
        equipmentTypes,
        equipmentPlates,
        equipmentHours,
        weldersCount,
        weldersNames,
        weldersTotalHours,
        installersCount,
        installersNames,
        installersTotalHours
      ];
    });

    const csvContent = '﻿' + [headers, ...rows]
      .map(row => row.join('\t'))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `tatneft_svod_${form.date}.csv`;
    link.click();

    haptic('success');
  };

  const handleDeleteReport = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
    if (editId === id) {
      setEditId(null);
      setForm({
        date: new Date().toISOString().split('T')[0],
        object: '',
        masterId: '',
        works: {} as Record<WorkTypeId, number>,
        additionalWork: '',
        equipment: [],
        welders: [],
        installers: []
      });
    }
    haptic('success');
  };

  const handleEditFromAdmin = (report: Report) => {
    setEditId(report.id);
    setForm({
      date: report.date,
      object: report.object,
      masterId: report.masterId,
      works: report.works,
      additionalWork: report.additionalWork || '',
      equipment: report.equipment || [],
      welders: report.welders || [],
      installers: report.installers || []
    });
    setShowAdmin(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Сводка о работе
        </h1>
        <div className="flex justify-center gap-3 mt-3">
          <button
            onClick={() => setShowAdmin(true)}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
          >
            Архив ({reports.length})
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 rounded text-blue-700"
          >
            Предпросмотр
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm bg-green-100 hover:bg-green-200 rounded text-green-700"
          >
            Экспорт
          </button>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          {showStatus && (
            <div className={`
              mb-4 p-4 rounded-lg text-center font-medium
              ${showStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
            `}>
              {showStatus.message}
            </div>
          )}

          <div className="mb-6">
            <LargeInput
              label="Дата"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

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
              required
            />
          </div>

          <div className="mb-6">
            <MasterInput
              value={form.masterId}
              onChange={(masterId) => setForm({ ...form, masterId })}
              mastersHistory={masters}
              onAddMaster={(newMaster: Master) => {
                if (!masters.includes(newMaster.name)) {
                  setMasters([newMaster.name, ...masters.slice(0, 19)]);
                }
              }}
              required
            />
          </div>

          <div className="mb-6">
            <WorkTypeSection
              works={form.works}
              onChange={(works) => setForm({ ...form, works })}
              additionalWork={form.additionalWork}
              onAdditionalWorkChange={(additionalWork) => setForm({ ...form, additionalWork })}
            />
          </div>

          <div className="mb-6">
            <EquipmentSection
              equipment={form.equipment}
              onChange={(equipment) => setForm({ ...form, equipment })}
            />
          </div>

          <div className="mb-6">
            <WeldersSection
              welders={form.welders}
              onChange={(welders) => setForm({ ...form, welders })}
            />
          </div>

          <div className="mb-6">
            <InstallersSection
              installers={form.installers}
              onChange={(installers) => setForm({ ...form, installers })}
            />
          </div>

          <LargeButton variant="primary" onClick={handleSave}>
            {editId ? 'Обновить сводку' : 'Сохранить сводку'}
          </LargeButton>
        </div>
      </main>

      {showAdmin && (
        <AdminPanel
          reports={reports}
          onDeleteReport={handleDeleteReport}
          onEditReport={handleEditFromAdmin}
          onClose={() => setShowAdmin(false)}
        />
      )}

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Предпросмотр сводки</h2>
              <button onClick={() => setShowPreview(false)} className="text-2xl text-gray-500 hover:text-gray-700">×</button>
            </div>
            <div className="p-4">
              <PreviewCard form={form} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
