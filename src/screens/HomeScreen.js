import React, { useMemo } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categories } from '../data/categories';
import SmartImage from '../components/SmartImage';
import { styles } from '../styles';
import { safeNum } from '../helpers/safeNum';

// Главный экран: логотип, гараж, поиск, сетка категорий
export default function HomeScreen({
  onCategoryPress,
  onViewProduct,
  searchQuery,
  onSearchChange,
  garageCars,
  allProducts,
  onRequestPart,
}) {
  const filteredCategories = useMemo(() => {
    return categories.map(cat => {
      const catProducts = allProducts.filter(p =>
        String(p.category).toLowerCase().trim() === cat.name.toLowerCase().trim()
      );
      const filtered = catProducts.filter(p => {
        if (garageCars.length === 0) return false;
        return garageCars.some(gc => productMatchesCar(p, gc));
      });
      return { ...cat, filteredCount: filtered.length, hasProducts: filtered.length > 0 };
    });
  }, [garageCars, allProducts]);

  const searchResults = useMemo(() => {
    const q = String(searchQuery || '').toLowerCase().trim();
    if (!q) return [];
    if (garageCars.length === 0) return [];
    return allProducts.filter(product => {
      const matchesGarage = garageCars.some(gc => productMatchesCar(product, gc));
      if (!matchesGarage) return false;
      return (
        String(product.article).toLowerCase().includes(q) ||
        String(product.name).toLowerCase().includes(q) ||
        String(product.make).toLowerCase().includes(q) ||
        String(product.model).toLowerCase().includes(q)
      );
    }).map(p => ({ ...p, categoryName: p.category }));
  }, [searchQuery, allProducts, garageCars]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.logo}>AUTOPARTS</Text>
      </View>

      {garageCars.length === 0 && (
        <View style={styles.emptyGarageBanner}>
          <Ionicons name="car-outline" size={48} color="#FF6B00" />
          <Text style={styles.emptyGarageTitle}>Добавьте ваш автомобиль</Text>
          <Text style={styles.emptyGarageText}>Перейдите в профиль и добавьте авто</Text>
        </View>
      )}

      {garageCars.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.garageStrip}>
          {garageCars.map((car) => (
            <View key={car.id} style={styles.garageChip}>
              <Ionicons name="car-sport" size={16} color="#FF6B00" />
              <Text style={styles.garageChipText}>{car.make} {car.model} ({car.year})</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {searchQuery.trim().length > 0 && (
        <View style={styles.searchResultsWrapper}>
          <Text style={styles.searchResultsTitle}>
            {searchResults.length > 0
              ? `Найдено: ${searchResults.length}`
              : garageCars.length === 0
              ? 'Добавьте авто в гараж'
              : 'Ничего не найдено'}
          </Text>

          {searchResults.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.searchResultCard}
              onPress={() => onCategoryPress(product.categoryName, product.id)}
            >
              <TouchableOpacity
                onPress={() => onViewProduct(product)}
                style={styles.searchResultImageWrapper}
              >
                <SmartImage source={product.image} fallback={product.fallback} size={60} />
              </TouchableOpacity>
              <View style={styles.searchResultInfo}>
                <Text style={styles.searchResultName}>{product.name}</Text>
                <Text style={styles.searchResultCar}>{product.make} {product.model}</Text>
                <Text style={styles.searchResultArticle}>Арт: {product.article}</Text>
              </View>
              <Text style={styles.searchResultPrice}>
                ≈ {safeNum(product.price).toLocaleString('ru-RU')} ₽
              </Text>
            </TouchableOpacity>
          ))}

          {searchResults.length === 0 && garageCars.length > 0 && (
            <View style={styles.noResultsHint}>
              <Ionicons name="help-circle" size={40} color="#FF6B00" />
              <Text style={styles.noResultsHintTitle}>Не нашли нужную запчасть?</Text>
              <Text style={styles.noResultsHintText}>
                Оставьте запрос — менеджер подберёт деталь из Китая.
              </Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={onRequestPart}>
                <Ionicons name="document-text" size={20} color="#FFF" />
                <Text style={styles.emptyStateButtonText}>Запросить запчасть</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {searchQuery.trim().length === 0 && (
        <>
          <View style={styles.gridWrapper}>
            <View style={styles.grid}>
              {filteredCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.card}
                  activeOpacity={0.7}
                  onPress={() => onCategoryPress(cat.name)}
                >
                  <Image source={cat.icon} style={styles.cardImage} resizeMode="contain" />
                  <Text style={styles.cardName} numberOfLines={1} adjustsFontSizeToFit>
                    {cat.name}
                  </Text>
                  <Text style={styles.cardCount}>{cat.filteredCount}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={{ height: 40 }} />
        </>
      )}
    </ScrollView>
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