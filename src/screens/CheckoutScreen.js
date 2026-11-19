import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';
import { safeNum } from '../helpers/safeNum';
import { isValidPhone } from '../helpers/phone';

// Экран оформления заявки
export default function CheckoutScreen({
  cart,
  onBack,
  onSubmitOrder,
  defaultName,
  defaultPhone,
  onShowToast,
  transportCompanies,
  refreshTC,
  garageCars,
}) {
  const [name, setName] = useState(defaultName || '');
  const [phone, setPhone] = useState(defaultPhone || '');
  const [selectedTC, setSelectedTC] = useState('');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );
  const totalEstimated = useMemo(
    () => cart.reduce((sum, item) => sum + safeNum(item.price) * item.quantity, 0),
    [cart]
  );

  useEffect(() => { refreshTC(); }, []);

  useEffect(() => {
    if (transportCompanies.length > 0 && !selectedTC) {
      setSelectedTC(transportCompanies[0].id);
    }
  }, [transportCompanies]);

  const validate = () => {
    const newErrors = {};
    if (name.trim().length < 2) newErrors.name = 'Введите имя';
    if (!isValidPhone(phone)) newErrors.phone = 'Введите 10-11 цифр';
    if (!selectedTC) newErrors.tc = 'Выберите транспортную компанию';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (submitting) return;
    setSubmitting(true);
    try {
      const tc = transportCompanies.find(t => t.id === selectedTC);
      const carVin = garageCars && garageCars.length > 0 ? (garageCars[0].vin || '') : '';
      await onSubmitOrder({
        name,
        phone,
        address,
        comment,
        totalItems,
        totalEstimated,
        transportCompany: tc ? tc.name : 'Не выбрана',
        items: [...cart],
        vin: carVin,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <View style={styles.catalogHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
          <Text style={styles.backText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.catalogTitle}>Оформление заявки</Text>
      </View>

      <View style={styles.checkoutWrapper}>
        {/* Список товаров */}
        <View style={styles.checkoutSection}>
          <Text style={styles.checkoutSectionTitle}>Ваш запрос ({totalItems} поз.)</Text>
          {cart.map((item) => (
            <View key={item.id} style={styles.checkoutItem}>
              <Text style={styles.checkoutItemName}>{item.name}</Text>
              <Text style={styles.checkoutItemDetails}>{item.quantity} шт. • {item.article}</Text>
            </View>
          ))}
          <View style={styles.estimatedTotalBlock}>
            <Text style={styles.estimatedTotalLabel}>Примерная сумма:</Text>
            <Text style={styles.estimatedTotalValue}>≈ {totalEstimated.toLocaleString('ru-RU')} ₽</Text>
          </View>
          <Text style={styles.checkoutHelperText}>
            * Цены в каталоге — ориентировочные. Точную сумму рассчитает менеджер.
          </Text>
        </View>

        {/* Контакты */}
        <View style={styles.checkoutSection}>
          <Text style={styles.checkoutSectionTitle}>Контакты для связи</Text>

          <Text style={styles.inputLabel}>Имя *</Text>
          <TextInput
            style={[styles.checkoutInput, errors.name && styles.inputError]}
            placeholder="Иван"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#666"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

          <Text style={styles.inputLabel}>Телефон *</Text>
          <TextInput
            style={[styles.checkoutInput, errors.phone && styles.inputError]}
            placeholder="+7..."
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor="#666"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          <Text style={styles.inputLabel}>Предпочтительная ТК *</Text>
          <View style={styles.tcList}>
            {transportCompanies.map((tc) => (
              <TouchableOpacity
                key={tc.id}
                style={[styles.tcOption, selectedTC === tc.id && styles.tcOptionSelected]}
                onPress={() => setSelectedTC(tc.id)}
              >
                <View style={styles.tcRadio}>
                  {selectedTC === tc.id && <View style={styles.tcRadioDot} />}
                </View>
                <View style={styles.tcInfo}>
                  <Text style={[styles.tcName, selectedTC === tc.id && styles.tcNameSelected]}>
                    {tc.name}
                  </Text>
                  {tc.city && <Text style={styles.tcCity}>{tc.city}</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {errors.tc && <Text style={styles.errorText}>{errors.tc}</Text>}

          <Text style={styles.inputLabel}>Адрес доставки (для расчета)</Text>
          <TextInput
            style={styles.checkoutInput}
            placeholder="Город, улица"
            value={address}
            onChangeText={setAddress}
            multiline
            placeholderTextColor="#666"
          />

          <Text style={styles.inputLabel}>Комментарий к заявке</Text>
          <TextInput
            style={styles.checkoutInput}
            placeholder="Срочность, пожелания..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            placeholderTextColor="#666"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Отправка...' : 'Отправить заявку менеджеру'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}