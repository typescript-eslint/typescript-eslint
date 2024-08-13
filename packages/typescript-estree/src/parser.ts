import debug from 'debug';
import type * as ts from 'typescript';

import { astConverter } from './ast-converter';
import { convertError } from './convert';
import { createIsolatedProgram } from './create-program/createIsolatedProgram';
import { createProjectProgram } from './create-program/createProjectProgram';
import {
  createNoProgram,
  createSourceFile,
} from './create-program/createSourceFile';
import { getWatchProgramsForProjects } from './create-program/getWatchProgramsForProjects';
import type { ASTAndProgram, CanonicalPath } from './create-program/shared';
import {
  createProgramFromConfigFile,
  useProvidedPrograms,
} from './create-program/useProvidedPrograms';
import { createParserServices } from './createParserServices';
import type {
  ParserServices,
  ParserServicesNodeMaps,
  TSESTreeOptions,
} from './parser-options';
import type { ParseSettings } from './parseSettings';
import { createParseSettings } from './parseSettings/createParseSettings';
import { getFirstSemanticOrSyntacticError } from './semantic-or-syntactic-errors';
import type { TSESTree } from './ts-estree';
import { useProgramFromProjectService } from './useProgramFromProjectService';

const log = debug('typescript-eslint:typescript-estree:parser');

/**
 * Cache existing programs for the single run use-case.
 *
 * clearProgramCache() is only intended to be used in testing to ensure the parser is clean between tests.
 */
const existingPrograms = new Map<CanonicalPath, ts.Program>();
function clearProgramCache(): void {
  existingPrograms.clear();
}

const defaultProjectMatchedFiles = new Set<string>();
function clearDefaultProjectMatchedFiles(): void {
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
    const fromProvidedPrograms = useProvidedPrograms(
      parseSettings.programs,
      parseSettings,
    );
    if (fromProvidedPrograms) {
      return fromProvidedPrograms;
    }
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
type AST<T extends TSESTreeOptions> = TSESTree.Program &
  (T['comment'] extends true ? { comments: TSESTree.Comment[] } : {}) &
  (T['tokens'] extends true ? { tokens: TSESTree.Token[] } : {});
/* eslint-enable @typescript-eslint/no-empty-object-type */

interface ParseAndGenerateServicesResult<T extends TSESTreeOptions> {
  ast: AST<T>;
  services: ParserServices;
}
interface ParseWithNodeMapsResult<T extends TSESTreeOptions>
  extends ParserServicesNodeMaps {
  ast: AST<T>;
}

function parse<T extends TSESTreeOptions = TSESTreeOptions>(
  code: string,
  options?: T,
): AST<T> {
  const { ast } = parseWithNodeMapsInternal(code, options, false);
  return ast;
}

function parseWithNodeMapsInternal<T extends TSESTreeOptions = TSESTreeOptions>(
  code: ts.SourceFile | string,
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
  const { estree, astMaps } = astConverter(
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
function clearParseAndGenerateServicesCalls(): void {
  parseAndGenerateServicesCalls = {};
}

function parseAndGenerateServices<T extends TSESTreeOptions = TSESTreeOptions>(
  code: ts.SourceFile | string,
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
   */
  if (parseSettings.singleRun && tsestreeOptions.filePath) {
    parseAndGenerateServicesCalls[tsestreeOptions.filePath] =
      (parseAndGenerateServicesCalls[tsestreeOptions.filePath] || 0) + 1;
  }

  const { ast, program } =
    parseSettings.singleRun &&
    tsestreeOptions.filePath &&
    parseAndGenerateServicesCalls[tsestreeOptions.filePath] > 1
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

  const { estree, astMaps } = astConverter(
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

export {
  AST,
  parse,
  parseAndGenerateServices,
  ParseAndGenerateServicesResult,
  clearDefaultProjectMatchedFiles,
  clearProgramCache,
  clearParseAndGenerateServicesCalls,
};
