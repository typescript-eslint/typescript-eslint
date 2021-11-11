import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
const replace = require('./rollup-plugin/replace');

module.exports = {
  input: 'src/linter/linter.js',
  output: {
    format: 'module',
    interop: 'auto',
    freeze: false,
    file: 'dist/index.js',
  },
  external: ['typescript', 'semver'],
  plugins: [
    replace({
      // verbose: true,
      alias: [
        {
          match: [
            /eslint\/lib\/(rule-tester|eslint|cli-engine|init)\//u,
            /eslint\/lib\/cli\.js$/,
            /experimental-utils\/dist\/eslint-utils\/RuleTester\.js$/,
            /experimental-utils\/dist\/ts-eslint\/CLIEngine\.js$/,
            /experimental-utils\/dist\/ts-eslint\/RuleTester\.js$/,
            // 'typescript-estree/dist/create-program/createWatchProgram.js',
            // 'typescript-estree/dist/create-program/createProjectProgram.js',
            // 'typescript-estree/dist/create-program/createIsolatedProgram.js',
            // 'eslint/lib/shared/ajv.js',
            // 'eslint/lib/shared/runtime-info.js',
          ],
          target: './src/mock/empty.js',
        },
        {
          match: /^assert$/u,
          target: './src/mock/assert.js',
        },
        {
          match: /^path$/u,
          target: './src/mock/path.js',
        },
        {
          match: /^util$/u,
          target: './src/mock/util.js',
        },
        {
          match: /^semver$/u,
          target: './src/mock/semver.js',
        },
      ],
      replace: [
        {
          match: /eslint\/lib\/linter\/rules\.js$/u,
          test: /require\(this\._rules\[ruleId\]\)/u,
          replace: 'null',
        },
        {
          test: /esquery\.parse\(/u,
          replace: 'esquery.default.parse(',
        },
        {
          test: /esquery\.matches\(/u,
          replace: 'esquery.default.matches(',
        },
        {
          test: /process\.env\.NODE_DEBUG/u,
          replace: 'false',
        },
        {
          test: /process\.env\.TIMING/u,
          replace: 'false',
        },
        {
          test: /process\.env\.IGNORE_TEST_WIN32/u,
          replace: 'true',
        },
      ],
    }),
    // nodePolyfills(),
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    json({ preferConst: true }),
  ],
};
