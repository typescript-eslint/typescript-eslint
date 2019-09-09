import path from 'path';
import semver from 'semver';
import * as ts from 'typescript'; // leave this as * as ts so people using util package don't need syntheticDefaultImports
import { sync as globSync } from 'glob';
import isGlob from 'is-glob';
import { astConverter } from './ast-converter';
import { convertError } from './convert';
import { firstDefined } from './node-utils';
import { Extra, TSESTreeOptions, ParserServices } from './parser-options';
import { getFirstSemanticOrSyntacticError } from './semantic-errors';
import { TSESTree } from './ts-estree';
import {
  calculateProjectParserOptions,
  createProgram,
  defaultCompilerOptions,
} from './tsconfig-parser';

/**
 * This needs to be kept in sync with the top-level README.md in the
 * typescript-eslint monorepo
 */
const SUPPORTED_TYPESCRIPT_VERSIONS = '>=3.2.1 <3.7.0';
const ACTIVE_TYPESCRIPT_VERSION = ts.version;
const isRunningSupportedTypeScriptVersion = semver.satisfies(
  ACTIVE_TYPESCRIPT_VERSION,
  SUPPORTED_TYPESCRIPT_VERSIONS,
);
const DEFAULT_EXTRA_FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

let extra: Extra;
let warnedAboutTSVersion = false;

/**
 * Compute the filename based on the parser options.
 *
 * Even if jsx option is set in typescript compiler, filename still has to
 * contain .tsx file extension.
 *
 * @param options Parser options
 */
function getFileName({ jsx }: { jsx?: boolean }): string {
  return jsx ? 'estree.tsx' : 'estree.ts';
}

/**
 * Resets the extra config object
 */
function resetExtra(): void {
  extra = {
    tokens: null,
    range: false,
    loc: false,
    comment: false,
    comments: [],
    strict: false,
    jsx: false,
    useJSXTextNode: false,
    log: console.log, // eslint-disable-line no-console
    projects: [],
    errorOnUnknownASTType: false,
    errorOnTypeScriptSyntacticAndSemanticIssues: false,
    code: '',
    tsconfigRootDir: process.cwd(),
    extraFileExtensions: [],
    preserveNodeMaps: undefined,
    createDefaultProgram: false,
  };
}

interface ASTAndProgram {
  ast: ts.SourceFile;
  program: ts.Program | undefined;
}

/**
 * @param code The code of the file being linted
 * @param options The config object
 * @returns If found, returns the source file corresponding to the code and the containing program
 */
function getASTFromProject(
  code: string,
  options: TSESTreeOptions,
  createDefaultProgram: boolean,
): ASTAndProgram | undefined {
  const filePath = options.filePath || getFileName(options);
  const astAndProgram = firstDefined(
    calculateProjectParserOptions(code, filePath, extra),
    currentProgram => {
      const ast = currentProgram.getSourceFile(filePath);
      return ast && { ast, program: currentProgram };
    },
  );

  if (!astAndProgram && !createDefaultProgram) {
    // the file was either not matched within the tsconfig, or the extension wasn't expected
    const errorLines = [
      '"parserOptions.project" has been set for @typescript-eslint/parser.',
      `The file does not match your project config: ${filePath}.`,
    ];
    let hasMatchedAnError = false;

    extra.extraFileExtensions.forEach(extraExtension => {
      if (extraExtension.startsWith('.')) {
        errorLines.push(
          `Found unexpected extension "${extraExtension}" specified with the "extraFileExtensions" option. Did you mean ".${extraExtension}"?`,
        );
      }
      if (DEFAULT_EXTRA_FILE_EXTENSIONS.includes(extraExtension)) {
        errorLines.push(
          `You unnecessairly included the extension "${extraExtension}" with the "extraFileExtensions" option. This extension is already handled by the parser by default.`,
        );
      }
    });

    const fileExtension = path.extname(filePath);
    if (!DEFAULT_EXTRA_FILE_EXTENSIONS.includes(fileExtension)) {
      const nonStandardExt = `The extension for the file (${fileExtension}) is non-standard`;
      if (extra.extraFileExtensions && extra.extraFileExtensions.length > 0) {
        if (!extra.extraFileExtensions.includes(fileExtension)) {
          errorLines.push(
            `${nonStandardExt}. It should be added to your existing "parserOptions.extraFileExtensions".`,
          );
          hasMatchedAnError = true;
        }
      } else {
        errorLines.push(
          `${nonStandardExt}. You should add "parserOptions.extraFileExtensions" to your config.`,
        );
        hasMatchedAnError = true;
      }
    }

    if (!hasMatchedAnError) {
      errorLines.push(
        'The file must be included in at least one of the projects provided.',
      );
      hasMatchedAnError = true;
    }

    throw new Error(errorLines.join('\n'));
  }

  return astAndProgram;
}

/**
 * @param code The code of the file being linted
 * @param options The config object
 * @returns If found, returns the source file corresponding to the code and the containing program
 */
function getASTAndDefaultProject(
  code: string,
  options: TSESTreeOptions,
): ASTAndProgram | undefined {
  const fileName = options.filePath || getFileName(options);
  const program = createProgram(code, fileName, extra);
  const ast = program && program.getSourceFile(fileName);
  return ast && { ast, program };
}

/**
 * @param code The code of the file being linted
 * @returns Returns a new source file and program corresponding to the linted code
 */
function createNewProgram(code: string): ASTAndProgram {
  const FILENAME = getFileName(extra);

  const compilerHost: ts.CompilerHost = {
    fileExists() {
      return true;
    },
    getCanonicalFileName() {
      return FILENAME;
    },
    getCurrentDirectory() {
      return '';
    },
    getDirectories() {
      return [];
    },
    getDefaultLibFileName() {
      return 'lib.d.ts';
    },

    // TODO: Support Windows CRLF
    getNewLine() {
      return '\n';
    },
    getSourceFile(filename: string) {
      return ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true);
    },
    readFile() {
      return undefined;
    },
    useCaseSensitiveFileNames() {
      return true;
    },
    writeFile() {
      return null;
    },
  };

  const program = ts.createProgram(
    [FILENAME],
    {
      noResolve: true,
      target: ts.ScriptTarget.Latest,
      jsx: extra.jsx ? ts.JsxEmit.Preserve : undefined,
      ...defaultCompilerOptions,
    },
    compilerHost,
  );

  const ast = program.getSourceFile(FILENAME)!;

  return { ast, program };
}

/**
 * @param code The code of the file being linted
 * @param options The config object
 * @param shouldProvideParserServices True iff the program should be attempted to be calculated from provided tsconfig files
 * @returns Returns a source file and program corresponding to the linted code
 */
function getProgramAndAST(
  code: string,
  options: TSESTreeOptions,
  shouldProvideParserServices: boolean,
  createDefaultProgram: boolean,
): ASTAndProgram | undefined {
  return (
    (shouldProvideParserServices &&
      getASTFromProject(code, options, createDefaultProgram)) ||
    (shouldProvideParserServices &&
      createDefaultProgram &&
      getASTAndDefaultProject(code, options)) ||
    createNewProgram(code)
  );
}

function applyParserOptionsToExtra(options: TSESTreeOptions): void {
  /**
   * Track range information in the AST
   */
  extra.range = typeof options.range === 'boolean' && options.range;
  extra.loc = typeof options.loc === 'boolean' && options.loc;
  /**
   * Track tokens in the AST
   */
  if (typeof options.tokens === 'boolean' && options.tokens) {
    extra.tokens = [];
  }
  /**
   * Track comments in the AST
   */
  if (typeof options.comment === 'boolean' && options.comment) {
    extra.comment = true;
    extra.comments = [];
  }
  /**
   * Enable JSX - note the applicable file extension is still required
   */
  if (typeof options.jsx === 'boolean' && options.jsx) {
    extra.jsx = true;
  }
  /**
   * The JSX AST changed the node type for string literals
   * inside a JSX Element from `Literal` to `JSXText`.
   *
   * When value is `true`, these nodes will be parsed as type `JSXText`.
   * When value is `false`, these nodes will be parsed as type `Literal`.
   */
  if (typeof options.useJSXTextNode === 'boolean' && options.useJSXTextNode) {
    extra.useJSXTextNode = true;
  }
  /**
   * Allow the user to cause the parser to error if it encounters an unknown AST Node Type
   * (used in testing)
   */
  if (
    typeof options.errorOnUnknownASTType === 'boolean' &&
    options.errorOnUnknownASTType
  ) {
    extra.errorOnUnknownASTType = true;
  }
  /**
   * Allow the user to override the function used for logging
   */
  if (typeof options.loggerFn === 'function') {
    extra.log = options.loggerFn;
  } else if (options.loggerFn === false) {
    extra.log = Function.prototype;
  }

  if (typeof options.project === 'string') {
    extra.projects = [options.project];
  } else if (
    Array.isArray(options.project) &&
    options.project.every(projectPath => typeof projectPath === 'string')
  ) {
    extra.projects = options.project;
  }

  // Transform glob patterns into paths
  if (extra.projects) {
    extra.projects = extra.projects.reduce<string[]>(
      (projects, project) =>
        projects.concat(isGlob(project) ? globSync(project) : project),
      [],
    );
  }

  if (typeof options.tsconfigRootDir === 'string') {
    extra.tsconfigRootDir = options.tsconfigRootDir;
  }

  if (
    Array.isArray(options.extraFileExtensions) &&
    options.extraFileExtensions.every(ext => typeof ext === 'string')
  ) {
    extra.extraFileExtensions = options.extraFileExtensions;
  }
  /**
   * Allow the user to enable or disable the preservation of the AST node maps
   * during the conversion process.
   *
   * NOTE: For backwards compatibility we also preserve node maps in the case where `project` is set,
   * and `preserveNodeMaps` is not explicitly set to anything.
   */
  extra.preserveNodeMaps =
    typeof options.preserveNodeMaps === 'boolean' && options.preserveNodeMaps;
  if (options.preserveNodeMaps === undefined && extra.projects.length > 0) {
    extra.preserveNodeMaps = true;
  }

  extra.createDefaultProgram =
    typeof options.createDefaultProgram === 'boolean' &&
    options.createDefaultProgram;
}

function warnAboutTSVersion(): void {
  if (!isRunningSupportedTypeScriptVersion && !warnedAboutTSVersion) {
    const border = '=============';
    const versionWarning = [
      border,
      'WARNING: You are currently running a version of TypeScript which is not officially supported by typescript-estree.',
      'You may find that it works just fine, or you may not.',
      `SUPPORTED TYPESCRIPT VERSIONS: ${SUPPORTED_TYPESCRIPT_VERSIONS}`,
      `YOUR TYPESCRIPT VERSION: ${ACTIVE_TYPESCRIPT_VERSION}`,
      'Please only submit bug reports when using the officially supported version.',
      border,
    ];
    extra.log(versionWarning.join('\n\n'));
    warnedAboutTSVersion = true;
  }
}

//------------------------------------------------------------------------------
// Parser
//------------------------------------------------------------------------------

export type AST<T extends TSESTreeOptions> = TSESTree.Program &
  (T['range'] extends true ? { range: [number, number] } : {}) &
  (T['tokens'] extends true ? { tokens: TSESTree.Token[] } : {}) &
  (T['comment'] extends true ? { comments: TSESTree.Comment[] } : {});

export interface ParseAndGenerateServicesResult<T extends TSESTreeOptions> {
  ast: AST<T>;
  services: ParserServices;
}

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

export const version: string = require('../package.json').version;

export function parse<T extends TSESTreeOptions = TSESTreeOptions>(
  code: string,
  options?: T,
): AST<T> {
  /**
   * Reset the parse configuration
   */
  resetExtra();
  /**
   * Ensure users do not attempt to use parse() when they need parseAndGenerateServices()
   */
  if (options && options.errorOnTypeScriptSyntacticAndSemanticIssues) {
    throw new Error(
      `"errorOnTypeScriptSyntacticAndSemanticIssues" is only supported for parseAndGenerateServices()`,
    );
  }
  /**
   * Ensure the source code is a string, and store a reference to it
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof code !== 'string' && !((code as any) instanceof String)) {
    code = String(code);
  }
  extra.code = code;
  /**
   * Apply the given parser options
   */
  if (typeof options !== 'undefined') {
    applyParserOptionsToExtra(options);
  }
  /**
   * Warn if the user is using an unsupported version of TypeScript
   */
  warnAboutTSVersion();
  /**
   * Create a ts.SourceFile directly, no ts.Program is needed for a simple
   * parse
   */
  const ast = ts.createSourceFile(
    getFileName(extra),
    code,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
  );
  /**
   * Convert the TypeScript AST to an ESTree-compatible one
   */
  const { estree } = astConverter(ast, extra, false);
  return estree as AST<T>;
}

export function parseAndGenerateServices<
  T extends TSESTreeOptions = TSESTreeOptions
>(code: string, options: T): ParseAndGenerateServicesResult<T> {
  /**
   * Reset the parse configuration
   */
  resetExtra();
  /**
   * Ensure the source code is a string, and store a reference to it
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof code !== 'string' && !((code as any) instanceof String)) {
    code = String(code);
  }
  extra.code = code;
  /**
   * Apply the given parser options
   */
  if (typeof options !== 'undefined') {
    applyParserOptionsToExtra(options);
    if (
      typeof options.errorOnTypeScriptSyntacticAndSemanticIssues ===
        'boolean' &&
      options.errorOnTypeScriptSyntacticAndSemanticIssues
    ) {
      extra.errorOnTypeScriptSyntacticAndSemanticIssues = true;
    }
  }
  /**
   * Warn if the user is using an unsupported version of TypeScript
   */
  warnAboutTSVersion();
  /**
   * Generate a full ts.Program in order to be able to provide parser
   * services, such as type-checking
   */
  const shouldProvideParserServices =
    extra.projects && extra.projects.length > 0;
  const { ast, program } = getProgramAndAST(
    code,
    options,
    shouldProvideParserServices,
    extra.createDefaultProgram,
  )!;
  /**
   * Determine whether or not two-way maps of converted AST nodes should be preserved
   * during the conversion process
   */
  const shouldPreserveNodeMaps =
    extra.preserveNodeMaps !== undefined
      ? extra.preserveNodeMaps
      : shouldProvideParserServices;
  /**
   * Convert the TypeScript AST to an ESTree-compatible one, and optionally preserve
   * mappings between converted and original AST nodes
   */
  const { estree, astMaps } = astConverter(ast, extra, shouldPreserveNodeMaps);
  /**
   * Even if TypeScript parsed the source code ok, and we had no problems converting the AST,
   * there may be other syntactic or semantic issues in the code that we can optionally report on.
   */
  if (program && extra.errorOnTypeScriptSyntacticAndSemanticIssues) {
    const error = getFirstSemanticOrSyntacticError(program, ast);
    if (error) {
      throw convertError(error);
    }
  }
  /**
   * Return the converted AST and additional parser services
   */
  return {
    ast: estree as AST<T>,
    services: {
      program: shouldProvideParserServices ? program : undefined,
      esTreeNodeToTSNodeMap:
        shouldPreserveNodeMaps && astMaps
          ? astMaps.esTreeNodeToTSNodeMap
          : undefined,
      tsNodeToESTreeNodeMap:
        shouldPreserveNodeMaps && astMaps
          ? astMaps.tsNodeToESTreeNodeMap
          : undefined,
    },
  };
}

export { TSESTreeOptions, ParserServices };
export * from './ts-estree';
