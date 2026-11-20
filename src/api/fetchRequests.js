import { SCRIPT_URL } from '../config/scriptUrl';

export async function fetchRequests(phone = '') {
  try {
    let url = `${SCRIPT_URL}?action=getRequests`;
    if (phone) url += `&phone=${encodeURIComponent(phone)}`;

    const response = await fetch(url);
    const text = await response.text();

    if (!text || text.trim().startsWith('<')) {
      console.error('getRequests: сервер вернул не JSON');
      return { success: false, data: [] };
    }

    const data = JSON.parse(text);
    if (Array.isArray(data)) {
      return { success: true, data };
    }
    console.error('getRequests: некорректный формат', data);
    return { success: false, data: [] };
  } catch (error) {
    console.error('Ошибка загрузки запросов:', error);
    return { success: false, data: [] };
  }
}