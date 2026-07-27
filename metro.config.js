const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('cjs');
config.resolver.conditionNames = ['react-native', 'browser', 'require', 'import', 'default'];
config.resolver.mainFields = ['react-native', 'browser', 'main', 'module'];
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
