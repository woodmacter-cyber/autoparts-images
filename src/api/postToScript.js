import { SCRIPT_URL } from '../config/scriptUrl';

// Единая отправка POST в Google Apps Script.
// ВАЖНО: Content-Type должен быть text/plain — иначе Apps Script
// отклоняет запрос из-за CORS-префлайта (application/json не проходит).
export async function postToScript(payload) {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    const text = await response.text();

    // Apps Script иногда возвращает HTML-страницу ошибки вместо JSON
    if (!text || text.trim().startsWith('<')) {
      return { success: false, message: 'Сервер вернул некорректный ответ' };
    }

    const data = JSON.parse(text);

    if (data.status === 'ok' || data.status === 'already_exists' || data.status === 'already_requested') {
      return { success: true, data };
    }

    return { success: false, message: data.message || 'Ошибка сервера', data };
  } catch (error) {
    console.error('Ошибка POST:', error);
    return { success: false, message: 'Нет связи с сервером' };
  }
}