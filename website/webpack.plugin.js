// const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

module.exports = function (/*context, options*/) {
  return {
    name: 'webpack-custom-plugin',
    configureWebpack(cfg, isServer) {
      return {
        module: {
          rules: [
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
        resolve: {
          exportsFields: [],
          alias: {
            '@typescript-eslint/experimental-utils/dist/ts-eslint/index.js': false,
            '@typescript-eslint/typescript-estree/dist/create-program/createWatchProgram.js': false,
            '@typescript-eslint/typescript-estree/dist/create-program/createProjectProgram.js': false,
            '@typescript-eslint/typescript-estree/dist/create-program/createIsolatedProgram.js': false,
            '@typescript-eslint/experimental-utils/dist/eslint-utils/RuleTester.js': false,

            'eslint/lib/cli-engine/cli-engine': false,
            'eslint/lib/cli.js': false,
            'eslint/lib/eslint': false,
            'eslint/lib/eslint/index.js': false,
            'eslint/lib/eslint/eslint.js': false,
            'eslint/lib/cli-engine/cli-engine.js': false,
            'eslint/lib/cli-engine/load-rules.js': false,
            'eslint/lib/rule-tester/index.js': false,
            'eslint/lib/rule-tester/rule-tester.js': false,
            'eslint/lib/shared/ajv.js': false,
            'eslint/lib/shared/runtime-info.js': false,
            'eslint/lib/init/autoconfig.js': false,
            'eslint/lib/init/config-file.js': false,
            'eslint/lib/init/config-initializer.js': false,
            'eslint/lib/init/config-rule.js': false,
            'eslint/lib/init/npm-utils.js': false,
            'eslint/lib/init/source-code-utils.js': false,
          },
          fallback: {
            assert: require.resolve('assert'),
            fs: false,
            os: require.resolve('os-browserify/browser'),
            tty: false,
            path: require.resolve('path-browserify'),
            util: require.resolve('util'),
            crypto: false,
          },
        },
        externals: {
          typescript: 'window.ts',
        },
        plugins: [
          new webpack.DefinePlugin({
            'process.env': {
              IS_SERVER: JSON.stringify(isServer),
              TS_VERSION: JSON.stringify(
                require('typescript/package.json').version,
              ),
              ESLINT_VERSION: JSON.stringify(
                require('eslint/package.json').version,
              ),
              TS_ESLINT_VERSION: JSON.stringify(
                require('@typescript-eslint/eslint-plugin/package.json')
                  .version,
              ),
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
            /eslint$/,
            path.resolve(__dirname, 'src/modules/eslint.js'),
          ),
          new webpack.NormalModuleReplacementPlugin(
            /eslint\/use-at-your-own-risk$/,
            path.resolve(__dirname, 'src/modules/eslint-rules.js'),
          ),
          new webpack.NormalModuleReplacementPlugin(
            /@eslint\/eslintrc\/universal$/,
            path.resolve(__dirname, 'src/modules/eslintrc.js'),
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
