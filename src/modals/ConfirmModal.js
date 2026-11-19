import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

// Универсальное окно подтверждения действий
export default function ConfirmModal({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  confirmColor = '#FF4444',
}) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.confirmOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onCancel} />
        
        <View style={styles.confirmBox}>
          <Ionicons name="alert-circle" size={48} color={confirmColor} />
          <Text style={styles.confirmTitle}>{title}</Text>
          {message && <Text style={styles.confirmSubtitle}>{message}</Text>}
          
          <View style={styles.confirmButtons}>
            <TouchableOpacity style={styles.confirmCancelBtn} onPress={onCancel}>
              <Text style={styles.confirmCancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmOkBtn, { backgroundColor: confirmColor }]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmOkText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}