import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ScrollView, Switch, TouchableOpacity, Animated } from 'react-native';
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

const WHATSAPP_LIKE_PACKAGES = ['com.whatsapp', 'org.telegram.messenger', 'com.facebook.orca'];

export const NotificationFeedScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { notifications, isGranted, isListening, requestPermission, startListening, stopListening, clearNotifications } = useNotificationListener();
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<Record<string, any>>({});
  const [autoMode, setAutoMode] = useState(false);
  const [appStats, setAppStats] = useState<Record<string, number>>({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const relevantNotifications = notifications.filter(n =>
    WHATSAPP_LIKE_PACKAGES.some(pkg => (n.packageName ?? '').includes(pkg))
  );

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [fadeAnim]);

  useEffect(() => {
    const stats: Record<string, number> = {};
    relevantNotifications.forEach(n => {
      const app = getAppName(n.packageName);
      stats[app] = (stats[app] || 0) + 1;
    });
    setAppStats(stats);
  }, [relevantNotifications.length]);

  useEffect(() => {
    if (autoMode && relevantNotifications.length > 0) {
      handleAutoAnalyze();
    }
  }, [autoMode, relevantNotifications.length]);

  const handleAutoAnalyze = async () => {
    if (analyzing) return;
    setAnalyzing(true);
    try {
      const unanalyzed = relevantNotifications.filter(n => !suggestions[n.key]);
      if (unanalyzed.length === 0) { setAnalyzing(false); return; }
      const res = await api.post('/notification/analyze-notifications', {
        notifications: unanalyzed.slice(0, 10).map(n => ({
          title: n.title, text: n.text, packageName: n.packageName,
        })),
        country: 'FR',
      });
      if (res.data?.suggestions) {
        const newS: Record<string, any> = {};
        res.data.suggestions.forEach((s: any, i: number) => {
          if (unanalyzed[i]) newS[unanalyzed[i].key] = s;
        });
        setSuggestions(prev => ({ ...prev, ...newS }));
      }
    } catch {}
    setAnalyzing(false);
  };

  const analyzeNotification = async (notif: CapturedNotification) => {
    setAnalyzing(true);
    try {
      const res = await api.post('/notification/analyze-messages', {
        messages: [{ sender: notif.packageName, text: notif.text, timestamp: parseInt(notif.timestamp as string) || Date.now() }],
        country: 'FR',
      });
      if (res.data?.suggestion) {
        setSuggestions(prev => ({ ...prev, [notif.key]: res.data.suggestion }));
      }
    } catch {}
    setAnalyzing(false);
  };

  const generateMemeFromSuggestion = () => navigation.navigate('ContextReader');

  const getAppIcon = (packageName: string): 'chat' | 'telegram' | 'profile' => {
    if (packageName.includes('whatsapp')) return 'chat';
    if (packageName.includes('telegram')) return 'telegram';
    return 'profile';
  };

  const getAppName = (packageName: string) => {
    if (packageName.includes('whatsapp')) return 'WhatsApp';
    if (packageName.includes('telegram')) return 'Telegram';
    if (packageName.includes('facebook')) return 'Messenger';
    return packageName.split('.').pop() || packageName;
  };

  const getAppColor = (packageName: string) => {
    if (packageName.includes('whatsapp')) return '#25D366';
    if (packageName.includes('telegram')) return '#0088cc';
    if (packageName.includes('facebook')) return '#006AFF';
    return COLORS.primary;
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Flux discussions" subtitle="Suggestions automatiques de memes" />
      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.permissionBox}>
            <View style={styles.permissionHeader}>
              <Icon name="notification" size={18} color={COLORS.primary} />
              <Text style={styles.permissionTitle}>Acces aux notifications</Text>
            </View>
            <Text style={styles.permissionDesc}>
              KLIP ecoute les notifications WhatsApp et Telegram en temps reel pour te suggerer des memes instantanement.
            </Text>
            {!isGranted ? (
              <Button title="Activer l acces aux notifications" onPress={requestPermission} />
            ) : (
              <View style={styles.permissionGranted}>
                <View style={styles.grantedRow}>
                  <Icon name="notification" size={16} color={COLORS.success} />
                  <Text style={styles.grantedText}>Acces accorde - ecoute active</Text>
                </View>
                <View style={styles.listeningToggle}>
                  <Text style={styles.listeningLabel}>{isListening ? 'En ecoute' : 'Ecoute desactivee'}</Text>
                  <Switch
                    value={isListening}
                    onValueChange={(val) => val ? startListening() : stopListening()}
                    trackColor={{ false: COLORS.surfaceLight, true: COLORS.primary }}
                    thumbColor={COLORS.white}
                  />
                </View>
              </View>
            )}
          </View>

          {isListening && Object.keys(appStats).length > 0 && (
            <View style={styles.statsRow}>
              {Object.entries(appStats).map(([app, count]) => (
                <View key={app} style={styles.statBadge}>
                  <Icon
                    name={app === 'WhatsApp' ? 'chat' : app === 'Telegram' ? 'telegram' : 'profile'}
                    size={12} color={COLORS.primary}
                  />
                  <Text style={styles.statText}>{app}: {count}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.autoModeBox}>
            <View style={styles.autoModeLeft}>
              <Icon name="sparkle" size={18} color={COLORS.accent} />
              <View>
                <Text style={styles.autoModeLabel}>Mode automatique</Text>
                <Text style={styles.autoModeDesc}>Analyse et suggere des memes en temps reel</Text>
              </View>
            </View>
            <Switch
              value={autoMode}
              onValueChange={setAutoMode}
              trackColor={{ false: COLORS.surfaceLight, true: COLORS.accent }}
              thumbColor={COLORS.white}
            />
          </View>

          {relevantNotifications.length > 0 && (
            <View style={styles.bulkActions}>
              <Button title="Tout analyser" onPress={handleAutoAnalyze} variant="secondary" loading={analyzing} />
              <TouchableOpacity onPress={clearNotifications} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>Effacer ({relevantNotifications.length})</Text>
              </TouchableOpacity>
            </View>
          )}

          {analyzing && <Loader message="Analyse des conversations en temps reel..." />}

          {relevantNotifications.length === 0 && !analyzing && (
            <View style={styles.emptyState}>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>En attente de notifications...</Text>
              </View>
              <Text style={styles.emptyText}>Aucune notification detectee</Text>
              <Text style={styles.emptyHint}>
                Recois un message WhatsApp ou Telegram pour voir les suggestions apparaitre ici en temps reel.
              </Text>
              <View style={styles.emptyDemo}>
                <Icon name="chat" size={16} color={COLORS.textMuted} />
                <Text style={styles.emptyDemoText}>
                  Envoie-toi un message WhatsApp pour tester
                </Text>
              </View>
            </View>
          )}

          {relevantNotifications.slice(0, 50).map((notif, idx) => {
            const appColor = getAppColor(notif.packageName);
            return (
              <View key={notif.key + idx} style={styles.notifCard}>
                <View style={styles.notifHeader}>
                  <View style={[styles.notifIcon, { backgroundColor: appColor + '20' }]}>
                    <Icon name={getAppIcon(notif.packageName)} size={16} color={appColor} />
                  </View>
                  <View style={styles.notifMeta}>
                    <Text style={[styles.notifApp, { color: appColor }]}>{getAppName(notif.packageName)}</Text>
                    <Text style={styles.notifTitle} numberOfLines={1}>{notif.title || 'Message'}</Text>
                  </View>
                  <Text style={styles.notifTime}>
                    {new Date(parseInt(notif.timestamp as string) || Date.now()).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={styles.notifText} numberOfLines={3}>{notif.text || '(aucun texte)'}</Text>

                {suggestions[notif.key] ? (
                  <View style={styles.suggestionBox}>
                    <View style={styles.suggestionScore}>
                      <Icon name="sparkle" size={12} color={COLORS.warning} />
                      <Text style={styles.suggestionScoreText}>
                        Score: {suggestions[notif.key]?.score || 0}/100
                      </Text>
                    </View>
                    <Text style={styles.suggestionReason}>{suggestions[notif.key]?.reason || ''}</Text>
                    <View style={styles.suggestionActions}>
                      <Button title="Generer ce meme" onPress={generateMemeFromSuggestion} style={styles.suggestionBtn} />
                      <Button title="Rejeter" onPress={() => {
                        const newS = { ...suggestions };
                        delete newS[notif.key];
                        setSuggestions(newS);
                      }} variant="outline" style={styles.rejectBtn} />
                    </View>
                  </View>
                ) : (
                  <View style={styles.notifActions}>
                    <Button title="Analyser" onPress={() => analyzeNotification(notif)} variant="outline" loading={analyzing} style={styles.analyzeBtn} />
                    <Button title="Meme direct" onPress={generateMemeFromSuggestion} style={styles.memeBtn} />
                  </View>
                )}
              </View>
            );
          })}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  permissionBox: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  permissionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  permissionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  permissionDesc: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18, marginBottom: 12 },
  permissionGranted: { gap: 10 },
  grantedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  grantedText: { color: COLORS.success, fontWeight: '600', fontSize: 14 },
  listeningToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listeningLabel: { color: COLORS.text, fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  statBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.surface, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: COLORS.border },
  statText: { color: COLORS.text, fontSize: 11, fontWeight: '600' },
  autoModeBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  autoModeLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  autoModeLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  autoModeDesc: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  bulkActions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  clearBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  clearBtnText: { color: COLORS.textMuted, fontSize: 12 },
  notifCard: { backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  notifHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  notifIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  notifMeta: { flex: 1 },
  notifApp: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  notifTitle: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginTop: 1 },
  notifTime: { fontSize: 10, color: COLORS.textMuted },
  notifText: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18, marginBottom: 10 },
  notifActions: { flexDirection: 'row', gap: 8 },
  analyzeBtn: { flex: 1 },
  memeBtn: { flex: 1 },
  suggestionBox: { backgroundColor: COLORS.surfaceLight, borderRadius: 10, padding: 12, marginTop: 4 },
  suggestionScore: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  suggestionScoreText: { fontSize: 12, color: COLORS.warning, fontWeight: '600' },
  suggestionReason: { fontSize: 12, color: COLORS.text, marginBottom: 8, lineHeight: 16 },
  suggestionActions: { flexDirection: 'row', gap: 8 },
  suggestionBtn: { flex: 1 },
  rejectBtn: { flex: 1 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.success },
  liveText: { color: COLORS.success, fontSize: 13, fontWeight: '600' },
  emptyText: { fontSize: 15, color: COLORS.textMuted, fontWeight: '500', marginBottom: 6 },
  emptyHint: { fontSize: 12, color: COLORS.surfaceLight, textAlign: 'center', lineHeight: 16, marginBottom: 16 },
  emptyDemo: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.surface, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  emptyDemoText: { color: COLORS.textMuted, fontSize: 12 },
});
