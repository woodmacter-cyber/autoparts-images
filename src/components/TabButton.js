import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

// Кнопка нижней вкладки с иконкой, подписью и бейджем счётчика
export default function TabButton({ label, iconName, isActive, onPress, badge }) {
  return (
    <TouchableOpacity
      style={styles.tabButton}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 25, bottom: 25, left: 20, right: 20 }}
    >
      <View style={styles.tabIconWrapper}>
        <Ionicons name={iconName} size={26} color={isActive ? '#FF6B00' : '#FFFFFF'} />
        {badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}