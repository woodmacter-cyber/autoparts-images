import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  CART: 'autoparts_cart',
  ORDERS: 'autoparts_orders',
  CARS: 'autoparts_cars',
  PROFILE: 'autoparts_profile',
  HIDDEN_ORDERS: 'autoparts_hidden_orders', // ✅ Новое: для скрытых заявок
};

export const storage = {
  async loadCart() {
    try {
      const v = await AsyncStorage.getItem(KEYS.CART);
      return v ? JSON.parse(v) : null;
    } catch (e) { return null; }
  },
  async saveCart(cart) {
    try { await AsyncStorage.setItem(KEYS.CART, JSON.stringify(cart)); } catch (e) {}
  },
  
  async loadOrders() {
    try {
      const v = await AsyncStorage.getItem(KEYS.ORDERS);
      return v ? JSON.parse(v) : null;
    } catch (e) { return null; }
  },
  async saveOrders(orders) {
    try { await AsyncStorage.setItem(KEYS.ORDERS, JSON.stringify(orders)); } catch (e) {}
  },

  async loadCars() {
    try {
      const v = await AsyncStorage.getItem(KEYS.CARS);
      return v ? JSON.parse(v) : null;
    } catch (e) { return null; }
  },
  async saveCars(cars) {
    try { await AsyncStorage.setItem(KEYS.CARS, JSON.stringify(cars)); } catch (e) {}
  },

  async loadProfile() {
    try {
      const v = await AsyncStorage.getItem(KEYS.PROFILE);
      return v ? JSON.parse(v) : null;
    } catch (e) { return null; }
  },
  async saveProfile(profile) {
    try { await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile)); } catch (e) {}
  },

  // ✅ НОВОЕ: Скрытые заявки
  async loadHiddenOrders() {
    try {
      const v = await AsyncStorage.getItem(KEYS.HIDDEN_ORDERS);
      return v ? JSON.parse(v) : [];
    } catch (e) { return []; }
  },
  async saveHiddenOrders(hiddenOrders) {
    try { await AsyncStorage.setItem(KEYS.HIDDEN_ORDERS, JSON.stringify(hiddenOrders)); } catch (e) {}
  },
};