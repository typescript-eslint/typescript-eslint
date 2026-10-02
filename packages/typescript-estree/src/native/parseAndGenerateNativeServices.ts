import type {
  Node as NativeNode,
  SourceFile as NativeSourceFile,
} from '@typescript/native/unstable/ast';
import type {
  Diagnostic as NativeDiagnostic,
  Program as NativeProgram,
} from '@typescript/native/unstable/sync';
import type * as ts from 'typescript';

import { SyntaxKind as NativeSyntaxKind } from '@typescript/native/unstable/ast';

import type { ParseAndGenerateServicesResult } from '../parser';
import type { TSESTreeOptions } from '../parser-options';
import type { ParseSettings } from '../parseSettings';
import type { NativeProjectContext } from './types';

import { astConverter } from '../ast-converter';
import { convertError } from '../convert';
import { createParserServices } from '../createParserServices';
import { getFirstSemanticOrSyntacticError } from '../semantic-or-syntactic-errors';
import { getNativeProjectService } from './createNativeProjectService';
import { createNativeChecker } from './nativeCheckerAdapter';
import { createNativeNodeAdapter } from './nativeNodeAdapter';
import { createNativeProgram } from './nativeProgramAdapter';
import { createNativeTypeAdapter } from './nativeTypeAdapter';

const PREFETCH_KINDS = new Set(
  Object.entries(NativeSyntaxKind)
    .filter(
      ([name, value]) =>
        typeof value === 'number' &&
        /Expression$|Literal$|^Identifier$|^FunctionDeclaration$|^(?:False|Null|Super|This|True)Keyword$/.test(
          name,
        ),
    )
    .map(([, value]) => value as NativeSyntaxKind),
);

const NAME_PREFETCH_PARENT_KINDS = new Set([
  NativeSyntaxKind.ShorthandPropertyAssignment,
  NativeSyntaxKind.VariableDeclaration,
]);

const UNTYPED_IDENTIFIER_PARENT_KINDS = new Set([
  NativeSyntaxKind.ExportSpecifier,
  NativeSyntaxKind.ImportClause,
  NativeSyntaxKind.ImportSpecifier,
  NativeSyntaxKind.NamespaceExport,
  NativeSyntaxKind.NamespaceImport,
  NativeSyntaxKind.QualifiedName,
  NativeSyntaxKind.TypeReference,
]);

/** Rules ask after an identifier's type where it is a value, rarely where it names something. */
function isTypedIdentifier(node: NativeNode) {
  const { parent } = node;
  return (
    !UNTYPED_IDENTIFIER_PARENT_KINDS.has(parent.kind) &&
    ((parent as NativeNode & { name?: NativeNode }).name !== node ||
      NAME_PREFETCH_PARENT_KINDS.has(parent.kind))
  );
}

function collectPrefetchNodes(sourceFile: NativeSourceFile) {
  const identifiers: NativeNode[] = [];
  const typed: NativeNode[] = [];
  const visit = (node: NativeNode): void => {
    if (node.kind === NativeSyntaxKind.Identifier) {
      identifiers.push(node);
      if (isTypedIdentifier(node)) {
        typed.push(node);
      }
    } else if (PREFETCH_KINDS.has(node.kind)) {
      typed.push(node);
    }
    node.forEachChild(visit);
  };
  sourceFile.forEachChild(visit);
  return { identifiers, typed };
}

function createAdapters({ project }: NativeProjectContext) {
  let diagnosticsByFile: Map<string, NativeDiagnostic[]> | undefined;
  const nodeAdapter = createNativeNodeAdapter({
    getSyntacticDiagnostics: fileName => {
      if (!diagnosticsByFile) {
        diagnosticsByFile = new Map();
        for (const diagnostic of project.program.getSyntacticDiagnostics()) {
          const key = diagnostic.fileName ?? '';
          const existing = diagnosticsByFile.get(key);
          if (existing) {
            existing.push(diagnostic);
          } else {
            diagnosticsByFile.set(key, [diagnostic]);
          }
        }
      }
      return diagnosticsByFile.get(fileName) ?? [];
    },
  });
  const { checker, prefetch } = createNativeChecker({
    checker: project.checker,
    nodeAdapter,
    typeAdapter: createNativeTypeAdapter({
      checker: project.checker,
      nodeAdapter,
      project,
    }),
  });
  return {
    nodeAdapter,
    prefetch,
    prefetchedSourceFiles: new WeakSet<NativeSourceFile>(),
    program: createNativeProgram({ checker, nodeAdapter, project }),
  };
}

const adaptersByProgram = new WeakMap<
  NativeProgram,
  ReturnType<typeof createAdapters>
>();

function getAdapters(context: NativeProjectContext) {
  let adapters = adaptersByProgram.get(context.project.program);
  if (!adapters) {
    adapters = createAdapters(context);
    adaptersByProgram.set(context.project.program, adapters);
  }
  return adapters;
}

export function parseAndGenerateNativeServices<
  T extends TSESTreeOptions = TSESTreeOptions,
>(parseSettings: ParseSettings): ParseAndGenerateServicesResult<T> {
  const context = getNativeProjectService(
    parseSettings.tsconfigRootDir,
  ).openFile(parseSettings.filePath, parseSettings.codeFullText);
  const { nodeAdapter, prefetch, prefetchedSourceFiles, program } =
    getAdapters(context);
  const sourceFile = nodeAdapter.wrapNode(context.sourceFile) as ts.SourceFile;
  const { astMaps, estree } = astConverter(sourceFile, parseSettings, true);
  if (!prefetchedSourceFiles.has(context.sourceFile)) {
    prefetchedSourceFiles.add(context.sourceFile);
    const { identifiers, typed } = collectPrefetchNodes(context.sourceFile);
    prefetch(
      typed.map(node => nodeAdapter.wrapNode(node)),
      identifiers.map(node => nodeAdapter.wrapNode(node)),
    );
  }

  if (parseSettings.errorOnTypeScriptSyntacticAndSemanticIssues) {
    const error = getFirstSemanticOrSyntacticError(program, sourceFile);
    if (error) {
      throw convertError(error);
    }
  }

  return {
    ast: estree as ParseAndGenerateServicesResult<T>['ast'],
    services: createParserServices(astMaps, program),
  };
}
