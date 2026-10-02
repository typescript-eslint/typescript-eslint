import type {
  SourceFile as NativeSourceFile,
  StringLiteralLikeNode as NativeStringLiteralLike,
} from '@typescript/native/unstable/ast';
import type {
  Diagnostic as NativeDiagnostic,
  Project as NativeProject,
} from '@typescript/native/unstable/sync';
import type * as ts from 'typescript';

import type { NativeNodeAdapter } from './nativeNodeAdapter';

import { toClassicDiagnostic } from './nativeNodeAdapter';
import { throwOnUnsupportedMembers } from './throwOnUnsupportedMembers';

interface NativeProgramAdapterContext {
  checker: ts.TypeChecker;
  nodeAdapter: NativeNodeAdapter;
  project: NativeProject;
}

const UNSUPPORTED_PROGRAM_MEMBERS = new Set([
  'emit',
  'getIdentifierCount',
  'getInstantiationCount',
  'getNodeCount',
  'getRelationCacheSizes',
  'getResolvedProjectReferences',
  'getSymbolCount',
  'getTypeCount',
] satisfies readonly (keyof ts.Program)[]);

export function createNativeProgram({
  checker,
  nodeAdapter,
  project,
}: NativeProgramAdapterContext): ts.Program {
  const { program } = project;

  function getSourceFile(fileName: string) {
    const sourceFile = program.getSourceFile(fileName);
    return sourceFile && (nodeAdapter.wrapNode(sourceFile) as ts.SourceFile);
  }

  function wrapDiagnostic(diagnostic: NativeDiagnostic) {
    return toClassicDiagnostic(diagnostic, fileName =>
      fileName == null ? undefined : getSourceFile(fileName),
    );
  }

  function locatedDiagnosticsFor(
    get: (fileName?: string) => readonly NativeDiagnostic[],
    file: ts.SourceFile | undefined,
  ) {
    return get(file?.fileName)
      .map(wrapDiagnostic)
      .filter(
        (diagnostic): diagnostic is ts.DiagnosticWithLocation =>
          diagnostic.file != null,
      );
  }

  const nativeProgram = {
    getCompilerOptions: () =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment -- values match classic; see native-enum-parity.test.ts
      program.getCompilerOptions() as ts.CompilerOptions,
    getConfigFileParsingDiagnostics: () =>
      program.getConfigFileParsingDiagnostics().map(wrapDiagnostic),
    getCurrentDirectory: () => program.getCurrentDirectory(),
    getDeclarationDiagnostics: file =>
      locatedDiagnosticsFor(program.getDeclarationDiagnostics, file),
    getGlobalDiagnostics: () =>
      program.getGlobalDiagnostics().map(wrapDiagnostic),
    getModeForResolutionAtIndex: (file, index) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment -- values match classic; see native-enum-parity.test.ts
      program.getModeForResolutionAtIndex(file.fileName, index) as
        ts.ResolutionMode | undefined,
    getModeForUsageLocation: (file, usage) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment -- values match classic; see native-enum-parity.test.ts
      program.getModeForUsageLocation(
        file.fileName,
        nodeAdapter.unwrapNode(usage) as NativeStringLiteralLike,
      ) as ts.ResolutionMode | undefined,
    getOptionsDiagnostics: () =>
      program.getProgramDiagnostics().map(wrapDiagnostic),
    getProjectReferences: () => project.parsedCommandLine.projectReferences,
    getRootFileNames: () => project.parsedCommandLine.fileNames,

    getSemanticDiagnostics: file =>
      program.getSemanticDiagnostics(file?.fileName).map(wrapDiagnostic),
    getSourceFile,
    getSourceFileByPath: getSourceFile,

    getSourceFiles: () =>
      program
        .getSourceFileNames()
        .map(getSourceFile)
        .filter(sourceFile => sourceFile != null),
    getSyntacticDiagnostics: file =>
      locatedDiagnosticsFor(program.getSyntacticDiagnostics, file),
    getTypeChecker: () => checker,
    isSourceFileDefaultLibrary: sourceFile =>
      program.isSourceFileDefaultLibrary(
        nodeAdapter.unwrapNode(sourceFile) as NativeSourceFile,
      ),
    isSourceFileFromExternalLibrary: sourceFile =>
      program.isSourceFileFromExternalLibrary(
        nodeAdapter.unwrapNode(sourceFile) as NativeSourceFile,
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

function packageNameFromPath(filePath: string) {
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
