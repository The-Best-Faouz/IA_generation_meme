import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Loader } from '../../components/common/Loader';
import { Icon } from '../../components/common/Icon';
import { Input } from '../../components/common/Input';
import api from '../../services/api.service';
import { COLORS } from '../../constants/colors';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

type Tone = 'sarcastique' | 'absurde' | 'dramatique' | 'calme';

const TONES: Tone[] = ['sarcastique', 'absurde', 'dramatique', 'calme'];

export const ContextReaderScreen = () => {
  const navigation = useNavigation<NavProp>();
  const [seedText, setSeedText] = useState('');
  const [situation, setSituation] = useState('');
  const [people, setPeople] = useState('');
  const [extra, setExtra] = useState('');
  const [tone, setTone] = useState<Tone>('sarcastique');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!seedText.trim()) {
      setError('Ajoute au moins un mot ou une phrase de depart');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/meme/text', {
        text: seedText,
        context: {
          situation,
          people,
          tone,
          extra,
          audience: 'public francophone',
        },
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

  if (loading) {
    return <Loader message="L IA genere ton meme..." />;
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Context Reader" subtitle="Ajoute du contexte au texte brut" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="chat" size={18} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Texte de depart</Text>
          </View>
          <Input
            value={seedText}
            onChangeText={setSeedText}
            placeholder="Ex: lundi matin"
            multiline
            numberOfLines={2}
            style={styles.seedInput}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="sparkle" size={18} color={COLORS.warning} />
            <Text style={styles.cardTitle}>Contexte rapide</Text>
          </View>

          <Input
            label="Situation"
            value={situation}
            onChangeText={setSituation}
            placeholder="Ex: fin de mois, batterie a 2%"
          />
          <Input
            label="Qui est concerne"
            value={people}
            onChangeText={setPeople}
            placeholder="Ex: moi, le chef, mon ami"
          />

          <Text style={styles.sectionLabel}>Ton du meme</Text>
          <View style={styles.toneRow}>
            {TONES.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.toneChip, tone === item && styles.toneChipActive]}
                onPress={() => setTone(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.toneChipText, tone === item && styles.toneChipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label="Details supplementaires"
            value={extra}
            onChangeText={setExtra}
            placeholder="Ex: reaction exageree, reference locale, ironie"
            multiline
            numberOfLines={3}
            style={styles.extraInput}
          />
        </View>

        {error ? <ErrorMessage message={error} /> : null}

        <Button title="Generer le meme" onPress={handleGenerate} />
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  seedInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
    marginBottom: 10,
  },
  toneRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  toneChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toneChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toneChipText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  toneChipTextActive: {
    color: COLORS.white,
  },
  extraInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
