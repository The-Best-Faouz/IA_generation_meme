import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, type = 'error' }) => {
  const colors = {
    error: { bg: 'rgba(239, 68, 68, 0.15)', border: COLORS.error, text: COLORS.error },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', border: COLORS.warning, text: COLORS.warning },
    info: { bg: 'rgba(14, 165, 233, 0.15)', border: COLORS.primary, text: COLORS.primary },
  };

  const c = colors[type];

  return (
    <View style={[styles.container, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.text, { color: c.text }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 14,
    marginVertical: 8,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
