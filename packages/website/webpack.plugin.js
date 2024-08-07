// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpack = require('webpack');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('node:path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
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
            // TODO: Move back to package.json's version shortly after v8 launches
            'process.env.TS_ESLINT_VERSION': JSON.stringify('v8'),
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
