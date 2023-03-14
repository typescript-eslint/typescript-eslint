import type * as SandboxFactory from '@site/src/vendor/sandbox';
import type * as TsWorker from '@site/src/vendor/tsWorker';
import type { LintUtils } from '@typescript-eslint/website-eslint';
import type esquery from 'esquery';
import type MonacoType from 'monaco-editor';
import type * as TSType from 'typescript';

declare global {
  type WindowRequireCb = (
    main: typeof MonacoType,
    tsWorker: typeof TsWorker,
    sandboxFactory: typeof SandboxFactory,
    lintUtils: LintUtils,
  ) => void;
  interface WindowRequire {
    (files: string[], cb: WindowRequireCb): void;
    config: (arg: {
      paths?: Record<string, string>;
      ignoreDuplicateModules?: string[];
    }) => void;
  }

  interface Window {
    ts: typeof TSType;
    require: WindowRequire;
    esquery: typeof esquery;
  }
}
