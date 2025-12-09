import type { Lib, SourceType, TSESTree } from '@typescript-eslint/types';

import { visitorKeys } from '@typescript-eslint/visitor-keys';

import type { ReferencerOptions } from './referencer';

import { Referencer } from './referencer';
import { ScopeManager } from './ScopeManager';

//////////////////////////////////////////////////////////
// MAKE SURE THIS IS KEPT IN SYNC WITH THE WEBSITE DOCS //
//////////////////////////////////////////////////////////

export interface AnalyzeOptions {
  /**
   * Known visitor keys.
   */
  childVisitorKeys?: ReferencerOptions['childVisitorKeys'];

  /**
   * Whether the whole script is executed under node.js environment.
   * When enabled, the scope manager adds a function scope immediately following the global scope.
   * Defaults to `false`.
   */
  globalReturn?: boolean;

  /**
   * Implied strict mode.
   * Defaults to `false`.
   */
  impliedStrict?: boolean;

  /**
   * The identifier that's used for JSX Element creation (after transpilation).
   * This should not be a member expression - just the root identifier (i.e. use "React" instead of "React.createElement").
   * Defaults to `"React"`.
   */
  jsxPragma?: string | null;

  /**
   * The identifier that's used for JSX fragment elements (after transpilation).
   * If `null`, assumes transpilation will always use a member on `jsxFactory` (i.e. React.Fragment).
   * This should not be a member expression - just the root identifier (i.e. use "h" instead of "h.Fragment").
   * Defaults to `null`.
   */
  jsxFragmentName?: string | null;

  /**
   * The lib used by the project.
   * This automatically defines a type variable for any types provided by the configured TS libs.
   * Defaults to ['esnext'].
   *
   * https://www.typescriptlang.org/tsconfig#lib
   */
  lib?: Lib[];

  /**
   * The source type of the script.
   */
  sourceType?: SourceType;

  /**
   * Whether to resolve references to global `var`/function declarations when `sourceType` is `script`.
   * Defaults to `false` (ESLint 9 behavior) to preserve support for the current eslint range (^8.57.0 || ^9.0.0).
   * Set to `true` to opt into ESLint 10 behavior where such references are resolved out of `through`.
   */
  resolveGlobalVarsInScript?: boolean;

  // TODO - remove this in v10
  /**
   * @deprecated This option never did what it was intended for and will be removed in a future major release.
   */
  emitDecoratorMetadata?: boolean;
}

const DEFAULT_OPTIONS: Required<AnalyzeOptions> = {
  childVisitorKeys: visitorKeys,
  emitDecoratorMetadata: false,
  globalReturn: false,
  impliedStrict: false,
  jsxFragmentName: null,
  jsxPragma: 'React',
  lib: ['es2018'],
  // TODO(major): flip to true when ESLint 10 is within the supported range (see supported ESLint versions in project docs).
  resolveGlobalVarsInScript: false,
  sourceType: 'script',
};

/**
 * Takes an AST and returns the analyzed scopes.
 */
export function analyze(
  tree: TSESTree.Program,
  providedOptions?: AnalyzeOptions,
): ScopeManager {
  const options: Required<AnalyzeOptions> = {
    childVisitorKeys:
      providedOptions?.childVisitorKeys ?? DEFAULT_OPTIONS.childVisitorKeys,
    emitDecoratorMetadata: false,
    globalReturn: providedOptions?.globalReturn ?? DEFAULT_OPTIONS.globalReturn,
    impliedStrict:
      providedOptions?.impliedStrict ?? DEFAULT_OPTIONS.impliedStrict,
    jsxFragmentName:
      providedOptions?.jsxFragmentName ?? DEFAULT_OPTIONS.jsxFragmentName,
    jsxPragma:
      // eslint-disable-next-line @typescript-eslint/internal/eqeq-nullish
      providedOptions?.jsxPragma === undefined
        ? DEFAULT_OPTIONS.jsxPragma
        : providedOptions.jsxPragma,
    lib: providedOptions?.lib ?? ['esnext'],
    resolveGlobalVarsInScript:
      providedOptions?.resolveGlobalVarsInScript ??
      DEFAULT_OPTIONS.resolveGlobalVarsInScript,
    sourceType: providedOptions?.sourceType ?? DEFAULT_OPTIONS.sourceType,
  };

  // ensure the option is lower cased
  options.lib = options.lib.map(l => l.toLowerCase() as Lib);

  const scopeManager = new ScopeManager(options);
  const referencer = new Referencer(options, scopeManager);

  referencer.visit(tree);

  return scopeManager;
}
