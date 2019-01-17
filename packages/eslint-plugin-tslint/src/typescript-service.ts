import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import ts from 'typescript';

export function getSourceFile(
  program: ts.Program,
  fileName: string,
  sourceText?: string
): ts.SourceFile {
  if (program !== undefined) {
    const sourceFile = program.getSourceFile(fileName);
    if (sourceFile) {
      return sourceFile;
    }
  }
  if (sourceText === undefined) {
    throw new Error(`Invalid source file: ${fileName}`);
  }
  return ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.ES5, true);
}

type createServiceOptions = {
  configFile: string;
  compilerOptions?: ts.CompilerOptions;
  projectDirectory?: string;
};

export function createService({
  compilerOptions,
  configFile
}: createServiceOptions) {
  let { program, compilerHost } = createTypescriptServices({
    configFile,
    compilerOptions
  });
  const api = {
    getProgram: () => program,
    getSourceFile: (fileName: string, sourceText: string) => {
      let sourceFile = program.getSourceFile(fileName);
      if (sourceFile === undefined) {
        fileName = fileName.replace(/\\/g, '/');
        const rootFileNames = [...program.getRootFileNames(), fileName];
        program = ts.createProgram(
          rootFileNames,
          program.getCompilerOptions(),
          compilerHost,
          program
        );
        sourceFile = program.getSourceFile(fileName);
      } else if (sourceFile.text !== sourceText) {
        program = ts.createProgram(
          program.getRootFileNames(),
          program.getCompilerOptions(),
          compilerHost,
          program
        );
        sourceFile = program.getSourceFile(fileName);
      }
      return sourceFile || getSourceFile(program, fileName, sourceText);
    },
    getDiagnostics: (fileName: string, sourceText: string) => {
      const sourceFile = api.getSourceFile(fileName, sourceText);
      return [
        ...program.getSyntacticDiagnostics(sourceFile),
        ...program.getSemanticDiagnostics(sourceFile)
      ];
    }
  };
  return api;
}

function createTypescriptServices({
  configFile,
  projectDirectory = dirname(configFile),
  compilerOptions = {}
}: createServiceOptions) {
  const { config, error } = ts.readConfigFile(configFile, ts.sys.readFile);
  if (error !== undefined) {
    throw new Error(
      ts.formatDiagnostics([error], {
        getCanonicalFileName: f => f,
        getCurrentDirectory: process.cwd,
        getNewLine: () => '\n'
      })
    );
  }
  const parseConfigHost: ts.ParseConfigHost = {
    fileExists: (path: string) => {
      return existsSync(path);
    },
    readDirectory: ts.sys.readDirectory,
    readFile: file => {
      return readFileSync(file, 'utf8');
    },
    useCaseSensitiveFileNames: false
  };
  config.compilerOptions = {
    ...(config.compilerOptions || {}),
    ...compilerOptions
  };
  const parsed = ts.parseJsonConfigFileContent(
    config,
    parseConfigHost,
    resolve(projectDirectory),
    {
      noEmit: true,
      sourceMap: false,
      inlineSources: false,
      inlineSourceMap: false
    }
  );
  if (parsed.errors !== undefined) {
    // ignore warnings and 'TS18003: No inputs were found in config file ...'
    const errors = parsed.errors.filter(
      d => d.category === ts.DiagnosticCategory.Error && d.code !== 18003
    );
    if (errors.length !== 0) {
      throw new Error(
        ts.formatDiagnostics(errors, {
          getCanonicalFileName: f => f,
          getCurrentDirectory: process.cwd,
          getNewLine: () => '\n'
        })
      );
    }
  }
  const compilerHost = ts.createCompilerHost(parsed.options, true);
  const program = ts.createProgram(
    parsed.fileNames,
    parsed.options,
    compilerHost
  );

  return { program, compilerHost };
}

let service: ReturnType<typeof createService>;

type _createServiceOptions = {
  configFile: string;
  compilerOptions?: ts.CompilerOptions;
};

export function typescriptService(options?: _createServiceOptions) {
  if (service === undefined) {
    if (options === undefined) {
      throw new Error('Service is not yet created');
    }
    service = createService(options);
  }
  return service;
}
