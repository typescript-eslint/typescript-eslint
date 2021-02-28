const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');

console.log(path.resolve(__dirname, '../../node_modules/monaco-editor'));

module.exports = function (context, options) {
  return {
    name: 'monaco-editor',
    configureWebpack(config, isServer) {
      return {
        module: {
          rules: [
            {
              test: /\.ttf$/,
              use: ['file-loader'],
            },
          ],
        },
        plugins: [
          new MonacoWebpackPlugin({
            languages: ['typescript'],
          }),
        ],
      };
    },
  };
};
