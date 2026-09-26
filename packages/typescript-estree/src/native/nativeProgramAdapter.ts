import type { Diagnostic as NativeDiagnostic } from '@typescript/native/unstable/sync';
import type * as ts from 'typescript';

import type { NativeNodeAdapter } from './nativeNodeAdapter';
import type { NativeProjectContext } from './types';

import { createNativeChecker } from './nativeCheckerAdapter';
import { toClassicDiagnostic } from './nativeNodeAdapter';
import { createNativeTypeAdapter } from './nativeTypeAdapter';
import { throwOnUnsupportedMembers } from './throwOnUnsupportedMembers';

interface NativeProgramAdapterContext {
  context: NativeProjectContext;
  nodeAdapter: NativeNodeAdapter;
}

const UNSUPPORTED_PROGRAM_MEMBERS = new Set([
  'emit',
  'getIdentifierCount',
  'getInstantiationCount',
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

  let typeChecker: ts.TypeChecker | undefined;

  function getSourceFile(fileName: string): ts.SourceFile | undefined {
    const sourceFile = program.getSourceFile(fileName);
    return sourceFile && (nodeAdapter.wrapNode(sourceFile) as ts.SourceFile);
  }

  function wrapDiagnostic(
    diagnostic: NativeDiagnostic,
    requestedFile?: ts.SourceFile,
  ): ts.Diagnostic {
    return toClassicDiagnostic(
      diagnostic,
      (diagnostic.fileName == null
        ? undefined
        : getSourceFile(diagnostic.fileName)) ?? requestedFile,
    );
  }

  function diagnosticsFor(
    get: (fileName?: string) => readonly NativeDiagnostic[],
    file: ts.SourceFile | undefined,
  ): ts.Diagnostic[] {
    return get(file?.fileName).map(diagnostic =>
      wrapDiagnostic(diagnostic, file),
    );
  }

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
      program.getCompilerOptions() as ts.CompilerOptions,
    getConfigFileParsingDiagnostics: () =>
      program
        .getConfigFileParsingDiagnostics()
        .map(diagnostic => wrapDiagnostic(diagnostic)),
    getCurrentDirectory: () => program.getCurrentDirectory(),
    getDeclarationDiagnostics: file =>
      locatedDiagnosticsFor(
        fileName => program.getDeclarationDiagnostics(fileName),
        file,
      ),
    getGlobalDiagnostics: () =>
      program
        .getGlobalDiagnostics()
        .map(diagnostic => wrapDiagnostic(diagnostic)),
    getModeForResolutionAtIndex: (file, index) =>
      program.getModeForResolutionAtIndex(file.fileName, index) as
        ts.ResolutionMode | undefined,
    getModeForUsageLocation: (file, usage) =>
      program.getModeForUsageLocation(
        file.fileName,
        nodeAdapter.unwrapNode(usage) as never,
      ) as ts.ResolutionMode | undefined,
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
        .map(getSourceFile)
        .filter(sourceFile => sourceFile != null),
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
