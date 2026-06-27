import React from 'react';
import { View, StyleSheet } from 'react-native';

interface IconProps {
  name: 'home' | 'gallery' | 'profile' | 'chat' | 'image' | 'mic' | 'edit' | 'swap' | 'telegram' | 'studio' | 'bell' | 'share' | 'close' | 'back' | 'plus' | 'play' | 'sparkle' | 'gif' | 'import' | 'prompt' | 'notification' | 'sticker' | 'settings';
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#f8fafc' }) => {
  const s = size;
  const half = s / 2;
  const q = s / 4;
  const e = s / 8;

  const renderIcon = () => {
    switch (name) {
      case 'home':
        return <HomeIcon s={s} c={color} />;
      case 'gallery':
        return <GalleryIcon s={s} c={color} />;
      case 'profile':
        return <ProfileIcon s={s} c={color} />;
      case 'chat':
        return <ChatIcon s={s} c={color} />;
      case 'image':
        return <ImageIcon s={s} c={color} />;
      case 'mic':
        return <MicIcon s={s} c={color} />;
      case 'edit':
        return <EditIcon s={s} c={color} />;
      case 'swap':
        return <SwapIcon s={s} c={color} />;
      case 'telegram':
        return <TelegramIcon s={s} c={color} />;
      case 'studio':
        return <StudioIcon s={s} c={color} />;
      case 'bell':
        return <BellIcon s={s} c={color} />;
      case 'share':
        return <ShareIcon s={s} c={color} />;
      case 'close':
        return <CloseIcon s={s} c={color} />;
      case 'back':
        return <BackIcon s={s} c={color} />;
      case 'plus':
        return <PlusIcon s={s} c={color} />;
      case 'play':
        return <PlayIcon s={s} c={color} />;
      case 'sparkle':
      case 'prompt':
        return <SparkleIcon s={s} c={color} />;
      case 'gif':
        return <GifIcon s={s} c={color} />;
      case 'import':
        return <ImportIcon s={s} c={color} />;
      case 'notification':
        return <BellIcon s={s} c={color} />;
      case 'sticker':
        return <StickerIcon s={s} c={color} />;
      case 'settings':
        return <SettingsIcon s={s} c={color} />;
      default:
        return <View style={{ width: s, height: s }} />;
    }
  };

  return (
    <View style={[styles.container, { width: s, height: s }]}>
      {renderIcon()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const HomeIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'flex-end' }}>
    <View style={{ position: 'absolute', top: 0, width: 0, height: 0, borderLeftWidth: s * 0.45, borderRightWidth: s * 0.45, borderBottomWidth: s * 0.4, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: c }} />
    <View style={{ width: s * 0.8, height: s * 0.5, backgroundColor: c, borderRadius: 1 }} />
    <View style={{ position: 'absolute', bottom: 0, width: s * 0.28, height: s * 0.22, backgroundColor: '#0f172a', borderTopLeftRadius: 1 }} />
  </View>
);

const GalleryIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => {
  const cell = s * 0.42;
  const g = s * 0.08;
  return (
    <View style={{ width: s, height: s, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'space-between', justifyContent: 'space-between' }}>
      <View style={{ width: cell, height: cell, backgroundColor: c, borderRadius: 3 }} />
      <View style={{ width: cell, height: cell, backgroundColor: c, borderRadius: 3 }} />
      <View style={{ width: cell, height: cell, backgroundColor: c, borderRadius: 3 }} />
      <View style={{ width: cell, height: cell, backgroundColor: c, borderRadius: 3 }} />
    </View>
  );
};

const ProfileIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <View style={{ width: s, height: s, alignItems: 'center', justifyContent: 'flex-start' }}>
    <View style={{ width: s * 0.45, height: s * 0.45, borderRadius: s * 0.225, backgroundColor: c, position: 'absolute', top: s * 0.02 }} />
    <View style={{ width: s * 0.8, height: s * 0.42, borderTopLeftRadius: s * 0.4, borderTopRightRadius: s * 0.4, backgroundColor: c, position: 'absolute', bottom: s * 0.04 }} />
  </View>
);

const ChatIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <View style={{ width: s, height: s }}>
    <View style={{ width: s * 0.82, height: s * 0.62, backgroundColor: c, borderRadius: s * 0.12, position: 'absolute', top: 0, left: s * 0.09 }} />
    <View style={{ width: 0, height: 0, borderLeftWidth: s * 0.12, borderRightWidth: s * 0.04, borderTopWidth: s * 0.16, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: c, position: 'absolute', bottom: s * 0.06, left: s * 0.18 }} />
  </View>
);

const ImageIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <View style={{ width: s, height: s }}>
    <View style={{ width: s * 0.9, height: s * 0.9, borderRadius: s * 0.08, borderWidth: 2, borderColor: c, position: 'absolute', top: s * 0.05, left: s * 0.05 }} />
    <View style={{ width: s * 0.22, height: s * 0.22, borderRadius: s * 0.11, backgroundColor: c, position: 'absolute', bottom: s * 0.2, right: s * 0.15 }} />
    <View style={{ width: 0, height: 0, borderLeftWidth: s * 0.2, borderRightWidth: s * 0.2, borderBottomWidth: s * 0.2, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: c, position: 'absolute', bottom: s * 0.08, left: s * 0.1 }} />
  </View>
);

const MicIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <View style={{ width: s, height: s, alignItems: 'center' }}>
    <View style={{ width: s * 0.28, height: s * 0.52, backgroundColor: c, borderRadius: s * 0.14 }} />
    <View style={{ width: s * 0.4, height: s * 0.12, borderBottomLeftRadius: s * 0.2, borderBottomRightRadius: s * 0.2, borderWidth: 2, borderTopWidth: 0, borderColor: c, position: 'absolute', bottom: s * 0.15 }} />
    <View style={{ width: 2, height: s * 0.12, backgroundColor: c, position: 'absolute', bottom: 0 }} />
  </View>
);

const EditIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <View style={{ width: s, height: s, transform: [{ rotate: '-45deg' }] }}>
    <View style={{ width: s * 0.22, height: s * 0.7, backgroundColor: c, borderRadius: 2, position: 'absolute', bottom: s * 0.05, left: s * 0.39 }} />
    <View style={{ width: 0, height: 0, borderLeftWidth: s * 0.15, borderRightWidth: s * 0.15, borderBottomWidth: s * 0.2, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: c, position: 'absolute', top: s * 0.08, left: s * 0.35 }} />
  </View>
);

const SwapIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute', top: s * 0.05 }}>
      <View style={{ width: s * 0.4, height: 2, backgroundColor: c }} />
      <View style={{ width: 0, height: 0, borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 6, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: c }} />
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute', bottom: s * 0.05 }}>
      <View style={{ width: 0, height: 0, borderTopWidth: 5, borderBottomWidth: 5, borderRightWidth: 6, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: c }} />
      <View style={{ width: s * 0.4, height: 2, backgroundColor: c }} />
    </View>
  </View>
);

const TelegramIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center', transform: [{ rotate: '-20deg' }] }}>
    <View style={{ width: 0, height: 0, borderLeftWidth: s * 0.15, borderRightWidth: s * 0.4, borderBottomWidth: s * 0.25, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: c }} />
    <View style={{ width: 0, height: 0, borderLeftWidth: s * 0.08, borderRightWidth: s * 0.08, borderTopWidth: s * 0.2, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: c, position: 'absolute', bottom: s * 0.06, right: s * 0.06 }} />
  </View>
);

const StudioIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: s * 0.5, height: s * 0.5, backgroundColor: c, transform: [{ rotate: '45deg' }], borderRadius: 3 }} />
    <View style={{ width: s * 0.12, height: s * 0.12, borderRadius: s * 0.06, backgroundColor: '#0f172a', position: 'absolute' }} />
  </View>
);

const BellIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <View style={{ width: s, height: s, alignItems: 'center' }}>
    <View style={{ width: s * 0.6, height: s * 0.6, borderTopLeftRadius: s * 0.3, borderTopRightRadius: s * 0.3, borderWidth: 2, borderBottomWidth: 0, borderColor: c, position: 'absolute', top: s * 0.05 }} />
    <View style={{ width: s * 0.38, height: 2, backgroundColor: c, position: 'absolute', bottom: s * 0.22 }} />
    <View style={{ width: s * 0.12, height: s * 0.12, borderRadius: s * 0.06, backgroundColor: c, position: 'absolute', bottom: s * 0.1 }} />
  </View>
);

const ShareIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: s * 0.3, height: s * 0.3, borderRadius: s * 0.15, backgroundColor: c, position: 'absolute', top: s * 0.08 }} />
    <View style={{ width: s * 0.3, height: s * 0.3, borderRadius: s * 0.15, backgroundColor: c, position: 'absolute', bottom: s * 0.08, left: s * 0.05 }} />
    <View style={{ width: s * 0.3, height: s * 0.3, borderRadius: s * 0.15, backgroundColor: c, position: 'absolute', bottom: s * 0.08, right: s * 0.05 }} />
    <View style={{ width: 2, height: s * 0.3, backgroundColor: c, position: 'absolute', top: s * 0.28, left: s * 0.36, transform: [{ rotate: '60deg' }] }} />
    <View style={{ width: 2, height: s * 0.3, backgroundColor: c, position: 'absolute', top: s * 0.28, right: s * 0.36, transform: [{ rotate: '-60deg' }] }} />
  </View>
);

const CloseIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: s * 0.75, height: 2.5, backgroundColor: c, transform: [{ rotate: '45deg' }], borderRadius: 1, position: 'absolute' }} />
    <View style={{ width: s * 0.75, height: 2.5, backgroundColor: c, transform: [{ rotate: '-45deg' }], borderRadius: 1, position: 'absolute' }} />
  </View>
);

const BackIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => {
  const h = s / 2;
  return (
  <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: s * 0.6, height: 2.5, backgroundColor: c, borderRadius: 1, position: 'absolute', left: s * 0.15, top: h - 1.25, transform: [{ rotate: '0deg' }] }} />
    <View style={{ width: s * 0.25, height: 2.5, backgroundColor: c, borderRadius: 1, position: 'absolute', top: s * 0.25, left: s * 0.15, transform: [{ rotate: '-45deg' }] }} />
    <View style={{ width: s * 0.25, height: 2.5, backgroundColor: c, borderRadius: 1, position: 'absolute', bottom: s * 0.25, left: s * 0.15, transform: [{ rotate: '45deg' }] }} />
  </View>
  );
};

const PlusIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: s * 0.7, height: 2.5, backgroundColor: c, borderRadius: 1, position: 'absolute' }} />
    <View style={{ width: 2.5, height: s * 0.7, backgroundColor: c, borderRadius: 1, position: 'absolute' }} />
  </View>
);

const PlayIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: 0, height: 0, borderTopWidth: s * 0.3, borderBottomWidth: s * 0.3, borderLeftWidth: s * 0.4, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: c, marginLeft: s * 0.1 }} />
  </View>
);

const SparkleIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ position: 'absolute', width: s * 0.12, height: s * 0.5, backgroundColor: c, borderRadius: s * 0.06, top: 0 }} />
    <View style={{ position: 'absolute', width: s * 0.5, height: s * 0.12, backgroundColor: c, borderRadius: s * 0.06 }} />
    <View style={{ position: 'absolute', width: s * 0.08, height: s * 0.3, backgroundColor: c, borderRadius: s * 0.04, transform: [{ rotate: '45deg' }], top: s * 0.05, right: s * 0.05 }} />
    <View style={{ position: 'absolute', width: s * 0.08, height: s * 0.3, backgroundColor: c, borderRadius: s * 0.04, transform: [{ rotate: '-45deg' }], top: s * 0.05, left: s * 0.05 }} />
  </View>
);

const GifIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: s * 0.8, height: s * 0.6, borderRadius: 3, borderWidth: 2, borderColor: c, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: s * 0.06, height: s * 0.3, backgroundColor: c, marginHorizontal: 2, borderRadius: 1 }} />
      <View style={{ width: s * 0.06, height: s * 0.3, backgroundColor: c, marginHorizontal: 2, borderRadius: 1 }} />
      <View style={{ width: s * 0.06, height: s * 0.3, backgroundColor: c, marginHorizontal: 2, borderRadius: 1 }} />
    </View>
    <View style={{ width: s * 0.1, height: s * 0.1, borderTopWidth: 2, borderRightWidth: 2, borderColor: c, position: 'absolute', top: s * 0.12, right: s * 0.08, transform: [{ rotate: '45deg' }] }} />
  </View>
);

const ImportIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: s * 0.7, height: s * 0.55, borderRadius: 3, borderWidth: 2, borderColor: c, position: 'absolute', bottom: 0 }} />
    <View style={{ width: 2, height: s * 0.5, backgroundColor: c, position: 'absolute', top: 0 }} />
    <View style={{ width: 0, height: 0, borderLeftWidth: s * 0.12, borderRightWidth: s * 0.12, borderTopWidth: s * 0.14, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: c, position: 'absolute', top: s * 0.35 }} />
  </View>
);

const StickerIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: s * 0.75, height: s * 0.75, borderRadius: s * 0.12, backgroundColor: c, opacity: 0.3, position: 'absolute', top: s * 0.08, left: s * 0.08 }} />
    <View style={{ width: s * 0.75, height: s * 0.75, borderRadius: s * 0.12, borderWidth: 2, borderColor: c, position: 'absolute', top: 0, left: 0 }}>
      <View style={{ width: s * 0.12, height: s * 0.12, borderTopWidth: 2, borderRightWidth: 2, borderColor: c, position: 'absolute', bottom: -2, right: -2, backgroundColor: '#0f172a' }} />
    </View>
  </View>
);

const SettingsIcon: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <View style={{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: s * 0.65, height: s * 0.65, borderRadius: s * 0.07, borderWidth: 2.5, borderColor: c, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: s * 0.22, height: s * 0.22, borderRadius: s * 0.11, backgroundColor: c }} />
    </View>
  </View>
);
