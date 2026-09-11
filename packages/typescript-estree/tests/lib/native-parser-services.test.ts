import type { TSESTree } from '@typescript-eslint/types';

import path from 'node:path';
import * as ts from 'typescript';

import '../../src/native/index.js';
import { clearCaches, parseAndGenerateServices } from '../../src/index.js';

const fixtures = path.join(__dirname, '../fixtures/nativeProject');
const filePath = path.join(fixtures, 'file.ts');

afterEach(clearCaches);

function parse(code: string) {
  return parseAndGenerateServices(code, {
    filePath,
    projectService: { backend: 'native' },
  });
}

describe('native parser services', () => {
  it('returns the same parser services shape as the classic backend', () => {
    const { ast, services } = parseAndGenerateServices(
      '// leading\nconst value: string = "text";',
      {
        comment: true,
        filePath,
        projectService: { backend: 'native' },
        tokens: true,
      },
    );

    expect(ast.comments).toHaveLength(1);
    expect(ast.tokens.length).toBeGreaterThan(0);
    expect(services.program).not.toBeNull();
    expect(services.program.getCompilerOptions().strict).toBe(true);

    const declaration = ast.body[0];
    expect(services.getTypeAtLocation(declaration).flags).toBeTypeOf('number');
    expect(services.esTreeNodeToTSNodeMap.get(declaration).kind).toBe(
      ts.SyntaxKind.VariableStatement,
    );
  });

  it('exposes a program whose checker speaks the classic type API', () => {
    const { ast, services } = parse('declare const value: string | number;');
    const checker = services.program.getTypeChecker();
    const declaration = ast.body[0] as TSESTree.VariableDeclaration;
    const type = services.getTypeAtLocation(declaration.declarations[0].id);

    expect(checker.typeToString(type)).toBe('string | number');
    expect(type.isUnion()).toBe(true);
    expect(
      (type as ts.UnionType).types.map(part => checker.typeToString(part)),
    ).toStrictEqual(['string', 'number']);
  });

  it('resolves symbols to classic-shaped declarations', () => {
    const { ast, services } = parse('interface Box {}\ndeclare const b: Box;');
    const declaration = ast.body[1] as TSESTree.VariableDeclaration;
    const symbol = services.getSymbolAtLocation(declaration.declarations[0].id);

    expect(symbol?.name).toBe('b');
    expect(symbol?.declarations?.[0].kind).toBe(
      ts.SyntaxKind.VariableDeclaration,
    );
  });

  it('replaces nodes and types when the same file text changes', () => {
    const first = parse('export const value = 1;');
    const firstNode = first.services.esTreeNodeToTSNodeMap.get(
      first.ast.body[0],
    );
    const firstType = first.services.getTypeAtLocation(first.ast.body[0]);

    const second = parse('export const value = "updated";');
    const secondNode = second.services.esTreeNodeToTSNodeMap.get(
      second.ast.body[0],
    );

    expect(secondNode).not.toBe(firstNode);
    expect(second.services.getTypeAtLocation(second.ast.body[0])).not.toBe(
      firstType,
    );
    expect(second.services.tsNodeToESTreeNodeMap.has(secondNode)).toBe(true);
    expect(second.services.tsNodeToESTreeNodeMap.has(firstNode)).toBe(false);
  });

  it('gets the contextual type of an expression', () => {
    const { ast, services } = parse(
      'const callback: (value: string) => string = value => value;',
    );
    const declaration = ast.body[0] as TSESTree.VariableDeclaration;
    const expression = declaration.declarations[0]
      .init as TSESTree.ArrowFunctionExpression;

    expect(services.getContextualType(expression)).toBeDefined();
  });

  it.each([
    ['call', 'function create() {} create();'],
    ['new', 'class Example {} new Example();'],
  ])('gets the resolved signature of a %s expression', (_kind, code) => {
    const { ast, services } = parse(code);
    const statement = ast.body[1] as TSESTree.ExpressionStatement;

    expect(
      services.getResolvedSignature(
        statement.expression as
          TSESTree.CallExpression | TSESTree.NewExpression,
      ),
    ).toBeDefined();
  });

  it('maps a node back to the identical ESTree node', () => {
    const { ast, services } = parse('const value = 1;');
    const estreeNode = ast.body[0];
    const tsNode = services.esTreeNodeToTSNodeMap.get(estreeNode);

    expect(services.tsNodeToESTreeNodeMap.get(tsNode)).toBe(estreeNode);
    expect({
      forward: services.esTreeNodeToTSNodeMap.has(estreeNode),
      reverse: services.tsNodeToESTreeNodeMap.has(tsNode),
    }).toStrictEqual({ forward: true, reverse: true });
  });

  it.each([
    ['function test(...values,) {}', 'A rest parameter'],
    ['1 = 2;', 'left-hand side'],
  ])('reports diagnostics for %s', (code, message) => {
    expect(() =>
      parseAndGenerateServices(code, {
        errorOnTypeScriptSyntacticAndSemanticIssues: true,
        filePath,
        projectService: { backend: 'native' },
      }),
    ).toThrow(message);
  });

  it('names the missing native API when an unsupported one is reached', () => {
    const { services } = parse('const value = 1;');
    const checker = services.program.getTypeChecker();

    expect(
      () => (checker as unknown as Record<string, unknown>).getTypeCount,
    ).toThrow('not available on the TypeScript native preview API');
  });
});
