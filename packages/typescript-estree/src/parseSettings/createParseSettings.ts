import debug from 'debug';
import * as ts from 'typescript';

import type { ProjectServiceSettings } from '../create-program/createProjectService';
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
let TSSERVER_PROJECT_SERVICE: ProjectServiceSettings | null = null;

// NOTE - we intentionally use "unnecessary" `?.` here because in TS<5.3 this enum doesn't exist
// This object exists so we can centralize these for tracking and so we don't proliferate these across the file
// https://github.com/microsoft/TypeScript/issues/56579
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
const JSDocParsingMode = {
  ParseAll: ts.JSDocParsingMode?.ParseAll,
  ParseNone: ts.JSDocParsingMode?.ParseNone,
  ParseForTypeErrors: ts.JSDocParsingMode?.ParseForTypeErrors,
  ParseForTypeInfo: ts.JSDocParsingMode?.ParseForTypeInfo,
} as const;
/* eslint-enable @typescript-eslint/no-unnecessary-condition */

export function createParseSettings(
  code: ts.SourceFile | string,
  tsestreeOptions: Partial<TSESTreeOptions> = {},
): MutableParseSettings {
  const codeFullText = enforceCodeString(code);
  const singleRun = inferSingleRun(tsestreeOptions);
  const tsconfigRootDir =
    typeof tsestreeOptions.tsconfigRootDir === 'string'
      ? tsestreeOptions.tsconfigRootDir
      : process.cwd();
  const passedLoggerFn = typeof tsestreeOptions.loggerFn === 'function';
  const jsDocParsingMode = ((): ts.JSDocParsingMode => {
    switch (tsestreeOptions.jsDocParsingMode) {
      case 'all':
        return JSDocParsingMode.ParseAll;

      case 'none':
        return JSDocParsingMode.ParseNone;

      case 'type-info':
        return JSDocParsingMode.ParseForTypeInfo;

      default:
        return JSDocParsingMode.ParseAll;
    }
  })();

  const parseSettings: MutableParseSettings = {
    allowInvalidAST: tsestreeOptions.allowInvalidAST === true,
    code,
    codeFullText,
    comment: tsestreeOptions.comment === true,
    comments: [],
    debugLevel:
      tsestreeOptions.debugLevel === true
        ? new Set(['typescript-eslint'])
        : Array.isArray(tsestreeOptions.debugLevel)
          ? new Set(tsestreeOptions.debugLevel)
          : new Set(),
    errorOnTypeScriptSyntacticAndSemanticIssues: false,
    errorOnUnknownASTType: tsestreeOptions.errorOnUnknownASTType === true,
    EXPERIMENTAL_projectService:
      tsestreeOptions.EXPERIMENTAL_useProjectService ||
      (tsestreeOptions.project &&
        tsestreeOptions.EXPERIMENTAL_useProjectService !== false &&
        process.env.TYPESCRIPT_ESLINT_EXPERIMENTAL_TSSERVER === 'true')
        ? (TSSERVER_PROJECT_SERVICE ??= createProjectService(
            tsestreeOptions.EXPERIMENTAL_useProjectService,
            jsDocParsingMode,
          ))
        : undefined,
    extraFileExtensions:
      Array.isArray(tsestreeOptions.extraFileExtensions) &&
      tsestreeOptions.extraFileExtensions.every(ext => typeof ext === 'string')
        ? tsestreeOptions.extraFileExtensions
        : [],
    filePath: ensureAbsolutePath(
      typeof tsestreeOptions.filePath === 'string' &&
        tsestreeOptions.filePath !== '<input>'
        ? tsestreeOptions.filePath
        : getFileName(tsestreeOptions.jsx),
      tsconfigRootDir,
    ),
    jsDocParsingMode,
    jsx: tsestreeOptions.jsx === true,
    loc: tsestreeOptions.loc === true,
    log:
      typeof tsestreeOptions.loggerFn === 'function'
        ? tsestreeOptions.loggerFn
        : tsestreeOptions.loggerFn === false
          ? (): void => {} // eslint-disable-line @typescript-eslint/no-empty-function
          : console.log, // eslint-disable-line no-console
    preserveNodeMaps: tsestreeOptions.preserveNodeMaps !== false,
    programs: Array.isArray(tsestreeOptions.programs)
      ? tsestreeOptions.programs
      : null,
    projects: new Map(),
    range: tsestreeOptions.range === true,
    singleRun,
    suppressDeprecatedPropertyWarnings:
      tsestreeOptions.suppressDeprecatedPropertyWarnings ??
      process.env.NODE_ENV !== 'test',
    tokens: tsestreeOptions.tokens === true ? [] : null,
    tsconfigMatchCache: (TSCONFIG_MATCH_CACHE ??= new ExpiringCache(
      singleRun
        ? 'Infinity'
        : tsestreeOptions.cacheLifetime?.glob ??
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

  if (Array.isArray(tsestreeOptions.programs)) {
    if (!tsestreeOptions.programs.length) {
      throw new Error(
        `You have set parserOptions.programs to an empty array. This will cause all files to not be found in existing programs. Either provide one or more existing TypeScript Program instances in the array, or remove the parserOptions.programs setting.`,
      );
    }
    log(
      'parserOptions.programs was provided, so parserOptions.project will be ignored.',
    );
  }

  // Providing a program or project service overrides project resolution
  if (!parseSettings.programs && !parseSettings.EXPERIMENTAL_projectService) {
    parseSettings.projects = resolveProjectList({
      cacheLifetime: tsestreeOptions.cacheLifetime,
      project: getProjectConfigFiles(parseSettings, tsestreeOptions.project),
      projectFolderIgnoreList: tsestreeOptions.projectFolderIgnoreList,
      singleRun: parseSettings.singleRun,
      tsconfigRootDir: tsconfigRootDir,
    });
  }

  // No type-aware linting which means that cross-file (or even same-file) JSDoc is useless
  // So in this specific case we default to 'none' if no value was provided
  if (
    tsestreeOptions.jsDocParsingMode == null &&
    parseSettings.projects.size === 0 &&
    parseSettings.programs == null &&
    parseSettings.EXPERIMENTAL_projectService == null
  ) {
    parseSettings.jsDocParsingMode = JSDocParsingMode.ParseNone;
  }

  warnAboutTSVersion(parseSettings, passedLoggerFn);

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
 */
function getFileName(jsx?: boolean): string {
  return jsx ? 'estree.tsx' : 'estree.ts';
}
