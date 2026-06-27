import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppNavigator';
import { Icon } from './Icon';
import { COLORS } from '../../constants/colors';

type NavProp = NativeStackNavigationProp<AppStackParamList>;

interface AppHeaderProps {
  title?: string;
  hideLogo?: boolean;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ title, hideLogo, rightAction }) => {
  const navigation = useNavigation<NavProp>();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {hideLogo ? (
          <View style={styles.placeholder} />
        ) : (
          <View style={styles.logoContainer}>
            <View style={styles.logoMark}>
              <View style={styles.logoDot} />
              <View style={[styles.logoDot, { backgroundColor: COLORS.secondary, marginLeft: 1 }]} />
            </View>
            <Text style={styles.logoText}>KLIP</Text>
          </View>
        )}
        {title && <Text style={styles.title}>{title}</Text>}
      </View>
      <View style={styles.right}>
        {rightAction || (
          <TouchableOpacity
            onPress={() => navigation.navigate('NotificationFeed')}
            style={styles.iconBtn}
            activeOpacity={0.7}
          >
            <Icon name="notification" size={20} color={COLORS.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
    paddingBottom: 8,
    backgroundColor: COLORS.background,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoMark: {
    flexDirection: 'row',
    marginRight: 8,
    alignItems: 'center',
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 12,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  placeholder: {
    width: 1,
  },
});
