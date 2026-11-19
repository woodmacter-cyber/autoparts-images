import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SmartImage from '../components/SmartImage';
import { styles } from '../styles';
import { safeNum } from '../helpers/safeNum';

// Экран списка товаров в категории
export default function CatalogScreen({
  categoryName,
  onBack,
  cart,
  onAddToRequest,
  onRemoveFromRequest,
  highlightProductId,
  garageCars,
  onViewProduct,
  onShowToast,
  allProducts,
  onRequestPart,
}) {
  const products = useMemo(() => {
    const catProducts = allProducts.filter(p =>
      String(p.category).toLowerCase().trim() === categoryName.toLowerCase().trim()
    );
    return catProducts.filter(p => {
      if (garageCars.length === 0) return false;
      return garageCars.some(gc => productMatchesCar(p, gc));
    });
  }, [categoryName, garageCars, allProducts]);

  const getQuantity = (productId) => cart.find((i) => i.id === productId)?.quantity || 0;

  const renderItem = ({ item: product }) => {
    const quantity = getQuantity(product.id);
    const isHighlighted = highlightProductId === product.id;
    const isUniversal = !product.year || String(product.year).trim().toUpperCase() === 'ALL';

    return (
      <View style={[styles.productCard, isHighlighted && styles.productCardHighlighted]}>
        <TouchableOpacity
          onPress={() => onViewProduct(product)}
          style={styles.productImageWrapper}
        >
          <SmartImage source={product.image} fallback={product.fallback} size={80} />
        </TouchableOpacity>
        <View style={styles.productRightSide}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCar}>
              {product.make} {product.model} {isUniversal ? '' : `(${product.year})`}
            </Text>
            {isUniversal && (
              <View style={styles.universalBadgeSmall}>
                <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                <Text style={styles.universalBadgeSmallText}>Все годы</Text>
              </View>
            )}
            <View style={styles.articleBadge}>
              <Text style={styles.articleText}>Арт: {product.article}</Text>
            </View>
          </View>
          <View style={styles.productAction}>
            <Text style={styles.productPrice}>
              ≈ {safeNum(product.price).toLocaleString('ru-RU')} ₽
            </Text>
            {quantity > 0 ? (
              <View style={styles.counter}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => onRemoveFromRequest(product.id)}
                >
                  <Ionicons name="remove" size={16} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => {
                    onAddToRequest(product);
                    onShowToast('Добавлено в запрос', 'success');
                  }}
                >
                  <Ionicons name="add" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  onAddToRequest(product);
                  onShowToast('Добавлено в запрос', 'success');
                }}
              >
                <Ionicons name="add-circle" size={16} color="#FFF" />
                <Text style={styles.addButtonText}>В запрос</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.catalogHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
          <Text style={styles.backText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.catalogTitle} numberOfLines={1} adjustsFontSizeToFit>
          {categoryName}
        </Text>
      </View>
      {products.length > 0 ? (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="construct" size={64} color="#555" />
          <Text style={styles.emptyText}>Нет товаров для ваших авто</Text>
          <Text style={styles.emptySubText}>
            В категории «{categoryName}» пока нет запчастей под ваш автомобиль
          </Text>
          <TouchableOpacity style={styles.emptyStateButton} onPress={onRequestPart}>
            <Ionicons name="document-text" size={20} color="#FFF" />
            <Text style={styles.emptyStateButtonText}>Запросить запчасть</Text>
          </TouchableOpacity>
          <Text style={styles.emptyStateHint}>Менеджер подберёт деталь из Китая</Text>
        </View>
      )}
    </View>
  );
}

// Временная заглушка — будет заменена на импорт из helpers
function productMatchesCar(product, car) {
  if (!product || !car) return false;
  const gcMake = String(car.make || '').toLowerCase().trim();
  const pMake = String(product.make || '').toLowerCase().trim();
  const gcModel = String(car.model || '').toLowerCase().trim();
  const pModel = String(product.model || '').toLowerCase().trim();
  if (gcMake !== pMake || gcModel !== pModel) return false;
  if (!product.year || String(product.year).trim().toUpperCase() === 'ALL') return true;
  const garageY = parseInt(String(car.year).trim(), 10);
  const str = String(product.year || '').trim();
  if (!str || str.toUpperCase() === 'ALL') return true;
  const rangeMatch = str.match(/(\d{4})\s*[-–—]\s*(\d{4})/);
  if (rangeMatch) {
    const start = parseInt(rangeMatch[1], 10);
    const end = parseInt(rangeMatch[2], 10);
    return garageY >= start && garageY <= end;
  }
  const singleMatch = str.match(/(\d{4})/);
  if (singleMatch) {
    const productY = parseInt(singleMatch[1], 10);
    return Math.abs(garageY - productY) <= 2;
  }
  return false;
}