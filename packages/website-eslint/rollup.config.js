import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const replace = require('./rollup-plugin/replace');

module.exports = {
  input: 'src/linter/linter.js',
  output: {
    format: 'amd',
    interop: 'auto',
    freeze: false,
    sourcemap: true,
    file: 'dist/index.js',
  },
  external: ['vs/language/typescript/tsWorker'],
  plugins: [
    terser({
      keep_classnames: true,
    }),
    replace({
      // verbose: true,
      alias: [
        {
          // those files should be omitted, we do not want them to be exposed to web
          match: [
            /eslint\/lib\/(rule-tester|eslint|cli-engine|init)\//u,
            /eslint\/lib\/cli\.js$/,
            /utils\/dist\/eslint-utils\/rule-tester\/RuleTester\.js$/,
            /utils\/dist\/ts-eslint\/CLIEngine\.js$/,
            /utils\/dist\/ts-eslint\/RuleTester\.js$/,
            /typescript-estree\/dist\/create-program\/getWatchProgramsForProjects\.js/,
            /typescript-estree\/dist\/create-program\/createProjectProgram\.js/,
            /typescript-estree\/dist\/create-program\/createIsolatedProgram\.js/,
            /typescript-estree\/dist\/clear-caches\.js/,
            /utils\/dist\/ts-eslint\/ESLint\.js/,
            /ajv\/lib\/definition_schema\.js/,
            /stream/,
            /os/,
            /fs/,
          ],
          target: './src/mock/empty.js',
        },
        {
          // use window.ts instead of bundling typescript
          match: /typescript$/u,
          target: './src/mock/typescript.js',
        },
        {
          // assert for web
          match: /^assert$/u,
          target: './src/mock/assert.js',
        },
        {
          // path for web
          match: /^path$/u,
          target: './src/mock/path.js',
        },
        {
          // util for web
          match: /^util$/u,
          target: './src/mock/util.js',
        },
        {
          // semver simplified, solve issue with circular dependencies
          match: /semver$/u,
          target: './src/mock/semver.js',
        },
        {
          match: /^globby$/u,
          target: './src/mock/globby.js',
        },
        {
          match: /^is-glob$/u,
          target: './src/mock/is-glob.js',
        },
      ],
      replace: [
        {
          // we do not want dynamic imports
          match: /eslint\/lib\/linter\/rules\.js$/u,
          test: /require\(this\._rules\[ruleId\]\)/u,
          replace: 'null',
        },
        {
          // esquery has both browser and node versions, we are bundling browser version that has different export
          test: /esquery\.parse\(/u,
          replace: 'esquery.default.parse(',
        },
        {
          // esquery has both browser and node versions, we are bundling browser version that has different export
          test: /esquery\.matches\(/u,
          replace: 'esquery.default.matches(',
        },
        {
          // replace all process.env.NODE_DEBUG with false
          test: /process\.env\.NODE_DEBUG/u,
          replace: 'false',
        },
        {
          // replace all process.env.TIMING with false
          test: /process\.env\.TIMING/u,
          replace: 'false',
        },
        {
          // replace all process.env.IGNORE_TEST_WIN32 with true
          test: /process\.env\.IGNORE_TEST_WIN32/u,
          replace: 'true',
        },
      ],
    }),
    resolve({
      browser: true,
      exportConditions: ['require'],
      preferBuiltins: false,
    }),
    commonjs(),
    json({ preferConst: true }),
  ],
};
