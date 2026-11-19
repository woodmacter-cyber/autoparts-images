// Безопасное преобразование значения в число
// Если значение пустое, null или не число — возвращает fallback (по умолчанию 0)
export function safeNum(v, fallback = 0) {
  if (v === null || v === undefined || v === '') return fallback;
  if (typeof v === 'number') return v;
  let clean = String(v).replace(/[^\d.,-]/g, '').replace(',', '.');
  const n = Number(clean);
  return Number.isFinite(n) ? n : fallback;
}