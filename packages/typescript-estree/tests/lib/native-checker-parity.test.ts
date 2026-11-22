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

  describe('getTypeOfSymbolAtLocation', () => {
    const code = [
      'class Box {',
      "  get 'value'(): string { return ''; }",
      "  set 'value'(value: string | number) {}",
      '}',
      'declare const box: Box;',
      "box['value'] = 1;",
      'export const exported = 1;',
      'exported;',
      'declare function call(callback: () => void): void;',
      'call(() => {});',
    ].join('\n');

    function boxValue({ ast, checker, tsNode }: NativeQueryContext) {
      const declaration = ast.body[0] as TSESTree.ClassDeclaration;
      return checker
        .getDeclaredTypeOfSymbol(
          checker.getSymbolAtLocation(tsNode(declaration.id!))!,
        )
        .getProperty('value')!;
    }

    it.each([
      [
        'a set accessor’s name',
        'string | number',
        (context: NativeQueryContext) => {
          const declaration = context.ast.body[0] as TSESTree.ClassDeclaration;
          const setter = declaration.body.body[1] as TSESTree.MethodDefinition;
          return context.checker.getTypeOfSymbolAtLocation(
            boxValue(context),
            context.tsNode(setter.key),
          );
        },
      ],
      [
        'an element access being written',
        'string | number',
        (context: NativeQueryContext) => {
          const statement = context.ast.body[2] as TSESTree.ExpressionStatement;
          const { left } =
            statement.expression as TSESTree.AssignmentExpression;
          return context.checker.getTypeOfSymbolAtLocation(
            boxValue(context),
            context.tsNode((left as TSESTree.MemberExpression).property),
          );
        },
      ],
      [
        'an exported local',
        '1',
        (context: NativeQueryContext) => {
          const location = context.tsNode(context.ast.body[4]);
          const local = context.checker
            .getSymbolsInScope(location, ts.SymbolFlags.Value)
            .find(symbol => symbol.name === 'exported')!;
          return context.checker.getTypeOfSymbolAtLocation(local, location);
        },
      ],
      [
        'a differently named identifier',
        '() => void',
        (context: NativeQueryContext) => {
          const statement = context.ast.body[6] as TSESTree.ExpressionStatement;
          const call = statement.expression as TSESTree.CallExpression;
          const signature = context.checker.getResolvedSignature(
            context.tsNode(call) as ts.CallExpression,
          )!;
          return context.checker.getTypeOfSymbolAtLocation(
            signature.parameters[0],
            context.tsNode(call.callee),
          );
        },
      ],
    ])('answers the same as classic at %s', (_name, expected, query) => {
      const results = onBothBackends(code, context =>
        context.checker.typeToString(query(context)),
      );

      expect(results).toEqual({ classic: expected, native: expected });
    });
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
