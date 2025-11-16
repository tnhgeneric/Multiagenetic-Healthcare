// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

// Add this to ensure proper routing
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs', 'tsx', 'ts'];
config.resolver.resolverMainFields = ['browser', 'main'];

// Force environment variables to be available
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
  env: {
    EXPO_ROUTER_APP_ROOT: './app',
  },
});

module.exports = config;