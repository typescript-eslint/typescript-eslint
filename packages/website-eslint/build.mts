/* eslint-disable no-console */

import * as esbuild from 'esbuild';
import * as fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);

function requireResolved(targetPath: string): string {
  return createRequire(__filename).resolve(targetPath);
}

function normalizePath(filePath: string): string {
  return filePath.replaceAll('\\', '/');
}

function requireMock(targetPath: string): Promise<string> {
  return fs.readFile(requireResolved(targetPath), 'utf8');
}

function makeFilter(filePath: string | string[]): { filter: RegExp } {
  const paths = Array.isArray(filePath) ? filePath : [filePath];
  const norm = paths.map(item =>
    normalizePath(item).replaceAll('/', '[\\\\/]').replaceAll('.', '\\.'),
  );
  return { filter: new RegExp(`(${norm.join('|')})$`) };
}

function createResolve(
  targetPath: string,
  join: string,
): esbuild.OnResolveResult {
  const resolvedPackage = requireResolved(`${targetPath}/package.json`);
  return {
    path: path.join(resolvedPackage, '../src/', join),
  };
}

async function buildPackage(name: string, file: string): Promise<void> {
  const eslintRoot = requireResolved('eslint/package.json');
  const linterPath = path.join(eslintRoot, '../lib/linter/linter.js');
  const rulesPath = path.join(eslintRoot, '../lib/rules/index.js');

  await esbuild.build({
    alias: Object.fromEntries(
      [
        // built-in Node packages — alias each twice — both with and without the `node:` prefix
        ...['util', 'assert', 'path'].flatMap(from => [from, `node:${from}`]),
        // other NPM packages
        'typescript',
        'typescript/lib/tsserverlibrary',
        'lru-cache',
      ].map(from => [
        from,
        requireResolved(
          `./src/mock/${from.split('/')[0].split(':').at(-1)}.js`,
        ),
      ]),
    ),
    banner: {
      // https://github.com/evanw/esbuild/issues/819
      js: `define(['exports', 'vs/language/typescript/tsWorker'], function (exports) {`,
    },
    bundle: true,
    define: {
      'define.amd': 'false',
      global: 'window',
      'process.emitWarning': 'console.warn',
      'process.env.DEBUG': 'false',
      'process.env.IGNORE_TEST_WIN32': 'true',
      'process.env.NODE_DEBUG': 'false',
      'process.env.NODE_ENV': '"production"',
      'process.env.TIMING': 'undefined',
      'process.platform': '"browser"',
    },
    entryPoints: {
      [name]: requireResolved(file),
    },
    external: [],
    footer: {
      // https://github.com/evanw/esbuild/issues/819
      js: `});`,
    },
    format: 'cjs',
    minify: true,
    outdir: './dist/',
    platform: 'browser',
    plugins: [
      {
        name: 'replace-plugin',
        setup(build): void {
          build.onLoad(
            makeFilter([
              '/getParsedConfigFile.ts',
              '/ts-eslint/ESLint.ts',
              '/ts-eslint/RuleTester.ts',
              '/ts-eslint/CLIEngine.ts',
            ]),
            async args => {
              console.log('onLoad:replace', args.path);
              const contents = await requireMock('./src/mock/empty.js');
              return { contents, loader: 'js' };
            },
          );
          build.onLoad(
            makeFilter('/eslint/lib/unsupported-api.js'),
            async args => {
              console.log('onLoad:eslint:unsupported-api', args.path);
              let contents = await requireMock('./src/mock/eslint-rules.js');
              // this is needed to bypass system module resolver
              contents = contents.replace(
                'vt:eslint/rules',
                normalizePath(rulesPath),
              );
              return { contents, loader: 'js' };
            },
          );
          build.onLoad(makeFilter('/eslint/lib/api.js'), async args => {
            console.log('onLoad:eslint', args.path);
            let text = await requireMock('./src/mock/eslint.js');
            // this is needed to bypass system module resolver
            text = text.replace('vt:eslint/linter', normalizePath(linterPath));
            return { contents: text, loader: 'js' };
          });
          build.onLoad(makeFilter(['/parser/src/parser.ts']), async args => {
            console.log('onLoad:replace', args.path);
            const contents = await requireMock('./src/mock/parser.js');
            return { contents, loader: 'js' };
          });
          build.onResolve(
            makeFilter([
              '@typescript-eslint/typescript-estree',
              '@typescript-eslint/typescript-estree/use-at-your-own-risk',
            ]),
            () =>
              createResolve(
                '@typescript-eslint/typescript-estree',
                'use-at-your-own-risk.ts',
              ),
          );
          const anyAlias = /^(@typescript-eslint\/[a-z-]+)\/([a-z-]+)$/;
          build.onResolve({ filter: anyAlias }, args => {
            const parts = anyAlias.exec(args.path);
            if (parts) {
              return createResolve(parts[1], `${parts[2]}/index.ts`);
            }
            return null;
          });
          build.onResolve(makeFilter('@typescript-eslint/[a-z-]+'), args =>
            createResolve(args.path, 'index.ts'),
          );
          build.onEnd(e => {
            for (const error of e.errors) {
              console.error(error);
            }
            for (const warning of e.warnings) {
              console.warn(warning);
            }
          });
        },
      },
    ],
    sourcemap: 'linked',
    supported: {},
    target: 'es2020',
    treeShaking: true,
    write: true,
  });
}

console.time('building eslint for web');
await buildPackage('index', './src/index.js');
console.timeEnd('building eslint for web');
