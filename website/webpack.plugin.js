// const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = function (/*context, options*/) {
  return {
    name: 'webpack-custom-plugin',
    configureWebpack(cfg, isServer) {
      return {
      };
    },
  };
};
