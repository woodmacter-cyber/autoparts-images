import { SCRIPT_URL } from '../config/scriptUrl';

const PROXY = 'https://corsproxy.io/?';

export async function fetchProducts() {
  try {
    const targetUrl = encodeURIComponent(`${SCRIPT_URL}?action=getProducts`);
    const response = await fetch(`${PROXY}${targetUrl}`);
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