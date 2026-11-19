// Определение этапа ЗАЯВКИ по статусу (9 этапов: 0..8)
// Возвращает: -2 (ошибка), -1 (отменено), 0..8 (этап)
export function getStageIndex(status) {
  if (!status) return 0;
  const s = String(status).toLowerCase().trim();
  if (s.includes('отменен') || s.includes('отменено') || s.includes('удален')) return -1;
  if (s.includes('получен') || s.includes('выдан')) return 8;
  if (s.includes('готов к выдаче')) return 7;
  if (s.includes('складе в рф') || s.includes('прибыл в рф')) return 6;
  if (s.includes('в пути') || s.includes('таможн')) return 5;
  if (s.includes('складе в китае')) return 4;
  if (s.includes('оплачен') || s.includes('закуп') || s.includes('выкуп')) return 3;
  if (s.includes('оплата')) return 2;
  if (s.includes('расчет')) return 1;
  if (s.includes('ошибка')) return -2;
  return 0;
}

// Определение статуса ЗАПРОСА (4 статуса: 0..3)
// Возвращает: -1 (отклонён/отменён), 0..3 (статус)
export function getRequestStageIndex(status) {
  if (!status) return 0;
  const s = String(status).toLowerCase().trim();
  if (s.includes('отклонен') || s.includes('отклонён')) return 3;
  if (s.includes('выполнен') || s.includes('завершен') || s.includes('завершён')) return 2;
  if (s.includes('в работе') || s.includes('принят')) return 1;
  if (s.includes('отменен') || s.includes('отменено')) return -1;
  return 0;
}

// Можно ли отменить ЗАЯВКУ? (только на этапах 0, 1, 2 — до оплаты)
export function canCancelOrder(status) {
  const stage = getStageIndex(status);
  return stage >= 0 && stage < 3;
}

// Можно ли отменить ЗАПРОС? (только на этапах 0, 1 — пока не выполнен)
export function canCancelRequest(status) {
  const stage = getRequestStageIndex(status);
  return stage === 0 || stage === 1;
}