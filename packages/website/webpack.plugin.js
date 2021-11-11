const webpack = require('webpack');

module.exports = function (/*context, options*/) {
  return {
    name: 'webpack-custom-plugin',
    configureWebpack(cfg, isServer) {
      return {
        externals: {
          typescript: 'window.ts',
        },
        plugins: [
          new webpack.DefinePlugin({
            'process.env.IS_SERVER': JSON.stringify(isServer),
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
        ],
      };
    },
  };
};
