import type MonacoEditor from 'monaco-editor';

import type * as SandboxFactory from '../../vendor/sandbox';
import type { WebLinterModule } from '../linter/types';

type Monaco = typeof MonacoEditor;
type Sandbox = typeof SandboxFactory;

export interface SandboxModel {
  lintUtils: WebLinterModule;
  main: Monaco;
  sandboxFactory: Sandbox;
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
          linter: '/sandbox',
          sandbox: 'https://www.typescriptlang.org/js/sandbox',
          vs: `https://playgroundcdn.typescriptlang.org/cdn/${tsVersion}/monaco/min/vs`,
        },
        // This is something you need for monaco to work
        ignoreDuplicateModules: ['vs/editor/editor.main'],
      });

      // Grab a copy of monaco, TypeScript and the sandbox
      window.require<[Monaco, Sandbox, WebLinterModule]>(
        ['vs/editor/editor.main', 'sandbox/index', 'linter/index'],
        (main, sandboxFactory, lintUtils) => {
          resolve({ lintUtils, main, sandboxFactory });
        },
        error => {
          console.log(error);
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
