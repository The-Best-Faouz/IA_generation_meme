import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface EyeIconProps {
  visible: boolean;
  size?: number;
}

export const EyeIcon: React.FC<EyeIconProps> = ({ visible, size = 22 }) => {
  const s = size;
  const half = s / 2;
  const eyeR = s * 0.38;
  const pupilR = s * 0.12;

  return (
    <View style={[styles.container, { width: s, height: s }]}>
      <View
        style={[
          styles.eye,
          {
            width: eyeR * 2,
            height: eyeR * 2,
            borderRadius: eyeR,
            borderWidth: 1.5,
            borderColor: COLORS.textMuted,
          },
        ]}
      >
        <View
          style={[
            styles.pupil,
            {
              width: pupilR * 2,
              height: pupilR * 2,
              borderRadius: pupilR,
              backgroundColor: COLORS.textMuted,
            },
          ]}
        />
        {!visible && (
          <View
            style={[
              styles.line,
              {
                width: eyeR * 2.6,
                height: 1.5,
                backgroundColor: COLORS.textMuted,
                transform: [{ rotate: '-45deg' }],
              },
            ]}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  eye: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pupil: {},
  line: {
    position: 'absolute',
  },
});
