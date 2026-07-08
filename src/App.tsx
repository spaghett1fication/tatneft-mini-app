// App.tsx
import { useState, useEffect } from 'react';
import { WORK_TYPES, EQUIPMENT_TYPES, type Master, type WorkTypeId, type EquipmentEntry, type Welder, type Installer, type Report } from './types';
import { useTelegram } from './hooks/useTelegram';
import { useReports, useObjectsHistory, useMasters } from './hooks/useLocalStorage';
import { formatReportText } from './utils/formatReport';
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
  const { user, haptic, sendData, isTelegram } = useTelegram();
  const { reports, setReports } = useReports();
  const { objects, setObjects } = useObjectsHistory();
  const { masters, setMasters } = useMasters();

  const [showAdmin, setShowAdmin] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSendPreview, setShowSendPreview] = useState<string | null>(null);

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

  const resetForm = () => {
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

    resetForm();

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
        r.masterId,
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

  const handleSendToBot = () => {
    const error = validateForm();
    if (error) {
      setShowStatus({ message: error, type: 'error' });
      haptic('error');
      return;
    }

    const text = formatReportText(form);

    if (isTelegram) {
      // Отправляем сводку в бот. Telegram после этого закроет мини-апп,
      // а бот получит данные и запишет сводку в чат.
      sendData(text);
      haptic('success');
    } else {
      // Демо-режим: просто показываем сформированный текст для копирования.
      setShowSendPreview(text);
    }
  };

  const handleDeleteReport = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
    if (editId === id) {
      setEditId(null);
      resetForm();
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
    <div className="app-shell">
      <header className="app-header p-4">
        <h1 className="text-2xl font-bold text-center text-slate-100 tracking-wide">
          СВОДКА О РАБОТЕ
        </h1>
        <div className="flex justify-center gap-3 mt-3 flex-wrap">
          <button
            onClick={() => setShowAdmin(true)}
            className="pill pill-neutral"
          >
            Архив ({reports.length})
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className="pill pill-accent"
          >
            Предпросмотр
          </button>
          <button
            onClick={handleExport}
            className="pill pill-green"
          >
            Экспорт
          </button>
        </div>
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        <div className="app-card p-6">
          {showStatus && (
            <div className={showStatus.type === 'success' ? 'status-success' : 'status-error'}>
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
                if (!masters.find(m => m.id === newMaster.id)) {
                  setMasters([newMaster, ...masters.slice(0, 19)]);
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

          <div className="space-y-3">
            <LargeButton variant="primary" onClick={handleSave}>
              {editId ? 'Обновить сводку' : 'Сохранить сводку'}
            </LargeButton>

            <LargeButton variant="success" onClick={handleSendToBot}>
              📤 Отправить в чат бота
            </LargeButton>
          </div>
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

      {/* Предпросмотр сводки */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50" onClick={() => setShowPreview(false)}>
          <div className="app-card max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-slate-950 border-b border-slate-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-100">Предпросмотр сводки</h2>
              <button onClick={() => setShowPreview(false)} className="text-2xl text-slate-400 hover:text-slate-200">×</button>
            </div>
            <div className="p-4">
              <PreviewCard form={form} />
            </div>
          </div>
        </div>
      )}

      {/* Окно отправки (демо-режим, вне Telegram) */}
      {showSendPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="app-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-950 border-b border-slate-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-slate-100">Сводка для отправки</h2>
              <button onClick={() => setShowSendPreview(null)} className="text-2xl text-slate-400 hover:text-slate-200">×</button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-slate-400">
                В Telegram эта сводка автоматически отправляется боту и пишется в чат.
                В демо-режиме скопируйте текст вручную:
              </p>
              <pre className="bg-slate-900 border border-slate-700 rounded-md p-4 text-sm text-slate-100 whitespace-pre-wrap font-mono">
{showSendPreview}
              </pre>
              <LargeButton
                variant="secondary"
                onClick={() => {
                  navigator.clipboard?.writeText(showSendPreview);
                  setShowStatus({ message: '✓ Текст скопирован', type: 'success' });
                }}
              >
                Копировать текст
              </LargeButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
