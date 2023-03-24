import type esquery from 'esquery';
import type * as TSType from 'typescript';

declare global {
  interface WindowRequire {
    <T>(files: string[], cb: (...arg: T) => void): void;
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
