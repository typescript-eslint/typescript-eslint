import type { TSESTree } from '@typescript-eslint/types';

import * as ts from 'typescript';

import { parseAndGenerateServices } from '../../src/index.js';
import {
  isolateNativeBackend,
  nativeFilePath as filePath,
} from './nativeTestUtils';

isolateNativeBackend();

function parse(code: string) {
  const { ast, services } = parseAndGenerateServices(code, {
    filePath,
    projectService: { backend: 'native' },
  });
  assert.isNotNull(services.program);
  return { ast, services };
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
    assert.isNotNull(services.program);

    expect(ast.comments).toHaveLength(1);
    expect(ast.tokens.length).toBeGreaterThan(0);
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
    const type = checker.getTypeAtLocation(
      services.esTreeNodeToTSNodeMap.get(declaration.declarations[0].id),
    );

    expect(checker.typeToString(type)).toBe('string | number');
    expect(
      type.isUnion()
        ? type.types.map(part => checker.typeToString(part))
        : undefined,
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

  it('locates diagnostics in the source file they came from', () => {
    const { ast, services } = parse('function test(...values,) {}');
    const sourceFile = services.esTreeNodeToTSNodeMap
      .get(ast.body[0])
      .getSourceFile();
    const diagnostics = services.program.getSemanticDiagnostics(sourceFile);
    const diagnostic = diagnostics.find(({ code }) => code === 1013);

    expect(diagnostics.map(({ file }) => file?.fileName)).toStrictEqual(
      diagnostics.map(() => filePath),
    );
    expect(
      diagnostic?.file?.getLineAndCharacterOfPosition(diagnostic.start!).line,
    ).toBe(0);
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

  it.each(['declarations', 'exports', 'members', 'parent', 'valueDeclaration'])(
    'resolves a symbol’s %s once and reuses it',
    property => {
      const { ast, services } = parse(
        'interface Box { a: number }\nexport declare const b: Box;',
      );
      const statement = ast.body[1] as TSESTree.ExportNamedDeclaration;
      const declaration = statement.declaration as TSESTree.VariableDeclaration;
      const symbol = services.getSymbolAtLocation(
        declaration.declarations[0].id,
      ) as unknown as Record<string, unknown>;

      expect(symbol[property]).toBeDefined();
      expect(symbol[property]).toBe(symbol[property]);
    },
  );

  it('names the missing checker API when an unsupported one is reached', () => {
    const { services } = parse('const value = 1;');
    const checker = services.program.getTypeChecker() as unknown as Record<
      string,
      unknown
    >;

    expect(() => checker.getAmbientModules).toThrow(
      'TypeChecker#getAmbientModules is not available on the TypeScript native preview API.',
    );
  });

  it('names the missing program API when an unsupported one is reached', () => {
    const { services } = parse('const value = 1;');
    const program = services.program as unknown as Record<string, unknown>;

    expect(() => program.getTypeCount).toThrow(
      '#getTypeCount is not available on the TypeScript native preview API.',
    );
  });

  it.each(['then', 'toJSON', 'inspect'])(
    'leaves the %s probe undefined rather than throwing',
    member => {
      const { services } = parse('const value = 1;');
      const checker = services.program.getTypeChecker() as unknown as Record<
        string,
        unknown
      >;

      expect(checker[member]).toBeUndefined();
      expect(
        (services.program as unknown as Record<string, unknown>)[member],
      ).toBeUndefined();
    },
  );
});
