const path = require('path');

module.exports = function (api) {
  api.cache(false);
  
  // Caminho absoluto para .env
  const envPath = path.join(__dirname, '.env');
  console.log('[BABEL] Carregando variáveis de:', envPath);
  
  let plugins = [
    'expo-router/babel',
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: envPath,
      safe: false,
      allowUndefined: false,
    }],
  ]

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins,
  };
};