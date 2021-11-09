const webpack = require('webpack');
const path = require('path');

module.exports = function (/*context, options*/) {
  return {
    name: 'webpack-custom-plugin',
    configureWebpack(cfg, isServer) {
      const emptyModules = [
        // TODO; verify wy this is not working, we don't want to import those files at all in build
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
      ];

      const modules = {
        getESLintCoreRule: 'src/modules/getESLintCoreRule.js',
        globby: 'src/modules/globby.js',
        'resolve-from': 'src/modules/resolve-from.js',
        'import-fresh': 'src/modules/import-fresh.js',
        semver: 'src/modules/semver.js',
        'is-glob': 'src/modules/is-glob.js',
      };

      return {
        module: {
          rules: [
            {
              test: /\.[tj]sx?$/,
              loader: 'string-replace-loader',
              include: [
                path.resolve('src'),
                path.resolve('../../node_modules'),
              ],
              enforce: 'pre',
              options: {
                multiple: [
                  {
                    search: 'semver.major(package_json_1.version) >= 8',
                    replace: 'true',
                  },
                ],
              },
            },
          ],
        },
        resolve: {
          fallback: {
            assert: require.resolve('assert'),
            fs: false,
            os: require.resolve('os-browserify/browser'),
            tty: false,
            module: false,
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
          ...emptyModules.map(
            item =>
              new webpack.NormalModuleReplacementPlugin(
                new RegExp(item),
                path.resolve(
                  __dirname,
                  path.resolve(__dirname, 'src/modules/empty.js'),
                ),
              ),
          ),
          ...Object.entries(modules).map(
            item =>
              new webpack.NormalModuleReplacementPlugin(
                new RegExp('(.*)' + item[0]),
                path.resolve(__dirname, path.resolve(__dirname, item[1])),
              ),
          ),
        ],
      };
    },
  };
};
