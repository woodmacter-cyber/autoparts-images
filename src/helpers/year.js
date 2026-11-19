// Проверка, подходит ли год выпуска автомобиля под год товара
// garageYear — год из гаража пользователя (число или строка)
// productYearStr — год товара из каталога (строка: "2021", "2020-2024", "ALL", пусто)
export function isYearMatch(garageYear, productYearStr) {
  const garageY = parseInt(String(garageYear).trim(), 10);
  if (isNaN(garageY)) return false;

  const str = String(productYearStr || '').trim();
  // Пусто или ALL — товар универсальный, подходит всем
  if (!str || str.toUpperCase() === 'ALL') return true;

  // Диапазон "2020-2024"
  const rangeMatch = str.match(/(\d{4})\s*[-–—]\s*(\d{4})/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    return garageY >= start && garageY <= end;
  }

  // Одиночный год "2021" — допускаем ±2 года (для совместимости поколений)
  const singleMatch = str.match(/(\d{4})/);
  if (singleMatch) {
    const productY = parseInt(singleMatch[1], 10);
    return Math.abs(garageY - productY) <= 2;
  }

  return false;
}

// Проверка, есть ли автомобиль в каталоге сервера
// cloudCarBrands — объект вида { "Toyota": { "Camry": ["2023", "2022", ...], ... }, ... }
export function isCarInCatalog(make, model, year, cloudCarBrands) {
  if (!cloudCarBrands || !make || !model || !year) return false;

  const makeNorm = make.toLowerCase().trim().replace(/\s+/g, '');
  const modelNorm = model.toLowerCase().trim().replace(/\s+/g, '');
  const yearNum = parseInt(year, 10);

  // Ищем марку (регистронезависимо, без пробелов)
  let matchedMake = null;
  for (const catalogMake of Object.keys(cloudCarBrands)) {
    if (catalogMake.toLowerCase().trim().replace(/\s+/g, '') === makeNorm) {
      matchedMake = catalogMake;
      break;
    }
  }
  if (!matchedMake) return false;

  // Ищем модель внутри марки
  const models = cloudCarBrands[matchedMake] || {};
  let matchedModel = null;
  for (const catalogModel of Object.keys(models)) {
    if (catalogModel.toLowerCase().trim().replace(/\s+/g, '') === modelNorm) {
      matchedModel = catalogModel;
      break;
    }
  }
  if (!matchedModel) return false;

  // Проверяем год
  const years = models[matchedModel] || [];
  if (isFinite(yearNum)) {
    return years.some(y => parseInt(y, 10) === yearNum);
  }
  return years.includes(year);
}