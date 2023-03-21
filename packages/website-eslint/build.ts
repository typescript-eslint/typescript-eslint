/* eslint-disable no-process-exit, no-console */

import * as fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import * as path from 'node:path';

import * as esbuild from 'esbuild';

function requireResolved(targetPath: string): string {
  return createRequire(__filename).resolve(targetPath);
}

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

function requireMock(targetPath: string): Promise<string> {
  return fs.readFile(requireResolved(targetPath), 'utf8');
}

function makeFilter(filePath: string | string[]): { filter: RegExp } {
  const paths = Array.isArray(filePath) ? filePath : [filePath];
  const norm = paths.map(item =>
    normalizePath(item).replace(/\//g, '[\\\\/]').replace(/\./g, '\\.'),
  );
  return { filter: new RegExp('(' + norm.join('|') + ')$') };
}

async function buildPackage(name: string, file: string): Promise<void> {
  const eslintRoot = requireResolved('eslint/package.json');
  const linterPath = path.join(eslintRoot, '../lib/linter/linter.js');
  const rulesPath = path.join(eslintRoot, '../lib/rules/index.js');

  const output = await esbuild.build({
    entryPoints: {
      [name]: requireResolved(file),
    },
    format: 'cjs',
    platform: 'browser',
    bundle: true,
    external: [],
    minify: true,
    treeShaking: true,
    write: true,
    target: 'es2020',
    sourcemap: 'linked',
    outdir: './dist/',
    supported: {},
    define: {
      'process.env.NODE_ENV': '"production"',
      'process.env.NODE_DEBUG': 'false',
      'process.env.IGNORE_TEST_WIN32': 'true',
      'process.env.DEBUG': 'false',
      'process.emitWarning': 'console.warn',
      'process.platform': '"browser"',
      'process.env.TIMING': 'undefined',
      'define.amd': 'false',
      global: 'window',
      // 'process.env': 'undefined',
      // process: 'undefined',
    },
    alias: {
      util: requireResolved('./src/mock/util.js'),
      assert: requireResolved('./src/mock/assert.js'),
      path: requireResolved('./src/mock/path.js'),
      typescript: requireResolved('./src/mock/typescript.js'),
      'lru-cache': requireResolved('./src/mock/lru-cache.js'),
    },
    plugins: [
      {
        name: 'replace-plugin',
        setup(build): void {
          build.onLoad(
            makeFilter([
              '/eslint-utils/rule-tester/RuleTester.js',
              '/utils/dist/ts-eslint/ESLint.js',
              '/utils/dist/ts-eslint/RuleTester.js',
              '/utils/dist/ts-eslint/CLIEngine.js',
            ]),
            async args => {
              console.log('onLoad:replace', args.path);
              const text = await requireMock('./src/mock/empty.js');
              return { contents: text, loader: 'js' };
            },
          );
          build.onLoad(
            makeFilter('/eslint/lib/unsupported-api.js'),
            async args => {
              console.log('onLoad:eslint:unsupported-api', args.path);
              let text = await requireMock('./src/mock/eslint-rules.js');
              // this is needed to bypass system module resolver
              text = text.replace('vt:eslint/rules', normalizePath(rulesPath));
              return { contents: text, loader: 'js' };
            },
          );
          build.onLoad(makeFilter('/eslint/lib/api.js'), async args => {
            console.log('onLoad:eslint', args.path);
            let text = await requireMock('./src/mock/eslint.js');
            // this is needed to bypass system module resolver
            text = text.replace('vt:eslint/linter', normalizePath(linterPath));
            return { contents: text, loader: 'js' };
          });
          build.onLoad(
            makeFilter('/typescript-estree/dist/index.js'),
            async args => {
              console.log('onLoad:typescript-estree', args.path);
              const text = await requireMock('./src/mock/ts-estree.js');
              return { contents: text, loader: 'js' };
            },
          );
        },
      },
    ],
  });

  if (output.errors) {
    for (const error of output.errors) {
      console.error(error);
    }
    for (const warning of output.warnings) {
      console.warn(warning);
    }

    if (output.errors.length > 0) {
      throw new Error('error occurred');
    }
  }
}

console.time('building eslint for web');

buildPackage('index', './src/index.js')
  .then(() => {
    console.timeEnd('building eslint for web');
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
