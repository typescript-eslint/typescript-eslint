import * as fs from 'fs';
import fetch from 'cross-fetch';
import * as path from 'path';

const baseHost = 'https://www.staging-typescript.org';

async function getFileAndStoreLocally(
  url: string,
  path: string,
  editFunc: (arg: string) => string = (text: string): string => text,
): Promise<void> {
  const response = await fetch(baseHost + url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const contents = await response.text();
  fs.writeFileSync(path, editFunc(contents), 'utf8');
}

async function main(): Promise<void> {
  const vendor = path.join(
    __dirname,
    '..',
    'packages',
    'website',
    'src',
    'vendor',
  );
  const ds = path.join(vendor, 'ds');

  if (!fs.existsSync(vendor)) {
    fs.mkdirSync(vendor);
  }
  if (!fs.existsSync(ds)) {
    fs.mkdirSync(ds);
  }

  // The API for the monaco typescript worker
  await getFileAndStoreLocally(
    '/js/sandbox/tsWorker.d.ts',
    path.join(vendor, 'tsWorker.d.ts'),
  );

  // The Design System DTS
  await getFileAndStoreLocally(
    '/js/playground/ds/createDesignSystem.d.ts',
    path.join(ds, 'createDesignSystem.d.ts'),
    text => {
      return text.replace('typescriptlang-org/static/js/sandbox', '../sandbox');
    },
  );

  // Util funcs
  await getFileAndStoreLocally(
    '/js/playground/pluginUtils.d.ts',
    path.join(vendor, 'pluginUtils.d.ts'),
    text => {
      return text.replace('from "@typescript/sandbox"', 'from "./sandbox"');
    },
  );

  // TS-VFS
  await getFileAndStoreLocally(
    '/js/sandbox/vendor/typescript-vfs.d.ts',
    path.join(vendor, 'typescript-vfs.d.ts'),
    text => {
      const removeImports = text.replace(
        '/// <reference types="lz-string" />',
        '',
      );
      return removeImports.replace('import("lz-string").LZStringStatic', 'any');
    },
  );

  // Sandbox
  await getFileAndStoreLocally(
    '/js/sandbox/index.d.ts',
    path.join(vendor, 'sandbox.d.ts'),
    text => {
      return text
        .replace(/import lzstring/g, '// import lzstring')
        .replace('"./vendor/typescript-vfs"', "'./typescript-vfs'")
        .replace('lzstring: typeof lzstring', '// lzstring: typeof lzstring');
    },
  );

  // Playground
  await getFileAndStoreLocally(
    '/js/playground/index.d.ts',
    path.join(vendor, '/playground.d.ts'),
    text => {
      const replaceSandbox = text.replace(/@typescript\/sandbox/g, './sandbox');
      const replaceTSVFS = replaceSandbox.replace(
        /typescriptlang-org\/static\/js\/sandbox\/vendor\/typescript-vfs/g,
        './typescript-vfs',
      );
      const removedLZ = replaceTSVFS.replace(
        'lzstring: typeof',
        '// lzstring: typeof',
      );
      const removedWorker = removedLZ.replace(
        'getWorkerProcess',
        '// getWorkerProcess',
      );
      return removedWorker.replace('ui:', '// ui:');
    },
  );
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
