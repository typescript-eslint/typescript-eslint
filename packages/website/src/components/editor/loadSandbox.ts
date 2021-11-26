import type * as TsWorker from '../../vendor/tsWorker';
import type * as SandboxFactory from '../../vendor/sandbox';
import type { LinterLoader } from '@typescript-eslint/website-eslint';

type Monaco = typeof import('monaco-editor');
type TS = typeof import('typescript');

declare global {
  type WindowRequireCb = (
    main: Monaco,
    tsWorker: typeof TsWorker,
    sandboxFactory: typeof SandboxFactory,
    linter: LinterLoader,
  ) => void;
  interface WindowRequire {
    (files: string[], cb: WindowRequireCb): void;
    config: (arg: {
      paths?: Record<string, string>;
      ignoreDuplicateModules?: string[];
    }) => void;
  }

  interface Window {
    ts: TS;
    require: WindowRequire;
  }
}

export interface SandboxModel {
  main: Monaco;
  tsWorker: typeof TsWorker;
  sandboxFactory: typeof SandboxFactory;
  ts: TS;
  linter: LinterLoader;
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
      window.require(
        [
          'vs/editor/editor.main',
          'vs/language/typescript/tsWorker',
          'sandbox/index',
          'linter/index',
        ],
        (main, tsWorker, sandboxFactory, linter) => {
          const isOK = main && window.ts && sandboxFactory;
          if (isOK) {
            resolve({
              main,
              tsWorker,
              sandboxFactory,
              ts: window.ts,
              linter,
            });
          } else {
            reject(
              new Error(
                'Could not get all the dependencies of sandbox set up!',
              ),
            );
          }
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
