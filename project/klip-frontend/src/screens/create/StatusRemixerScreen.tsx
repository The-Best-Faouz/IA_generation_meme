import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, Text, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Loader } from '../../components/common/Loader';
import { Icon } from '../../components/common/Icon';
import { WhatsAppStatusService, WhatsAppStatus } from '../../services/whatsappStatus.service';
import api from '../../services/api.service';
import { COLORS } from '../../constants/colors';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

export const StatusRemixerScreen = () => {
  const navigation = useNavigation<NavProp>();
  const [statuses, setStatuses] = useState<WhatsAppStatus[]>([]);
  const [scanning, setScanning] = useState(false);
  const [selectedUri, setSelectedUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const scanWhatsAppStatuses = async () => {
    setScanning(true);
    setError('');
    try {
      const found = await WhatsAppStatusService.scanStatuses();
      if (found.length === 0) {
        launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response: ImagePickerResponse) => {
          if (response.assets && response.assets[0]?.uri) {
            setSelectedUri(response.assets[0].uri);
            setStatuses([]);
          }
        });
        setError('Aucun statut WhatsApp detecte. Selectionne une image.');
      } else {
        setStatuses(found);
      }
    } catch {
      launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response: ImagePickerResponse) => {
        if (response.assets && response.assets[0]?.uri) {
          setSelectedUri(response.assets[0].uri);
        }
      });
      setError('Impossible de scanner les statuts. Selectionne une image.');
    }
    setScanning(false);
  };

  const pickManual = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response: ImagePickerResponse) => {
      if (response.assets && response.assets[0]?.uri) {
        setSelectedUri(response.assets[0].uri);
        setStatuses([]);
        setError('');
      }
    });
  };

  const handleGenerate = async () => {
    const uri = selectedUri;
    if (!uri) {
      setError('Choisis un statut ou une image');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', { uri, type: 'image/jpeg', name: 'status.jpg' } as any);
      const res = await api.post('/meme/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigation.navigate('Preview', {
        imageUrl: res.data.imageUrl,
        caption: res.data.caption,
        memeId: res.data.memeId,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de generation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Remix en cours..." />;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Status Remixer" subtitle="Capture un statut WhatsApp et remixe-le" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.scanSection}>
          <TouchableOpacity style={styles.scanBtn} onPress={scanWhatsAppStatuses} disabled={scanning} activeOpacity={0.8}>
            <Icon name="import" size={22} color={COLORS.white} />
            <Text style={styles.scanBtnText}>
              {scanning ? 'Scan en cours...' : 'Scanner les statuts WhatsApp'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.manualBtn} onPress={pickManual} activeOpacity={0.8}>
            <Icon name="image" size={18} color={COLORS.textMuted} />
            <Text style={styles.manualBtnText}>Ou choisir depuis la galerie</Text>
          </TouchableOpacity>
        </View>

        {statuses.length > 0 && (
          <View style={styles.statusesSection}>
            <Text style={styles.sectionLabel}>Statuts trouves</Text>
            <View style={styles.statusesGrid}>
              {statuses.slice(0, 12).map((status, idx) => (
                <TouchableOpacity
                  key={status.fileName + idx}
                  style={[styles.statusThumb, selectedUri === status.uri && styles.statusThumbSelected]}
                  onPress={() => { setSelectedUri(status.uri); setStatuses([]); }}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: status.uri }} style={styles.thumbImage} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {selectedUri && (
          <View style={styles.previewSection}>
            <Text style={styles.sectionLabel}>Image selectionnee</Text>
            <Image source={{ uri: selectedUri }} style={styles.previewImage} />
          </View>
        )}

        {error ? <ErrorMessage message={error} /> : null}

        <Button title="Remixer en meme" onPress={handleGenerate} disabled={!selectedUri} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  scanSection: {
    marginBottom: 20,
    gap: 10,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  scanBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  manualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  manualBtnText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  statusesSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  statusesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusThumb: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statusThumbSelected: {
    borderColor: COLORS.primary,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  previewSection: {
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
});
