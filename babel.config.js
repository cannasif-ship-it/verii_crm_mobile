module.exports = function (api) {
  api.cache(true);

  return {
    presets: [[
      'babel-preset-expo',
      {
        worklets: false,
        reanimated: false,
      },
    ], 'nativewind/babel'],

    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],

          alias: {
            '@': './src',
            'tailwind.config': './tailwind.config.js',
          },
        },
      ],
    ],
  };
};
