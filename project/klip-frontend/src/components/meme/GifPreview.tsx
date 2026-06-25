import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface GifPreviewProps {
  uri: string;
  width?: number;
  height?: number;
}

export const GifPreview: React.FC<GifPreviewProps> = ({ uri, width = 300, height = 300 }) => {
  return (
    <View style={[styles.container, { width, height }]}>
      <Image source={{ uri }} style={[styles.image, { width, height }]} resizeMode="contain" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    alignSelf: 'center',
  },
  image: {
    borderRadius: 12,
  },
});
