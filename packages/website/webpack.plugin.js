// eslint-disable-next-line @typescript-eslint/no-require-imports
const CopyPlugin = require('copy-webpack-plugin');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('node:path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpack = require('webpack');

module.exports = function (/*context, options*/) {
  return {
    configureWebpack() {
      return {
        externals: {
          typescript: 'window.ts',
        },
        plugins: [
          new webpack.DefinePlugin({
            'process.env.ESLINT_VERSION': JSON.stringify(
              require('eslint/package.json').version,
            ),
            'process.env.TS_ESLINT_VERSION': JSON.stringify(
              require('@typescript-eslint/eslint-plugin/package.json').version,
            ),
            'process.env.TS_VERSION': JSON.stringify(
              require('typescript/package.json').version,
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
    name: 'webpack-custom-plugin',
  };
};
