import { SCRIPT_URL } from '../config/scriptUrl';

export async function fetchProducts() {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getProducts`);
    const data = await response.json();
    
    if (data && typeof data === 'object' && !data.error) {
      return { success: true, data };
    }
    return { success: false, data: [] };
  } catch (error) {
    console.error('Ошибка загрузки товаров:', error);
    return { success: false, data: [] };
  }
}