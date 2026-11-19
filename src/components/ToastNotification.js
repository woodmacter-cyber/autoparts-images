import React, { useState, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

// Всплывающее уведомление внизу экрана
// type: 'success' | 'error' | 'info' | 'warning'
// visible: true/false
// onHide: функция, вызываемая после исчезновения
export default function ToastNotification({ message, type, visible, onHide }) {
  const translateY = useState(new Animated.Value(100))[0];
  const opacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: 100, duration: 300, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => onHide());
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return { name: 'checkmark-circle', color: '#4CAF50' };
      case 'error': return { name: 'close-circle', color: '#FF4444' };
      case 'info': return { name: 'information-circle', color: '#2196F3' };
      default: return { name: 'information-circle', color: '#FF6B00' };
    }
  };

  const icon = getIcon();

  return (
    <Animated.View style={[styles.toastContainer, { transform: [{ translateY }], opacity }]}>
      <View style={styles.toastContent}>
        <Ionicons name={icon.name} size={28} color={icon.color} />
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </Animated.View>
  );
}