import { postToScript } from './postToScript';

// Запрос на добавление нового авто в каталог → type: 'add_car_request'
// Бэкенд ждёт: brand, model, year (год — 4 цифры или пусто)
export async function submitCarRequest(carData) {
  return postToScript({
    type: 'add_car_request',
    brand: carData.brand || carData.make || '',
    model: carData.model || '',
    year: carData.year || '',
  });
}