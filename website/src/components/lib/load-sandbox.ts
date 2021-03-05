/* eslint-disable @typescript-eslint/ban-ts-comment */
import type * as TsWorker from '../../vendor/tsWorker';
import type * as SandboxFactory from '../../vendor/sandbox';

export type Monaco = typeof import('monaco-editor');
export type TS = typeof import('typescript');

export interface SandboxModel {
  main: Monaco;
  tsWorker: typeof TsWorker;
  sandboxFactory: typeof SandboxFactory;
  ts: TS;
}

function loadSandbox(): Promise<SandboxModel> {
  return new Promise((resolve, reject): void => {
    const getLoaderScript = document.createElement('script');
    getLoaderScript.src = 'https://www.typescriptlang.org/js/vs.loader.js';
    getLoaderScript.async = true;
    getLoaderScript.onload = (): void => {
      // For the monaco version you can use unpkg or the TypeScript web infra CDN
      // You can see the available releases for TypeScript here:
      // https://typescript.azureedge.net/indexes/releases.json
      // @ts-ignore
      window.require.config({
        paths: {
          vs: 'https://typescript.azureedge.net/cdn/4.2.2/monaco/min/vs',
          // vs: 'https://unpkg.com/@typescript-deploys/monaco-editor@4.2.2/min/vs',
          sandbox: 'https://www.typescriptlang.org/js/sandbox',
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
        ],
        // @ts-ignore
        (main, tsWorker, sandboxFactory) => {
          // @ts-ignore
          const isOK = main && window.ts && sandboxFactory;
          // @ts-ignore
          window.ts.__esModule = true;
          // window.ts.SyntaxKind;
          if (isOK) {
            resolve({
              main,
              tsWorker,
              sandboxFactory,
              // @ts-ignore
              ts: window.ts,
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

export const sandboxSingleton = loadSandbox();
