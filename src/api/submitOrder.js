import { postToScript } from './postToScript';

// Отправка заявки (корзина) на сервер → type: 'order'
// Бэкенд ждёт: name, phone, vin, tcName, address, comment, items[]
export async function submitOrder(orderData) {
  const items = (orderData.items || []).map((item) => ({
    name: item.name || 'Запчасть',
    article: item.article || '',
    quantity: item.quantity || 1,
    price: item.price || 0,
  }));

  return postToScript({
    type: 'order',
    name: orderData.name || '',
    phone: orderData.phone || '',
    vin: orderData.vin || '',
    tcName: orderData.tcName || 'Уточним с менеджером',
    address: orderData.address || '',
    comment: orderData.comment || '',
    items,
  });
}