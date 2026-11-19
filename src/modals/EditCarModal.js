import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { styles } from '../styles';

// Модальное окно редактирования автомобиля
export default function EditCarModal({ visible, onClose, onSave, car }) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [vin, setVin] = useState('');

  // Заполняем поля при открытии окна
  useEffect(() => {
    if (car) {
      setMake(car.make || '');
      setModel(car.model || '');
      setYear(car.year || '');
      setVin(car.vin || '');
    }
  }, [car, visible]);

  const handleSave = () => {
    if (!make.trim() || !model.trim() || !year.trim()) return;
    onSave({
      ...car,
      make: make.trim(),
      model: model.trim(),
      year: year.trim(),
      vin: vin.trim().toUpperCase(),
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Редактировать авто</Text>

          <Text style={styles.modalLabel}>Марка *</Text>
          <TextInput
            style={styles.modalInput}
            value={make}
            onChangeText={setMake}
            placeholder="Toyota"
            placeholderTextColor="#666"
            autoCapitalize="characters"
          />

          <Text style={styles.modalLabel}>Модель *</Text>
          <TextInput
            style={styles.modalInput}
            value={model}
            onChangeText={setModel}
            placeholder="Camry"
            placeholderTextColor="#666"
            autoCapitalize="characters"
          />

          <Text style={styles.modalLabel}>Год выпуска *</Text>
          <TextInput
            style={styles.modalInput}
            value={year}
            onChangeText={setYear}
            placeholder="2021"
            keyboardType="number-pad"
            placeholderTextColor="#666"
          />

          <Text style={styles.modalLabel}>VIN (необязательно)</Text>
          <TextInput
            style={styles.modalInput}
            value={vin}
            onChangeText={setVin}
            placeholder="XTA..."
            placeholderTextColor="#666"
            autoCapitalize="characters"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButtonCancel} onPress={onClose}>
              <Text style={styles.modalButtonCancelText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonConfirm} onPress={handleSave}>
              <Text style={styles.modalButtonConfirmText}>Сохранить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}