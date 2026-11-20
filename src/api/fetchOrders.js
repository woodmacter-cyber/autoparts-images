import { SCRIPT_URL } from '../config/scriptUrl';

export async function fetchOrders(phone = '') {
  try {
    let url = `${SCRIPT_URL}?action=getOrders`;
    if (phone) url += `&phone=${encodeURIComponent(phone)}`;

    const response = await fetch(url);
    const text = await response.text();

    // защита от HTML-ответа (логин Google / ошибка деплоя)
    if (!text || text.trim().startsWith('<')) {
      console.error('getOrders: сервер вернул не JSON');
      return { success: false, data: [] };
    }

    const data = JSON.parse(text);
    if (Array.isArray(data)) {
      return { success: true, data };
    }
    console.error('getOrders: некорректный формат', data);
    return { success: false, data: [] };
  } catch (error) {
    console.error('Ошибка загрузки заявок:', error);
    return { success: false, data: [] };
  }
}