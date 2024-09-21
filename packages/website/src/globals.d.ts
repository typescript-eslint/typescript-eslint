import type esquery from 'esquery';
import type * as ts from 'typescript';

declare global {
  interface WindowRequire {
    // We know it's an unsafe assertion. It's for window.require usage, so we
    // don't have to use verbose type assertions on every call.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
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
