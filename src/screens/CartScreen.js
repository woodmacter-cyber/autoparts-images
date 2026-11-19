import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SmartImage from '../components/SmartImage';
import { styles } from '../styles';
import { safeNum } from '../helpers/safeNum';

// Экран «Лист запроса» — корзина товаров перед оформлением заявки
export default function CartScreen({
  cart,
  onRemove,
  onClear,
  onCheckout,
  onShowToast,
  onBack,
  onRequestPart,
}) {
  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );
  const totalEstimated = useMemo(
    () => cart.reduce((sum, item) => sum + safeNum(item.price) * item.quantity, 0),
    [cart]
  );

  // Если корзина пуста — показываем заглушку
  if (cart.length === 0) {
    return (
      <View style={styles.screenContainer}>
        <Ionicons name="list-outline" size={80} color="#555" />
        <Text style={styles.screenTitle}>Лист запроса пуст</Text>
        <Text style={styles.screenSubtitle}>Добавьте детали из каталога</Text>
        <TouchableOpacity style={styles.addMoreButton} onPress={onBack}>
          <Ionicons name="add-circle" size={20} color="#FFF" />
          <Text style={styles.addMoreButtonText}>Перейти в каталог</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.emptyStateButton} onPress={onRequestPart}>
          <Ionicons name="document-text" size={20} color="#FFF" />
          <Text style={styles.emptyStateButtonText}>Запросить запчасть</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Рендер одной строки списка
  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <SmartImage source={item.image} fallback={item.fallback} size={60} />
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemArticle}>Арт: {item.article}</Text>
        <View style={styles.quantityRow}>
          <Text style={styles.quantityLabel}>Кол-во:</Text>
          <Text style={styles.quantityValue}>{item.quantity} шт.</Text>
        </View>
      </View>
      <View style={styles.cartItemAction}>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => {
            onRemove(item.id);
            onShowToast('Удалено из запроса', 'info');
          }}
        >
          <Ionicons name="close-circle" size={22} color="#FF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Шапка с кнопкой «Назад» и «Очистить» */}
      <View style={styles.cartHeader}>
        <TouchableOpacity onPress={onBack} style={styles.headerBackButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
          <Text style={styles.headerBackText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.cartTitle}>Лист запроса</Text>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Очистить?',
              'Все позиции будут удалены',
              [
                { text: 'Отмена', style: 'cancel' },
                {
                  text: 'Очистить',
                  onPress: () => {
                    onClear();
                    onShowToast('Очищено', 'info');
                  },
                },
              ]
            );
          }}
          style={styles.clearButtonIcon}
        >
          <Ionicons name="trash-outline" size={22} color="#FF4444" />
        </TouchableOpacity>
      </View>

      {/* Список товаров */}
      <FlatList
        data={cart}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      {/* Итоговый блок внизу */}
      <View style={styles.totalBlock}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Позиций:</Text>
          <Text style={styles.totalValue}>{totalItems} шт.</Text>
        </View>
        <View style={styles.estimatedTotalBlock}>
          <Text style={styles.estimatedTotalLabel}>Примерная сумма:</Text>
          <Text style={styles.estimatedTotalValue}>
            ≈ {totalEstimated.toLocaleString('ru-RU')} ₽
          </Text>
        </View>
        <Text style={styles.totalHelperText}>
          Цены в каталоге — примерные. Итоговую стоимость рассчитает менеджер.
        </Text>
        <TouchableOpacity style={styles.addMoreButton} onPress={onBack}>
          <Ionicons name="add-circle" size={20} color="#FFF" />
          <Text style={styles.addMoreButtonText}>Добавить ещё товары</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
          <Text style={styles.checkoutButtonText}>Оформить заявку</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}