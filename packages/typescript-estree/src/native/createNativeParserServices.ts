import type { Expression as NativeExpression } from '@typescript/native/unstable/ast';

import type { ASTMaps } from '../convert';
import type { NativeParserServices } from '../parser-options';
import type { TSNode } from '../ts-estree';
import type { NativeNodeAdapter } from './nativeNodeAdapter';
import type { NativeProjectContext } from './types';

export function createNativeParserServices(
  astMaps: ASTMaps,
  adapter: NativeNodeAdapter,
  { checker, program, project }: NativeProjectContext,
): NativeParserServices {
  const compilerOptions = program.getCompilerOptions();
  const toNativeNode = (
    node: Parameters<typeof astMaps.esTreeNodeToTSNodeMap.get>[0],
  ) => adapter.unwrapNode(astMaps.esTreeNodeToTSNodeMap.get(node));

  return {
    backend: 'native',
    emitDecoratorMetadata: compilerOptions.emitDecoratorMetadata ?? false,
    esTreeNodeToTSNodeMap: {
      get: node => toNativeNode(node),
      has: node => astMaps.esTreeNodeToTSNodeMap.has(node),
    },
    experimentalDecorators: compilerOptions.experimentalDecorators ?? false,
    getContextualType: node =>
      checker.getContextualType(toNativeNode(node) as NativeExpression),
    getResolvedSignature: node =>
      checker.getResolvedSignature(toNativeNode(node)),
    getSymbolAtLocation: node =>
      checker.getSymbolAtLocation(toNativeNode(node)),
    getTypeAtLocation: node => checker.getTypeAtLocation(toNativeNode(node)),
    getTypesAtLocations: nodes =>
      checker.getTypeAtLocation(nodes.map(toNativeNode)),
    isolatedDeclarations: compilerOptions.isolatedDeclarations ?? false,
    native: { checker, program, project },
    tsNodeToESTreeNodeMap: {
      get: node =>
        astMaps.tsNodeToESTreeNodeMap.get(adapter.wrapNode(node) as TSNode),
      has: node => {
        const wrapped = adapter.getWrappedNode(node);
        return wrapped != null && astMaps.tsNodeToESTreeNodeMap.has(wrapped);
      },
    },
  };
}
