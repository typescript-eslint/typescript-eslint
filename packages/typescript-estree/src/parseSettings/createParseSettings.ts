import debug from 'debug';
import type * as ts from 'typescript';

import { createProjectService } from '../create-program/createProjectService';
import { ensureAbsolutePath } from '../create-program/shared';
import type { TSESTreeOptions } from '../parser-options';
import { isSourceFile } from '../source-files';
import {
  DEFAULT_TSCONFIG_CACHE_DURATION_SECONDS,
  ExpiringCache,
} from './ExpiringCache';
import { getProjectConfigFiles } from './getProjectConfigFiles';
import type { MutableParseSettings } from './index';
import { inferSingleRun } from './inferSingleRun';
import { resolveProjectList } from './resolveProjectList';
import { warnAboutTSVersion } from './warnAboutTSVersion';

const log = debug(
  'typescript-eslint:typescript-estree:parser:parseSettings:createParseSettings',
);

let TSCONFIG_MATCH_CACHE: ExpiringCache<string, string> | null;

let TSSERVER_PROJECT_SERVICE: ReturnType<typeof createProjectService> | null =
  null;

export function createParseSettings(
  code: string | ts.SourceFile,
  options: Partial<TSESTreeOptions> = {},
): MutableParseSettings {
  const codeFullText = enforceCodeString(code);
  const singleRun = inferSingleRun(options);
  const tsconfigRootDir =
    typeof options.tsconfigRootDir === 'string'
      ? options.tsconfigRootDir
      : process.cwd();
  const parseSettings: MutableParseSettings = {
    allowInvalidAST: options.allowInvalidAST === true,
    code,
    codeFullText,
    comment: options.comment === true,
    comments: [],
    DEPRECATED__createDefaultProgram:
      // eslint-disable-next-line deprecation/deprecation -- will be cleaned up with the next major
      options.DEPRECATED__createDefaultProgram === true,
    debugLevel:
      options.debugLevel === true
        ? new Set(['typescript-eslint'])
        : Array.isArray(options.debugLevel)
        ? new Set(options.debugLevel)
        : new Set(),
    errorOnTypeScriptSyntacticAndSemanticIssues: false,
    errorOnUnknownASTType: options.errorOnUnknownASTType === true,
    EXPERIMENTAL_projectService:
      (options.EXPERIMENTAL_useProjectService === true &&
        process.env.TYPESCRIPT_ESLINT_EXPERIMENTAL_TSSERVER !== 'false') ||
      (process.env.TYPESCRIPT_ESLINT_EXPERIMENTAL_TSSERVER === 'true' &&
        options.EXPERIMENTAL_useProjectService !== false)
        ? (TSSERVER_PROJECT_SERVICE ??= createProjectService())
        : undefined,
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
    preserveNodeMaps: options.preserveNodeMaps !== false,
    programs: Array.isArray(options.programs) ? options.programs : null,
    projects: [],
    range: options.range === true,
    singleRun,
    suppressDeprecatedPropertyWarnings:
      options.suppressDeprecatedPropertyWarnings ??
      process.env.NODE_ENV !== 'test',
    tokens: options.tokens === true ? [] : null,
    tsconfigMatchCache: (TSCONFIG_MATCH_CACHE ??= new ExpiringCache(
      singleRun
        ? 'Infinity'
        : options.cacheLifetime?.glob ??
          DEFAULT_TSCONFIG_CACHE_DURATION_SECONDS,
    )),
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
    parseSettings.projects = resolveProjectList({
      cacheLifetime: options.cacheLifetime,
      project: getProjectConfigFiles(parseSettings, options.project),
      projectFolderIgnoreList: options.projectFolderIgnoreList,
      singleRun: parseSettings.singleRun,
      tsconfigRootDir: tsconfigRootDir,
    });
  }

  warnAboutTSVersion(parseSettings);

  return parseSettings;
}

export function clearTSConfigMatchCache(): void {
  TSCONFIG_MATCH_CACHE?.clear();
}

export function clearTSServerProjectService(): void {
  TSSERVER_PROJECT_SERVICE = null;
}

/**
 * Ensures source code is a string.
 */
function enforceCodeString(code: unknown): string {
  return isSourceFile(code)
    ? code.getFullText(code)
    : typeof code === 'string'
    ? code
    : String(code);
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
