import debug from 'debug';
import type * as ts from 'typescript';

import { astConverter } from './ast-converter';
import { convertError } from './convert';
import { createDefaultProgram } from './create-program/createDefaultProgram';
import { createIsolatedProgram } from './create-program/createIsolatedProgram';
import { createProjectProgram } from './create-program/createProjectProgram';
import {
  createNoProgram,
  createSourceFile,
} from './create-program/createSourceFile';
import type { ASTAndProgram, CanonicalPath } from './create-program/shared';
import {
  createProgramFromConfigFile,
  useProvidedPrograms,
} from './create-program/useProvidedPrograms';
import type {
  ParserServices,
  ParserServicesNodeMaps,
  TSESTreeOptions,
} from './parser-options';
import type { ParseSettings } from './parseSettings';
import { createParseSettings } from './parseSettings/createParseSettings';
import { getFirstSemanticOrSyntacticError } from './semantic-or-syntactic-errors';
import type { TSESTree } from './ts-estree';

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

/**
 * @param parseSettings Internal settings for parsing the file
 * @param shouldProvideParserServices True if the program should be attempted to be calculated from provided tsconfig files
 * @returns Returns a source file and program corresponding to the linted code
 */
function getProgramAndAST(
  parseSettings: ParseSettings,
  shouldProvideParserServices: boolean,
): ASTAndProgram {
  if (parseSettings.programs) {
    const fromProvidedPrograms = useProvidedPrograms(
      parseSettings.programs,
      parseSettings,
    );
    if (fromProvidedPrograms) {
      return fromProvidedPrograms;
    }
  }

  if (shouldProvideParserServices) {
    const fromProjectProgram = createProjectProgram(parseSettings);
    if (fromProjectProgram) {
      return fromProjectProgram;
    }

    // eslint-disable-next-line deprecation/deprecation -- will be cleaned up with the next major
    if (parseSettings.DEPRECATED__createDefaultProgram) {
      // eslint-disable-next-line deprecation/deprecation -- will be cleaned up with the next major
      const fromDefaultProgram = createDefaultProgram(parseSettings);
      if (fromDefaultProgram) {
        return fromDefaultProgram;
      }
    }

    return createIsolatedProgram(parseSettings);
  }

  // no need to waste time creating a program as the caller didn't want parser services
  // so we can save time and just create a lonesome source file
  return createNoProgram(parseSettings);
}

interface EmptyObject {}
type AST<T extends TSESTreeOptions> = TSESTree.Program &
  (T['tokens'] extends true ? { tokens: TSESTree.Token[] } : EmptyObject) &
  (T['comment'] extends true ? { comments: TSESTree.Comment[] } : EmptyObject);

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
  code: string | ts.SourceFile,
  options: T,
): ParseAndGenerateServicesResult<T> {
  /**
   * Reset the parse configuration
   */
  const parseSettings = createParseSettings(code, options);

  /**
   * If this is a single run in which the user has not provided any existing programs but there
   * are programs which need to be created from the provided "project" option,
   * create an Iterable which will lazily create the programs as needed by the iteration logic
   */
  if (
    parseSettings.singleRun &&
    !parseSettings.programs &&
    parseSettings.projects?.length > 0
  ) {
    parseSettings.programs = {
      *[Symbol.iterator](): Iterator<ts.Program> {
        for (const configFile of parseSettings.projects) {
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
    parseSettings.programs != null || parseSettings.projects?.length > 0;

  if (typeof options !== 'undefined') {
    if (
      typeof options.errorOnTypeScriptSyntacticAndSemanticIssues ===
        'boolean' &&
      options.errorOnTypeScriptSyntacticAndSemanticIssues
    ) {
      parseSettings.errorOnTypeScriptSyntacticAndSemanticIssues = true;
    }

    if (
      parseSettings.errorOnTypeScriptSyntacticAndSemanticIssues &&
      !shouldProvideParserServices
    ) {
      throw new Error(
        'Cannot calculate TypeScript semantic issues without a valid project.',
      );
    }
  }

  /**
   * If we are in singleRun mode but the parseAndGenerateServices() function has been called more than once for the current file,
   * it must mean that we are in the middle of an ESLint automated fix cycle (in which parsing can be performed up to an additional
   * 10 times in order to apply all possible fixes for the file).
   *
   * In this scenario we cannot rely upon the singleRun AOT compiled programs because the SourceFiles will not contain the source
   * with the latest fixes applied. Therefore we fallback to creating the quickest possible isolated program from the updated source.
   */
  if (parseSettings.singleRun && options.filePath) {
    parseAndGenerateServicesCalls[options.filePath] =
      (parseAndGenerateServicesCalls[options.filePath] || 0) + 1;
  }

  const { ast, program } =
    parseSettings.singleRun &&
    options.filePath &&
    parseAndGenerateServicesCalls[options.filePath] > 1
      ? createIsolatedProgram(parseSettings)
      : getProgramAndAST(parseSettings, shouldProvideParserServices)!;

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
    services: {
      program,
      // we always return the node maps because
      // (a) they don't require type info and
      // (b) they can be useful when using some of TS's internal non-type-aware AST utils
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
