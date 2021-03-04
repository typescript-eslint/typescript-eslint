import 'isomorphic-fetch';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const getFileAndStoreLocally = async (
  url: string,
  path: string,
  editFunc: (arg: string) => string = (text: string): string => text,
): Promise<void> => {
  const packageJSON = await fetch(url);
  const contents = await packageJSON.text();
  writeFileSync(path, editFunc(contents), 'utf8');
};

async function run(): Promise<void> {
  const vendor = join(__dirname, '..', 'website', 'src', 'vendor');
  const ds = join(vendor, 'ds');

  if (!existsSync(vendor)) {
    mkdirSync(vendor);
  }
  if (!existsSync(ds)) {
    mkdirSync(ds);
  }

  const host = 'https://www.staging-typescript.org';

  // The API for the monaco typescript worker
  await getFileAndStoreLocally(
    host + '/js/sandbox/tsWorker.d.ts',
    join(vendor, 'tsWorker.d.ts'),
  );

  // The Design System DTS
  await getFileAndStoreLocally(
    host + '/js/playground/ds/createDesignSystem.d.ts',
    join(ds, 'createDesignSystem.d.ts'),
    text => {
      return text.replace('typescriptlang-org/static/js/sandbox', '../sandbox');
    },
  );

  // Util funcs
  await getFileAndStoreLocally(
    host + '/js/playground/pluginUtils.d.ts',
    join(vendor, 'pluginUtils.d.ts'),
    text => {
      return text.replace('from "@typescript/sandbox"', 'from "./sandbox"');
    },
  );

  // TS-VFS
  await getFileAndStoreLocally(
    host + '/js/sandbox/vendor/typescript-vfs.d.ts',
    join(vendor, 'typescript-vfs.d.ts'),
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
    host + '/js/sandbox/index.d.ts',
    join(vendor, 'sandbox.d.ts'),
    text => {
      const removeImports = text
        .replace(/^import/g, '// import')
        .replace(/\nimport/g, '\n// import');
      const replaceTSVFS = removeImports.replace(
        '// import * as tsvfs from "./vendor/typescript-vfs"',
        "\nimport * as tsvfs from './typescript-vfs'",
      );
      const removedLZ = replaceTSVFS.replace(
        'lzstring: typeof lzstring',
        '// lzstring: typeof lzstring',
      );
      return 'import { TypeScriptWorker } from "./tsWorker";' + removedLZ;
    },
  );

  // Playground
  await getFileAndStoreLocally(
    host + '/js/playground/index.d.ts',
    join(vendor, '/playground.d.ts'),
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

run();
