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
      'react-native/split-platform-components': 'error',
      'react-native/no-inline-styles': 'error',
      'react-native/no-color-literals': 'error',
      'react-native/no-raw-text': 'off',
    },
  },
  {
    ignores: [
      'dist/*',
      '.expo/*',
      'business-admin/*',
      'supabase/functions/*',
      'scripts/*',
      'jest.setup.js'
    ],
  },
]);
