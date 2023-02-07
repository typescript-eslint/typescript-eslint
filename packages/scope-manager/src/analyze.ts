import type { Lib, TSESTree } from '@typescript-eslint/types';
import { visitorKeys } from '@typescript-eslint/visitor-keys';

import type { ReferencerOptions } from './referencer';
import { Referencer } from './referencer';
import { ScopeManager } from './ScopeManager';

//////////////////////////////////////////////////////////
// MAKE SURE THIS IS KEPT IN SYNC WITH THE WEBSITE DOCS //
//////////////////////////////////////////////////////////

interface AnalyzeOptions {
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
  sourceType?: 'script' | 'module';

  /**
   * Emit design-type metadata for decorated declarations in source.
   * Defaults to `false`.
   */
  emitDecoratorMetadata?: boolean;
}

const DEFAULT_OPTIONS: Required<AnalyzeOptions> = {
  childVisitorKeys: visitorKeys,
  globalReturn: false,
  impliedStrict: false,
  jsxPragma: 'React',
  jsxFragmentName: null,
  lib: ['es2018'],
  sourceType: 'script',
  emitDecoratorMetadata: false,
};

/**
 * Takes an AST and returns the analyzed scopes.
 */
function analyze(
  tree: TSESTree.Node,
  providedOptions?: AnalyzeOptions,
): ScopeManager {
  const options: Required<AnalyzeOptions> = {
    childVisitorKeys:
      providedOptions?.childVisitorKeys ?? DEFAULT_OPTIONS.childVisitorKeys,
    globalReturn: providedOptions?.globalReturn ?? DEFAULT_OPTIONS.globalReturn,
    impliedStrict:
      providedOptions?.impliedStrict ?? DEFAULT_OPTIONS.impliedStrict,
    jsxPragma:
      providedOptions?.jsxPragma === undefined
        ? DEFAULT_OPTIONS.jsxPragma
        : providedOptions.jsxPragma,
    jsxFragmentName:
      providedOptions?.jsxFragmentName ?? DEFAULT_OPTIONS.jsxFragmentName,
    sourceType: providedOptions?.sourceType ?? DEFAULT_OPTIONS.sourceType,
    lib: providedOptions?.lib ?? ['esnext'],
    emitDecoratorMetadata:
      providedOptions?.emitDecoratorMetadata ??
      DEFAULT_OPTIONS.emitDecoratorMetadata,
  };

  // ensure the option is lower cased
  options.lib = options.lib.map(l => l.toLowerCase() as Lib);

  const scopeManager = new ScopeManager(options);
  const referencer = new Referencer(options, scopeManager);

  referencer.visit(tree);

  return scopeManager;
}

export { analyze, AnalyzeOptions };
