import type esquery from 'esquery';
import type * as ts from 'typescript';

declare global {
  interface WindowRequire {
    // We know it's an unsafe assertion. This is fine.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    <T extends unknown[]>(
      files: string[],
      success?: (...arg: T) => void,
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
