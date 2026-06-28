import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { ScreenHeader } from '../../components/common/ScreenHeader';
import { Button } from '../../components/common/Button';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Loader } from '../../components/common/Loader';
import { Icon } from '../../components/common/Icon';
import api from '../../services/api.service';
import { COLORS } from '../../constants/colors';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

export const VoiceMemeScreen = () => {
  const navigation = useNavigation<NavProp>();
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const [playTime, setPlayTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      audioRecorderPlayer.stopRecorder().catch(() => {});
      audioRecorderPlayer.removeRecordBackListener();
      audioRecorderPlayer.stopPlayer().catch(() => {});
      audioRecorderPlayer.removePlayBackListener();
    };
  }, [audioRecorderPlayer]);

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Permission d\'enregistrement audio',
            message: 'L\'application a besoin d\'accéder à votre micro pour enregistrer votre voix.',
            buttonNeutral: 'Plus tard',
            buttonNegative: 'Annuler',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setError('Permission de microphone refusée');
          return false;
        }
        return true;
      } catch (err) {
        console.warn(err);
        setError('Erreur lors de la demande de permission');
        return false;
      }
    }
    return true; // iOS permission is requested automatically on startRecorder
  };

  const handleStartRecord = async () => {
    setError('');
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      setIsRecording(true);
      setRecordTime('00:00');
      
      const path = Platform.select({
        ios: 'sound.m4a',
        android: undefined, // Let library choose default cache path on Android
      });

      const result = await audioRecorderPlayer.startRecorder(path);
      console.log('Recording started, temporary path:', result);

      audioRecorderPlayer.addRecordBackListener((e) => {
        // Convert milliseconds to mm:ss
        const sec = Math.floor(e.currentPosition / 1000);
        const min = Math.floor(sec / 60);
        const mm = min < 10 ? `0${min}` : `${min}`;
        const ss = (sec % 60) < 10 ? `0${sec % 60}` : `${sec % 60}`;
        setRecordTime(`${mm}:${ss}`);
      });
    } catch (err: any) {
      console.error('Start record error:', err);
      setIsRecording(false);
      setError('Impossible de démarrer l\'enregistrement');
    }
  };

  const handleStopRecord = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setAudioPath(result);
      console.log('Recording stopped, path:', result);
    } catch (err) {
      console.error('Stop record error:', err);
      setIsRecording(false);
      setError('Erreur lors de l\'arrêt de l\'enregistrement');
    }
  };

  const handleStartPlay = async () => {
    if (!audioPath) return;
    setError('');
    try {
      setIsPlaying(true);
      await audioRecorderPlayer.startPlayer(audioPath);
      audioRecorderPlayer.addPlayBackListener((e) => {
        const sec = Math.floor(e.currentPosition / 1000);
        const min = Math.floor(sec / 60);
        const mm = min < 10 ? `0${min}` : `${min}`;
        const ss = (sec % 60) < 10 ? `0${sec % 60}` : `${sec % 60}`;
        setPlayTime(`${mm}:${ss}`);

        const totalSec = Math.floor(e.duration / 1000);
        const totalMin = Math.floor(totalSec / 60);
        const totalMm = totalMin < 10 ? `0${totalMin}` : `${totalMin}`;
        const totalSs = (totalSec % 60) < 10 ? `0${totalSec % 60}` : `${totalSec % 60}`;
        setDuration(`${totalMm}:${totalSs}`);

        if (e.currentPosition === e.duration) {
          audioRecorderPlayer.stopPlayer();
          setIsPlaying(false);
        }
      });
    } catch (err) {
      console.error('Start play error:', err);
      setIsPlaying(false);
      setError('Impossible de lire l\'audio');
    }
  };

  const handleStopPlay = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setIsPlaying(false);
    } catch (err) {
      console.error('Stop play error:', err);
    }
  };

  const handleReset = async () => {
    try {
      if (isRecording) {
        await audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
      }
      if (isPlaying) {
        await audioRecorderPlayer.stopPlayer();
        audioRecorderPlayer.removePlayBackListener();
      }
    } catch (e) {}
    setIsRecording(false);
    setIsPlaying(false);
    setRecordTime('00:00');
    setPlayTime('00:00');
    setDuration('00:00');
    setAudioPath(null);
    setError('');
  };

  const handleGenerate = async () => {
    if (!audioPath) {
      setError('Veuillez d\'abord enregistrer une note vocale');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: audioPath,
        type: Platform.OS === 'ios' ? 'audio/m4a' : 'audio/mp4',
        name: Platform.OS === 'ios' ? 'sound.m4a' : 'sound.mp4',
      } as any);

      const res = await api.post('/meme/voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      navigation.navigate('Preview', {
        imageUrl: res.data.imageUrl,
        caption: res.data.caption,
        memeId: res.data.memeId,
      });
    } catch (err: any) {
      console.error('Generate from voice error:', err);
      setError(err.response?.data?.error || 'Erreur lors de la transcription ou génération du meme');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Transcription et génération du meme en cours..." />;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Note Vocale" subtitle="Exprime-toi à la voix, l'IA crée ton meme !" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.recordCard}>
          <Text style={styles.statusLabel}>
            {isRecording ? 'Enregistrement en cours...' : audioPath ? 'Enregistrement terminé' : 'Prêt à enregistrer'}
          </Text>

          {isRecording ? (
            <Text style={styles.timerText}>{recordTime}</Text>
          ) : audioPath ? (
            <Text style={styles.timerText}>{playTime} / {duration === '00:00' ? recordTime : duration}</Text>
          ) : (
            <Text style={styles.timerText}>00:00</Text>
          )}

          <View style={styles.buttonRow}>
            {!audioPath ? (
              <TouchableOpacity
                onPress={isRecording ? handleStopRecord : handleStartRecord}
                style={[styles.micButton, isRecording && styles.micButtonRecording]}
                activeOpacity={0.8}
              >
                <Icon name={isRecording ? 'close' : 'mic'} size={32} color={COLORS.white} />
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  onPress={handleReset}
                  style={[styles.actionButton, styles.resetButton]}
                  activeOpacity={0.8}
                >
                  <Icon name="close" size={20} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>Effacer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={isPlaying ? handleStopPlay : handleStartPlay}
                  style={[styles.actionButton, styles.playButton]}
                  activeOpacity={0.8}
                >
                  <Icon name={isPlaying ? 'close' : 'play'} size={20} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>{isPlaying ? 'Arrêter' : 'Écouter'}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {error ? <ErrorMessage message={error} /> : null}

        <Button
          title="Générer le meme"
          onPress={handleGenerate}
          disabled={!audioPath || isRecording}
        />
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
  recordCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  micButtonRecording: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  resetButton: {
    backgroundColor: '#374151',
  },
  playButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
