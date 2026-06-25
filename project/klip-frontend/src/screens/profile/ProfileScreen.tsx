import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import api from '../../services/api.service';
import { COLORS } from '../../constants/colors';

export const ProfileScreen = () => {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/user/profile');
      setProfile(res.data.user);
    } catch {
      // erreur silencieuse
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profil</Text>

      {profile && (
        <View style={styles.infoCard}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{profile.email}</Text>

          <Text style={styles.label}>Pays</Text>
          <Text style={styles.value}>{profile.country}</Text>

          <Text style={styles.label}>Langue</Text>
          <Text style={styles.value}>{profile.language === 'fr' ? 'Français' : 'Anglais'}</Text>

          <Text style={styles.label}>Membre depuis</Text>
          <Text style={styles.value}>
            {new Date(profile.createdAt).toLocaleDateString()}
          </Text>
        </View>
      )}

      <Button title="Déconnexion" variant="outline" onPress={logout} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 8,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 8,
  },
});
