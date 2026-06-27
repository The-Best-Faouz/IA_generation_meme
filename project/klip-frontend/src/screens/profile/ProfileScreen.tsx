import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { AppHeader } from '../../components/common/AppHeader';
import { Icon } from '../../components/common/Icon';
import api from '../../services/api.service';
import { COLORS } from '../../constants/colors';

export const ProfileScreen = () => {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/user/profile');
      setProfile(res.data?.user ?? null);
    } catch (err: any) {
      setProfile(null);
    }
    setLoading(false);
  };

  if (loading) return <Loader />;

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Icon name="profile" size={28} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Profil</Text>
      </View>

      {profile && (
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Icon name="chat" size={16} color={COLORS.textMuted} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile.email}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Icon name="home" size={16} color={COLORS.textMuted} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Pays</Text>
              <Text style={styles.infoValue}>{profile.country || 'Non defini'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Icon name="edit" size={16} color={COLORS.textMuted} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Langue</Text>
              <Text style={styles.infoValue}>{profile.language === 'fr' ? 'Francais' : 'Anglais'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Icon name="gallery" size={16} color={COLORS.textMuted} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Membre depuis</Text>
              <Text style={styles.infoValue}>
                {new Date(profile.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.logoutSection}>
        <Button title="Deconnexion" variant="outline" onPress={logout} />
      </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(14, 165, 233, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  logoutSection: {
    marginTop: 8,
  },
});
