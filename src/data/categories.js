// Категории запчастей + иконки из папки assets
// ВАЖНО: поле name должно ТОЧНО совпадать с названием категории
// в столбце F листа "Товары" (регистр и пробелы не важны, но буквы — да).
// Если название в таблице другое — просто поменяйте строку name ниже.
// Если категория не найдена — приложение не упадёт, просто покажет заглушку.
export const categories = [
  { id: 1, name: 'Двигатель',   icon: require('../../assets/engine.png') },
  { id: 2, name: 'Подвеска',    icon: require('../../assets/suspension.png') },
  { id: 3, name: 'Кузов',       icon: require('../../assets/body.png') },
  { id: 4, name: 'Освещение',   icon: require('../../assets/light.png') },
  { id: 5, name: 'Салон',       icon: require('../../assets/seat.png') },
  { id: 6, name: 'Колёса',      icon: require('../../assets/wheel.png') },
  { id: 7, name: 'Электроника', icon: require('../../assets/ecu.png') },
  { id: 8, name: 'Турбина',     icon: require('../../assets/turbo.png') },
];