// Этапы выполнения ЗАЯВКИ (то, что клиент заказал из каталога)
// id — порядковый номер этапа, используется для сравнения статусов
// icon — иконка Ionicons, которая показывается в трекере
export const ORDER_STAGES = [
  { id: 0, title: 'Заявка отправлена', icon: 'paper-plane' },
  { id: 1, title: 'Расчет стоимости', icon: 'calculator' },
  { id: 2, title: 'Оплата', icon: 'card' },
  { id: 3, title: 'Оплачено / Закупка в Китае', icon: 'cash' },
  { id: 4, title: 'На складе в Китае', icon: 'cube' },
  { id: 5, title: 'В пути / Таможня', icon: 'boat' },
  { id: 6, title: 'На складе в РФ', icon: 'warehouse' },
  { id: 7, title: 'Готов к выдаче', icon: 'checkmark-done' },
  { id: 8, title: 'Получено клиентом', icon: 'happy' },
];

// Статусы ЗАПРОСА (то, что клиент просит подобрать вручную)
// color — цвет бейджа статуса в списке и в карточке
export const REQUEST_STAGES = [
  { id: 0, title: 'Отправлен', icon: 'paper-plane', color: '#FF6B00' },
  { id: 1, title: 'В работе', icon: 'construct', color: '#2196F3' },
  { id: 2, title: 'Выполнен', icon: 'checkmark-circle', color: '#4CAF50' },
  { id: 3, title: 'Отклонён', icon: 'close-circle', color: '#FF4444' },
];