import { TSESTree, EcmaVersion, Lib } from '@typescript-eslint/types';
import { visitorKeys } from '@typescript-eslint/visitor-keys';
import { Referencer, ReferencerOptions } from './referencer';
import { ScopeManager } from './ScopeManager';

////////////////////////////////////////////////////
// MAKE SURE THIS IS KEPT IN SYNC WITH THE README //
////////////////////////////////////////////////////

interface AnalyzeOptions {
  /**
   * Known visitor keys.
   */
  childVisitorKeys?: ReferencerOptions['childVisitorKeys'];

  /**
   * Which ECMAScript version is considered.
   * Defaults to `2018`.
   */
  ecmaVersion?: EcmaVersion;

  /**
   * Whether the whole script is executed under node.js environment.
   * When enabled, the scope manager adds a function scope immediately following the global scope.
   * Defaults to `false`.
   */
  globalReturn?: boolean;

  /**
   * Implied strict mode (if ecmaVersion >= 5).
   * Defaults to `false`.
   */
  impliedStrict?: boolean;

  /**
   * The lib used by the project.
   * This automatically defines a type variable for any types provided by the configured TS libs.
   * Defaults to the lib for the provided `ecmaVersion`.
   *
   * https://www.typescriptlang.org/tsconfig#lib
   */
  lib?: Lib[];

  /**
   * The source type of the script.
   */
  sourceType?: 'script' | 'module';
}

const DEFAULT_OPTIONS: Required<AnalyzeOptions> = {
  childVisitorKeys: visitorKeys,
  ecmaVersion: 2018,
  globalReturn: false,
  impliedStrict: false,
  lib: ['es2018'],
  sourceType: 'script',
};

function mapEcmaVersion(version: EcmaVersion | undefined): Lib {
  if (version == null || version === 3 || version === 5) {
    return 'es5';
  }

  if (version > 2000) {
    return `es${version}` as Lib;
  }

  const year = 2015 + (version - 6);
  return `es${year}` as Lib;
}

/**
 * Takes an AST and returns the analyzed scopes.
 */
function analyze(
  tree: TSESTree.Node,
  providedOptions?: AnalyzeOptions,
): ScopeManager {
  const ecmaVersion =
    providedOptions?.ecmaVersion ?? DEFAULT_OPTIONS.ecmaVersion;
  const options: Required<AnalyzeOptions> = {
    globalReturn: providedOptions?.globalReturn ?? DEFAULT_OPTIONS.globalReturn,
    impliedStrict:
      providedOptions?.impliedStrict ?? DEFAULT_OPTIONS.impliedStrict,
    sourceType: providedOptions?.sourceType ?? DEFAULT_OPTIONS.sourceType,
    ecmaVersion,
    childVisitorKeys:
      providedOptions?.childVisitorKeys ?? DEFAULT_OPTIONS.childVisitorKeys,
    lib: providedOptions?.lib ?? [mapEcmaVersion(ecmaVersion)],
  };

  // ensure the option is lower cased
  options.lib = options.lib.map(l => l.toLowerCase() as Lib);

  const scopeManager = new ScopeManager(options);
  const referencer = new Referencer(options, scopeManager);

  referencer.visit(tree);

  return scopeManager;
}

export { analyze, AnalyzeOptions };
