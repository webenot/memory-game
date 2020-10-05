const path = require('path');
const webpack = require('webpack');

require('dotenv').config();

const projectConfig = require(`./frontend/${process.env.CURRENT_APP}/webpack.config.js`);

const isProduction = (process.env.NODE_ENV === 'production');

// Additional plugins
const TerserJSPlugin = require('terser-webpack-plugin');
const Cleanplugin = require('clean-webpack-plugin').CleanWebpackPlugin;

const webpackConfig = {
  // Режим
  mode: (isProduction) ? 'production' : 'development',

  optimization: {
    minimizer: [ new TerserJSPlugin({}) ],
    usedExports: true,
  },

  // слежение
  watch: !isProduction,

  devtool: (isProduction) ? false : 'inline-source-map',

  // Базовый путь к проекту
  context: path.resolve(__dirname, 'frontend', process.env.CURRENT_APP),

  // Точки входа JS
  entry: projectConfig.entry,
  resolve: projectConfig.resolve,
  // Путь для собранных файлов
  output: {
    filename: isProduction ? '[name].[hash:8].js' : '[name].js',
    path: path.resolve(__dirname, 'applications', process.env.CURRENT_APP, 'public', 'js'),
    publicPath: '.',
  },
  module: { rules: [] },

  plugins: [
    new webpack.DefinePlugin({ NODE_ENV: JSON.stringify(process.env.NODE_ENV) }),
    new Cleanplugin({
      verbose: true,
      cleanStaleWebpackAssets: false,
    }),
  ],
};

if (projectConfig.module.rules) {
  webpackConfig.module.rules = webpackConfig.module.rules.concat(projectConfig.module.rules);
}
if (projectConfig.plugins) {
  webpackConfig.plugins = webpackConfig.plugins.concat(projectConfig.plugins);
}
// PRODUCTION ONLY
if (isProduction) {
  webpackConfig.plugins.push(
    new webpack.LoaderOptionsPlugin({ minimize: true }),
  );
}

module.exports = webpackConfig;
