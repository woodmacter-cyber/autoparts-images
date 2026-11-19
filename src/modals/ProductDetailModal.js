import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SmartImage from '../components/SmartImage';
import { styles } from '../styles';
import { safeNum } from '../helpers/safeNum';

// Модальное окно с детальной карточкой товара
export default function ProductDetailModal({ visible, product, onClose, onAddToRequest, quantity = 0 }) {
  if (!visible || !product) return null;

  const isUniversal = !product.year || String(product.year).trim().toUpperCase() === 'ALL';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.detailModalOverlay}>
        <View style={styles.detailModalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={32} color="#FFF" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.detailImageContainer}>
              <SmartImage source={product.image} fallback={product.fallback} size={200} />
            </View>

            <View style={styles.detailInfoContainer}>
              <Text style={styles.detailName}>{product.name}</Text>
              <Text style={styles.detailCar}>
                {product.make} {product.model} {isUniversal ? '(Все годы)' : `(${product.year})`}
              </Text>

              <View style={styles.detailArticleBadge}>
                <Text style={styles.detailArticleText}>Арт: {product.article}</Text>
              </View>

              <Text style={styles.detailPrice}>
                ≈ {safeNum(product.price).toLocaleString('ru-RU')} ₽
              </Text>
              <Text style={styles.priceDisclaimer}>* Примерная цена, точную рассчитает менеджер</Text>

              {product.description ? (
                <>
                  <Text style={styles.detailDescTitle}>Описание</Text>
                  <Text style={styles.detailDescText}>{product.description}</Text>
                </>
              ) : null}

              <View style={styles.detailButtonsRow}>
                {quantity > 0 ? (
                  <View style={[styles.detailMainButton, { backgroundColor: '#4CAF50' }]}>
                    <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                    <Text style={styles.detailMainButtonText}>В запросе ({quantity} шт.)</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.detailMainButton}
                    onPress={() => {
                      onAddToRequest(product);
                      onClose();
                    }}
                  >
                    <Ionicons name="add-circle" size={20} color="#FFF" />
                    <Text style={styles.detailMainButtonText}>Добавить в запрос</Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.detailHelperText}>Нажмите, чтобы добавить в лист запроса</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}