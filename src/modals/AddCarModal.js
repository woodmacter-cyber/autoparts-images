import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal,
  ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';

const ORANGE = '#FF6B00';
const BG = '#1c1c1e';
const FIELD = '#2a2a2c';
const BORDER = '#3a3a3c';
const TEXT = '#ffffff';
const MUTED = '#9a9a9e';

// Разрешаем только латиницу, цифры, пробел и дефис
const LATIN_ONLY = /[^a-zA-Z0-9\s-]/g;
const stripCyrillic = (text) => String(text || '').replace(LATIN_ONLY, '');

export default function AddCarModal({
  visible,
  onClose,
  onSave,
  carCatalog = [],
  garageCars = [],
  onRequestNewCar,
}) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [vin, setVin] = useState('');
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [error, setError] = useState('');

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
  const isValidYear = /^\d{4}$/.test(year.trim());

  const handleSelectMake = (m) => {
    setMake(m); setModel(''); setError('');
    setShowMakeDropdown(false); setShowModelDropdown(true);
  };
  const handleSelectModel = (m) => { setModel(m); setError(''); setShowModelDropdown(false); };

  // Проверка: есть ли машина в каталоге
  const findInCatalog = () => {
    const makeKey = make.trim().toLowerCase();
    const modelKey = model.trim().toLowerCase();
    const yearNum = parseInt(year, 10);

    const makeEntry = carCatalog.find(c => c.make.toLowerCase() === makeKey);
    if (!makeEntry) {
      return { ok: false, reason: 'make', message: `Марки «${make.trim()}» нет в каталоге.` };
    }

    const modelEntry = carCatalog.find(
      c => c.make.toLowerCase() === makeKey && c.model.toLowerCase() === modelKey
    );
    if (!modelEntry) {
      return { ok: false, reason: 'model', message: `Модели «${model.trim()}» нет в каталоге.` };
    }

    if (!Number.isNaN(yearNum) && (yearNum < modelEntry.yearFrom || yearNum > modelEntry.yearTo)) {
      return {
        ok: false,
        reason: 'year',
        message: `Модель выпускалась с ${modelEntry.yearFrom} по ${modelEntry.yearTo} год. Проверьте год.`,
      };
    }

    return { ok: true };
  };

  // Проверка: нет ли такой машины уже в гараже
  const isDuplicateInGarage = () => {
    const makeKey = make.trim().toLowerCase();
    const modelKey = model.trim().toLowerCase();
    const yearKey = year.trim();
    return garageCars.some(car =>
      String(car.make || '').toLowerCase() === makeKey &&
      String(car.model || '').toLowerCase() === modelKey &&
      String(car.year || '') === yearKey
    );
  };

  // Переход в модалку запроса с передачей данных
  const goToRequest = (payload) => {
    closeAll();
    setTimeout(() => {
      onRequestNewCar && onRequestNewCar(payload);
    }, 400);
  };

  const handleSave = () => {
    setError('');
    if (!make.trim() || !model.trim()) {
      setError('Укажите марку и модель');
      return;
    }
    if (!isValidYear) {
      setError('Год должен быть из 4 цифр');
      return;
    }

    const check = findInCatalog();
    if (!check.ok) {
      setError(check.message + ' Переходим к запросу добавления...');
      goToRequest({ make: make.trim(), model: model.trim(), year: year.trim() });
      return;
    }

    if (isDuplicateInGarage()) {
      setError(`Автомобиль ${make.trim()} ${model.trim()} (${year.trim()}) уже добавлен в гараж.`);
      return;
    }

    onSave({ make: make.trim(), model: model.trim(), year: year.trim(), vin: vin.trim().toUpperCase() });
    setMake(''); setModel(''); setYear(''); setVin(''); setError('');
    setShowMakeDropdown(false); setShowModelDropdown(false);
  };

  const closeAll = () => {
    onClose();
    setError('');
    setShowMakeDropdown(false); setShowModelDropdown(false);
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={closeAll}>
      <View style={s.overlay}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={closeAll} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={s.avoider}
        >
          <View style={s.sheet}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              <Text style={s.title}>Добавить автомобиль</Text>

              {/* МАРКА */}
              <Text style={s.label}>Марка</Text>
              <TextInput
                style={[s.input, showMakeDropdown && s.inputFocus]}
                value={make}
                onChangeText={(t) => {
                  setMake(stripCyrillic(t));
                  setShowMakeDropdown(true);
                  setShowModelDropdown(false);
                  setError('');
                }}
                onFocus={() => setShowMakeDropdown(true)}
                placeholder="Tank, Toyota, Lada..."
                placeholderTextColor={MUTED}
                autoCapitalize="characters"
              />
              {showMakeDropdown && filteredMakes.length > 0 &&
                renderDropdown(filteredMakes, handleSelectMake)}

              {/* МОДЕЛЬ */}
              <Text style={s.label}>Модель</Text>
              <TextInput
                style={[s.input, !make && s.inputDisabled, showModelDropdown && s.inputFocus]}
                value={model}
                editable={!!make}
                onChangeText={(t) => {
                  setModel(stripCyrillic(t));
                  setShowModelDropdown(true);
                  setError('');
                }}
                onFocus={() => make && setShowModelDropdown(true)}
                placeholder={make ? 'Выберите или введите модель' : 'Сначала выберите марку'}
                placeholderTextColor={MUTED}
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

              {/* ГОД + VIN */}
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>Год</Text>
                  <TextInput
                    style={[s.input, year.length > 0 && !isValidYear && s.inputError]}
                    value={year}
                    onChangeText={(t) => setYear(t.replace(/\D/g, '').slice(0, 4))}
                    placeholder="2021"
                    keyboardType="number-pad"
                    maxLength={4}
                    placeholderTextColor={MUTED}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.label}>VIN</Text>
                  <TextInput
                    style={s.input}
                    value={vin}
                    onChangeText={(t) => setVin(stripCyrillic(t))}
                    placeholder="необязательно"
                    autoCapitalize="characters"
                    maxLength={17}
                    placeholderTextColor={MUTED}
                  />
                </View>
              </View>

              {error ? <Text style={s.errorText}>{error}</Text> : null}

              {/* КНОПКИ */}
              <View style={s.actions}>
                <TouchableOpacity style={s.btnGhost} onPress={closeAll}>
                  <Text style={s.btnGhostText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.btnPrimary, (!make.trim() || !model.trim() || !isValidYear) && s.btnDisabled]}
                  onPress={handleSave}
                  disabled={!make.trim() || !model.trim() || !isValidYear}
                >
                  <Text style={s.btnPrimaryText}>Добавить</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={s.requestBtn}
                onPress={() => goToRequest({ make: make.trim(), model: model.trim(), year: year.trim() })}
              >
                <Text style={s.requestText}>Нет в списке? Запросить добавление →</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = {
  overlay: { flex: 1 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
  avoider: { flex: 1, justifyContent: 'center', paddingHorizontal: 16 },
  sheet: {
    backgroundColor: BG, borderRadius: 20,
    padding: 20, borderWidth: 1, borderColor: BORDER,
    maxHeight: '85%',
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
  },
  title: { color: TEXT, fontSize: 20, fontWeight: '700', marginBottom: 16 },
  label: { color: MUTED, fontSize: 13, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: FIELD, color: TEXT, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16,
    borderWidth: 1, borderColor: BORDER,
  },
  inputFocus: { borderColor: ORANGE },
  inputDisabled: { opacity: 0.5 },
  inputError: { borderColor: '#FF4444' },
  errorText: { color: '#FF4444', fontSize: 13, marginTop: 10, lineHeight: 18 },
  hint: { color: ORANGE, fontSize: 12, marginTop: 8 },
  row: { flexDirection: 'row', marginTop: 4 },
  dropdown: {
    maxHeight: 170,
    backgroundColor: '#232325', borderRadius: 12, marginTop: 6,
    borderWidth: 1, borderColor: ORANGE,
  },
  dropItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#333' },
  dropText: { color: TEXT, fontSize: 15 },
  dropHint: { color: MUTED, fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', marginTop: 18 },
  btnGhost: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: BORDER, alignItems: 'center', marginRight: 8 },
  btnGhostText: { color: MUTED, fontSize: 15, fontWeight: '600' },
  btnPrimary: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: ORANGE, alignItems: 'center', marginLeft: 8 },
  btnPrimaryText: { color: '#000', fontSize: 15, fontWeight: '700' },
  btnDisabled: { opacity: 0.4 },
  requestBtn: { marginTop: 14, alignItems: 'center', paddingVertical: 6 },
  requestText: { color: ORANGE, fontSize: 14, fontWeight: '600' },
};