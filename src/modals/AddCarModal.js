import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { styles } from '../styles';

// Модальное окно добавления автомобиля в гараж
export default function AddCarModal({ visible, onClose, onSave }) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [vin, setVin] = useState('');

  const handleSave = () => {
    if (!make.trim() || !model.trim() || !year.trim()) return;
    onSave({
      make: make.trim(),
      model: model.trim(),
      year: year.trim(),
      vin: vin.trim().toUpperCase(),
    });
    // Очищаем поля после сохранения
    setMake('');
    setModel('');
    setYear('');
    setVin('');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        {/* Клик по фону закрывает окно */}
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Добавить автомобиль</Text>

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
              <Text style={styles.modalButtonConfirmText}>Добавить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}