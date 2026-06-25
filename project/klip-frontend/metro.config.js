const { getDefaultConfig, mergeConfig } = require('metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  return mergeConfig(config, {
    resolver: {
      assetExts: [...config.resolver.assetExts, 'lottie'],
    },
  });
})();
