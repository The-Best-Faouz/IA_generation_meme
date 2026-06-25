const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = mergeConfig(config, {
  resolver: {
    assetExts: [...config.resolver.assetExts, 'lottie'],
  },
});
