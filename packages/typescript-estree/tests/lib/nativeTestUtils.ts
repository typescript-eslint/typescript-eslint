import type { TSESTree } from '@typescript-eslint/types';
import type * as ts from 'typescript';

import path from 'node:path';

import type { ParserServicesWithTypeInformation } from '../../src/index.js';

import '../../src/native/index.js';
import { clearCaches, parseAndGenerateServices } from '../../src/index.js';
import { toCompilerPath } from '../../src/native/createNativeProjectService.js';

export function nativePath(...segments: string[]): string {
  return toCompilerPath(path.join(...segments));
}

export const nativeFixtures = nativePath(
  __dirname,
  '../fixtures/nativeProject',
);
export const nativeFilePath = nativePath(nativeFixtures, 'file.ts');

export function isolateNativeBackend(): void {
  beforeEach(() => {
    vi.stubEnv('TYPESCRIPT_ESLINT_NATIVE_BACKEND', 'false');
  });
  afterEach(clearCaches);
}

export interface NativeQueryContext {
  ast: TSESTree.Program;
  checker: ts.TypeChecker;
  program: ts.Program;
  services: ParserServicesWithTypeInformation;
  sourceFile: ts.SourceFile;
  tsNode: (node: TSESTree.Node) => ts.Node;
}

export function parseOnBackend(
  code: string,
  native: boolean,
  filePath = nativeFilePath,
): NativeQueryContext {
  const { ast, services } = parseAndGenerateServices(code, {
    filePath,
    projectService: native ? { EXPERIMENTAL_backend: 'native' } : true,
  });
  assert.isNotNull(services.program);
  return {
    ast,
    checker: services.program.getTypeChecker(),
    program: services.program,
    services,
    sourceFile: services.esTreeNodeToTSNodeMap.get(ast),
    tsNode: (node: TSESTree.Node) => services.esTreeNodeToTSNodeMap.get(node),
  };
}

export function onBothBackends<T>(
  code: string,
  query: (context: NativeQueryContext) => T,
  filePath = nativeFilePath,
): { classic: T; native: T } {
  return {
    classic: query(parseOnBackend(code, false, filePath)),
    native: query(parseOnBackend(code, true, filePath)),
  };
}
