import path from 'path';
import ts from 'typescript';
import { Extra } from './parser-options';

//------------------------------------------------------------------------------
// Environment calculation
//------------------------------------------------------------------------------

/**
 * Default compiler options for program generation from single root file
 */
const defaultCompilerOptions: ts.CompilerOptions = {
  allowNonTsExtensions: true,
  allowJs: true,
};

/**
 * Appropriately report issues found when reading a config file
 * @param diagnostic The diagnostic raised when creating a program
 */
function diagnosticReporter(diagnostic: ts.Diagnostic): void {
  throw new Error(
    ts.flattenDiagnosticMessageText(diagnostic.messageText, ts.sys.newLine),
  );
}

function getTsconfigPath(tsconfigPath: string, extra: Extra): string {
  return path.isAbsolute(tsconfigPath)
    ? tsconfigPath
    : path.join(extra.tsconfigRootDir || process.cwd(), tsconfigPath);
}

/**
 * Calculate project environments using options provided by consumer and paths from config
 * @param code The code being linted
 * @param filePath The path of the file being parsed
 * @param extra.tsconfigRootDir The root directory for relative tsconfig paths
 * @param extra.project Provided tsconfig paths
 * @returns The programs corresponding to the supplied tsconfig paths
 */
const cache: Map<string, ts.Program> = new Map();
export function calculateProjectParserOptions(extra: Extra): ts.Program[] {
  const results: ts.Program[] = [];

  extra.projects
    .map(project => getTsconfigPath(project, extra))
    .forEach(tsconfigPath => {
      if (cache.has(tsconfigPath)) {
        results.push(cache.get(tsconfigPath) as ts.Program);
        return;
      }

      const config = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
      if (config.error !== undefined) {
        diagnosticReporter(config.error);
      }
      const parseConfigHost: ts.ParseConfigHost = {
        fileExists: ts.sys.fileExists,
        readDirectory: ts.sys.readDirectory,
        readFile: ts.sys.readFile,
        useCaseSensitiveFileNames: true,
      };
      const parsed = ts.parseJsonConfigFileContent(
        config.config,
        parseConfigHost,
        extra.tsconfigRootDir || path.dirname(tsconfigPath),
        { noEmit: true },
      );
      if (parsed.errors !== undefined && parsed.errors.length > 0) {
        diagnosticReporter(parsed.errors[0]);
      }
      const host = ts.createCompilerHost(
        { ...defaultCompilerOptions, ...parsed.options },
        true,
      );
      const program = ts.createProgram(parsed.fileNames, parsed.options, host);

      cache.set(tsconfigPath, program);

      results.push(program);
    });

  return results;
}

/**
 * Create program from single root file. Requires a single tsconfig to be specified.
 * @param code The code being linted
 * @param filePath The file being linted
 * @param extra.tsconfigRootDir The root directory for relative tsconfig paths
 * @param extra.project Provided tsconfig paths
 * @returns The program containing just the file being linted and associated library files
 */
export function createProgram(code: string, filePath: string, extra: Extra) {
  if (!extra.projects || extra.projects.length !== 1) {
    return undefined;
  }

  const tsconfigPath = getTsconfigPath(extra.projects[0], extra);

  const commandLine = ts.getParsedCommandLineOfConfigFile(
    tsconfigPath,
    defaultCompilerOptions,
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} },
  );

  if (!commandLine) {
    return undefined;
  }

  const compilerHost = ts.createCompilerHost(commandLine.options, true);
  const oldReadFile = compilerHost.readFile;
  compilerHost.readFile = (fileName: string) =>
    path.normalize(fileName) === path.normalize(filePath)
      ? code
      : oldReadFile(fileName);

  return ts.createProgram([filePath], commandLine.options, compilerHost);
}
