import semver from 'semver';
import * as ts from 'typescript';
import { sync as globSync } from 'glob';
import isGlob from 'is-glob';
import { astConverter } from './ast-converter';
import { convertError } from './convert';
import { createDefaultProgram } from './create-program/createDefaultProgram';
import { createIsolatedProgram } from './create-program/createIsolatedProgram';
import { createProjectProgram } from './create-program/createProjectProgram';
import { createSourceFile } from './create-program/createSourceFile';
import { Extra, TSESTreeOptions, ParserServices } from './parser-options';
import { getFirstSemanticOrSyntacticError } from './semantic-or-syntactic-errors';
import { TSESTree } from './ts-estree';

/**
 * This needs to be kept in sync with the top-level README.md in the
 * typescript-eslint monorepo
 */
const SUPPORTED_TYPESCRIPT_VERSIONS = '>=3.2.1 <3.8.0';
/*
 * The semver package will ignore prerelease ranges, and we don't want to explicitly document every one
 * List them all separately here, so we can automatically create the full string
 */
const SUPPORTED_PRERELEASE_RANGES = ['>3.7.0-dev.0', '3.7.1-rc'];
const ACTIVE_TYPESCRIPT_VERSION = ts.version;
const isRunningSupportedTypeScriptVersion = semver.satisfies(
  ACTIVE_TYPESCRIPT_VERSION,
  [SUPPORTED_TYPESCRIPT_VERSIONS]
    .concat(SUPPORTED_PRERELEASE_RANGES)
    .join(' || '),
);

let extra: Extra;
let warnedAboutTSVersion = false;

function enforceString(code: unknown): string {
  /**
   * Ensure the source code is a string
   */
  if (typeof code !== 'string') {
    return String(code);
  }

  return code;
}

interface ASTAndProgram {
  ast: ts.SourceFile;
  program: ts.Program | undefined;
}

/**
 * @param code The code of the file being linted
 * @param shouldProvideParserServices True if the program should be attempted to be calculated from provided tsconfig files
 * @param shouldCreateDefaultProgram True if the program should be created from compiler host
 * @returns Returns a source file and program corresponding to the linted code
 */
function getProgramAndAST(
  code: string,
  shouldProvideParserServices: boolean,
  shouldCreateDefaultProgram: boolean,
): ASTAndProgram | undefined {
  return (
    (shouldProvideParserServices &&
      createProjectProgram(code, shouldCreateDefaultProgram, extra)) ||
    (shouldProvideParserServices &&
      shouldCreateDefaultProgram &&
      createDefaultProgram(code, extra)) ||
    createIsolatedProgram(code, extra)
  );
}

/**
 * Compute the filename based on the parser options.
 *
 * Even if jsx option is set in typescript compiler, filename still has to
 * contain .tsx file extension.
 *
 * @param options Parser options
 */
function getFileName({ jsx }: { jsx?: boolean } = {}): string {
  return jsx ? 'estree.tsx' : 'estree.ts';
}

/**
 * Resets the extra config object
 */
function resetExtra(): void {
  extra = {
    code: '',
    comment: false,
    comments: [],
    createDefaultProgram: false,
    errorOnTypeScriptSyntacticAndSemanticIssues: false,
    errorOnUnknownASTType: false,
    extraFileExtensions: [],
    filePath: getFileName(),
    jsx: false,
    loc: false,
    log: console.log, // eslint-disable-line no-console
    preserveNodeMaps: undefined,
    projects: [],
    range: false,
    strict: false,
    tokens: null,
    tsconfigRootDir: process.cwd(),
    useJSXTextNode: false,
  };
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
   * Get the file extension
   */
  if (typeof options.filePath === 'string' && options.filePath !== '<input>') {
    extra.filePath = options.filePath;
  } else {
    extra.filePath = getFileName(extra);
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

  if (typeof options.tsconfigRootDir === 'string') {
    extra.tsconfigRootDir = options.tsconfigRootDir;
  }

  // Transform glob patterns into paths
  if (extra.projects) {
    extra.projects = extra.projects.reduce<string[]>(
      (projects, project) =>
        projects.concat(
          isGlob(project)
            ? globSync(project, {
                cwd: extra.tsconfigRootDir || process.cwd(),
              })
            : project,
        ),
      [],
    );
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
    const isTTY = typeof process === undefined ? false : process.stdout.isTTY;
    if (isTTY) {
      const border = '=============';
      const versionWarning = [
        border,
        'WARNING: You are currently running a version of TypeScript which is not officially supported by @typescript-eslint/typescript-estree.',
        'You may find that it works just fine, or you may not.',
        `SUPPORTED TYPESCRIPT VERSIONS: ${SUPPORTED_TYPESCRIPT_VERSIONS}`,
        `YOUR TYPESCRIPT VERSION: ${ACTIVE_TYPESCRIPT_VERSION}`,
        'Please only submit bug reports when using the officially supported version.',
        border,
      ];
      extra.log(versionWarning.join('\n\n'));
    }
    warnedAboutTSVersion = true;
  }
}

//------------------------------------------------------------------------------
// Parser
//------------------------------------------------------------------------------

type AST<T extends TSESTreeOptions> = TSESTree.Program &
  (T['range'] extends true ? { range: [number, number] } : {}) &
  (T['tokens'] extends true ? { tokens: TSESTree.Token[] } : {}) &
  (T['comment'] extends true ? { comments: TSESTree.Comment[] } : {});

interface ParseAndGenerateServicesResult<T extends TSESTreeOptions> {
  ast: AST<T>;
  services: ParserServices;
}

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

const version: string = require('../package.json').version;

function parse<T extends TSESTreeOptions = TSESTreeOptions>(
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
  if (options?.errorOnTypeScriptSyntacticAndSemanticIssues) {
    throw new Error(
      `"errorOnTypeScriptSyntacticAndSemanticIssues" is only supported for parseAndGenerateServices()`,
    );
  }

  /**
   * Ensure the source code is a string, and store a reference to it
   */
  code = enforceString(code);
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
  const ast = createSourceFile(code, extra);

  /**
   * Convert the TypeScript AST to an ESTree-compatible one
   */
  const { estree } = astConverter(ast, extra, false);
  return estree as AST<T>;
}

function parseAndGenerateServices<T extends TSESTreeOptions = TSESTreeOptions>(
  code: string,
  options: T,
): ParseAndGenerateServicesResult<T> {
  /**
   * Reset the parse configuration
   */
  resetExtra();

  /**
   * Ensure the source code is a string, and store a reference to it
   */
  code = enforceString(code);
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
    shouldProvideParserServices,
    extra.createDefaultProgram,
  )!;

  /**
   * Determine whatever or not two-way maps of converted AST nodes should be preserved
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

export {
  AST,
  parse,
  parseAndGenerateServices,
  ParseAndGenerateServicesResult,
  ParserServices,
  TSESTreeOptions,
  version,
};
export { simpleTraverse } from './simple-traverse';
export { visitorKeys } from './visitor-keys';
export * from './ts-estree';
export { clearCaches } from './create-program/createWatchProgram';
