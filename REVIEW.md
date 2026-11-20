# AutoPartsPilot — Аудит проекта и план работ

> Файл-память. Если открываешь новую сессию — прочитай этот файл целиком, прежде чем
> что-то менять. Здесь зафиксировано состояние кода, найденные баги, план правок
> и расхождения фронта с бэкендом (Google Apps Script).

Последнее обновление: аудит фронта + сверка с `Code.gs` v2.0.

---

## 0. О проекте

- **Имя:** `tankpartspilot` (см. `package.json`)
- **Стек:** Expo SDK 58, React 19.3, React Native 0.88, JS (не TS)
- **Навигация:** ручная, через `activeTab` в `App.js` (Expo Router НЕ используется)
- **Стор:** AsyncStorage (`src/utils/storage.js`)
- **Бэкенд:** Google Apps Script + Google Sheets (`Code.gs`, v2.0)
- **Backend URL:** `src/config/scriptUrl.js` → `SCRIPT_URL` (Google Apps Script /exec)

### Структура
```
App.js                     — корень, состояние, роутинг по activeTab, все модалки
src/
  api/      fetchProducts, fetchCarBrands, fetchCarCatalog, fetchOrders, fetchRequests
  components/ SmartImage, TabButton, ToastNotification
  config/   scriptUrl.js, stages.js
  data/     categories.js
  helpers/  phone, safeNum, stageIndex, text, year
  modals/   AddCarModal, EditCarModal, ConfirmModal, ProductDetailModal,
            RequestPartModal, RequestNewCarModal
  screens/  HomeScreen, CatalogScreen, CartScreen, CheckoutScreen,
            OrderSuccessScreen, ProfileScreen
  utils/    storage.js, genOrderId.js
  styles.js — единый StyleSheet
assets/     картинки (tank.jpg, engine.png и т.д.)
```

---

## 1. Бэкенд (Code.gs v2.0) — что важно знать

### GET actions (чтение)
| action | что возвращает | формат |
|---|---|---|
| `getProducts` | массив товаров | `[{id, article, name, brand, price, category, description, make, model, year, isUniversal, imageUrl}]` |
| `getTransportCompanies` | массив ТК | `[{id, name, city}]` |
| `getOrders` | массив заявок | `[{id, date, customer, phone, vin, transportCompany, address, comment, paidAt, total, exactTotal, itemsCount, rowsCount, unpricedRows, status, items:[{name,article,quantity,price,exact}], type:'order', partialPricing, canPay}]` |
| `getRequests` | массив запросов | `[{id, date, customer, phone, vin, car, comment, total, exactTotal, itemsCount, rowsCount, unpricedRows, partialPricing, status, items:[...], type:'request', transportCompany, address}]` |
| `getCarBrands` | объект `{Марка:{Модель:{Год:true}}}` | `{...}` |
| `ping` | диагностика | `{status, version, time, spreadsheet, rows}` |

> `getOrders`/`getRequests` УЖЕ проставляют `type: 'order'|'request'`.
> `getOrders` УЖЕ возвращает `partialPricing` и `canPay`.

### POST (запись) — JSON в теле
`doPost` делает `JSON.parse(e.postData.contents)`, читает `data.type`:

| type | обработчик | ожидаемые поля |
|---|---|---|
| `order` | handleOrder | `name`(или customer), `phone`, `vin`, `tcName`, `address`, `comment`, `items:[{name,article,quantity,price}]`, (опц.) `orderId` |
| `request` | handleRequest | `customer`(или name), `phone`, `vin`, `car`, `comment`, `items:[{name,article}]`, (опц.) `orderId` |
| `add_car_request` | handleAddCarRequest | `brand`, `model`, `year` |
| `pay_order` | handlePayOrder | `orderId`, (опц.) `exactTotal` для сверки суммы |
| `cancel_order` / `delete_order` / `complete_order` / `hide_order` | handleArchive | `orderId` |

### Ключевые правила бэкенда
- **Идемпотентность:** если передан `orderId` и он уже есть с тем же телефоном → `{status:'ok', duplicate:true}`.
- **Год в add_car_request** обязан быть 4 цифры (`/^\d{4}$/`) или пусто, иначе `error`.
- **add_car_request** возвращает `already_exists` / `already_requested` / `ok`.
- **pay_order** валидирует: все цены заполнены, сумма > 0, не отменена, не оплачена, сумма не изменилась. Ошибки приходят с `status:'error'` + `partialPricing`/`exactTotal`.
- Статус-машина заявки: 0..8, -1 отменено, -2 ошибка (совпадает с `src/config/stages.js`).

### ⚠️ CORS / POST
Apps Script `doPost` не отдаёт CORS-заголовки. Для `fetch` из RN использовать
`Content-Type: 'text/plain;charset=utf-8'` (НЕ `application/json`) либо прокси.
В `fetchOrders`/`fetchRequests` уже используется прокси `https://corsproxy.io/?`.
В `getProducts`/`getCarBrands` прокси НЕТ.

---

## 2. 🔴 Критичные баги / расхождения (по убыванию приоритета)

### 2.1 Заявки НЕ отправляются на сервер
`App.js → onSubmitOrder` только `console.log`, затем `setActiveTab('success')`.
Нужен реальный `POST type:'order'`. Аналогично `RequestPartModal` и `RequestNewCarModal`.

### 2.2 Транспортные компании пустые → оформление заблокировано
`App.js`: `transportCompanies = []`, `refreshTC = () => {}`.
`CheckoutScreen.validate()` требует `selectedTC`, а список пуст → заявку не отправить НИКОГДА.
Бэкенд умеет `getTransportCompanies` — надо вызвать и заполнять.

### 2.3 Формат и имена полей POST не совпадают с бэкендом
- Checkout шлёт `transportCompany`, бэкенд ждёт **`tcName`**.
- `items` должен содержать `name`, `article`, `quantity`, `price` — у части товаров `article`/`quantity` может отсутствовать.
- `RequestPartModal` шлёт `partName`, `vin`, `comment`, `customerName`, `customerPhone`.
  Бэкенд ждёт `customer`, `phone`, `car`, `items:[{name,article}]`. → **не совпадает**, надо маппить.
- `RequestNewCarModal` шлёт `make`, бэкенд ждёт **`brand`** (и `type:'add_car_request'`).

### 2.4 Нет кнопки «Оплатить» и вызова pay_order
`getOrders` возвращает `canPay` / `partialPricing` / `exactTotal`, но `ProfileScreen`
их не использует. Функции оплаты на фронте НЕТ вообще.

### 2.5 Отмена/архивация заявки — фейк
`ProfileScreen.handleCancelOrder` показывает тост, но не шлёт `cancel_order`.
После рефреша заявка «вернётся».

### 2.6 JSX в RequestNewCarModal.js (ПРОВЕРИТЬ)
При чтении файла показалось, что в блоке `modalButtons` отсутствовал закрывающий `</View>`.
Если проект собирается — тег на месте. **Проверить глазами/линтом первым делом.**

---

## 3. 🟠 Логика / качество

- **`productMatchesCar` продублирована** в `HomeScreen.js` и `CatalogScreen.js` (с пометкой
  «временная заглушка»). В `helpers/year.js` уже есть `isYearMatch` — вынести общую
  `productMatchesCar(product, car)` в хелперы и переиспользовать.
- **`ProfileScreen.loadData`** грузит только при наличии `profile.phone`; после ввода
  телефона нужен триггер перезагрузки (сейчас только pull-to-refresh).
- **`ProductDetailModal`**: если `quantity > 0`, кнопка «Добавить» = статичный View →
  нельзя добавить ещё из модалки.
- **`AddCarModal`**: год не валидируется (`year.trim()`), можно ввести «1».
- **`helpers/safeNum.js`**: `replace(',', '.')` меняет только ПЕРВУЮ запятую;
  русский формат тыс. («1.234,56») ломается. Улучшить парсинг.
- **`utils/genOrderId.js`** нигде не используется — либо задействовать, либо удалить.
- **`styles.js`**: много неиспользуемых ключей (orderPayButton, imageZoom*, requestTitle,
  orderDeleteButton и др.) — почистить.
- **`fetchCarCatalog`** возвращает `success:false` при пустом массиве → в логах
  «КАТАЛОГ НЕ ЗАГРУЖЕН» даже при валидном пустом ответе. Косметика логов.

---

## 4. ✅ План работ (порядок предложен пользователю)

1. **`fetchTransportCompanies`** + загрузка в `App.js` + реальный `refreshTC`.
2. **API-обёртки POST**: `submitOrder`, `submitRequest`, `submitCarRequest`
   (в `src/api/`), с `Content-Type: text/plain;charset=utf-8`.
3. **Подключить отправку**: `App.js` (маппинг полей), `CheckoutScreen` (`tcName`, `items`),
   `RequestPartModal` (customer/phone/car/items), `RequestNewCarModal` (`brand`, type).
4. **`payOrder`** + `archiveOrder` (cancel/delete/complete/hide) в `src/api/`.
5. **`ProfileScreen`**: кнопка «Оплатить» по `canPay`, отмена → `cancel_order`,
   обновление списка после действий.
6. **`RequestNewCarModal`** — проверить/починить JSX.
7. **Хелпер `productMatchesCar`** — вынести общее, убрать дубли.
8. **Мелочи**: валидация года в AddCarModal, safeNum, чистка styles, genOrderId.

---

## 5. Открытые вопросы (для пользователя)

- Тариф/биллинг: $10 — это API-кредиты в кабинете DeepSeek (pay-per-token).
  Ориентир: ~$0.1–0.3 в день интенсивной работы → недели, а не дни. Точный расход — в кабинете (Usage).
- `doPost` задеплоен как «Выполнять как: Я», «Доступ: любой»? (влияет на CORS/прокси)
- Список ТК в листе «ТК» уже заполнен? Какие компании должны быть?

---

## 6. Состояние проверки

- [x] Прочитан весь `src/` (api, components, config, data, helpers, modals, screens, utils, styles.js)
- [x] Прочитан `App.js`, `package.json`
- [x] Сверено с бэкендом `Code.gs` v2.0
- [ ] Линт / typecheck не запускались (команды отменялись). Команда для запуска: `npx expo lint`
- [ ] Реальная отправка POST ещё не реализована — код на фронте только логирует

---

## 7. Быстрый старт для новой сессии

1. Прочитай этот файл.
2. Проверь `git status` — что уже изменено.
3. Начни с пунктов Плана (раздел 4), первый блокирующий шаг — 1 и 2 (ТК + отправка заявок).
4. Для любых изменений API — придерживайся имён полей из раздела 1 (таблицы POST).
5. Стиль кода: функциональные компоненты + hooks, комментарии на русском.
~~~

**Как сохранить:** создай в корне проекта файл `REVIEW.md` и вставь этот текст. Завтра скажи мне «прочитай REVIEW.md» — и я сразу продолжу с пункта 1, без потери контекста.

Готово. Что-нибудь ещё или начинаем правки прямо сейчас?