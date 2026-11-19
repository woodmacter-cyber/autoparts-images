import { SCRIPT_URL } from '../config/scriptUrl';

export async function fetchCarBrands() {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getCarBrands`);
    const data = await response.json();
    
    if (data && typeof data === 'object' && !data.error) {
      return { success: true, data };
    }
    return { success: false, data: [] };
  } catch (error) {
    console.error('Ошибка загрузки марок:', error);
    return { success: false, data: [] };
  }
}