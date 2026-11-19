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

export default function AddCarModal({ visible, onClose, onSave, carCatalog = [], onRequestNewCar }) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [vin, setVin] = useState('');
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

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

  const handleSelectMake = (m) => {
    setMake(m); setModel('');
    setShowMakeDropdown(false); setShowModelDropdown(true);
  };
  const handleSelectModel = (m) => { setModel(m); setShowModelDropdown(false); };

  const handleSave = () => {
    if (!make.trim() || !model.trim() || !year.trim()) return;
    onSave({ make: make.trim(), model: model.trim(), year: year.trim(), vin: vin.trim().toUpperCase() });
    setMake(''); setModel(''); setYear(''); setVin('');
    setShowMakeDropdown(false); setShowModelDropdown(false);
  };

  const closeAll = () => {
    onClose();
    setShowMakeDropdown(false); setShowModelDropdown(false);
  };

  const renderDropdown = (items, onSelect) => (
    <View style={s.dropdown}>
      <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
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
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={closeAll}>
      <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={closeAll} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.avoider}
      >
        <View style={s.sheet}>
          <Text style={s.title}>Добавить автомобиль</Text>

          {/* МАРКА */}
          <Text style={s.label}>Марка</Text>
          <View style={s.fieldWrap}>
            <TextInput
              style={[s.input, showMakeDropdown && s.inputFocus]}
              value={make}
              onChangeText={(t) => { setMake(t); setShowMakeDropdown(true); setShowModelDropdown(false); }}
              onFocus={() => setShowMakeDropdown(true)}
              onBlur={() => setTimeout(() => setShowMakeDropdown(false), 150)}
              placeholder="Tank, Toyota, Lada..."
              placeholderTextColor={MUTED}
            />
            {showMakeDropdown && filteredMakes.length > 0 && renderDropdown(filteredMakes, handleSelectMake)}
          </View>

          {/* МОДЕЛЬ */}
          <Text style={s.label}>Модель</Text>
          <View style={s.fieldWrap}>
            <TextInput
              style={[s.input, !make && s.inputDisabled, showModelDropdown && s.inputFocus]}
              value={model}
              editable={!!make}
              onChangeText={(t) => { setModel(t); setShowModelDropdown(true); }}
              onFocus={() => make && setShowModelDropdown(true)}
              onBlur={() => setTimeout(() => setShowModelDropdown(false), 150)}
              placeholder={make ? 'Выберите или введите модель' : 'Сначала выберите марку'}
              placeholderTextColor={MUTED}
            />
            {showModelDropdown && make && filteredModels.length > 0 && renderDropdown(
              filteredModels.map(c => ({ value: c.model, label: c.model, hint: `${c.yearFrom}–${c.yearTo}` })),
              handleSelectModel
            )}
          </View>

          {selectedEntry ? (
            <Text style={s.hint}>Годы выпуска модели: {selectedEntry.yearFrom}–{selectedEntry.yearTo}</Text>
          ) : null}

          {/* ГОД + VIN */}
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Год</Text>
              <TextInput
                style={s.input} value={year} onChangeText={setYear}
                placeholder="2021" keyboardType="number-pad" maxLength={4}
                placeholderTextColor={MUTED}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={s.label}>VIN</Text>
              <TextInput
                style={s.input} value={vin} onChangeText={setVin}
                placeholder="необязательно" autoCapitalize="characters" maxLength={17}
                placeholderTextColor={MUTED}
              />
            </View>
          </View>

          {/* КНОПКИ */}
          <View style={s.actions}>
            <TouchableOpacity style={s.btnGhost} onPress={closeAll}>
              <Text style={s.btnGhostText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btnPrimary, (!make.trim() || !model.trim() || !year.trim()) && s.btnDisabled]}
              onPress={handleSave}
              disabled={!make.trim() || !model.trim() || !year.trim()}
            >
              <Text style={s.btnPrimaryText}>Добавить</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.requestBtn} onPress={() => { closeAll(); onRequestNewCar && onRequestNewCar(); }}>
            <Text style={s.requestText}>Нет в списке? Запросить добавление →</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = {
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  avoider: { flex: 1, justifyContent: 'center' },
  sheet: {
    marginHorizontal: 16, backgroundColor: BG, borderRadius: 20,
    padding: 20, borderWidth: 1, borderColor: BORDER,
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
  },
  title: { color: TEXT, fontSize: 20, fontWeight: '700', marginBottom: 16 },
  label: { color: MUTED, fontSize: 13, marginBottom: 6, marginTop: 4 },
  fieldWrap: { position: 'relative', zIndex: 10 },
  input: {
    backgroundColor: FIELD, color: TEXT, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16,
    borderWidth: 1, borderColor: BORDER,
  },
  inputFocus: { borderColor: ORANGE },
  inputDisabled: { opacity: 0.5 },
  hint: { color: ORANGE, fontSize: 12, marginTop: 6 },
  row: { flexDirection: 'row', marginTop: 4 },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0,
    backgroundColor: '#232325', borderRadius: 12, marginTop: 4,
    borderWidth: 1, borderColor: ORANGE, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10, elevation: 8,
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