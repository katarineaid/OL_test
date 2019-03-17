const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractLESS = new ExtractTextPlugin('[name].bundle.css');

module.exports = {
  context: path.resolve(__dirname, './public/js'),
  entry: {
    geo: './index.js',
  },
  output: {
    path: path.resolve(__dirname, './public/assets'),
    filename: '[name].bundle.js',
    publicPath: '/assets',
    library: 'gisApi',
    libraryTarget: 'umd',
    crossOriginLoading: false,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      }
    ]
  },
};
