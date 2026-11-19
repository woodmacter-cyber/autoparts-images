import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, ImageBackground } from 'react-native';

import { styles } from './src/styles';
import { fetchProducts } from './src/api/fetchProducts';
import { fetchCarBrands } from './src/api/fetchCarBrands';
import { fetchCarCatalog } from './src/api/fetchCarCatalog';
import { storage } from './src/utils/storage';

import HomeScreen from './src/screens/HomeScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderSuccessScreen from './src/screens/OrderSuccessScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import AddCarModal from './src/modals/AddCarModal';
import EditCarModal from './src/modals/EditCarModal';
import ConfirmModal from './src/modals/ConfirmModal';
import ProductDetailModal from './src/modals/ProductDetailModal';
import RequestPartModal from './src/modals/RequestPartModal';
import RequestNewCarModal from './src/modals/RequestNewCarModal';

import ToastNotification from './src/components/ToastNotification';
import TabButton from './src/components/TabButton';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [garageCars, setGarageCars] = useState([]);
  const [cart, setCart] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [carCatalog, setCarCatalog] = useState([]);
  const [transportCompanies, setTransportCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [highlightProductId, setHighlightProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [showEditCarModal, setShowEditCarModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRequestPartModal, setShowRequestPartModal] = useState(false);
  const [showRequestNewCarModal, setShowRequestNewCarModal] = useState(false);

  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const showToast = useCallback((message, type = 'info') => {
    setToast({ visible: true, message, type });
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileData, garageData, cartData] = await Promise.all([
          storage.loadProfile(),
          storage.loadCars(),
          storage.loadCart(),
        ]);
        if (profileData) setProfile(profileData);
        if (garageData) setGarageCars(garageData);
        if (cartData) setCart(cartData);

        const [productsRes, brandsRes, catalogRes] = await Promise.all([
          fetchProducts(),
          fetchCarBrands(),
          fetchCarCatalog(),
        ]);
        
        if (productsRes.success) {
          setAllProducts(productsRes.data);
          console.log('✅ Товары загружены:', productsRes.data.length);
        } else {
          console.log('❌ Товары НЕ загружены');
        }
        
        if (catalogRes.success) {
          setCarCatalog(catalogRes.data);
          console.log('✅ КАТАЛОГ АВТО ЗАГРУЖЕН, строк:', catalogRes.data.length);
          if (catalogRes.data.length > 0) {
            console.log('📋 Примеры:', catalogRes.data.slice(0, 3));
          }
        } else {
          console.log('❌ КАТАЛОГ АВТО НЕ ЗАГРУЖЕН');
        }
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => { storage.saveProfile(profile); }, [profile]);
  useEffect(() => { storage.saveCars(garageCars); }, [garageCars]);
  useEffect(() => { storage.saveCart(cart); }, [cart]);

  const onAddToRequest = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const onRemoveFromRequest = useCallback((productId) => {
    setCart(prev => {
      const item = prev.find(i => i.id === productId);
      if (item && item.quantity > 1) {
        return prev.map(i => i.id === productId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== productId);
    });
  }, []);

  const onClearCart = useCallback(() => setCart([]), []);
  const onAddCar = useCallback((car) => {
    setGarageCars(prev => [...prev, { ...car, id: Date.now() }]);
    setShowAddCarModal(false);
    showToast('Автомобиль добавлен', 'success');
  }, [showToast]);

  const onEditCar = useCallback((car) => {
    setEditingCar(car);
    setShowEditCarModal(true);
  }, []);

  const onSaveEditedCar = useCallback((updatedCar) => {
    setGarageCars(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));
    setShowEditCarModal(false);
    setEditingCar(null);
    showToast('Автомобиль обновлен', 'success');
  }, [showToast]);

  const onDeleteCar = useCallback((carId) => {
    setConfirmAction(() => () => {
      setGarageCars(prev => prev.filter(c => c.id !== carId));
      showToast('Автомобиль удален', 'info');
    });
    setShowConfirmModal(true);
  }, [showToast]);

  const onUpdateProfile = useCallback((newProfile) => setProfile(newProfile), []);
  const onCategoryPress = useCallback((categoryName, productId = null) => {
    setSelectedCategory(categoryName);
    setHighlightProductId(productId);
    setActiveTab('catalog');
  }, []);

  const onBackToHome = useCallback(() => {
    setSelectedCategory(null);
    setHighlightProductId(null);
    setActiveTab('home');
  }, []);

  const onViewProduct = useCallback((product) => {
    setSelectedProduct(product);
    setShowProductDetail(true);
  }, []);

  const onCheckout = useCallback(() => setActiveTab('checkout'), []);
  
  const onSubmitOrder = useCallback(async (orderData) => {
    try {
      console.log('Отправка заявки:', orderData);
      setCart([]);
      setActiveTab('success');
      showToast('Заявка отправлена', 'success');
    } catch (error) {
      showToast('Ошибка отправки', 'error');
    }
  }, [showToast]);

  const onGoHome = useCallback(() => setActiveTab('home'), []);
  const onRequestPart = useCallback(() => setShowRequestPartModal(true), []);
  const onRequestNewCar = useCallback(() => setShowRequestNewCarModal(true), []);

  if (loading) {
    return (
      <ImageBackground source={require('./assets/tank.jpg')} style={styles.background} resizeMode="cover">
        <View style={[styles.overlay, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={{ color: 'white', marginTop: 10 }}>Загрузка...</Text>
        </View>
      </ImageBackground>
    );
  }

  const renderScreen = () => {
    if (!activeTab) return <Text style={{color: 'white'}}>Ошибка навигации</Text>;

    switch (activeTab) {
      case 'home':
        return <HomeScreen onCategoryPress={onCategoryPress} onViewProduct={onViewProduct} searchQuery={searchQuery} onSearchChange={setSearchQuery} garageCars={garageCars} allProducts={allProducts} onRequestPart={onRequestPart} />;
      case 'catalog':
        return <CatalogScreen categoryName={selectedCategory} onBack={onBackToHome} cart={cart} onAddToRequest={onAddToRequest} onRemoveFromRequest={onRemoveFromRequest} highlightProductId={highlightProductId} garageCars={garageCars} onViewProduct={onViewProduct} onShowToast={showToast} allProducts={allProducts} onRequestPart={onRequestPart} />;
      case 'cart':
        return <CartScreen cart={cart} onRemove={onRemoveFromRequest} onClear={onClearCart} onCheckout={onCheckout} onShowToast={showToast} onBack={onBackToHome} onRequestPart={onRequestPart} />;
      case 'checkout':
        return <CheckoutScreen cart={cart} onBack={() => setActiveTab('cart')} onSubmitOrder={onSubmitOrder} defaultName={profile.name} defaultPhone={profile.phone} onShowToast={showToast} transportCompanies={transportCompanies} refreshTC={() => {}} garageCars={garageCars} />;
      case 'success':
        return <OrderSuccessScreen onGoHome={onGoHome} />;
      case 'profile':
        return <ProfileScreen profile={profile} onUpdateProfile={onUpdateProfile} garageCars={garageCars} onAddCar={() => setShowAddCarModal(true)} onEditCar={onEditCar} onDeleteCar={onDeleteCar} onRequestPart={onRequestPart} onRequestNewCar={onRequestNewCar} onShowToast={showToast} />;
      default:
        return <Text style={{color: 'white'}}>Неизвестный экран: {activeTab}</Text>;
    }
  };

  return (
    <ImageBackground source={require('./assets/tank.jpg')} style={styles.background} resizeMode="cover">
      <View style={[styles.overlay, { flex: 1 }]}>
        <View style={[styles.container, { flex: 1 }]}>
          <StatusBar style="light" />
          
          <View style={[styles.content, { flex: 1 }]}>
            {renderScreen()}
          </View>

          {activeTab !== 'checkout' && activeTab !== 'success' && (
            <View style={styles.tabBar}>
              <TabButton label="Главная" iconName="home-outline" isActive={activeTab === 'home'} onPress={() => setActiveTab('home')} badge={0} />
              <TabButton label="Запрос" iconName="list-outline" isActive={activeTab === 'cart'} onPress={() => setActiveTab('cart')} badge={cart.reduce((sum, item) => sum + item.quantity, 0)} />
              <TabButton label="Профиль" iconName="person-outline" isActive={activeTab === 'profile'} onPress={() => setActiveTab('profile')} badge={0} />
            </View>
          )}

          <AddCarModal 
            visible={showAddCarModal} 
            onClose={() => setShowAddCarModal(false)} 
            onSave={onAddCar} 
            carCatalog={carCatalog} 
            onRequestNewCar={onRequestNewCar} 
          />
          <EditCarModal visible={showEditCarModal} onClose={() => { setShowEditCarModal(false); setEditingCar(null); }} onSave={onSaveEditedCar} car={editingCar} />
          <ConfirmModal visible={showConfirmModal} title="Вы уверены?" message="Это действие нельзя отменить" onCancel={() => setShowConfirmModal(false)} onConfirm={() => { if (confirmAction) confirmAction(); setShowConfirmModal(false); }} />
          <ProductDetailModal visible={showProductDetail} product={selectedProduct} onClose={() => setShowProductDetail(false)} onAddToRequest={onAddToRequest} quantity={cart.find(item => item.id === selectedProduct?.id)?.quantity || 0} />
          <RequestPartModal visible={showRequestPartModal} onClose={() => setShowRequestPartModal(false)} onSubmit={(data) => { console.log('Запрос запчасти:', data); setShowRequestPartModal(false); showToast('Запрос отправлен', 'success'); }} garageCars={garageCars} profile={profile} />
          <RequestNewCarModal visible={showRequestNewCarModal} onClose={() => setShowRequestNewCarModal(false)} onSubmit={(data) => { console.log('Запрос нового авто:', data); setShowRequestNewCarModal(false); showToast('Запрос отправлен', 'success'); }} profile={profile} />

          <ToastNotification message={toast.message} type={toast.type} visible={toast.visible} onHide={() => setToast({ ...toast, visible: false })} />
        </View>
      </View>
    </ImageBackground>
  );
}