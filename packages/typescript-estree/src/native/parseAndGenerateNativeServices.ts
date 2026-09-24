import type {
  Diagnostic as NativeDiagnostic,
  Program as NativeProgram,
} from '@typescript/native/unstable/sync';
import type * as ts from 'typescript';

import type { ParseAndGenerateServicesResult } from '../parser';
import type { TSESTreeOptions } from '../parser-options';
import type { ParseSettings } from '../parseSettings';
import type { NativeNodeAdapter } from './nativeNodeAdapter';
import type { NativeProjectContext } from './types';

import { astConverter } from '../ast-converter';
import { convertError } from '../convert';
import { createParserServices } from '../createParserServices';
import { getFirstSemanticOrSyntacticError } from '../semantic-or-syntactic-errors';
import { getNativeProjectService } from './createNativeProjectService';
import { createNativeNodeAdapter } from './nativeNodeAdapter';
import { createNativeProgram } from './nativeProgramAdapter';

interface NativeAdapters {
  nodeAdapter: NativeNodeAdapter;
  program: ts.Program;
}

/**
 * One set of adapters per native program, which lives as long as its snapshot,
 * so every file linted against it shares the wrappers and what they remember.
 */
const adaptersByProgram = new WeakMap<NativeProgram, NativeAdapters>();

function getAdapters(context: NativeProjectContext): NativeAdapters {
  let adapters = adaptersByProgram.get(context.program);
  if (!adapters) {
    // One request for the whole program, rather than one per file linted.
    let diagnosticsByFile: Map<string, NativeDiagnostic[]> | undefined;
    const nodeAdapter = createNativeNodeAdapter(fileName => {
      if (!diagnosticsByFile) {
        diagnosticsByFile = new Map();
        for (const diagnostic of context.program.getSyntacticDiagnostics()) {
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
    });
    adapters = {
      nodeAdapter,
      program: createNativeProgram({ context, nodeAdapter }),
    };
    adaptersByProgram.set(context.program, adapters);
  }
  return adapters;
}

export function parseAndGenerateNativeServices<
  T extends TSESTreeOptions = TSESTreeOptions,
>(parseSettings: ParseSettings): ParseAndGenerateServicesResult<T> {
  const context = getNativeProjectService(
    parseSettings.tsconfigRootDir,
  ).openFile(parseSettings.filePath, parseSettings.codeFullText);
  const { nodeAdapter, program } = getAdapters(context);
  const sourceFile = nodeAdapter.wrapNode(context.sourceFile) as ts.SourceFile;
  const { astMaps, estree } = astConverter(sourceFile, parseSettings, true);

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
