import { SCRIPT_URL } from '../config/scriptUrl';

const PROXY = 'https://corsproxy.io/?';

export async function fetchOrders(phone = '') {
  try {
    let url = `${SCRIPT_URL}?action=getOrders`;
    if (phone) url += `&phone=${encodeURIComponent(phone)}`;
    const targetUrl = encodeURIComponent(url);
    const response = await fetch(`${PROXY}${targetUrl}`);
    const data = await response.json();
    if (data && typeof data === 'object' && !data.error) {
      return { success: true, data };
    }
    return { success: false, data: [] };
  } catch (error) {
    console.error('Ошибка загрузки заявок:', error);
    return { success: false, data: [] };
  }
}