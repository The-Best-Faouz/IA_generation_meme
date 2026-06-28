import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ScrollView, TextInput, TouchableOpacity, Switch, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Loader } from '../../components/common/Loader';
import { Icon } from '../../components/common/Icon';
import { useNotificationListener, CapturedNotification } from '../../hooks/useNotificationListener';
import api from '../../services/api.service';
import { COLORS } from '../../constants/colors';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

const WHATSAPP_PACKAGES = ['com.whatsapp', 'com.whatsapp.w4b'];

export const ChatImportScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { notifications, isGranted, isListening, requestPermission, startListening, stopListening } = useNotificationListener();
  const [chatContent, setChatContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [parseResult, setParseResult] = useState<any>(null);
  const [memesResult, setMemesResult] = useState<string | null>(null);
  const [mode, setMode] = useState<'live' | 'export'>('live');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const whatsappNotifs = notifications.filter(n =>
    WHATSAPP_PACKAGES.some(pkg => (n.packageName ?? '').includes(pkg))
  );

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const handleParse = async () => {
    if (!chatContent.trim()) { setError('Colle l export WhatsApp ici'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/chat/parse', { content: chatContent });
      setParseResult(res.data);
    } catch (err: any) { setError(err.response?.data?.error || 'Erreur de parsing'); }
    setLoading(false);
  };

  const handleGenerateMemes = async () => {
    if (!chatContent.trim()) { setError('Colle l export WhatsApp ici'); return; }
    setGenerating(true); setError('');
    try {
      const res = await api.post('/chat/generate-memes', { content: chatContent, country: 'CM' });
      navigation.navigate('Preview', {
        imageUrl: res.data.imageUrl,
        caption: res.data.caption,
        memeId: res.data.memeId,
      });
    } catch (err: any) { setError(err.response?.data?.error || 'Erreur de generation'); }
    setGenerating(false);
  };

  const generateMemeFromNotif = async (notif: CapturedNotification) => {
    setGenerating(true); setError('');
    try {
      const res = await api.post('/chat/generate-memes', {
        content: notif.text || notif.title || '',
        country: 'CM',
      });
      navigation.navigate('Preview', {
        imageUrl: res.data.imageUrl,
        caption: res.data.caption,
        memeId: res.data.memeId,
      });
    } catch (err: any) { setError(err.response?.data?.error || 'Erreur de generation'); }
    setGenerating(false);
  };

  const getAppName = (pkg: string) => {
    if (pkg.includes('whatsapp')) return 'WhatsApp';
    if (pkg.includes('telegram')) return 'Telegram';
    return 'App';
  };

  if (loading) return <Loader message="Analyse de la conversation..." />;
  if (generating) return <Loader message="Generation des memes par l IA..." />;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Import WhatsApp" subtitle="Messages en temps reel" />
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'live' && styles.modeBtnActive]}
              onPress={() => setMode('live')}
            >
              <Icon name="notification" size={16} color={mode === 'live' ? COLORS.white : COLORS.textMuted} />
              <Text style={[styles.modeBtnText, mode === 'live' && styles.modeBtnTextActive]}>Temps reel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'export' && styles.modeBtnActive]}
              onPress={() => setMode('export')}
            >
              <Icon name="import" size={16} color={mode === 'export' ? COLORS.white : COLORS.textMuted} />
              <Text style={[styles.modeBtnText, mode === 'export' && styles.modeBtnTextActive]}>Export</Text>
            </TouchableOpacity>
          </View>

          {mode === 'live' ? (
            <>
              <View style={styles.liveHeader}>
                <View style={styles.liveIndicator}>
                  <View style={[styles.liveDot, isListening && styles.liveDotActive]} />
                  <Text style={[styles.liveLabel, isListening && styles.liveLabelActive]}>
                    {isListening ? 'Capture en temps reel' : 'Inactif'}
                  </Text>
                </View>
                {!isGranted ? (
                  <Button title="Activer" onPress={requestPermission} style={styles.enableBtn} />
                ) : (
                  <Switch
                    value={isListening}
                    onValueChange={(v) => v ? startListening() : stopListening()}
                    trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
                    thumbColor={COLORS.white}
                  />
                )}
              </View>

              <Text style={styles.sectionLabel}>
                Messages WhatsApp captures ({whatsappNotifs.length})
              </Text>

              {whatsappNotifs.length === 0 ? (
                <View style={styles.liveEmpty}>
                  <View style={styles.liveEmptyIcon}>
                    <Icon name="chat" size={28} color={COLORS.surfaceLight} />
                  </View>
                  <Text style={styles.liveEmptyTitle}>
                    {isListening ? 'En attente de messages...' : 'Active l ecoute pour capturer les messages'}
                  </Text>
                  <Text style={styles.liveEmptyHint}>
                    Les messages WhatsApp apparaitront ici en temps reel des qu ils arrivent.
                  </Text>
                </View>
              ) : (
                whatsappNotifs.slice(0, 30).map((notif, idx) => (
                  <View key={notif.key + idx} style={styles.messageCard}>
                    <View style={styles.messageHeader}>
                      <View style={styles.messageSource}>
                        <Icon name="chat" size={12} color="#25D366" />
                        <Text style={styles.messageApp}>{getAppName(notif.packageName)}</Text>
                      </View>
                      <Text style={styles.messageTime}>
                        {new Date(parseInt(notif.timestamp as string) || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Text style={styles.messageTitle} numberOfLines={1}>{notif.title || 'Message'}</Text>
                    <Text style={styles.messageText} numberOfLines={2}>{notif.text || ''}</Text>
                    <TouchableOpacity style={styles.generateBtn} onPress={() => generateMemeFromNotif(notif)} activeOpacity={0.8}>
                      <Icon name="sparkle" size={14} color={COLORS.white} />
                      <Text style={styles.generateBtnText}>Generer un meme</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </>
          ) : (
            <>
              <View style={styles.instructions}>
                <View style={styles.instructionsHeader}>
                  <Icon name="import" size={16} color={COLORS.primary} />
                  <Text style={styles.instructionsTitle}>Exporter depuis WhatsApp</Text>
                </View>
                <Text style={styles.instructionsText}>
                  1. Ouvre la conversation WhatsApp{'\n'}
                  2. Appuie sur Plus {`>`} Exporter la discussion{'\n'}
                  3. Choisis Sans medias{'\n'}
                  4. Colle le contenu ci-dessous
                </Text>
              </View>

              <View style={styles.inputCard}>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={8}
                  placeholder="Colle ici l export WhatsApp..."
                  placeholderTextColor={COLORS.textMuted}
                  value={chatContent}
                  onChangeText={setChatContent}
                  textAlignVertical="top"
                />
              </View>

              {error ? <ErrorMessage message={error} /> : null}

              <View style={styles.exportActions}>
                <Button title="Analyser" onPress={handleParse} variant="secondary" />
                <Button title="Generer des memes" onPress={handleGenerateMemes} />
              </View>

              {parseResult && (
                <View style={styles.resultBox}>
                  <Text style={styles.resultTitle}>{parseResult.title || 'Conversation'}</Text>
                  <Text style={styles.resultStat}>
                    {parseResult.participants?.length || 0} participants - {parseResult.messageCount || 0} messages
                  </Text>
                  {parseResult.stats?.messagesPerPerson && (
                    <View style={styles.statsBox}>
                      <Text style={styles.statsTitle}>Messages par personne</Text>
                      {Object.entries(parseResult.stats.messagesPerPerson).map(([name, count]: [string, any]) => (
                        <View key={name} style={styles.statsRow}>
                          <Text style={styles.statsName}>{name}</Text>
                          <Text style={styles.statsCount}>{count}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <Button title="Generer des memes" onPress={handleGenerateMemes} style={{ marginTop: 16 }} />
                </View>
              )}

              {memesResult && (
                <View style={styles.memesBox}>
                  <View style={styles.memesHeader}>
                    <Icon name="sparkle" size={18} color={COLORS.warning} />
                    <Text style={styles.memesTitle}>Memes generes</Text>
                  </View>
                  <Text style={styles.memesContent}>{memesResult}</Text>
                  <Button title="Aller au Context Reader" onPress={() => navigation.navigate('ContextReader')} variant="outline" style={{ marginTop: 12 }} />
                </View>
              )}
            </>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  modeToggle: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  modeBtn: { flex: 1, flexDirection: 'row', paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 10, gap: 6 },
  modeBtnActive: { backgroundColor: COLORS.primary },
  modeBtnText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 13 },
  modeBtnTextActive: { color: COLORS.white },
  liveHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.surfaceLight },
  liveDotActive: { backgroundColor: COLORS.success },
  liveLabel: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },
  liveLabelActive: { color: COLORS.success },
  enableBtn: { marginLeft: 'auto' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  liveEmpty: { alignItems: 'center', paddingVertical: 40 },
  liveEmptyIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  liveEmptyTitle: { color: COLORS.textMuted, fontSize: 14, fontWeight: '500', textAlign: 'center', marginBottom: 8 },
  liveEmptyHint: { color: COLORS.surfaceLight, fontSize: 12, textAlign: 'center', lineHeight: 16 },
  messageCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  messageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  messageSource: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  messageApp: { color: '#25D366', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  messageTime: { color: COLORS.textMuted, fontSize: 10 },
  messageTitle: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  messageText: { color: COLORS.textMuted, fontSize: 13, lineHeight: 17, marginBottom: 10 },
  generateBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'flex-start' },
  generateBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 12 },
  instructions: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  instructionsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  instructionsTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  instructionsText: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20 },
  inputCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  textArea: { color: COLORS.text, fontSize: 13, fontFamily: 'monospace', minHeight: 160, lineHeight: 18 },
  exportActions: { gap: 10, marginBottom: 16 },
  resultBox: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginTop: 16, borderWidth: 1, borderColor: COLORS.border },
  resultTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  resultStat: { fontSize: 12, color: COLORS.textMuted, marginBottom: 12 },
  statsBox: { backgroundColor: COLORS.surfaceLight, borderRadius: 10, padding: 12 },
  statsTitle: { fontSize: 12, fontWeight: '600', color: COLORS.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  statsName: { fontSize: 13, color: COLORS.textMuted },
  statsCount: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  memesBox: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginTop: 16, borderWidth: 1, borderColor: COLORS.border },
  memesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  memesTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  memesContent: { fontSize: 13, color: COLORS.text, lineHeight: 20, fontFamily: 'monospace' },
});
