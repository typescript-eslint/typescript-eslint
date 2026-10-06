import { getParsedConfigFile } from '@typescript-eslint/tsconfig-utils';
import debug from 'debug';
import path from 'node:path';
import * as ts from 'typescript';

import type { ParseSettings } from '../parseSettings';
import type { ASTAndDefiniteProgram } from './shared';

import { getAstFromProgram } from './shared';

const log = debug(
  'typescript-eslint:typescript-estree:create-program:useSingleRunProgramForProjectService',
);

/**
 * Programs created per tsconfig, or null for tsconfigs the project service
 * should handle itself.
 */
const programs = new Map<string, ts.Program | null>();

/**
 * The nearest tsconfig.json or jsconfig.json for each directory looked up.
 */
const nearestConfigFiles = new Map<string, string | undefined>();

export function clearSingleRunProjectServicePrograms(): void {
  programs.clear();
  nearestConfigFiles.clear();
}

/**
 * Files don't change on disk during a single run, so the project service's
 * bookkeeping for each opened file isn't needed. Instead, each file can come
 * from a Program created once for its nearest tsconfig, the same as with
 * `parserOptions.project`. Anything less straightforward is left to the
 * project service: default project files, extra file extensions, project
 * references, and files not found in their nearest tsconfig's Program.
 */
export function useSingleRunProgramForProjectService(
  parseSettings: ParseSettings,
): ASTAndDefiniteProgram | undefined {
  if (
    parseSettings.extraFileExtensions.length ||
    parseSettings.projectService?.allowDefaultProject?.length
  ) {
    return undefined;
  }

  const configFile = findNearestConfigFile(
    path.dirname(parseSettings.filePath),
    parseSettings.tsconfigRootDir,
  );
  if (!configFile?.endsWith('tsconfig.json')) {
    return undefined;
  }

  let program = programs.get(configFile);
  if (program === undefined) {
    log('Creating single-run Program for project service: %s', configFile);
    program = createProgram(configFile, parseSettings);
    programs.set(configFile, program);
  }

  const astAndProgram = program && getAstFromProgram(program, parseSettings.filePath);
  if (astAndProgram?.ast.text !== parseSettings.codeFullText) {
    return undefined;
  }

  astAndProgram.program.getTypeChecker(); // ensure parent pointers are set in source files
  return astAndProgram;
}

function createProgram(
  configFile: string,
  parseSettings: ParseSettings,
): ts.Program | null {
  const parsed = getParsedConfigFile(ts, configFile);

  // The project service loads referenced projects from their source files,
  // while a Program would use their built declaration files.
  if (parsed.projectReferences?.length) {
    return null;
  }

  const host = ts.createCompilerHost(parsed.options, true);
  host.jsDocParsingMode = parseSettings.jsDocParsingMode;

  return ts.createProgram(parsed.fileNames, parsed.options, host);
}

/**
 * Finds the tsconfig.json or jsconfig.json the project service would pick for
 * files in a directory: the nearest one, not looking above `tsconfigRootDir`
 * for files within it.
 */
function findNearestConfigFile(
  directory: string,
  tsconfigRootDir: string,
): string | undefined {
  const visited: string[] = [];
  const withinRoot = !path.relative(tsconfigRootDir, directory).startsWith('..');
  let configFile: string | undefined;
  let current = directory;

  while (true) {
    if (nearestConfigFiles.has(current)) {
      configFile = nearestConfigFiles.get(current);
      break;
    }

    visited.push(current);

    configFile = ['tsconfig.json', 'jsconfig.json']
      .map(fileName => path.join(current, fileName))
      .find(filePath => ts.sys.fileExists(filePath));

    const parent = path.dirname(current);
    if (
      configFile ||
      parent === current ||
      path.basename(current) === 'node_modules' ||
      (withinRoot && current === tsconfigRootDir)
    ) {
      break;
    }

    current = parent;
  }

  for (const visitedDirectory of visited) {
    nearestConfigFiles.set(visitedDirectory, configFile);
  }

  return configFile;
}
