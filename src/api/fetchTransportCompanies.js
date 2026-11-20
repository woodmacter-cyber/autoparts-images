import { SCRIPT_URL } from '../config/scriptUrl';

// Загрузка транспортных компаний (лист "ТК")
// Возвращает массив [{ id, name, city }] — только активные (D = true)
export async function fetchTransportCompanies() {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getTransportCompanies`);
    const data = await response.json();

    if (Array.isArray(data)) {
      return { success: true, data };
    }
    return { success: false, data: [] };
  } catch (error) {
    console.error('Ошибка загрузки ТК:', error);
    return { success: false, data: [] };
  }
}