import { SCRIPT_URL } from '../config/scriptUrl';

export async function fetchCarCatalog() {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getCarCatalog`);
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      return { success: true, data };
    }
    return { success: false, data: [] };
  } catch (error) {
    console.error('Ошибка загрузки каталога авто:', error);
    return { success: false, data: [] };
  }
}