import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal,
  ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { styles } from '../styles';

const ORANGE = '#FF6B00';
const MUTED = '#9a9a9e';

// Разрешаем только латиницу, цифры, пробел и дефис
const LATIN_ONLY = /[^a-zA-Z0-9\s-]/g;
const stripCyrillic = (text) => String(text || '').replace(LATIN_ONLY, '');

// Модальное окно запроса на добавление нового авто в каталог
export default function RequestNewCarModal({
  visible,
  onClose,
  onSubmit,
  profile,
  carCatalog = [],
  initialValues = null,
}) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // Предзаполнение из AddCarModal при открытии
  useEffect(() => {
    if (visible && initialValues) {
      setMake(initialValues.make || '');
      setModel(initialValues.model || '');
      setYear(initialValues.year || '');
    }
  }, [visible, initialValues]);

  // Список всех марок из каталога
  const allMakes = useMemo(() => {
    const set = new Set(carCatalog.map(c => c.make));
    return Array.from(set).sort();
  }, [carCatalog]);

  const modelsForMake = useMemo(
    () => (make ? carCatalog.filter(c => c.make.toLowerCase() === make.toLowerCase()) : []),
    [make, carCatalog]
  );

  const filteredMakes = useMemo(() => {
    const q = make.trim().toLowerCase();
    return q ? allMakes.filter(m => m.toLowerCase().includes(q)) : allMakes;
  }, [make, allMakes]);

  const filteredModels = useMemo(() => {
    const q = model.trim().toLowerCase();
    return q ? modelsForMake.filter(c => c.model.toLowerCase().includes(q)) : modelsForMake;
  }, [model, modelsForMake]);

  const selectedEntry = modelsForMake.find(c => c.model.toLowerCase() === model.toLowerCase());
  const isValidYear = year === '' || /^\d{4}$/.test(year);

  const handleSelectMake = (m) => {
    setMake(m); setModel(''); setError('');
    setShowMakeDropdown(false); setShowModelDropdown(true);
  };
  const handleSelectModel = (m) => { setModel(m); setError(''); setShowModelDropdown(false); };

  const resetFields = () => {
    setMake('');
    setModel('');
    setYear('');
    setComment('');
    setShowMakeDropdown(false);
    setShowModelDropdown(false);
    setError('');
  };

  const handleSubmit = () => {
    setError('');
    if (!make.trim() || !model.trim()) {
      setError('Укажите марку и модель');
      return;
    }
    if (!isValidYear) {
      setError('Год должен быть из 4 цифр');
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

    resetFields();
    setSubmitting(false);
  };

  const closeAll = () => {
    resetFields();
    onClose();
  };

  const renderDropdown = (items, onSelect) => (
    <ScrollView
      style={s.dropdown}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
    >
      {items.map((item, i) => (
        <TouchableOpacity
          key={String(item.label || item) + i}
          style={s.dropItem}
          onPress={() => onSelect(item.value ?? item)}
          activeOpacity={0.6}
        >
          <Text style={s.dropText}>{item.label ?? item}</Text>
          {item.hint ? <Text style={s.dropHint}>{item.hint}</Text> : null}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={closeAll}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeAll} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              <Text style={styles.modalTitle}>Запрос нового авто</Text>
              <Text style={styles.modalSubtitle}>
                Мы добавим ваш автомобиль в общий каталог
              </Text>

              {/* МАРКА */}
              <Text style={styles.modalLabel}>Марка *</Text>
              <TextInput
                style={styles.modalInput}
                value={make}
                onChangeText={(t) => {
                  setMake(stripCyrillic(t));
                  setShowMakeDropdown(true);
                  setShowModelDropdown(false);
                  setError('');
                }}
                onFocus={() => setShowMakeDropdown(true)}
                placeholder="Tank"
                placeholderTextColor="#666"
                autoCapitalize="characters"
              />
              {showMakeDropdown && filteredMakes.length > 0 &&
                renderDropdown(filteredMakes, handleSelectMake)}

              {/* МОДЕЛЬ */}
              <Text style={styles.modalLabel}>Модель *</Text>
              <TextInput
                style={styles.modalInput}
                value={model}
                editable={!!make}
                onChangeText={(t) => {
                  setModel(stripCyrillic(t));
                  setShowModelDropdown(true);
                  setError('');
                }}
                onFocus={() => make && setShowModelDropdown(true)}
                placeholder="300"
                placeholderTextColor="#666"
                autoCapitalize="characters"
              />
              {showModelDropdown && make && filteredModels.length > 0 &&
                renderDropdown(
                  filteredModels.map(c => ({ value: c.model, label: c.model, hint: `${c.yearFrom}–${c.yearTo}` })),
                  handleSelectModel
                )}

              {selectedEntry ? (
                <Text style={s.hint}>Годы выпуска модели: {selectedEntry.yearFrom}–{selectedEntry.yearTo}</Text>
              ) : null}

              {/* ГОД */}
              <Text style={styles.modalLabel}>Год выпуска</Text>
              <TextInput
                style={[styles.modalInput, year.length > 0 && !isValidYear && s.inputError]}
                value={year}
                onChangeText={(t) => setYear(t.replace(/\D/g, '').slice(0, 4))}
                placeholder="2023"
                keyboardType="number-pad"
                maxLength={4}
                placeholderTextColor="#666"
              />

              {/* КОММЕНТАРИЙ */}
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

              {error ? <Text style={s.errorText}>{error}</Text> : null}

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButtonCancel} onPress={closeAll}>
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
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = {
  hint: { color: ORANGE, fontSize: 12, marginTop: 6 },
  errorText: { color: '#FF4444', fontSize: 13, marginTop: 8 },
  inputError: { borderColor: '#FF4444' },
  dropdown: {
    maxHeight: 170,
    backgroundColor: '#232325',
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: ORANGE,
  },
  dropItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  dropText: { color: '#FFF', fontSize: 15 },
  dropHint: { color: MUTED, fontSize: 12, marginTop: 2 },
};