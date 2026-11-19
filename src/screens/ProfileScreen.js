import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';
import { safeNum } from '../helpers/safeNum';
import { isValidPhone } from '../helpers/phone';
import { getStageIndex, getRequestStageIndex, canCancelOrder, canCancelRequest } from '../helpers/stageIndex';
import { ORDER_STAGES, REQUEST_STAGES } from '../config/stages';
import { fetchOrders } from '../api/fetchOrders';
import { fetchRequests } from '../api/fetchRequests';
import SmartImage from '../components/SmartImage';

// Экран профиля: контакты, гараж, список заявок и запросов
export default function ProfileScreen({
  profile,
  onUpdateProfile,
  garageCars,
  onAddCar,
  onEditCar,
  onDeleteCar,
  onRequestPart,
  onRequestNewCar,
  onShowToast,
}) {
  const [orders, setOrders] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Загрузка заявок и запросов С ФИЛЬТРАЦИЕЙ ПО ТЕЛЕФОНУ
  const loadData = useCallback(async () => {
    if (!profile.phone) return;
    setLoading(true);
    try {
      const [ordersRes, requestsRes] = await Promise.all([
        fetchOrders(profile.phone),
        fetchRequests(profile.phone),
      ]);
      if (ordersRes.success) setOrders(ordersRes.data);
      if (requestsRes.success) setRequests(requestsRes.data);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
    } finally {
      setLoading(false);
    }
  }, [profile.phone]);

  useEffect(() => { loadData(); }, [loadData]);

  // Отмена заявки
  const handleCancelOrder = (orderId) => {
    Alert.alert('Отменить заявку?', 'Менеджер увидит отметку об отмене', [
      { text: 'Нет', style: 'cancel' },
      { text: 'Да', onPress: () => onShowToast('Заявка отменена', 'info') },
    ]);
  };

  // Рендер трекера этапов заявки
  const renderOrderTracker = (order) => {
    const currentStage = getStageIndex(order.status);
    if (currentStage === -1) {
      return (
        <View style={styles.trackerCancelled}>
          <Ionicons name="close-circle" size={24} color="#FF4444" />
          <Text style={styles.trackerCancelledText}>Заявка отменена</Text>
        </View>
      );
    }
    return (
      <View style={styles.trackerContainer}>
        <Text style={styles.trackerTitle}>Статус выполнения</Text>
        {ORDER_STAGES.map((stage, idx) => {
          const isPassed = idx < currentStage;
          const isCurrent = idx === currentStage;
          const isFuture = idx > currentStage;
          return (
            <View key={stage.id} style={styles.trackerStepRow}>
              <View style={styles.trackerStepLeft}>
                <View style={[
                  styles.trackerCircle,
                  isPassed && styles.trackerCirclePassed,
                  isCurrent && styles.trackerCircleCurrent,
                  isFuture && styles.trackerCircleFuture,
                ]}>
                  <Ionicons
                    name={isPassed ? 'checkmark' : stage.icon}
                    size={14}
                    color={isPassed ? '#FFF' : (isCurrent ? '#FFF' : '#888')}
                  />
                </View>
                {idx < ORDER_STAGES.length - 1 && (
                  <View style={[
                    styles.trackerLineVertical,
                    isPassed && styles.trackerLinePassed,
                    isCurrent && styles.trackerLineCurrent,
                  ]} />
                )}
              </View>
              <View style={styles.trackerStepContent}>
                <Text style={[
                  styles.trackerStepTitle,
                  isPassed && styles.trackerStepTitlePassed,
                  isCurrent && styles.trackerStepTitleCurrent,
                  isFuture && styles.trackerStepTitleFuture,
                ]}>
                  {stage.title}
                </Text>
                {isCurrent && <Text style={styles.trackerStepCurrentBadge}>Текущий этап</Text>}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // Рендер карточки заявки/запроса
  const renderOrderCard = (order) => {
    const isRequest = order.type === 'request';
    const isExpanded = expandedOrderId === order.id;
    const stageIndex = isRequest ? getRequestStageIndex(order.status) : getStageIndex(order.status);
    const stageConfig = isRequest
      ? REQUEST_STAGES.find(s => s.id === stageIndex)
      : ORDER_STAGES.find(s => s.id === stageIndex);

    return (
      <View key={order.id} style={[
        styles.orderCard,
        isRequest && styles.orderCardRequest,
        stageIndex === -1 && styles.orderCardCancelled,
        stageIndex === 8 && styles.orderCardCompleted,
        stageIndex === 3 && styles.orderCardRejected,
      ]}>
        <TouchableOpacity onPress={() => setExpandedOrderId(isExpanded ? null : order.id)}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>{order.id}</Text>
            {stageConfig && (
              <View style={[styles.orderTypeBadge, isRequest ? styles.orderTypeBadgeRequest : styles.orderTypeBadgeOrder]}>
                <Ionicons name={stageConfig.icon} size={12} color="#FFF" />
                <Text style={styles.orderTypeBadgeText}>{stageConfig.title}</Text>
              </View>
            )}
          </View>
          <Text style={styles.orderDate}>{order.date}</Text>
          <Text style={styles.orderItems}>
            {order.itemsCount} поз. • {isRequest ? 'Запрос' : 'Заявка'}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={{ marginTop: 12 }}>
            {renderOrderTracker(order)}
            <View style={styles.orderDetailInfoBlock}>
              <Text style={styles.orderDetailInfoLabel}>Телефон</Text>
              <Text style={styles.orderDetailInfoText}>{order.phone || '—'}</Text>
              <Text style={styles.orderDetailInfoLabel}>ТК</Text>
              <Text style={styles.orderDetailInfoText}>{order.transportCompany || '—'}</Text>
              <Text style={styles.orderDetailInfoLabel}>Адрес</Text>
              <Text style={styles.orderDetailInfoText}>{order.address || '—'}</Text>
            </View>
            {!isRequest && order.exactTotal > 0 && (
              <View style={styles.orderExactTotalBlock}>
                <Text style={styles.orderExactTotalLabel}>Точная сумма</Text>
                <Text style={styles.orderExactTotalValue}>{order.exactTotal.toLocaleString('ru-RU')} ₽</Text>
              </View>
            )}
            {!isRequest && canCancelOrder(order.status) && (
              <TouchableOpacity style={styles.orderCancelButton} onPress={() => handleCancelOrder(order.id)}>
                <Ionicons name="close-circle" size={18} color="#FF4444" />
                <Text style={styles.orderCancelButtonText}>Отменить заявку</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} tintColor="#FF6B00" />}
    >
      {/* Шапка профиля */}
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          <Ionicons name="person" size={40} color="#FFF" />
        </View>
        <Text style={styles.profileName}>{profile.name || 'Гость'}</Text>
      </View>

      {/* Контакты */}
      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>Контакты</Text>
        <View style={styles.profileCard}>
          <TextInput
            style={styles.profileInput}
            placeholder="Имя"
            value={profile.name}
            onChangeText={(v) => onUpdateProfile({ ...profile, name: v })}
            placeholderTextColor="#666"
          />
          <TextInput
            style={styles.profileInput}
            placeholder="Телефон"
            value={profile.phone}
            onChangeText={(v) => onUpdateProfile({ ...profile, phone: v })}
            keyboardType="phone-pad"
            placeholderTextColor="#666"
          />
        </View>
      </View>

      {/* Гараж */}
      <View style={styles.profileSection}>
        <View style={styles.profileSectionHeader}>
          <Text style={styles.profileSectionTitle}>Мой гараж</Text>
          <TouchableOpacity style={styles.addCarButton} onPress={onAddCar}>
            <Ionicons name="add-circle" size={18} color="#FF6B00" />
            <Text style={styles.addCarButtonText}>Добавить авто</Text>
          </TouchableOpacity>
        </View>
        {garageCars.length === 0 ? (
          <View style={styles.emptyGarage}>
            <Ionicons name="car-outline" size={48} color="#888" />
            <Text style={styles.emptyOrdersText}>Нет автомобилей</Text>
          </View>
        ) : (
          garageCars.map((car) => (
            <View key={car.id} style={styles.carCard}>
              <View style={styles.carIconWrapper}>
                <Ionicons name="car-sport" size={24} color="#FF6B00" />
              </View>
              <View style={styles.carInfo}>
                <Text style={styles.carName}>{car.make} {car.model}</Text>
                <Text style={styles.carYear}>{car.year}</Text>
                {car.vin && <Text style={styles.carVin}>VIN: {car.vin}</Text>}
              </View>
              <View style={styles.carActions}>
                <TouchableOpacity style={styles.carEditButton} onPress={() => onEditCar(car)}>
                  <Ionicons name="create" size={18} color="#FF6B00" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.carDeleteButton} onPress={() => onDeleteCar(car.id)}>
                  <Ionicons name="trash" size={18} color="#FF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Заявки */}
      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>Мои заявки</Text>
        {orders.length === 0 ? (
          <View style={styles.emptyOrders}>
            <Ionicons name="document-text-outline" size={48} color="#888" />
            <Text style={styles.emptyOrdersText}>Нет заявок</Text>
          </View>
        ) : (
          orders.map(renderOrderCard)
        )}
      </View>

      {/* Запросы */}
      <View style={styles.profileSection}>
        <Text style={styles.profileSectionTitle}>Мои запросы</Text>
        {requests.length === 0 ? (
          <View style={styles.emptyOrders}>
            <Ionicons name="help-circle-outline" size={48} color="#888" />
            <Text style={styles.emptyOrdersText}>Нет запросов</Text>
          </View>
        ) : (
          requests.map(renderOrderCard)
        )}
      </View>

      {/* Кнопки действий */}
      <View style={styles.profileSection}>
        <TouchableOpacity style={styles.emptyStateButton} onPress={onRequestPart}>
          <Ionicons name="document-text" size={20} color="#FFF" />
          <Text style={styles.emptyStateButtonText}>Запросить запчасть</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.requestNewCarButton} onPress={onRequestNewCar}>
          <Ionicons name="car-outline" size={20} color="#FF6B00" />
          <Text style={styles.requestNewCarButtonText}>Запросить новое авто в каталог</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}