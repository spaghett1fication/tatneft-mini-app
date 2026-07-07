// types/index.ts

// Справочник видов работ (соответствует колонкам Excel)
export const WORK_TYPES = [
  { id: 'razbitie', name: 'Разбивка трассы', unit: 'м', column: 'Разбивка трассы (м)' },
  { id: 'shurmfovka', name: 'Шурфовка пересечений', unit: 'шт', column: 'Шурфовка пересечений (шт)' },
  { id: 'klykovanie', name: 'Клыкование', unit: 'м', column: 'Клыкование (м)' },
  { id: 'srezka', name: 'Срезка плодородного слоя', unit: 'м', column: 'Срезка плодородного слоя (м)' },
  { id: 'kopa', name: 'Копка траншеи', unit: 'м', column: 'Копка траншеи (м)' },
  { id: 'svarka_futlyarov', name: 'Сварка футляров', unit: 'м', column: 'Сварка футляров (м)' },
  { id: 'protaскivanie', name: 'Протаскивание через футляр', unit: 'м', column: 'Протаскивание через футляр (м)' },
  { id: 'dostavka', name: 'Доставка ТМЦ', unit: 'м', column: 'Доставка ТМЦ (м)' },
  { id: 'montazh_linii', name: 'Монтаж линейки', unit: 'м', column: 'Монтаж линейки (м)' },
  { id: 'obvyazka', name: 'Обвязка', unit: 'стык', column: 'Обвязка (стык)' },
  { id: 'prosuv', name: 'Просветка стыков РГК', unit: 'стык', column: 'Просветка стыков РГК (стык)' },
  { id: 'kkni', name: 'Проведение ККНИ', unit: 'м', column: 'Проведение ККНИ (м)' },
  { id: 'svarka_uzlov', name: 'Сварка узлов', unit: 'стык', column: 'Сварка узлов (стык)' },
  { id: 'montazh_ehz', name: 'Монтаж ЭХЗ и КИК', unit: 'шт', column: 'Монтаж ЭХЗ и КИК (шт)' },
  { id: 'ispytaniya', name: 'Испытания трубопровода', unit: 'м', column: 'Испытания трубопровода (м)' },
  { id: 'zasypka', name: 'Засыпка траншеи', unit: 'м', column: 'Засыпка траншеи (м)' },
  { id: 'rekultivatsiya', name: 'Рекультивация', unit: 'м', column: 'Рекультивация (м)' }
] as const;

export const EQUIPMENT_TYPES = [
  { id: 'buldozer', name: 'Бульдозер', column: 'Бульдозер (ч)' },
  { id: 'excavator', name: 'Экскаватор', column: 'Экскаватор (ч)' },
  { id: 'truboukladchik', name: 'Трубоукладчик', column: 'Трубоукладчик (ч)' },
  { id: 'UAZ', name: 'УАЗ', column: 'УАЗ (ч)' },
  { id: 'Sobol', name: 'Соболь', column: 'Соболь (ч)' },
  { id: 'Arok', name: 'Арок', column: 'Арок (ч)' },
  { id: 'KAMAZ', name: 'Камаз', column: 'Камаз (ч)' },
  { id: 'KMU', name: 'КМУ', column: 'КМУ (ч)' },
  { id: 'Fiskar', name: 'Фискар', column: 'Фискар (ч)' },
  { id: 'ARPT', name: 'АРПТ', column: 'АРПТ (ч)' },
  { id: 'Dlinnomer', name: 'Длинномер', column: 'Длинномер (ч)' },
  { id: 'APSH', name: 'АПШ', column: 'АПШ (ч)' },
  { id: 'Pogruzchik', name: 'Погрузчик', column: 'Погрузчик (ч)' },
  { id: 'Kran', name: 'Кран', column: 'Кран (ч)' },
  { id: 'TsA', name: 'ЦА', column: 'ЦА (ч)' },
  { id: 'Ts', name: 'АЦ', column: 'АЦ (ч)' },
  { id: 'Traf', name: 'Трал', column: 'Трал (ч)' },
  { id: 'SIN', name: 'СИН', column: 'СИН (ч)' },
  { id: 'Niva', name: 'Нива', column: 'Нива (ч)' }
] as const;

// Справочник мастеров
export const MASTERS = [
  { id: '1', name: 'Газимзянов М.Г.' },
  { id: '2', name: 'Дмитриев' },
  { id: '3', name: 'Дмитриев Дмитрий Евгеньевич' },
  { id: '4', name: 'Казаков В.Л.' },
  { id: '5', name: 'Каримов Д.Н.' },
  { id: '6', name: 'Куропаткин Алексей Александрович' },
  { id: '7', name: 'Липатов Р.С.' },
  { id: '8', name: 'Платонов К.И.' },
  { id: '9', name: 'Саттаров' },
  { id: '10', name: 'Саушкин А.К.' },
  { id: '11', name: 'Тазиев Р.Г.' },
  { id: '12', name: 'Фадеев Николай Витальевич' },
  { id: '13', name: 'Ханиев Динар Линарович' }
] as const;

// Типы
export type WorkTypeId = typeof WORK_TYPES[number]['id'];
export type EquipmentTypeId = typeof EQUIPMENT_TYPES[number]['id'];

// Сварщик
export interface Welder {
  name: string;
  hours: number;
}

// Данные отчёта
export interface Report {
  id: string;
  timestamp: string;
  userId: string;

  // Основные поля
  date: string;
  object: string;
  masterId: string;

  // Работы (ключ-значение: тип работы -> количество)
  works: Record<WorkTypeId, number>;

  // Доп. работа вне списка
  additionalWork?: string;

  // Техника (ключ-значение: тип техники -> часы)
  equipmentHours: Partial<Record<EquipmentTypeId, number>>;

  // Сварщики (детальная информация)
  welders: Welder[];

  // Монтажники (только часы)
  installerHours: number;
}

// Состояние формы
export interface FormState {
  date: string;
  object: string;
  masterId: string;
  works: Record<WorkTypeId, number>;
  additionalWork: string;
  equipmentHours: Partial<Record<EquipmentTypeId, number>>;
  welders: Welder[];
  installerHours: number;
}

// Ошибки валидации
export interface ValidationErrors {
  [key: string]: string;
}