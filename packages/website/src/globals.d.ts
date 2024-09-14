import type esquery from 'esquery';
import type * as ts from 'typescript';

declare global {
  interface WindowRequire {
    <T extends unknown[]>(
      files: string[],
      success?: (...arg: T) => void,
      error?: (e: Error) => void,
    ): void;
    config: (arg: {
      ignoreDuplicateModules?: string[];
      paths?: Record<string, string>;
    }) => void;
  }

  interface Window {
    esquery: typeof esquery;
    require: WindowRequire;
    system: unknown;
    ts: typeof ts;
    visitorKeys: Record<string, readonly string[] | undefined>;
  }
}
