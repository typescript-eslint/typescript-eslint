import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import fetch from 'cross-fetch';
import makeDir from 'make-dir';
import prettier from 'prettier';
import { rimraf } from 'rimraf';

const BASE_HOST = 'https://www.staging-typescript.org';

const banner = [
  '/**********************************************',
  ' *      DO NOT MODIFY THIS FILE MANUALLY      *',
  ' *                                            *',
  ' *     THIS FILE HAS BEEN FETCHED FROM THE    *',
  ' *      TYPESCRIPT PLAYGROUND SOURCE CODE.    *',
  ' *                                            *',
  ' *    YOU CAN REGENERATE THESE FILES USING    *',
  ' *          yarn generate-website-dts         *',
  ' **********************************************/',
];

async function getFileAndStoreLocally(
  url: string,
  path: string,
  editFunc: (arg: string) => string = (text: string): string => text,
): Promise<void> {
  console.log('Fetching', url);
  const response = await fetch(BASE_HOST + url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const config = await prettier.resolveConfig(path);

  let contents = await response.text();
  contents = [...banner, '', editFunc(contents)].join('\n');
  contents = prettier.format(contents, {
    parser: 'typescript',
    ...config,
  });

  await fs.writeFile(path, contents, 'utf8');
}

function replaceImports(text: string, from: string, to: string): string {
  const regex = new RegExp(`from ["']${from}["']`, 'g');
  const regex2 = new RegExp(`import\\(["']${from}["']\\)`, 'g');
  return text.replace(regex, `from '${to}'`).replace(regex2, `import('${to}')`);
}

function injectImports(text: string, from: string, safeName: string): string {
  const regex = new RegExp(`import\\(["']${from}["']\\)`, 'g');
  if (regex.test(text)) {
    return (
      `import type * as ${safeName} from '${from}';\n` +
      text.replace(regex, safeName)
    );
  }
  return text;
}

function processFiles(text: string): string {
  let result = text;
  result = injectImports(result, 'monaco-editor', 'MonacoEditor');
  result = injectImports(result, 'typescript', 'ts');
  result = replaceImports(result, './vendor/lzstring.min', 'lz-string');
  result = replaceImports(
    result,
    './vendor/typescript-vfs',
    './typescript-vfs',
  );
  // replace the import of the worker with the type
  result = result.replace(
    /import\s*\{\s*TypeScriptWorker\s*}\s*from\s*['"].\/tsWorker['"];/,
    'import TypeScriptWorker = MonacoEditor.languages.typescript.TypeScriptWorker;',
  );
  // replace all imports with import type
  result = result.replace(/^import\s+(?!type)/gm, 'import type ');
  return result;
}

async function main(): Promise<void> {
  const vendor = path.join(__dirname, '..', 'src', 'vendor');

  console.log('Cleaning...');
  await rimraf(vendor);
  await makeDir(vendor);

  // TS-VFS
  await getFileAndStoreLocally(
    '/js/sandbox/vendor/typescript-vfs.d.ts',
    path.join(vendor, 'typescript-vfs.d.ts'),
    processFiles,
  );

  // Sandbox
  await getFileAndStoreLocally(
    '/js/sandbox/index.d.ts',
    path.join(vendor, 'sandbox.d.ts'),
    processFiles,
  );
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
