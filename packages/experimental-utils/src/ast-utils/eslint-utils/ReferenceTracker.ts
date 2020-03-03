/* eslint-disable @typescript-eslint/no-namespace */

import * as eslintUtils from 'eslint-utils';
import { TSESTree } from '../../ts-estree';
import * as TSESLint from '../../ts-eslint';

const ReferenceTrackerREAD: unique symbol = eslintUtils.ReferenceTracker.READ;
const ReferenceTrackerCALL: unique symbol = eslintUtils.ReferenceTracker.CALL;
const ReferenceTrackerCONSTRUCT: unique symbol =
  eslintUtils.ReferenceTracker.CONSTRUCT;

interface ReferenceTracker {
  /**
   * Iterate the references that the given `traceMap` determined.
   * This method starts to search from global variables.
   *
   * @see {@link https://eslint-utils.mysticatea.dev/api/scope-utils.html#tracker-iterateglobalreferences}
   */
  iterateGlobalReferences<T>(
    traceMap: ReferenceTracker.TraceMap<T>,
  ): IterableIterator<ReferenceTracker.FoundReference<T>>;

  /**
   * Iterate the references that the given `traceMap` determined.
   * This method starts to search from `require()` expression.
   *
   * @see {@link https://eslint-utils.mysticatea.dev/api/scope-utils.html#tracker-iteratecjsreferences}
   */
  iterateCjsReferences<T>(
    traceMap: ReferenceTracker.TraceMap<T>,
  ): IterableIterator<ReferenceTracker.FoundReference<T>>;

  /**
   * Iterate the references that the given `traceMap` determined.
   * This method starts to search from `import`/`export` declarations.
   *
   * @see {@link https://eslint-utils.mysticatea.dev/api/scope-utils.html#tracker-iterateesmreferences}
   */
  iterateEsmReferences<T>(
    traceMap: ReferenceTracker.TraceMap<T>,
  ): IterableIterator<ReferenceTracker.FoundReference<T>>;
}
interface ReferenceTrackerStatic {
  new (
    globalScope: TSESLint.Scope.Scope,
    options?: {
      /**
       * The mode which determines how the `tracker.iterateEsmReferences()` method scans CommonJS modules.
       * If this is `"strict"`, the method binds CommonJS modules to the default export. Otherwise, the method binds
       * CommonJS modules to both the default export and named exports. Optional. Default is `"strict"`.
       */
      mode: 'strict' | 'legacy';
      /**
       * The name list of Global Object. Optional. Default is `["global", "globalThis", "self", "window"]`.
       */
      globalObjectNames: readonly string[];
    },
  ): ReferenceTracker;

  readonly READ: typeof ReferenceTrackerREAD;
  readonly CALL: typeof ReferenceTrackerCALL;
  readonly CONSTRUCT: typeof ReferenceTrackerCONSTRUCT;
}

namespace ReferenceTracker {
  export type READ = ReferenceTrackerStatic['READ'];
  export type CALL = ReferenceTrackerStatic['CALL'];
  export type CONSTRUCT = ReferenceTrackerStatic['CONSTRUCT'];
  export type ReferenceType = READ | CALL | CONSTRUCT;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type TraceMap<T = any> = Record<string, TraceMapElement<T>>;
  export interface TraceMapElement<T> {
    [ReferenceTrackerREAD]?: T;
    [ReferenceTrackerCALL]?: T;
    [ReferenceTrackerCONSTRUCT]?: T;
    [key: string]: TraceMapElement<T>;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export interface FoundReference<T = any> {
    node: TSESTree.Node;
    path: readonly string[];
    type: ReferenceType;
    entry: T;
  }
}

/**
 * The tracker for references. This provides reference tracking for global variables, CommonJS modules, and ES modules.
 *
 * @see {@link https://eslint-utils.mysticatea.dev/api/scope-utils.html#referencetracker-class}
 */
const ReferenceTracker = eslintUtils.ReferenceTracker as ReferenceTrackerStatic;

export { ReferenceTracker };
