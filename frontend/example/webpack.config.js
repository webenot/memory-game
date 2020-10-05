const path = require('path');
require('@babel/polyfill');

module.exports = {
  entry: {
    // Основной файл приложения
    index: [
      '@babel/polyfill',
      path.resolve(__dirname, 'index.js'),
    ],
  },
  module: {
    rules: [
      // ts rule
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /^(node_modules)$/,
      },
      // js rule
      {
        test: /\.m?jsx?$/i,
        exclude: /^(node_modules)$/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: './babel.config.js',
            cacheDirectory: true,
          },
        },
      },
    ],
  },
  resolve: { extensions: [ '.ts', '.tsx', '.js' ] },
};
