import type { TSESTree } from '@typescript-eslint/types';

import * as ts from 'typescript';

import type { NativeQueryContext } from './nativeTestUtils';

import { isolateNativeBackend, onBothBackends } from './nativeTestUtils';

isolateNativeBackend();

function typeOfLastDeclaration({ ast, checker, tsNode }: NativeQueryContext) {
  const declaration = ast.body.at(-1) as TSESTree.VariableDeclaration;
  return checker.getTypeAtLocation(tsNode(declaration.declarations[0].id));
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
    [
      'a class type’s `this` type',
      'class C { m() {} }\ndeclare const v: C;',
      (checker: ts.TypeChecker, type: ts.Type) =>
        checker.typeToString((type as ts.InterfaceType).thisType!),
    ],
    [
      'a union whose constituents await to different types',
      'declare const p: Promise<number> | Promise<string>;',
      (checker: ts.TypeChecker, type: ts.Type) =>
        checker.typeToString(checker.getAwaitedType(type)!),
    ],
    [
      'a single awaited thenable',
      'declare const p: Promise<number>;',
      (checker: ts.TypeChecker, type: ts.Type) =>
        checker.typeToString(checker.getAwaitedType(type)!),
    ],
  ])('answers the same as classic for %s', (_name, code, query) => {
    const { classic, native } = onBothBackends(code, context =>
      query(context.checker, typeOfLastDeclaration(context)),
    );

    expect(native).toBe(classic);
    expect(native).toBeDefined();
  });

  it('orders union constituents by name where classic orders them by type id', () => {
    const results = onBothBackends(
      [
        'interface Zebra { z: number }',
        'interface Apple { a: number }',
        'declare const u: Zebra | Apple;',
      ].join('\n'),
      context => context.checker.typeToString(typeOfLastDeclaration(context)),
    );

    expect(results).toEqual({
      classic: 'Zebra | Apple',
      native: 'Apple | Zebra',
    });
  });

  it("answers a meta property's keyword with the meta property", () => {
    const results = onBothBackends(
      'const meta = import.meta;\nexport {};',
      ({ ast, checker, services }) => {
        const declaration = ast.body[0] as TSESTree.VariableDeclaration;
        const { meta } = declaration.declarations[0]
          .init as TSESTree.MetaProperty;

        return [
          services.getSymbolAtLocation(meta)?.name,
          checker.typeToString(services.getTypeAtLocation(meta)),
        ];
      },
    );

    expect(results).toEqual({
      classic: ['ImportMetaExpression', '{ readonly meta: ImportMeta; }'],
      native: ['ImportMeta', 'ImportMeta'],
    });
  });
});
