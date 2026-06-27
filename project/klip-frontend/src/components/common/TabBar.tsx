import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Icon } from './Icon';
import { COLORS } from '../../constants/colors';

const TAB_CONFIG: Record<string, { icon: 'home' | 'gallery' | 'profile'; label: string }> = {
  Home: { icon: 'home', label: 'Accueil' },
  Gallery: { icon: 'gallery', label: 'Galerie' },
  Profile: { icon: 'profile', label: 'Profil' },
};

const TabButton: React.FC<{
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
}> = ({ routeName, isFocused, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const config = TAB_CONFIG[routeName] || { icon: 'home' as const, label: routeName };

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [isFocused, scaleAnim]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 60, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 200, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.tab} activeOpacity={1}>
      <Animated.View style={[styles.tabInner, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
          <Icon name={config.icon} size={20} color={isFocused ? COLORS.primary : COLORS.textMuted} />
        </View>
        <Text style={[styles.label, isFocused && styles.labelActive]}>{config.label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const TabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TabButton
              key={route.key}
              routeName={route.name}
              isFocused={isFocused}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.4)',
    paddingBottom: 4,
  },
  content: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  iconWrap: {
    width: 36,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
  },
  label: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
    letterSpacing: 0.3,
    marginTop: 1,
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
