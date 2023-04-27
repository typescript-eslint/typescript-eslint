import type MonacoEditor from 'monaco-editor';

import type * as SandboxFactory from '../../vendor/sandbox';
import type { WebLinterModule } from '../linter/types';

type Monaco = typeof MonacoEditor;
type Sandbox = typeof SandboxFactory;

export interface SandboxModel {
  main: Monaco;
  sandboxFactory: Sandbox;
  lintUtils: WebLinterModule;
}

function loadSandbox(tsVersion: string): Promise<SandboxModel> {
  return new Promise((resolve, reject): void => {
    const getLoaderScript = document.createElement('script');
    getLoaderScript.src = 'https://www.typescriptlang.org/js/vs.loader.js';
    getLoaderScript.async = true;
    getLoaderScript.onload = (): void => {
      // For the monaco version you can use unpkg or the TypeScript web infra CDN
      // You can see the available releases for TypeScript here:
      // https://typescript.azureedge.net/indexes/releases.json
      window.require.config({
        paths: {
          vs: `https://typescript.azureedge.net/cdn/${tsVersion}/monaco/min/vs`,
          sandbox: 'https://www.typescriptlang.org/js/sandbox',
          linter: '/sandbox',
        },
        // This is something you need for monaco to work
        ignoreDuplicateModules: ['vs/editor/editor.main'],
      });

      // Grab a copy of monaco, TypeScript and the sandbox
      window.require<[Monaco, Sandbox, WebLinterModule]>(
        ['vs/editor/editor.main', 'sandbox/index', 'linter/index'],
        (main, sandboxFactory, lintUtils) => {
          resolve({ main, sandboxFactory, lintUtils });
        },
        () => {
          reject(
            new Error('Could not get all the dependencies of sandbox set up!'),
          );
        },
      );
    };
    document.body.appendChild(getLoaderScript);
  });
}

let instance: Promise<SandboxModel> | undefined;

export const sandboxSingleton = (version: string): Promise<SandboxModel> => {
  if (instance) {
    return instance;
  }
  return (instance = loadSandbox(version));
};
