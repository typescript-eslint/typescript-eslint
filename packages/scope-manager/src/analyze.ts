import { TSESTree, EcmaVersion, Lib } from '@typescript-eslint/types';
import { visitorKeys } from '@typescript-eslint/visitor-keys';
import { Referencer, ReferencerOptions } from './referencer';
import { ScopeManager } from './ScopeManager';
import { lib as TSLibraries } from './lib';

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
   * The identifier that's used for JSX Element creation (after transpilation).
   * This should not be a member expression - just the root identifier (i.e. use "React" instead of "React.createElement").
   * Defaults to `"React"`.
   */
  jsxPragma?: string;

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
  jsxPragma: 'React',
  jsxFragmentName: null,
  lib: ['es2018'],
  sourceType: 'script',
};

function mapEcmaVersion(version: EcmaVersion | undefined): Lib {
  if (version == null || version === 3 || version === 5) {
    return 'es5';
  }

  const year = version > 2000 ? version : 2015 + (version - 6);
  const lib = `es${year}`;

  return lib in TSLibraries ? (lib as Lib) : year > 2020 ? 'esnext' : 'es5';
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
    childVisitorKeys:
      providedOptions?.childVisitorKeys ?? DEFAULT_OPTIONS.childVisitorKeys,
    ecmaVersion,
    globalReturn: providedOptions?.globalReturn ?? DEFAULT_OPTIONS.globalReturn,
    impliedStrict:
      providedOptions?.impliedStrict ?? DEFAULT_OPTIONS.impliedStrict,
    jsxPragma: providedOptions?.jsxPragma ?? DEFAULT_OPTIONS.jsxPragma,
    jsxFragmentName:
      providedOptions?.jsxFragmentName ?? DEFAULT_OPTIONS.jsxFragmentName,
    sourceType: providedOptions?.sourceType ?? DEFAULT_OPTIONS.sourceType,
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
