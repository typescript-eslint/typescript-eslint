import type esquery from 'esquery';
import type * as ts from 'typescript';

declare global {
  interface WindowRequire {
    (
      files: string[],
      success?: (...arg: unknown[]) => void,
      error?: (e: Error) => void,
    ): void;
    config: (arg: {
      paths?: Record<string, string>;
      ignoreDuplicateModules?: string[];
    }) => void;
  }

  interface Window {
    ts: typeof ts;
    require: WindowRequire;
    esquery: typeof esquery;
    system: unknown;
  }
}
