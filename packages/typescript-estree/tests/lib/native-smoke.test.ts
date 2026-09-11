import path from 'node:path';
import * as tsutils from 'ts-api-utils';
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

describe('native smoke', () => {
  it('exposes a classic program and checker', () => {
    const { ast, services } = parse('const value: string = "hello";');
    expect(services.program).not.toBeNull();
    const checker = services.program!.getTypeChecker();
    const declarator = (ast.body[0] as any).declarations[0].id;
    const type = services.getTypeAtLocation(declarator);
    expect(checker.typeToString(type)).toBe('string');
    expect(tsutils.isTypeFlagSet(type, ts.TypeFlags.String)).toBe(true);
  });

  it('walks unions, symbols, and declarations', () => {
    const { ast, services } = parse(
      'interface Box { value: number }\ndeclare const box: Box | undefined;\nbox;',
    );
    const checker = services.program!.getTypeChecker();
    const expr = (ast.body[2] as any).expression;
    const type = services.getTypeAtLocation(expr);
    expect(type.isUnion()).toBe(true);
    const parts = (type as ts.UnionType).types;
    expect(parts).toHaveLength(2);
    const box = parts.find(part => part.symbol?.name === 'Box')!;
    expect(box).toBeDefined();
    expect(box.symbol.declarations?.[0].kind).toBe(
      ts.SyntaxKind.InterfaceDeclaration,
    );
    const value = checker.getPropertyOfType(box, 'value')!;
    expect(checker.typeToString(checker.getTypeOfSymbol(value))).toBe('number');
  });

  it('resolves signatures and type arguments', () => {
    const { ast, services } = parse(
      'declare function wrap<T>(value: T): T[];\nwrap(1);',
    );
    const checker = services.program!.getTypeChecker();
    const call = (ast.body[1] as any).expression;
    const signature = services.getResolvedSignature(call)!;
    expect(signature).toBeDefined();
    const returnType = signature.getReturnType();
    expect(checker.isArrayType(returnType)).toBe(true);
    expect(
      checker
        .getTypeArguments(returnType as ts.TypeReference)
        .map(arg => checker.typeToString(arg)),
    ).toStrictEqual(['number']);
  });

  it('maps ESTree nodes to classic-shaped TypeScript nodes', () => {
    const { ast, services } = parse('const x = 1;');
    const tsNode = services.esTreeNodeToTSNodeMap.get(ast.body[0]);
    expect(ts.isVariableStatement(tsNode)).toBe(true);
    expect(services.tsNodeToESTreeNodeMap.get(tsNode)).toBe(ast.body[0]);
  });
});
