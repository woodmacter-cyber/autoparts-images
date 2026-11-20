import { postToScript } from './postToScript';

// Отправка запроса запчасти (если нет в каталоге) → type: 'request'
// Бэкенд ждёт: customer, phone, vin, car, comment, items[]
export async function submitRequest(requestData) {
  const itemName = requestData.partName || 'Запрос запчасти';

  return postToScript({
    type: 'request',
    customer: requestData.customerName || requestData.customer || 'Клиент',
    phone: requestData.customerPhone || requestData.phone || '',
    vin: requestData.vin || '',
    car: requestData.car ? `${requestData.car.make} ${requestData.car.model} (${requestData.car.year})` : '',
    comment: requestData.comment || '',
    items: [{ name: itemName, article: '' }],
  });
}