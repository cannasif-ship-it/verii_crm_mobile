module.exports = function (api) {
  api.cache(true);

  return {
    presets: [['babel-preset-expo'], 'nativewind/babel'],

    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],

          alias: {
            '@': './',
            'tailwind.config': './tailwind.config.js',
          },
        },
      ],
      // 'react-native-worklets/plugin',  <-- BU SATIRI SİLDİK, HATA BURADAYDI.
      
      // Reanimated plugin'i HER ZAMAN listenin en sonunda olmalıdır.
      'react-native-reanimated/plugin',
    ],
  };
};