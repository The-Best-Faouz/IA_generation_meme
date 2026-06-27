import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { COUNTRIES, Country } from '../../constants/countries';

interface CountryPickerProps {
  value: string;
  onChange: (country: Country) => void;
}

export const CountryPicker: React.FC<CountryPickerProps> = ({ value, onChange }) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selected = COUNTRIES.find((c) => c.code === value);

  const filtered = search
    ? COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRIES;

  const handleSelect = (country: Country) => {
    onChange(country);
    setVisible(false);
    setSearch('');
  };

  return (
    <View>
      <Text style={styles.label}>Pays</Text>
      <TouchableOpacity style={styles.selector} onPress={() => setVisible(true)}>
        <Text style={[styles.selectorText, !selected && styles.placeholder]}>
          {selected ? selected.name : 'Sélectionne ton pays'}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionne ton pays</Text>
              <TouchableOpacity onPress={() => { setVisible(false); setSearch(''); }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un pays..."
              placeholderTextColor={COLORS.textMuted}
              value={search}
              onChangeText={setSearch}
            />

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.item, item.code === value && styles.itemSelected]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.itemText}>{item.name}</Text>
                  {item.code === value && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              )}
              style={styles.list}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  selector: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    color: COLORS.text,
    fontSize: 16,
  },
  placeholder: {
    color: COLORS.textMuted,
  },
  arrow: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    color: COLORS.textMuted,
    fontSize: 20,
    padding: 4,
  },
  searchInput: {
    backgroundColor: COLORS.surfaceLight,
    color: COLORS.text,
    borderRadius: 8,
    margin: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  list: {
    maxHeight: 400,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemSelected: {
    backgroundColor: COLORS.surfaceLight,
  },
  itemText: {
    color: COLORS.text,
    fontSize: 15,
  },
  check: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
  },
});
