import type { TSESTree } from '@typescript-eslint/types';

import { AST_NODE_TYPES } from '@typescript-eslint/types';
import * as ts from 'typescript';

import { parseAndGenerateServices } from '../../src/index.js';
import {
  isolateNativeBackend,
  nativeFilePath as filePath,
} from './nativeTestUtils';

isolateNativeBackend();

function parse(code: string, allowInvalidAST = false) {
  const { ast, services } = parseAndGenerateServices(code, {
    allowInvalidAST,
    filePath,
    projectService: { EXPERIMENTAL_backend: 'tsgo' },
    range: true,
  });
  const { attributes } = ast
    .body[0] as TSESTree.TSModuleDeclarationModuleWithStringId;
  return { attributes, services };
}

describe('ambient module import attributes', () => {
  it('converts the attributes type members into import attributes', () => {
    const { attributes, services } = parse(
      "declare module '*.db' with { type: 'sqlite', 'embed': 'true' } {}",
    );

    expect(attributes).toMatchObject([
      {
        key: { name: 'type', type: AST_NODE_TYPES.Identifier },
        range: [29, 43],
        type: AST_NODE_TYPES.ImportAttribute,
        value: { type: AST_NODE_TYPES.Literal, value: 'sqlite' },
      },
      {
        key: { type: AST_NODE_TYPES.Literal, value: 'embed' },
        range: [45, 60],
        type: AST_NODE_TYPES.ImportAttribute,
        value: { type: AST_NODE_TYPES.Literal, value: 'true' },
      },
    ]);

    const tsNode = services.esTreeNodeToTSNodeMap.get(attributes[0]);
    expect(tsNode.kind).toBe(ts.SyntaxKind.PropertySignature);
    expect(services.tsNodeToESTreeNodeMap.get(tsNode)).toBe(attributes[0]);
  });

  it.each([
    [
      'declare module "*.css" with { type(): void } {}',
      'An import attributes type may only contain property signatures.',
    ],
    [
      'declare module "*.css" with { readonly type: "css" } {}',
      "An import attributes property cannot have a 'readonly' modifier.",
    ],
    [
      'declare module "*.css" with { type } {}',
      'An import attributes property must have a type annotation.',
    ],
    [
      'declare module "*.css" with { type?: "css" } {}',
      'An import attributes property cannot be optional.',
    ],
    [
      'declare module "*.css" with { ["type"]: "css" } {}',
      'An import attributes property must have a string literal or identifier name.',
    ],
    [
      'declare module "*.css" with { "resolution-mode": "import" } {}',
      "'resolution-mode' is not a valid key for an import attributes type.",
    ],
    [
      'declare module "*.css" with { type: `css` } {}',
      'An import attributes property must have a string literal type annotation.',
    ],
    [
      'declare module "*.css" with { private type: "css" } {}',
      "'private' modifier cannot appear on a type member",
    ],
  ])('reports an error for %s', (code, message) => {
    expect(() => parse(code)).toThrow(message);
  });

  it('skips members that cannot be import attributes with allowInvalidAST', () => {
    const { attributes } = parse(
      'declare module "*.css" with { type(): void; kind: "css"; size: number; flag } {}',
      true,
    );

    expect(attributes).toMatchObject([{ key: { name: 'kind' } }]);
  });
});
