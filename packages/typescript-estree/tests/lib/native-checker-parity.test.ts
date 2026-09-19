import * as ts from 'typescript';

import { parseAndGenerateServices } from '../../src/index.js';
import {
  isolateNativeBackend,
  nativeFilePath as filePath,
} from './nativeTestUtils';

isolateNativeBackend();

function parse(code: string) {
  return parseAndGenerateServices(code, {
    filePath,
    projectService: { backend: 'native' },
  });
}

function typeOfDeclaration(code: string) {
  const { ast, services } = parse(code);
  assert.isNotNull(services.program);
  const checker = services.program.getTypeChecker();
  const declaration = ast.body.at(-1) as never as {
    declarations: { id: never }[];
  };
  return {
    checker,
    type: checker.getTypeAtLocation(
      services.esTreeNodeToTSNodeMap.get(declaration.declarations[0].id),
    ),
  };
}

/** Runs a checker query on both backends so their answers can be compared. */
function onBothBackends(
  code: string,
  query: (checker: ts.TypeChecker, type: ts.Type) => string | undefined,
): { classic: string | undefined; native: string | undefined } {
  const run = (native: boolean): string | undefined => {
    const { ast, services } = parseAndGenerateServices(code, {
      filePath,
      projectService: native ? { backend: 'native' as const } : true,
    });
    assert.isNotNull(services.program);
    const declaration = ast.body.at(-1) as never as {
      declarations: { id: never }[];
    };
    const checker = services.program.getTypeChecker();
    return query(
      checker,
      checker.getTypeAtLocation(
        services.esTreeNodeToTSNodeMap.get(declaration.declarations[0].id),
      ),
    );
  };
  return { classic: run(false), native: run(true) };
}

describe('native preview API parity', () => {
  it.each([
    [
      'string index info',
      'declare const v: { [key: string]: number };',
      (checker: ts.TypeChecker, type: ts.Type) =>
        checker.typeToString(
          checker.getIndexInfoOfType(type, ts.IndexKind.String)!.type,
        ),
    ],
    [
      'number index type',
      'declare const v: { [key: number]: string };',
      (checker: ts.TypeChecker, type: ts.Type) =>
        checker.typeToString(
          checker.getIndexTypeOfType(type, ts.IndexKind.Number)!,
        ),
    ],
    [
      'a type parameter default',
      'interface Box<T = string> { t: T }\ndeclare const v: Box;',
      (checker: ts.TypeChecker, type: ts.Type) =>
        checker.typeToString(
          checker.getDefaultFromTypeParameter(
            (type as ts.TypeReference).target.typeParameters![0],
          )!,
        ),
    ],
    [
      'the non-primitive type',
      'declare const v: object;',
      (checker: ts.TypeChecker) =>
        checker.typeToString(checker.getNonPrimitiveType()),
    ],
  ])('answers the same as classic for %s', (_name, code, query) => {
    const { classic, native } = onBothBackends(code, query);

    expect(native).toBe(classic);
    expect(native).toBeDefined();
  });

  it('reads an interface type’s `this` type', () => {
    const { ast, services } = parse('class C { m() {} }');
    assert.isNotNull(services.program);
    const checker = services.program.getTypeChecker();
    const classType = checker.getTypeAtLocation(
      services.esTreeNodeToTSNodeMap.get(ast.body[0]),
    ) as ts.InterfaceType;

    expect(checker.typeToString(classType.thisType!)).toBe('this');
  });

  it('awaits a union whose constituents await to different types', () => {
    const { checker, type } = typeOfDeclaration(
      'declare const p: Promise<number> | Promise<string>;',
    );

    expect(checker.typeToString(checker.getAwaitedType(type)!)).toBe(
      'string | number',
    );
  });

  it('awaits a single thenable the same way classic does', () => {
    const { checker, type } = typeOfDeclaration(
      'declare const p: Promise<number>;',
    );

    expect(checker.typeToString(checker.getAwaitedType(type)!)).toBe('number');
  });

  it('orders union constituents by name where classic orders them by type id', () => {
    const { checker, type } = typeOfDeclaration(
      [
        'interface Zebra { z: number }',
        'interface Apple { a: number }',
        'declare const u: Zebra | Apple;',
      ].join('\n'),
    );

    // Classic reports `Zebra | Apple`.
    expect(checker.typeToString(type)).toBe('Apple | Zebra');
  });
});
