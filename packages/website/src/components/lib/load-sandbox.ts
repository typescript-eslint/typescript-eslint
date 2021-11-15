/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import type * as TsWorker from '../../vendor/tsWorker';
import type * as SandboxFactory from '../../vendor/sandbox';
import { WebLinter } from '../editor';

export type Monaco = typeof import('monaco-editor');
export type TS = typeof import('typescript');

export interface SandboxModel {
  main: Monaco;
  tsWorker: typeof TsWorker;
  sandboxFactory: typeof SandboxFactory;
  ts: TS;
  linter: {
    loadLinter(): WebLinter;
  };
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
      // @ts-ignore
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
        // @ts-ignore
        (main, tsWorker, sandboxFactory, linter) => {
          // @ts-ignore
          const isOK = main && window.ts && sandboxFactory;
          // @ts-ignore
          // window.ts.__esModule = true;
          // window.ts.SyntaxKind;
          if (isOK) {
            resolve({
              main,
              tsWorker,
              sandboxFactory,
              // @ts-ignore
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

let instance;

export const sandboxSingleton = (version: string): Promise<SandboxModel> => {
  if (instance) {
    return instance;
  }
  return (instance = loadSandbox(version));
};
