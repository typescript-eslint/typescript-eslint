import debug from 'debug';
import { sync as globSync } from 'globby';
import isGlob from 'is-glob';
import semver from 'semver';
import { normalize } from 'path';
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
import {
  ASTAndProgram,
  CanonicalPath,
  ensureAbsolutePath,
  getCanonicalFileName,
} from './create-program/shared';
import {
  createProgramFromConfigFile,
  useProvidedPrograms,
} from './create-program/useProvidedPrograms';

const log = debug('typescript-eslint:typescript-estree:parser');

/**
 * This needs to be kept in sync with the top-level README.md in the
 * typescript-eslint monorepo
 */
const SUPPORTED_TYPESCRIPT_VERSIONS = '>=3.3.1 <4.8.0';
/*
 * The semver package will ignore prerelease ranges, and we don't want to explicitly document every one
 * List them all separately here, so we can automatically create the full string
 */
const SUPPORTED_PRERELEASE_RANGES: string[] = ['4.7.0-beta'];
const ACTIVE_TYPESCRIPT_VERSION = ts.version;
const isRunningSupportedTypeScriptVersion = semver.satisfies(
  ACTIVE_TYPESCRIPT_VERSION,
  [SUPPORTED_TYPESCRIPT_VERSIONS]
    .concat(SUPPORTED_PRERELEASE_RANGES)
    .join(' || '),
);

let extra: Extra;
let warnedAboutTSVersion = false;

/**
 * Cache existing programs for the single run use-case.
 *
 * clearProgramCache() is only intended to be used in testing to ensure the parser is clean between tests.
 */
const existingPrograms = new Map<CanonicalPath, ts.Program>();
function clearProgramCache(): void {
  existingPrograms.clear();
}

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
 * @param programInstances One or more (potentially lazily constructed) existing programs to use
 * @param shouldProvideParserServices True if the program should be attempted to be calculated from provided tsconfig files
 * @param shouldCreateDefaultProgram True if the program should be created from compiler host
 * @returns Returns a source file and program corresponding to the linted code
 */
function getProgramAndAST(
  code: string,
  programInstances: Iterable<ts.Program> | null,
  shouldProvideParserServices: boolean,
  shouldCreateDefaultProgram: boolean,
): ASTAndProgram {
  return (
    (programInstances && useProvidedPrograms(programInstances, extra)) ||
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
    programs: null,
    projects: [],
    range: false,
    strict: false,
    tokens: null,
    tsconfigRootDir: process.cwd(),
    /**
     * Unless we can reliably infer otherwise, we default to assuming that this run could be part
     * of a long-running session (e.g. in an IDE) and watch programs will therefore be required
     */
    singleRun: false,
    moduleResolver: '',
  };
}

function getTsconfigPath(tsconfigPath: string, extra: Extra): CanonicalPath {
  return getCanonicalFileName(ensureAbsolutePath(tsconfigPath, extra));
}

/**
 * Normalizes, sanitizes, resolves and filters the provided project paths
 */
function prepareAndTransformProjects(
  projectsInput: string | string[] | undefined,
  ignoreListInput: string[],
): CanonicalPath[] {
  const sanitizedProjects: string[] = [];

  // Normalize and sanitize the project paths
  if (typeof projectsInput === 'string') {
    sanitizedProjects.push(projectsInput);
  } else if (Array.isArray(projectsInput)) {
    for (const project of projectsInput) {
      if (typeof project === 'string') {
        sanitizedProjects.push(project);
      }
    }
  }

  if (sanitizedProjects.length === 0) {
    return [];
  }

  // Transform glob patterns into paths
  const nonGlobProjects = sanitizedProjects.filter(project => !isGlob(project));
  const globProjects = sanitizedProjects.filter(project => isGlob(project));
  const uniqueCanonicalProjectPaths = new Set(
    nonGlobProjects
      .concat(
        globSync([...globProjects, ...ignoreListInput], {
          cwd: extra.tsconfigRootDir,
        }),
      )
      .map(project => getTsconfigPath(project, extra)),
  );

  log(
    'parserOptions.project (excluding ignored) matched projects: %s',
    uniqueCanonicalProjectPaths,
  );

  return Array.from(uniqueCanonicalProjectPaths);
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

  if (Array.isArray(options.programs)) {
    if (!options.programs.length) {
      throw new Error(
        `You have set parserOptions.programs to an empty array. This will cause all files to not be found in existing programs. Either provide one or more existing TypeScript Program instances in the array, or remove the parserOptions.programs setting.`,
      );
    }
    extra.programs = options.programs;
    log(
      'parserOptions.programs was provided, so parserOptions.project will be ignored.',
    );
  }

  if (!extra.programs) {
    // providing a program overrides project resolution
    const projectFolderIgnoreList = (
      options.projectFolderIgnoreList ?? ['**/node_modules/**']
    )
      .reduce<string[]>((acc, folder) => {
        if (typeof folder === 'string') {
          acc.push(folder);
        }
        return acc;
      }, [])
      // prefix with a ! for not match glob
      .map(folder => (folder.startsWith('!') ? folder : `!${folder}`));
    // NOTE - prepareAndTransformProjects relies upon having the correct tsconfigRootDir in extra
    extra.projects = prepareAndTransformProjects(
      options.project,
      projectFolderIgnoreList,
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

  if (typeof options.moduleResolver === 'string') {
    extra.moduleResolver = options.moduleResolver;
  }
}

function warnAboutTSVersion(): void {
  if (!isRunningSupportedTypeScriptVersion && !warnedAboutTSVersion) {
    const isTTY =
      typeof process === 'undefined' ? false : process.stdout?.isTTY;
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

/**
 * ESLint (and therefore typescript-eslint) is used in both "single run"/one-time contexts,
 * such as an ESLint CLI invocation, and long-running sessions (such as continuous feedback
 * on a file in an IDE).
 *
 * When typescript-eslint handles TypeScript Program management behind the scenes, this distinction
 * is important because there is significant overhead to managing the so called Watch Programs
 * needed for the long-running use-case. We therefore use the following logic to figure out which
 * of these contexts applies to the current execution.
 */
function inferSingleRun(options: TSESTreeOptions | undefined): void {
  // Allow users to explicitly inform us of their intent to perform a single run (or not) with TSESTREE_SINGLE_RUN
  if (process.env.TSESTREE_SINGLE_RUN === 'false') {
    extra.singleRun = false;
    return;
  }
  if (process.env.TSESTREE_SINGLE_RUN === 'true') {
    extra.singleRun = true;
    return;
  }

  // Currently behind a flag while we gather real-world feedback
  if (options?.allowAutomaticSingleRunInference) {
    if (
      // Default to single runs for CI processes. CI=true is set by most CI providers by default.
      process.env.CI === 'true' ||
      // This will be true for invocations such as `npx eslint ...` and `./node_modules/.bin/eslint ...`
      process.argv[1].endsWith(normalize('node_modules/.bin/eslint'))
    ) {
      extra.singleRun = true;
      return;
    }
  }

  /**
   * We default to assuming that this run could be part of a long-running session (e.g. in an IDE)
   * and watch programs will therefore be required
   */
  extra.singleRun = false;
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
  const { ast } = parseWithNodeMapsInternal(code, options, false);
  return ast;
}

function parseWithNodeMapsInternal<T extends TSESTreeOptions = TSESTreeOptions>(
  code: string,
  options: T | undefined,
  shouldPreserveNodeMaps: boolean,
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
   * Figure out whether this is a single run or part of a long-running process
   */
  inferSingleRun(options);

  /**
   * Create a ts.SourceFile directly, no ts.Program is needed for a simple
   * parse
   */
  const ast = createSourceFile(code, extra);

  /**
   * Convert the TypeScript AST to an ESTree-compatible one
   */
  const { estree, astMaps } = astConverter(ast, extra, shouldPreserveNodeMaps);

  return {
    ast: estree as AST<T>,
    esTreeNodeToTSNodeMap: astMaps.esTreeNodeToTSNodeMap,
    tsNodeToESTreeNodeMap: astMaps.tsNodeToESTreeNodeMap,
  };
}

function parseWithNodeMaps<T extends TSESTreeOptions = TSESTreeOptions>(
  code: string,
  options?: T,
): ParseWithNodeMapsResult<T> {
  return parseWithNodeMapsInternal(code, options, true);
}

let parseAndGenerateServicesCalls: { [fileName: string]: number } = {};
// Privately exported utility intended for use in typescript-eslint unit tests only
function clearParseAndGenerateServicesCalls(): void {
  parseAndGenerateServicesCalls = {};
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
   * Figure out whether this is a single run or part of a long-running process
   */
  inferSingleRun(options);

  /**
   * If this is a single run in which the user has not provided any existing programs but there
   * are programs which need to be created from the provided "project" option,
   * create an Iterable which will lazily create the programs as needed by the iteration logic
   */
  if (extra.singleRun && !extra.programs && extra.projects?.length > 0) {
    extra.programs = {
      *[Symbol.iterator](): Iterator<ts.Program> {
        for (const configFile of extra.projects) {
          const existingProgram = existingPrograms.get(configFile);
          if (existingProgram) {
            yield existingProgram;
          } else {
            log(
              'Detected single-run/CLI usage, creating Program once ahead of time for project: %s',
              configFile,
            );
            const newProgram = createProgramFromConfigFile(configFile);
            existingPrograms.set(configFile, newProgram);
            yield newProgram;
          }
        }
      },
    };
  }

  /**
   * Generate a full ts.Program or offer provided instances in order to be able to provide parser services, such as type-checking
   */
  const shouldProvideParserServices =
    extra.programs != null || (extra.projects && extra.projects.length > 0);

  /**
   * If we are in singleRun mode but the parseAndGenerateServices() function has been called more than once for the current file,
   * it must mean that we are in the middle of an ESLint automated fix cycle (in which parsing can be performed up to an additional
   * 10 times in order to apply all possible fixes for the file).
   *
   * In this scenario we cannot rely upon the singleRun AOT compiled programs because the SourceFiles will not contain the source
   * with the latest fixes applied. Therefore we fallback to creating the quickest possible isolated program from the updated source.
   */
  let ast: ts.SourceFile;
  let program: ts.Program;

  if (extra.singleRun && options.filePath) {
    parseAndGenerateServicesCalls[options.filePath] =
      (parseAndGenerateServicesCalls[options.filePath] || 0) + 1;
  }

  if (
    extra.singleRun &&
    options.filePath &&
    parseAndGenerateServicesCalls[options.filePath] > 1
  ) {
    const isolatedAstAndProgram = createIsolatedProgram(code, extra);
    ast = isolatedAstAndProgram.ast;
    program = isolatedAstAndProgram.program;
  } else {
    const astAndProgram = getProgramAndAST(
      code,
      extra.programs,
      shouldProvideParserServices,
      extra.createDefaultProgram,
    )!;
    ast = astAndProgram.ast;
    program = astAndProgram.program;
  }

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
  clearProgramCache,
  clearParseAndGenerateServicesCalls,
};
