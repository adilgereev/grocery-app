const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/**
 * Исправление для Web: принудительно используем CommonJS версии библиотек.
 *
 * Многие пакеты (zustand и др.) в conditional exports при условии "import"
 * отдают ESM-билды (.mjs) с import.meta.env, который Metro для Web
 * не умеет транспилировать в не-модульный бандл → SyntaxError.
 *
 * Решение: отключаем package exports-резолв (unstable_enablePackageExports),
 * чтобы Metro использовал resolverMainFields и находил CJS-версии (.js)
 * вместо ESM (.mjs).
 *
 * Дефолтные resolverMainFields: ['react-native', 'browser', 'main']
 * сохранены — мобильные платформы резолвятся через 'react-native' поле,
 * а web — через 'browser' или 'main' → CJS без import.meta.
 */
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
