import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import { COLORS } from '../../constants/colors';

export const AnimatedLogo: React.FC = () => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.9, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    spin.start();
    pulse.start();
    return () => { spin.stop(); pulse.stop(); };
  }, [spinAnim, pulseAnim]);

  const spinInterpolation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.ringOuter}>
        <Animated.View
          style={[styles.ringSpinner, { transform: [{ rotate: spinInterpolation }, { scale: pulseAnim }] }]}
        />
        <Text style={styles.klip}>KLIP</Text>
      </View>
      <Text style={styles.slogan}>Clip it. Remix it. Send it.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  ringOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  ringSpinner: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: COLORS.primary,
    borderRightColor: COLORS.primaryDark,
  },
  klip: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 3,
  },
  slogan: {
    fontSize: 13,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginTop: 8,
  },
});
