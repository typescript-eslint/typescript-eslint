import ts from 'typescript';
import { ProgramCache } from './ProgramCache';

const programCache = new ProgramCache();

/**
 * @param filePath the path to the file to get the program for. Must either be an absolute path, or a path relative to tsconfigPath.
 * @param tsconfigPath the path to the tsconfig file. Must either be an absolute path, or a path relative to the CWD.
 */
function createProgramWithProject(
  code: string,
  filePath: string,
  tsconfigPath: string,
): ts.Program {
  programCache.createOrUpdateSourceFile(code, filePath, tsconfigPath);

  // we have a cached program that can be used
  const cachedProgram = programCache.getProgram(tsconfigPath);
  if (cachedProgram.program && !cachedProgram.invalidated) {
    return cachedProgram.program;
  }

  const program = programCache.createProgram(
    tsconfigPath,
    cachedProgram.program,
  );

  return program;
}

/**
 * Provided for testing use cases only
 */
function clearCache(): void {
  programCache.clear();
}

export { createProgramWithProject, clearCache };
