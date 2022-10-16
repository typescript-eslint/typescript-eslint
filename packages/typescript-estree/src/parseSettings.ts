import debug from 'debug';
import { sync as globSync } from 'globby';
import isGlob from 'is-glob';
import type * as ts from 'typescript';

import type { CanonicalPath } from './create-program/shared';
import {
  ensureAbsolutePath,
  getCanonicalFileName,
} from './create-program/shared';
import { inferSingleRun } from './inferSingleRun';
import { log } from './log';
import type { TSESTreeOptions } from './parser-options';
import type { TSESTree } from './ts-estree';
import { warnAboutTSVersion } from './warnAboutTSVersion';

type DebugModule = 'typescript-eslint' | 'eslint' | 'typescript';

/**
 * Internal settings used by the parser to run on a file.
 */
export interface ParseSettings {
  /**
   * Code of the file being parsed.
   */
  code: string;

  /**
   * Whether the `comment` parse option is enabled.
   */
  comment: boolean;

  /**
   * If the `comment` parse option is enabled, retrieved comments.
   */
  comments: TSESTree.Comment[];

  /**
   * Whether to create a TypeScript program if one is not provided.
   */
  createDefaultProgram: boolean;

  /**
   * Which debug areas should be logged.
   */
  debugLevel: Set<DebugModule>;

  /**
   * Whether to error if TypeScript reports a semantic or syntactic error diagnostic.
   */
  errorOnTypeScriptSyntacticAndSemanticIssues: boolean;

  /**
   * Whether to error if an unknown AST node type is encountered.
   */
  errorOnUnknownASTType: boolean;

  /**
   * Whether TS should use the source files for referenced projects instead of the compiled .d.ts files.
   *
   * @remarks
   * This feature is not yet optimized, and is likely to cause OOMs for medium to large projects.
   * This flag REQUIRES at least TS v3.9, otherwise it does nothing.
   */
  EXPERIMENTAL_useSourceOfProjectReferenceRedirect: boolean;

  /**
   * Any non-standard file extensions which will be parsed.
   */
  extraFileExtensions: string[];

  /**
   * Path of the file being parsed.
   */
  filePath: string;

  /**
   * Whether parsing of JSX is enabled.
   *
   * @remarks The applicable file extension is still required.
   */
  jsx: boolean;

  /**
   * Whether to add `loc` information to each node.
   */
  loc: boolean;

  /**
   * Log function, if not `console.log`.
   */
  log: (message: string) => void;

  /**
   * Path for a module resolver to use for the compiler host's `resolveModuleNames`.
   */
  moduleResolver: string;

  /**
   * Whether two-way AST node maps are preserved during the AST conversion process.
   */
  preserveNodeMaps?: boolean;

  /**
   * One or more instances of TypeScript Program objects to be used for type information.
   */
  programs: null | Iterable<ts.Program>;

  /**
   * Normalized paths to provided project paths.
   */
  projects: CanonicalPath[];

  /**
   * Whether to add the `range` property to AST nodes.
   */
  range: boolean;

  /**
   * Whether this is part of a single run, rather than a long-running process.
   */
  singleRun: boolean;

  /**
   * If the `cotokensmment` parse option is enabled, retrieved tokens.
   */
  tokens: null | TSESTree.Token[];

  /**
   * The absolute path to the root directory for all provided `project`s.
   */
  tsconfigRootDir: string;
}

export function createParseSettings(
  code: string,
  options: Partial<TSESTreeOptions> = {},
): ParseSettings {
  const tsconfigRootDir =
    typeof options.tsconfigRootDir === 'string'
      ? options.tsconfigRootDir
      : process.cwd();
  const parseSettings: ParseSettings = {
    code: enforceString(code),
    comment: options.comment === true,
    comments: [],
    createDefaultProgram: options.createDefaultProgram === true,
    debugLevel:
      options.debugLevel === true
        ? new Set(['typescript-eslint'])
        : Array.isArray(options.debugLevel)
        ? new Set(options.debugLevel)
        : new Set(),
    errorOnTypeScriptSyntacticAndSemanticIssues: false,
    errorOnUnknownASTType: options.errorOnUnknownASTType === true,
    EXPERIMENTAL_useSourceOfProjectReferenceRedirect:
      options.EXPERIMENTAL_useSourceOfProjectReferenceRedirect === true,
    extraFileExtensions:
      Array.isArray(options.extraFileExtensions) &&
      options.extraFileExtensions.every(ext => typeof ext === 'string')
        ? options.extraFileExtensions
        : [],
    filePath: ensureAbsolutePath(
      typeof options.filePath === 'string' && options.filePath !== '<input>'
        ? options.filePath
        : getFileName(options.jsx),
      tsconfigRootDir,
    ),
    jsx: options.jsx === true,
    loc: options.loc === true,
    log:
      typeof options.loggerFn === 'function'
        ? options.loggerFn
        : options.loggerFn === false
        ? (): void => {}
        : console.log, // eslint-disable-line no-console
    moduleResolver: options.moduleResolver ?? '',
    preserveNodeMaps: options.preserveNodeMaps !== false,
    programs: Array.isArray(options.programs) ? options.programs : null,
    projects: [],
    range: options.range === true,
    singleRun: inferSingleRun(options),
    tokens: options.tokens === true ? [] : null,
    tsconfigRootDir,
  };

  // debug doesn't support multiple `enable` calls, so have to do it all at once
  if (parseSettings.debugLevel.size > 0) {
    const namespaces = [];
    if (parseSettings.debugLevel.has('typescript-eslint')) {
      namespaces.push('typescript-eslint:*');
    }
    if (
      parseSettings.debugLevel.has('eslint') ||
      // make sure we don't turn off the eslint debug if it was enabled via --debug
      debug.enabled('eslint:*,-eslint:code-path')
    ) {
      // https://github.com/eslint/eslint/blob/9dfc8501fb1956c90dc11e6377b4cb38a6bea65d/bin/eslint.js#L25
      namespaces.push('eslint:*,-eslint:code-path');
    }
    debug.enable(namespaces.join(','));
  }

  if (Array.isArray(options.programs)) {
    if (!options.programs.length) {
      throw new Error(
        `You have set parserOptions.programs to an empty array. This will cause all files to not be found in existing programs. Either provide one or more existing TypeScript Program instances in the array, or remove the parserOptions.programs setting.`,
      );
    }
    log(
      'parserOptions.programs was provided, so parserOptions.project will be ignored.',
    );
  }

  // Providing a program overrides project resolution
  if (!parseSettings.programs) {
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

    parseSettings.projects = prepareAndTransformProjects(
      tsconfigRootDir,
      options.project,
      projectFolderIgnoreList,
    );
  }

  warnAboutTSVersion(parseSettings);

  return parseSettings;
}

/**
 * Ensures source code is a string.
 */
function enforceString(code: unknown): string {
  if (typeof code !== 'string') {
    return String(code);
  }

  return code;
}

/**
 * Compute the filename based on the parser options.
 *
 * Even if jsx option is set in typescript compiler, filename still has to
 * contain .tsx file extension.
 *
 * @param options Parser options
 */
function getFileName(jsx?: boolean): string {
  return jsx ? 'estree.tsx' : 'estree.ts';
}

function getTsconfigPath(
  tsconfigPath: string,
  tsconfigRootDir: string,
): CanonicalPath {
  return getCanonicalFileName(
    ensureAbsolutePath(tsconfigPath, tsconfigRootDir),
  );
}

/**
 * Normalizes, sanitizes, resolves and filters the provided project paths
 */
function prepareAndTransformProjects(
  tsconfigRootDir: string,
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
          cwd: tsconfigRootDir,
        }),
      )
      .map(project => getTsconfigPath(project, tsconfigRootDir)),
  );

  log(
    'parserOptions.project (excluding ignored) matched projects: %s',
    uniqueCanonicalProjectPaths,
  );

  return Array.from(uniqueCanonicalProjectPaths);
}
