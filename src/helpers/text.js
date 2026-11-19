// Транслитерация кириллицы в латиницу
export function translit(str) {
  const lowerMap = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z',
    'и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r',
    'с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch',
    'ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'
  };
  return String(str || '').toLowerCase().split('').map(c => lowerMap[c] !== undefined ? lowerMap[c] : c).join('');
}

// Очистка строки: оставляем только латинские буквы, цифры, пробелы и дефисы
export function onlyLatin(str) {
  return String(str || '').replace(/[^a-zA-Z0-9\s\-]/g, '');
}

// Расстояние Левенштейна (для нечеткого поиска с опечатками)
export function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
  }
  return matrix[b.length][a.length];
}

// Сортировка массива строк по алфавиту (с корректной поддержкой русского и английского)
export function sortAlphabetically(arr) {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort((a, b) => String(a).localeCompare(String(b), ['ru', 'en'], { sensitivity: 'base', numeric: true }));
}