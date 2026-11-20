import { postToScript } from './postToScript';

// Действия над заявкой/запросом на сервере.
// action: 'cancel_order' | 'delete_order' | 'complete_order' | 'hide_order'
// Бэкенд (handleArchive) ждёт orderId.
export async function archiveOrder(orderId, action = 'cancel_order') {
  if (!orderId) {
    return { success: false, message: 'Не указан номер заявки' };
  }

  const allowed = ['cancel_order', 'delete_order', 'complete_order', 'hide_order'];
  if (!allowed.includes(action)) {
    return { success: false, message: 'Неизвестное действие' };
  }

  return postToScript({
    type: action,
    orderId,
  });
}

// Удобные обёртки
export const cancelOrder = (orderId) => archiveOrder(orderId, 'cancel_order');
export const deleteOrder = (orderId) => archiveOrder(orderId, 'delete_order');
export const completeOrder = (orderId) => archiveOrder(orderId, 'complete_order');