import debug from 'debug';
import { sync as globSync } from 'globby';
import isGlob from 'is-glob';
import semver from 'semver';
import * as ts from 'typescript';
import { astConverter } from './ast-converter';
import { convertError } from './convert';
import { createDefaultProgram } from './create-program/createDefaultProgram';
import { createIsolatedProgram } from './create-program/createIsolatedProgram';
import { createProjectProgram } from './create-program/createProjectProgram';
import { createSourceFile } from './create-program/createSourceFile';
import { Extra, TSESTreeOptions, ParserServices } from './parser-options';
import { getFirstSemanticOrSyntacticError } from './semantic-or-syntactic-errors';
import { TSESTree } from './ts-estree';
import { ASTAndProgram, ensureAbsolutePath } from './create-program/shared';

const log = debug('typescript-eslint:typescript-estree:parser');

/**
 * This needs to be kept in sync with the top-level README.md in the
 * typescript-eslint monorepo
 */
const SUPPORTED_TYPESCRIPT_VERSIONS = '>=3.3.1 <4.2.0';
/*
 * The semver package will ignore prerelease ranges, and we don't want to explicitly document every one
 * List them all separately here, so we can automatically create the full string
 */
const SUPPORTED_PRERELEASE_RANGES: string[] = ['4.1.1-rc', '4.1.0-beta'];
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
): ASTAndProgram {
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
    debugLevel: new Set(),
    errorOnTypeScriptSyntacticAndSemanticIssues: false,
    errorOnUnknownASTType: false,
    EXPERIMENTAL_useSourceOfProjectReferenceRedirect: false,
    extraFileExtensions: [],
    filePath: getFileName(),
    jsx: false,
    loc: false,
    log: console.log, // eslint-disable-line no-console
    preserveNodeMaps: true,
    projects: [],
    range: false,
    strict: false,
    tokens: null,
    tsconfigRootDir: process.cwd(),
    useJSXTextNode: false,
  };
}

/**
 * Normalizes, sanitizes, resolves and filters the provided
 */
function prepareAndTransformProjects(
  projectsInput: string | string[] | undefined,
  ignoreListInput: string[],
): string[] {
  let projects: string[] = [];

  // Normalize and sanitize the project paths
  if (typeof projectsInput === 'string') {
    projects.push(projectsInput);
  } else if (Array.isArray(projectsInput)) {
    for (const project of projectsInput) {
      if (typeof project === 'string') {
        projects.push(project);
      }
    }
  }

  if (projects.length === 0) {
    return projects;
  }

  // Transform glob patterns into paths
  const globbedProjects = projects.filter(project => isGlob(project));
  projects = projects
    .filter(project => !isGlob(project))
    .concat(
      globSync([...globbedProjects, ...ignoreListInput], {
        cwd: extra.tsconfigRootDir,
      }),
    );

  log(
    'parserOptions.project (excluding ignored) matched projects: %s',
    projects,
  );

  return projects;
}

function applyParserOptionsToExtra(options: TSESTreeOptions): void {
  /**
   * Configure Debug logging
   */
  if (options.debugLevel === true) {
    extra.debugLevel = new Set(['typescript-eslint']);
  } else if (Array.isArray(options.debugLevel)) {
    extra.debugLevel = new Set(options.debugLevel);
  }
  if (extra.debugLevel.size > 0) {
    // debug doesn't support multiple `enable` calls, so have to do it all at once
    const namespaces = [];
    if (extra.debugLevel.has('typescript-eslint')) {
      namespaces.push('typescript-eslint:*');
    }
    if (
      extra.debugLevel.has('eslint') ||
      // make sure we don't turn off the eslint debug if it was enabled via --debug
      debug.enabled('eslint:*,-eslint:code-path')
    ) {
      // https://github.com/eslint/eslint/blob/9dfc8501fb1956c90dc11e6377b4cb38a6bea65d/bin/eslint.js#L25
      namespaces.push('eslint:*,-eslint:code-path');
    }
    debug.enable(namespaces.join(','));
  }

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
   * Get the file path
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
    extra.log = (): void => {};
  }

  if (typeof options.tsconfigRootDir === 'string') {
    extra.tsconfigRootDir = options.tsconfigRootDir;
  }

  // NOTE - ensureAbsolutePath relies upon having the correct tsconfigRootDir in extra
  extra.filePath = ensureAbsolutePath(extra.filePath, extra);

  // NOTE - prepareAndTransformProjects relies upon having the correct tsconfigRootDir in extra
  const projectFolderIgnoreList = (options.projectFolderIgnoreList ?? [])
    .reduce<string[]>((acc, folder) => {
      if (typeof folder === 'string') {
        acc.push(folder);
      }
      return acc;
    }, [])
    // prefix with a ! for not match glob
    .map(folder => (folder.startsWith('!') ? folder : `!${folder}`));
  extra.projects = prepareAndTransformProjects(
    options.project,
    projectFolderIgnoreList,
  );

  if (
    Array.isArray(options.extraFileExtensions) &&
    options.extraFileExtensions.every(ext => typeof ext === 'string')
  ) {
    extra.extraFileExtensions = options.extraFileExtensions;
  }

  /**
   * Allow the user to enable or disable the preservation of the AST node maps
   * during the conversion process.
   */
  if (typeof options.preserveNodeMaps === 'boolean') {
    extra.preserveNodeMaps = options.preserveNodeMaps;
  }

  extra.createDefaultProgram =
    typeof options.createDefaultProgram === 'boolean' &&
    options.createDefaultProgram;

  extra.EXPERIMENTAL_useSourceOfProjectReferenceRedirect =
    typeof options.EXPERIMENTAL_useSourceOfProjectReferenceRedirect ===
      'boolean' && options.EXPERIMENTAL_useSourceOfProjectReferenceRedirect;
}

function warnAboutTSVersion(): void {
  if (!isRunningSupportedTypeScriptVersion && !warnedAboutTSVersion) {
    const isTTY = typeof process === undefined ? false : process.stdout?.isTTY;
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface EmptyObject {}
type AST<T extends TSESTreeOptions> = TSESTree.Program &
  (T['tokens'] extends true ? { tokens: TSESTree.Token[] } : EmptyObject) &
  (T['comment'] extends true ? { comments: TSESTree.Comment[] } : EmptyObject);

interface ParseAndGenerateServicesResult<T extends TSESTreeOptions> {
  ast: AST<T>;
  services: ParserServices;
}
interface ParseWithNodeMapsResult<T extends TSESTreeOptions> {
  ast: AST<T>;
  esTreeNodeToTSNodeMap: ParserServices['esTreeNodeToTSNodeMap'];
  tsNodeToESTreeNodeMap: ParserServices['tsNodeToESTreeNodeMap'];
}

function parse<T extends TSESTreeOptions = TSESTreeOptions>(
  code: string,
  options?: T,
): AST<T> {
  const { ast } = parseWithNodeMaps(code, options);
  return ast;
}

function parseWithNodeMaps<T extends TSESTreeOptions = TSESTreeOptions>(
  code: string,
  options?: T,
): ParseWithNodeMapsResult<T> {
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
  const { estree, astMaps } = astConverter(ast, extra, false);

  return {
    ast: estree as AST<T>,
    esTreeNodeToTSNodeMap: astMaps.esTreeNodeToTSNodeMap,
    tsNodeToESTreeNodeMap: astMaps.tsNodeToESTreeNodeMap,
  };
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
   * Convert the TypeScript AST to an ESTree-compatible one, and optionally preserve
   * mappings between converted and original AST nodes
   */
  const preserveNodeMaps =
    typeof extra.preserveNodeMaps === 'boolean' ? extra.preserveNodeMaps : true;
  const { estree, astMaps } = astConverter(ast, extra, preserveNodeMaps);

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
      hasFullTypeInformation: shouldProvideParserServices,
      program,
      esTreeNodeToTSNodeMap: astMaps.esTreeNodeToTSNodeMap,
      tsNodeToESTreeNodeMap: astMaps.tsNodeToESTreeNodeMap,
    },
  };
}

export {
  AST,
  parse,
  parseAndGenerateServices,
  parseWithNodeMaps,
  ParseAndGenerateServicesResult,
  ParseWithNodeMapsResult,
};
