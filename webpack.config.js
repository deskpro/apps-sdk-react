const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = (env = {}) => {
  const isProduction = env.production === true;

  return {
    context: path.resolve(__dirname, './'),

    devtool: (() => {
      return isProduction
        ? 'source-map'
        : 'cheap-module-eval-source-map';
    })(),

    entry: {
      index: './src/index.js'
    },

    output: {
      path:          path.resolve(__dirname, 'dist'),
      filename:      'index.js',
      library:       '@deskpro/apps-sdk-react',
      libraryTarget: 'umd'
    },

    externals: [
      {
        'react': {
          root:      'react',
          commonjs2: 'react',
          commonjs:  'react',
          amd:       'react'
        },
        'react-dom': {
          root:      'react-dom',
          commonjs2: 'react-dom',
          commonjs:  'react-dom',
          amd:       'react-dom'
        },
        '@deskpro/apps-sdk-core': {
          root:      '@deskpro/apps-sdk-core',
          commonjs2: '@deskpro/apps-sdk-core',
          commonjs:  '@deskpro/apps-sdk-core',
          amd:       '@deskpro/apps-sdk-core'
        },
        '@deskpro/react-components': {
          root:      '@deskpro/react-components',
          commonjs2: '@deskpro/react-components',
          commonjs:  '@deskpro/react-components',
          amd:       '@deskpro/react-components'
        }
      }
    ],

    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          exclude: /(node_modules)/,
          loader: require.resolve('babel-loader')
        }
      ]
    },

    plugins: (() => {
      return isProduction ? [
        new UglifyJSPlugin()
      ] : [];
    }),

    resolve: {
      extensions: ['.js', '.jsx']
    }
  };
};


