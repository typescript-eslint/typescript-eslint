const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = function (/*context, options*/) {
  return {
    name: 'webpack-custom-plugin',
    configureWebpack() {
      return {
        externals: {
          typescript: 'window.ts',
        },
        plugins: [
          new webpack.DefinePlugin({
            'process.env.TS_VERSION': JSON.stringify(
              require('typescript/package.json').version,
            ),
            'process.env.ESLINT_VERSION': JSON.stringify(
              require('eslint/package.json').version,
            ),
            'process.env.TS_ESLINT_VERSION': JSON.stringify(
              require('@typescript-eslint/eslint-plugin/package.json').version,
            ),
          }),
          new CopyPlugin({
            patterns: [
              {
                from: path.dirname(
                  require.resolve('@typescript-eslint/website-eslint'),
                ),
                to: './sandbox/',
              },
            ],
          }),
        ],
      };
    },
  };
};
