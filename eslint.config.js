// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const reactNative = require('eslint-plugin-react-native');

module.exports = defineConfig([
  ...expoConfig,
  {
    plugins: {
      'react-native': reactNative,
    },
    rules: {
      'react-native/no-unused-styles': 'error',
      'react-native/split-platform-components': 'warn',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-color-literals': 'warn',
      'react-native/no-raw-text': 'off', // Отключено, так как Expo Router использует текстовые узлы в Link и тп
    },
  },
  {
    ignores: ['dist/*', '.expo/*'],
  },
]);
