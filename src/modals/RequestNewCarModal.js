import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import { styles } from '../styles';

// Модальное окно запроса на добавление нового авто в каталог
export default function RequestNewCarModal({ visible, onClose, onSubmit, profile }) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!make.trim() || !model.trim()) {
      Alert.alert('Ошибка', 'Укажите марку и модель');
      return;
    }
    if (submitting) return;
    setSubmitting(true);

    onSubmit({
      make: make.trim(),
      model: model.trim(),
      year: year.trim(),
      comment: comment.trim(),
      customerName: profile.name,
      customerPhone: profile.phone,
    });

    // Очистка полей
    setMake('');
    setModel('');
    setYear('');
    setComment('');
    setSubmitting(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Запрос нового авто</Text>
          <Text style={styles.modalSubtitle}>
            Мы добавим ваш автомобиль в общий каталог
          </Text>

          <Text style={styles.modalLabel}>Марка *</Text>
          <TextInput
            style={styles.modalInput}
            value={make}
            onChangeText={setMake}
            placeholder="Tank"
            placeholderTextColor="#666"
            autoCapitalize="characters"
          />

          <Text style={styles.modalLabel}>Модель *</Text>
          <TextInput
            style={styles.modalInput}
            value={model}
            onChangeText={setModel}
            placeholder="300"
            placeholderTextColor="#666"
            autoCapitalize="characters"
          />

          <Text style={styles.modalLabel}>Год выпуска</Text>
          <TextInput
            style={styles.modalInput}
            value={year}
            onChangeText={setYear}
            placeholder="2023"
            keyboardType="number-pad"
            placeholderTextColor="#666"
          />

          <Text style={styles.modalLabel}>Комментарий</Text>
          <TextInput
            style={styles.modalInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Особенности комплектации..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={2}
          />

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