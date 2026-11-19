// Проверка корректности номера телефона
// Считаем только цифры, игнорируя скобки, пробелы, дефисы и "+7"
// Разрешаем 10 цифр (городской/мобильный без кода страны) и 11 (с кодом страны)
export function isValidPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}