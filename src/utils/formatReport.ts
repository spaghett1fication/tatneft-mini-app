// utils/formatReport.ts
import { WORK_TYPES, EQUIPMENT_TYPES, type Welder, type Installer, type EquipmentEntry } from '../types';

interface ReportLike {
  date: string;
  object: string;
  masterId: string;
  works: Record<string, number>;
  additionalWork?: string;
  equipment: EquipmentEntry[];
  welders: Welder[];
  installers: Installer[];
}

// Формирует человекочитаемый текст сводки для отправки в чат бота.
export function formatReportText(form: ReportLike): string {
  const lines: string[] = [];
  lines.push('📋 СВОДКА О РАБОТЕ');
  lines.push('');

  const date = form.date
    ? new Date(form.date).toLocaleDateString('ru-RU')
    : new Date().toLocaleDateString('ru-RU');
  lines.push(`📅 Дата: ${date}`);
  lines.push(`📍 Объект: ${form.object || '—'}`);
  lines.push(`👤 Мастер: ${form.masterId || '—'}`);

  const works = Object.entries(form.works)
    .filter(([_, qty]) => Number(qty) > 0)
    .map(([workId, qty]) => {
      const work = WORK_TYPES.find(w => w.id === workId);
      return `   • ${work?.name || workId}: ${qty} ${work?.unit || ''}`.trim();
    });

  if (works.length > 0) {
    lines.push('');
    lines.push('🔧 Выполненные работы:');
    lines.push(...works);
  }

  if (form.additionalWork) {
    lines.push(`📝 Доп. работа: ${form.additionalWork}`);
  }

  if (form.equipment && form.equipment.length > 0) {
    lines.push('');
    lines.push('🚜 Техника:');
    form.equipment.forEach(e => {
      const eq = EQUIPMENT_TYPES.find(t => t.id === e.type);
      const plate = e.plateNumber ? ` (${e.plateNumber})` : '';
      lines.push(`   • ${eq?.name || e.type}${plate}: ${e.hours || 0} ч`);
    });
  }

  if (form.welders && form.welders.length > 0) {
    lines.push('');
    lines.push(`👷 Сварщики (${form.welders.length}):`);
    form.welders.forEach(w => {
      lines.push(`   • ${w.name || '—'}: ${w.hours || 0} ч`);
    });
  }

  if (form.installers && form.installers.length > 0) {
    lines.push('');
    lines.push(`🔩 Монтажники (${form.installers.length}):`);
    form.installers.forEach(i => {
      lines.push(`   • ${i.name || '—'}: ${i.hours || 0} ч`);
    });
  }

  return lines.join('\n');
}
