// const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

// TODO: find better way to do this
const filesToSkip = [
  '@typescript-eslint/experimental-utils/dist/ts-eslint/index.js',
  '@typescript-eslint/typescript-estree/dist/create-program/createWatchProgram.js',
  '@typescript-eslint/typescript-estree/dist/create-program/createProjectProgram.js',
  '@typescript-eslint/typescript-estree/dist/create-program/createIsolatedProgram.js',
  '@typescript-eslint/experimental-utils/dist/eslint-utils/RuleTester.js',
  'eslint/lib/cli.js',
  'eslint/lib/eslint',
  'eslint/lib/eslint/index.js',
  'eslint/lib/eslint/eslint.js',
  'eslint/lib/cli-engine/cli-engine.js',
  'eslint/lib/cli-engine/load-rules.js',
  'eslint/lib/rule-tester/index.js',
  'eslint/lib/rule-tester/rule-tester.js',
  'eslint/lib/shared/ajv.js',
  'eslint/lib/shared/runtime-info.js',
  'eslint/lib/init/autoconfig.js',
  'eslint/lib/init/config-file.js',
  'eslint/lib/init/config-initializer.js',
  'eslint/lib/init/config-rule.js',
  'eslint/lib/init/npm-utils.js',
  'eslint/lib/init/source-code-utils.js',
  '@eslint/eslintrc',
];

module.exports = function (/*context, options*/) {
  return {
    name: 'monaco-editor',
    configureWebpack(cfg, isServer) {
      return {
        module: {
          rules: [
            {
              test: filesToSkip.map(file => require.resolve(file)),
              use: 'null-loader',
            },
            {
              test: /\.js$/,
              loader: 'string-replace-loader',
              options: {
                multiple: [
                  {
                    search: '__importStar(require("typescript"))',
                    replace: 'window.ts',
                  },
                ],
              },
            },
          ],
        },
        externals: {
          // fs: 'window.fs',
          // os: 'window.os',
          // tty: 'window.tty',
          typescript: 'window.ts',
        },
        plugins: [
          new webpack.DefinePlugin({
            'process.env': {
              IS_SERVER: JSON.stringify(isServer),
            },
          }),
          new webpack.NormalModuleReplacementPlugin(
            /globby/,
            path.resolve(__dirname, 'src/modules/globby.js'),
          ),
          new webpack.NormalModuleReplacementPlugin(
            /resolve-from/,
            path.resolve(__dirname, 'src/modules/resolve-from.js'),
          ),
          new webpack.NormalModuleReplacementPlugin(
            /esquery/,
            require.resolve('esquery/dist/esquery.js'),
          ),
          new webpack.NormalModuleReplacementPlugin(
            /semver/,
            path.resolve(__dirname, 'src/modules/semver.js'),
          ),
          new webpack.NormalModuleReplacementPlugin(
            /is-glob/,
            path.resolve(__dirname, 'src/modules/is-glob.js'),
          ),
        ],
      };
    },
  };
};
