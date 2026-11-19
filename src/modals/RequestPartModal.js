import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

// Модальное окно запроса запчасти (если нет в каталоге)
export default function RequestPartModal({
  visible,
  onClose,
  onSubmit,
  garageCars,
  profile,
}) {
  const [selectedCarId, setSelectedCarId] = useState(garageCars.length > 0 ? garageCars[0].id : null);
  const [partName, setPartName] = useState('');
  const [vin, setVin] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedCar = garageCars.find(c => c.id === selectedCarId);

  const handleSubmit = () => {
    if (!partName.trim()) {
      Alert.alert('Ошибка', 'Укажите название запчасти');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    
    onSubmit({
      car: selectedCar,
      partName: partName.trim(),
      vin: vin.trim().toUpperCase(),
      comment: comment.trim(),
      customerName: profile.name,
      customerPhone: profile.phone,
    });
    
    // Очистка полей после отправки
    setPartName('');
    setVin('');
    setComment('');
    setSubmitting(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Запрос запчасти</Text>
          <Text style={styles.modalSubtitle}>
            Менеджер подберёт деталь из Китая и пришлёт расчёт
          </Text>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {garageCars.length > 0 ? (
              <>
                <Text style={styles.modalLabel}>Автомобиль</Text>
                {garageCars.map((car) => (
                  <TouchableOpacity
                    key={car.id}
                    style={[
                      styles.tcOption,
                      selectedCarId === car.id && styles.tcOptionSelected
                    ]}
                    onPress={() => setSelectedCarId(car.id)}
                  >
                    <View style={styles.tcRadio}>
                      {selectedCarId === car.id && <View style={styles.tcRadioDot} />}
                    </View>
                    <View style={styles.tcInfo}>
                      <Text style={[styles.tcName, selectedCarId === car.id && styles.tcNameSelected]}>
                        {car.make} {car.model}
                      </Text>
                      <Text style={styles.tcCity}>{car.year}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View style={styles.emptyGarageRequest}>
                <Ionicons name="car-outline" size={40} color="#888" />
                <Text style={styles.emptyGarageRequestTitle}>Нет авто в гараже</Text>
                <Text style={styles.emptyGarageRequestText}>Добавьте авто в профиле для точного подбора</Text>
              </View>
            )}

            <Text style={styles.modalLabel}>Название запчасти *</Text>
            <TextInput
              style={styles.modalInput}
              value={partName}
              onChangeText={setPartName}
              placeholder="Тормозные колодки, бампер..."
              placeholderTextColor="#666"
              multiline
            />

            <Text style={styles.modalLabel}>VIN (если есть)</Text>
            <TextInput
              style={styles.modalInput}
              value={vin}
              onChangeText={setVin}
              placeholder="XTA..."
              placeholderTextColor="#666"
              autoCapitalize="characters"
            />

            <Text style={styles.modalLabel}>Комментарий</Text>
            <TextInput
              style={styles.modalInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Срочность, цвет, особенности..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
            />
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButtonCancel} onPress={onClose}>
              <Text style={styles.modalButtonCancelText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButtonConfirm, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.modalButtonConfirmText}>
                {submitting ? 'Отправка...' : 'Отправить запрос'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}