import type * as ts from 'typescript';

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

describe('native preview API parity', () => {
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
