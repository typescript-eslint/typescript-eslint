import type {
  CompilerOptions as NativeCompilerOptions,
  Diagnostic as NativeDiagnostic,
} from '@typescript/native/unstable/sync';
import type * as ts from 'typescript';

import type { NativeNodeAdapter } from './nativeNodeAdapter';
import type { NativeProjectContext } from './types';

import { createNativeChecker } from './nativeCheckerAdapter';
import { createNativeTypeAdapter } from './nativeTypeAdapter';

export interface NativeProgramAdapterContext {
  context: NativeProjectContext;
  nodeAdapter: NativeNodeAdapter;
}

/**
 * `JsxEmit.React` and `JsxEmit.ReactNative` are the one pair of compiler option
 * enum members whose numeric values the two compilers disagree on. Everything
 * else — `ScriptTarget`, `ModuleKind`, `ModuleResolutionKind` — matches, and
 * the remaining options are booleans and strings.
 */
const NATIVE_TO_CLASSIC_JSX_EMIT = new Map([
  [2, 3],
  [3, 2],
]);

/**
 * Presents a native project's program as a classic `ts.Program`.
 *
 * This is the seam that lets every existing rule run unchanged on the native
 * backend: `createParserServices` takes this object exactly as it takes a
 * classic program, so `services.program.getTypeChecker()` hands rules a checker
 * whose types, symbols, and signatures all speak the classic API.
 *
 * As with the checker, any classic method without a native counterpart throws
 * on access rather than surfacing as `undefined`.
 */
export function createNativeProgram({
  context,
  nodeAdapter,
}: NativeProgramAdapterContext): ts.Program {
  const { checker, program, project } = context;
  const typeAdapter = createNativeTypeAdapter({
    checker,
    nodeAdapter,
    project,
  });

  let compilerOptions: ts.CompilerOptions | undefined;
  let typeChecker: ts.TypeChecker | undefined;

  function wrapDiagnostic(diagnostic: NativeDiagnostic): ts.Diagnostic {
    return {
      category: diagnostic.category as unknown as ts.DiagnosticCategory,
      code: diagnostic.code,
      file: undefined,
      length: diagnostic.end - diagnostic.pos,
      messageText: diagnostic.text,
      start: diagnostic.pos,
    };
  }

  function diagnosticsFor(
    get: (fileName?: string) => readonly NativeDiagnostic[],
    file: ts.SourceFile | undefined,
  ): ts.Diagnostic[] {
    return get(file?.fileName).map(wrapDiagnostic);
  }

  const nativeProgram = {
    getCompilerOptions: () =>
      (compilerOptions ??= translateCompilerOptions(
        program.getCompilerOptions(),
      )),
    getCurrentDirectory: () => dirnameOf(project.configFileName),
    getRootFileNames: () => project.parsedCommandLine.fileNames,
    getSourceFile: fileName => {
      const sourceFile = program.getSourceFile(fileName);
      return sourceFile && (nodeAdapter.wrapNode(sourceFile) as ts.SourceFile);
    },
    getSourceFiles: () =>
      program
        .getSourceFileNames()
        .map(fileName => program.getSourceFile(fileName))
        .filter(sourceFile => sourceFile != null)
        .map(sourceFile => nodeAdapter.wrapNode(sourceFile) as ts.SourceFile),
    getTypeChecker: () =>
      (typeChecker ??= createNativeChecker({
        checker,
        nodeAdapter,
        typeAdapter,
      })),

    isSourceFileDefaultLibrary: sourceFile =>
      program.isSourceFileDefaultLibrary(
        nodeAdapter.unwrapNode(sourceFile) as never,
      ),
    isSourceFileFromExternalLibrary: sourceFile =>
      program.isSourceFileFromExternalLibrary(
        nodeAdapter.unwrapNode(sourceFile) as never,
      ),

    getConfigFileParsingDiagnostics: () =>
      program.getConfigFileParsingDiagnostics().map(wrapDiagnostic),
    getGlobalDiagnostics: () =>
      program.getGlobalDiagnostics().map(wrapDiagnostic),
    getSemanticDiagnostics: file =>
      diagnosticsFor(
        fileName => program.getSemanticDiagnostics(fileName),
        file,
      ),
    getSyntacticDiagnostics: file =>
      diagnosticsFor(
        fileName => program.getSyntacticDiagnostics(fileName),
        file,
      ) as ts.DiagnosticWithLocation[],
    getDeclarationDiagnostics: file =>
      diagnosticsFor(
        fileName => program.getDeclarationDiagnostics(fileName),
        file,
      ) as ts.DiagnosticWithLocation[],

    /**
     * Classic keeps a map from a source file's canonical path to the package it
     * was resolved from. The native API exposes no such map, so the package name
     * is read back off the path, which is where classic's own entries come from.
     */
    sourceFileToPackageName: {
      get: (path: string) => packageNameFromPath(path),
    },
  } satisfies Partial<ts.Program> & Record<string, unknown>;

  return new Proxy(nativeProgram, {
    get(target, property) {
      const value: unknown = Reflect.get(target, property, target);
      if (value === undefined && typeof property === 'string') {
        throw new Error(
          `Program#${property} is not available on the TypeScript native preview API.`,
        );
      }
      return value;
    },
  }) as unknown as ts.Program;
}

function dirnameOf(filePath: string): string {
  const separator = Math.max(
    filePath.lastIndexOf('/'),
    filePath.lastIndexOf('\\'),
  );
  return separator === -1 ? filePath : filePath.slice(0, separator);
}

function packageNameFromPath(filePath: string): string | undefined {
  const segments = filePath.split(/[/\\]/);
  const index = segments.lastIndexOf('node_modules');
  if (index === -1 || index === segments.length - 1) {
    return undefined;
  }
  const name = segments[index + 1];
  return name.startsWith('@') && index + 2 < segments.length
    ? `${name}/${segments[index + 2]}`
    : name;
}

function translateCompilerOptions(
  options: NativeCompilerOptions,
): ts.CompilerOptions {
  const translated = { ...options } as ts.CompilerOptions;
  if (options.jsx != null) {
    translated.jsx = (NATIVE_TO_CLASSIC_JSX_EMIT.get(options.jsx) ??
      options.jsx) as ts.JsxEmit;
  }
  return translated;
}
