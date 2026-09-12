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

describe('native preview API gaps', () => {
  it('has no way to read an interface type’s `this` type', () => {
    const { ast, services } = parse('class C { m() {} }');
    assert.isNotNull(services.program);
    const checker = services.program.getTypeChecker();
    const classType = checker.getTypeAtLocation(
      services.esTreeNodeToTSNodeMap.get(ast.body[0]),
    ) as ts.InterfaceType;

    expect(() => classType.thisType).toThrow(
      'Type#thisType is not available on the TypeScript native preview API.',
    );
  });

  it('cannot await a union whose constituents await to different types', () => {
    const { checker, type } = typeOfDeclaration(
      'declare const p: Promise<number> | Promise<string>;',
    );

    expect(checker.getAwaitedType(type)).toBeUndefined();
  });

  it('awaits a single thenable the same way classic does', () => {
    const { checker, type } = typeOfDeclaration(
      'declare const p: Promise<number>;',
    );

    expect(checker.typeToString(checker.getAwaitedType(type)!)).toBe('number');
  });

  it('does not preserve the declared order of union constituents', () => {
    const { checker, type } = typeOfDeclaration(
      'declare const u: number | string;',
    );

    // Classic reports `number | string`, matching the declaration.
    expect(checker.typeToString(type)).toBe('string | number');
  });
});
