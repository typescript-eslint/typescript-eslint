import debug from 'debug';
import * as ts from 'typescript';

import type {
  ASTAndDefiniteProgram,
  ASTAndProgram,
  CanonicalPath,
} from './create-program/shared';
import type {
  ParserServices,
  ParserServicesNodeMaps,
  TSESTreeOptions,
} from './parser-options';
import type { ParseSettings } from './parseSettings';
import type { TSESTree } from './ts-estree';

import { astConverter } from './ast-converter';
import { convertError } from './convert';
import { createIsolatedProgram } from './create-program/createIsolatedProgram';
import { createProjectProgram } from './create-program/createProjectProgram';
import {
  createNoProgram,
  createSourceFile,
} from './create-program/createSourceFile';
import { getWatchProgramsForProjects } from './create-program/getWatchProgramsForProjects';
import {
  getAstFromProgram,
  getCanonicalFileName,
} from './create-program/shared';
import {
  createProgramFromConfigFile,
  useProvidedPrograms,
} from './create-program/useProvidedPrograms';
import { createParserServices } from './createParserServices';
import { createParseSettings } from './parseSettings/createParseSettings';
import { getProjectConfigFiles } from './parseSettings/getProjectConfigFiles';
import { getFirstSemanticOrSyntacticError } from './semantic-or-syntactic-errors';
import { useProgramFromProjectService } from './useProgramFromProjectService';

const log = debug('typescript-eslint:typescript-estree:parser');

/**
 * Cache existing programs for the single run use-case.
 *
 * clearProgramCache() is only intended to be used in testing to ensure the parser is clean between tests.
 */
const existingPrograms = new Map<CanonicalPath, ts.Program>();

/**
 * Tsconfigs with project references, which single runs leave to the project service.
 */
const configFilesWithReferences = new Set<CanonicalPath>();

export function clearProgramCache(): void {
  existingPrograms.clear();
  configFilesWithReferences.clear();
}

/**
 * Files don't change on disk during a single run, so the project service's
 * bookkeeping for each opened file isn't needed. Instead, each file can come
 * from a Program created once for its tsconfig, the same as with
 * `parserOptions.project`. Anything less straightforward is left to the
 * project service: default project files, extra file extensions, project
 * references, and files not found in their tsconfig's Program.
 */
function useSingleRunProgramForProjectService(
  parseSettings: ParseSettings,
): ASTAndDefiniteProgram | undefined {
  if (
    parseSettings.extraFileExtensions.length ||
    parseSettings.projectService?.allowDefaultProject?.length
  ) {
    return undefined;
  }

  let configFile: string | undefined;
  try {
    [configFile] = getProjectConfigFiles(parseSettings, true) ?? [];
  } catch {
    return undefined;
  }

  if (!configFile) {
    return undefined;
  }

  const canonicalConfigFile = getCanonicalFileName(configFile);
  if (configFilesWithReferences.has(canonicalConfigFile)) {
    return undefined;
  }

  let program = existingPrograms.get(canonicalConfigFile);
  if (!program) {
    // The project service loads referenced projects from their source files,
    // while a Program would use their built declaration files.
    // References aren't inherited through extends, so the raw file is enough.
    const rawConfig = ts.readConfigFile(configFile, ts.sys.readFile).config as
      { references?: unknown[] } | undefined;
    if (rawConfig?.references?.length) {
      configFilesWithReferences.add(canonicalConfigFile);
      return undefined;
    }

    log('Creating single-run Program for project service: %s', configFile);
    program = createProgramFromConfigFile(
      configFile,
      undefined,
      parseSettings.jsDocParsingMode,
    );
    existingPrograms.set(canonicalConfigFile, program);
  }

  const astAndProgram = getAstFromProgram(program, parseSettings.filePath);
  if (astAndProgram?.ast.text !== parseSettings.codeFullText) {
    return undefined;
  }

  astAndProgram.program.getTypeChecker(); // ensure parent pointers are set in source files
  return astAndProgram;
}

const defaultProjectMatchedFiles = new Set<string>();
export function clearDefaultProjectMatchedFiles(): void {
  defaultProjectMatchedFiles.clear();
}

/**
 * @param parseSettings Internal settings for parsing the file
 * @param hasFullTypeInformation True if the program should be attempted to be calculated from provided tsconfig files
 * @returns Returns a source file and program corresponding to the linted code
 */
function getProgramAndAST(
  parseSettings: ParseSettings,
  hasFullTypeInformation: boolean,
): ASTAndProgram {
  if (parseSettings.projectService) {
    if (parseSettings.singleRun && hasFullTypeInformation) {
      const fromSingleRunProgram =
        useSingleRunProgramForProjectService(parseSettings);
      if (fromSingleRunProgram) {
        return fromSingleRunProgram;
      }
    }

    const fromProjectService = useProgramFromProjectService(
      parseSettings.projectService,
      parseSettings,
      hasFullTypeInformation,
      defaultProjectMatchedFiles,
    );
    if (fromProjectService) {
      return fromProjectService;
    }
  }

  if (parseSettings.programs) {
    return useProvidedPrograms(parseSettings.programs, parseSettings);
  }

  // no need to waste time creating a program as the caller didn't want parser services
  // so we can save time and just create a lonesome source file
  if (!hasFullTypeInformation) {
    return createNoProgram(parseSettings);
  }

  return createProjectProgram(
    parseSettings,
    getWatchProgramsForProjects(parseSettings),
  );
}

/* eslint-disable @typescript-eslint/no-empty-object-type */
export type AST<T extends TSESTreeOptions> = (T['comment'] extends true
  ? { comments: TSESTree.Comment[] }
  : {}) &
  (T['tokens'] extends true ? { tokens: TSESTree.Token[] } : {}) &
  TSESTree.Program;
/* eslint-enable @typescript-eslint/no-empty-object-type */

export interface ParseAndGenerateServicesResult<T extends TSESTreeOptions> {
  ast: AST<T>;
  services: ParserServices;
}
interface ParseWithNodeMapsResult<
  T extends TSESTreeOptions,
> extends ParserServicesNodeMaps {
  ast: AST<T>;
}

export function parse<T extends TSESTreeOptions = TSESTreeOptions>(
  code: string,
  options?: T,
): AST<T> {
  const { ast } = parseWithNodeMapsInternal(code, options, false);
  return ast;
}

function parseWithNodeMapsInternal<T extends TSESTreeOptions = TSESTreeOptions>(
  code: string | ts.SourceFile,
  options: T | undefined,
  shouldPreserveNodeMaps: boolean,
): ParseWithNodeMapsResult<T> {
  /**
   * Reset the parse configuration
   */
  const parseSettings = createParseSettings(code, options);

  /**
   * Ensure users do not attempt to use parse() when they need parseAndGenerateServices()
   */
  if (options?.errorOnTypeScriptSyntacticAndSemanticIssues) {
    throw new Error(
      `"errorOnTypeScriptSyntacticAndSemanticIssues" is only supported for parseAndGenerateServices()`,
    );
  }

  /**
   * Create a ts.SourceFile directly, no ts.Program is needed for a simple parse
   */
  const ast = createSourceFile(parseSettings);

  /**
   * Convert the TypeScript AST to an ESTree-compatible one
   */
  const { astMaps, estree } = astConverter(
    ast,
    parseSettings,
    shouldPreserveNodeMaps,
  );

  return {
    ast: estree as AST<T>,
    esTreeNodeToTSNodeMap: astMaps.esTreeNodeToTSNodeMap,
    tsNodeToESTreeNodeMap: astMaps.tsNodeToESTreeNodeMap,
  };
}

let parseAndGenerateServicesCalls: Record<string, number> = {};
// Privately exported utility intended for use in typescript-eslint unit tests only
export function clearParseAndGenerateServicesCalls(): void {
  parseAndGenerateServicesCalls = {};
}

export function parseAndGenerateServices<
  T extends TSESTreeOptions = TSESTreeOptions,
>(
  code: string | ts.SourceFile,
  tsestreeOptions: T,
): ParseAndGenerateServicesResult<T> {
  /**
   * Reset the parse configuration
   */
  const parseSettings = createParseSettings(code, tsestreeOptions);

  /**
   * If this is a single run in which the user has not provided any existing programs but there
   * are programs which need to be created from the provided "project" option,
   * create an Iterable which will lazily create the programs as needed by the iteration logic
   */
  if (
    parseSettings.singleRun &&
    !parseSettings.programs &&
    parseSettings.projects.size > 0
  ) {
    parseSettings.programs = {
      *[Symbol.iterator](): Iterator<ts.Program> {
        for (const configFile of parseSettings.projects) {
          const existingProgram = existingPrograms.get(configFile[0]);
          if (existingProgram) {
            yield existingProgram;
          } else {
            log(
              'Detected single-run/CLI usage, creating Program once ahead of time for project: %s',
              configFile,
            );
            const newProgram = createProgramFromConfigFile(configFile[1]);
            existingPrograms.set(configFile[0], newProgram);
            yield newProgram;
          }
        }
      },
    };
  }

  const hasFullTypeInformation =
    parseSettings.programs != null ||
    parseSettings.projects.size > 0 ||
    !!parseSettings.projectService;

  if (
    typeof tsestreeOptions.errorOnTypeScriptSyntacticAndSemanticIssues ===
      'boolean' &&
    tsestreeOptions.errorOnTypeScriptSyntacticAndSemanticIssues
  ) {
    parseSettings.errorOnTypeScriptSyntacticAndSemanticIssues = true;
  }

  if (
    parseSettings.errorOnTypeScriptSyntacticAndSemanticIssues &&
    !hasFullTypeInformation
  ) {
    throw new Error(
      'Cannot calculate TypeScript semantic issues without a valid project.',
    );
  }

  /**
   * If we are in singleRun mode but the parseAndGenerateServices() function has been called more than once for the current file,
   * it must mean that we are in the middle of an ESLint automated fix cycle (in which parsing can be performed up to an additional
   * 10 times in order to apply all possible fixes for the file).
   *
   * In this scenario we cannot rely upon the singleRun AOT compiled programs because the SourceFiles will not contain the source
   * with the latest fixes applied. Therefore we fallback to creating the quickest possible isolated program from the updated source.
   *
   * Note: This fallback is only needed for the legacy `project` option which uses AOT compiled programs.
   * When `projectService` is used, the TypeScript language service always provides up-to-date programs,
   * so no fallback is necessary. Additionally, external parsers like vue-eslint-parser may call
   * parseAndGenerateServices() multiple times for the same file in a single lint pass, which would
   * incorrectly trigger this fallback.
   */
  if (parseSettings.singleRun && tsestreeOptions.filePath) {
    parseAndGenerateServicesCalls[tsestreeOptions.filePath] =
      (parseAndGenerateServicesCalls[tsestreeOptions.filePath] || 0) + 1;
  }

  const { ast, program } =
    parseSettings.singleRun &&
    tsestreeOptions.filePath &&
    parseAndGenerateServicesCalls[tsestreeOptions.filePath] > 1 &&
    !parseSettings.projectService
      ? createIsolatedProgram(parseSettings)
      : getProgramAndAST(parseSettings, hasFullTypeInformation);

  /**
   * Convert the TypeScript AST to an ESTree-compatible one, and optionally preserve
   * mappings between converted and original AST nodes
   */
  const shouldPreserveNodeMaps =
    typeof parseSettings.preserveNodeMaps === 'boolean'
      ? parseSettings.preserveNodeMaps
      : true;

  const { astMaps, estree } = astConverter(
    ast,
    parseSettings,
    shouldPreserveNodeMaps,
  );

  /**
   * Even if TypeScript parsed the source code ok, and we had no problems converting the AST,
   * there may be other syntactic or semantic issues in the code that we can optionally report on.
   */
  if (program && parseSettings.errorOnTypeScriptSyntacticAndSemanticIssues) {
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
    services: createParserServices(astMaps, program),
  };
}
