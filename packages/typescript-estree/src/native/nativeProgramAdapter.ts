import type {
  CompilerOptions as NativeCompilerOptions,
  Diagnostic as NativeDiagnostic,
} from '@typescript/native/unstable/sync';

import path from 'node:path';
import * as ts from 'typescript';

import type { NativeNodeAdapter } from './nativeNodeAdapter';
import type { NativeProjectContext } from './types';

import { createNativeChecker } from './nativeCheckerAdapter';
import { createNativeTypeAdapter } from './nativeTypeAdapter';
import { throwOnUnsupportedMembers } from './throwOnUnsupportedMembers';

export interface NativeProgramAdapterContext {
  context: NativeProjectContext;
  nodeAdapter: NativeNodeAdapter;
}

/** Native numbers `ReactNative` 2 and `React` 3; classic has them swapped. */
const NATIVE_TO_CLASSIC_JSX_EMIT = new Map<number, number>([
  [2, ts.JsxEmit.ReactNative],
  [3, ts.JsxEmit.React],
]);

const UNSUPPORTED_PROGRAM_MEMBERS = new Set([
  'emit',
  'getIdentifierCount',
  'getInstantiationCount',
  'getModeForResolutionAtIndex',
  'getModeForUsageLocation',
  'getNodeCount',
  'getOptionsDiagnostics',
  'getProjectReferences',
  'getRelationCacheSizes',
  'getResolvedProjectReferences',
  'getSourceFileByPath',
  'getSymbolCount',
  'getTypeCount',
] satisfies readonly (keyof ts.Program)[]);

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

  function getSourceFile(fileName: string): ts.SourceFile | undefined {
    const sourceFile = program.getSourceFile(fileName);
    return sourceFile && (nodeAdapter.wrapNode(sourceFile) as ts.SourceFile);
  }

  function wrapDiagnostic(
    diagnostic: NativeDiagnostic,
    requestedFile?: ts.SourceFile,
  ): ts.Diagnostic {
    return {
      category: diagnostic.category,
      code: diagnostic.code,
      file:
        diagnostic.fileName == null
          ? requestedFile
          : (getSourceFile(diagnostic.fileName) ?? requestedFile),
      length: diagnostic.end - diagnostic.pos,
      messageText: diagnostic.text,
      start: diagnostic.pos,
    };
  }

  function diagnosticsFor(
    get: (fileName?: string) => readonly NativeDiagnostic[],
    file: ts.SourceFile | undefined,
  ): ts.Diagnostic[] {
    return get(file?.fileName).map(diagnostic =>
      wrapDiagnostic(diagnostic, file),
    );
  }

  /** A diagnostic with no file belongs to the global accessors, not these. */
  function locatedDiagnosticsFor(
    get: (fileName?: string) => readonly NativeDiagnostic[],
    file: ts.SourceFile | undefined,
  ): ts.DiagnosticWithLocation[] {
    return diagnosticsFor(get, file).filter(
      (diagnostic): diagnostic is ts.DiagnosticWithLocation =>
        diagnostic.file != null,
    );
  }

  const nativeProgram = {
    getCompilerOptions: () =>
      (compilerOptions ??= translateCompilerOptions(
        program.getCompilerOptions(),
      )),
    getConfigFileParsingDiagnostics: () =>
      program
        .getConfigFileParsingDiagnostics()
        .map(diagnostic => wrapDiagnostic(diagnostic)),
    getCurrentDirectory: () => path.dirname(project.configFileName),
    getDeclarationDiagnostics: file =>
      locatedDiagnosticsFor(
        fileName => program.getDeclarationDiagnostics(fileName),
        file,
      ),
    getGlobalDiagnostics: () =>
      program
        .getGlobalDiagnostics()
        .map(diagnostic => wrapDiagnostic(diagnostic)),
    getRootFileNames: () => project.parsedCommandLine.fileNames,

    getSemanticDiagnostics: file =>
      diagnosticsFor(
        fileName => program.getSemanticDiagnostics(fileName),
        file,
      ),
    getSourceFile,

    getSourceFiles: () =>
      program
        .getSourceFileNames()
        .map(fileName => program.getSourceFile(fileName))
        .filter(sourceFile => sourceFile != null)
        .map(sourceFile => nodeAdapter.wrapNode(sourceFile) as ts.SourceFile),
    getSyntacticDiagnostics: file =>
      locatedDiagnosticsFor(
        fileName => program.getSyntacticDiagnostics(fileName),
        file,
      ),
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

    sourceFileToPackageName: { get: packageNameFromPath },
  } satisfies Partial<ts.Program> & Record<string, unknown>;

  return throwOnUnsupportedMembers(
    // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum -- this names the classic TypeScript API, not an ESTree node type
    'Program',
    UNSUPPORTED_PROGRAM_MEMBERS,
    nativeProgram,
  ) as unknown as ts.Program;
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
    translated.jsx = NATIVE_TO_CLASSIC_JSX_EMIT.get(options.jsx) ?? options.jsx;
  }
  return translated;
}
