import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

// Экран успеха после отправки заявки
export default function OrderSuccessScreen({ onGoHome }) {
  return (
    <View style={styles.successContainer}>
      <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
      <Text style={styles.successTitle}>Заявка отправлена!</Text>
      <Text style={styles.successText}>
        Менеджер свяжется с вами в течение 24 часов.
      </Text>
      <TouchableOpacity style={styles.successButton} onPress={onGoHome}>
        <Text style={styles.successButtonText}>На главную</Text>
      </TouchableOpacity>
    </View>
  );
}