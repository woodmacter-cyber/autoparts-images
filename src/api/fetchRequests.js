import { SCRIPT_URL } from '../config/scriptUrl';

const PROXY = 'https://corsproxy.io/?';

export async function fetchRequests(phone = '') {
  try {
    let url = `${SCRIPT_URL}?action=getRequests`;
    if (phone) url += `&phone=${encodeURIComponent(phone)}`;
    const targetUrl = encodeURIComponent(url);
    const response = await fetch(`${PROXY}${targetUrl}`);
    const data = await response.json();
    if (data && typeof data === 'object' && !data.error) {
      return { success: true, data };
    }
    return { success: false, data: [] };
  } catch (error) {
    console.error('Ошибка загрузки запросов:', error);
    return { success: false, data: [] };
  }
}