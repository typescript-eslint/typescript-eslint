import type { TSESTree } from '@typescript-eslint/types';

import {
  getTypeOfPropertyOfName,
  getTypeOfPropertyOfType,
  isTypeAnyType,
} from '../src/index.js';
import { parseCodeForEslint } from './test-utils/custom-matchers/custom-matchers.js';

describe.for(['getTypeOfPropertyOfName', 'getTypeOfPropertyOfType'])(
  '%s',
  functionName => {
    it.for([
      {
        code: 'declare let test: { value: string };',
        expected: 'string',
      },
      {
        code: 'declare let test: { value?: string };',
        expected: 'string | undefined',
      },
      {
        code: `
declare let test: { [key]: string };
declare const key: unique symbol;
      `,
        expected: 'string',
      },
      {
        code: `
declare let test: { [key]?: string };
declare const key: unique symbol;
      `,
        expected: 'string | undefined',
      },
      {
        code: `
declare let test: Derived;
declare const key: unique symbol;
interface Base<T> { readonly [key]: T }
interface Derived extends Base<string> {}
      `,
        expected: 'string',
      },
      {
        code: `
declare let test: { [K in typeof key]: number };
declare const key: unique symbol;
      `,
        expected: 'number',
      },
      {
        code: 'declare let test: { readonly [Symbol.toStringTag]: string };',
        expected: 'string',
      },
      {
        code: `
declare let test: Container;
class Container { #value: number = 1 }
      `,
        expected: 'number',
      },
      {
        code: `
declare let test: Container<string>;
class Container<T> { #value?: T }
      `,
        expected: 'string | undefined',
      },
    ])('returns $expected for $code', ({ code, expected }) => {
      const { ast, services } = parseCodeForEslint(code);
      const declaration = ast.body[0] as TSESTree.VariableDeclaration;
      const type = services.getTypeAtLocation(declaration.declarations[0].id);
      const checker = services.program.getTypeChecker();
      const [property] = type.getProperties();
      const result =
        functionName === 'getTypeOfPropertyOfName'
          ? getTypeOfPropertyOfName(
              checker,
              type,
              property.getName(),
              property.getEscapedName(),
            )
          : getTypeOfPropertyOfType(checker, type, property);

      expect(result).toBeDefined();
      expect(checker.typeToString(result!)).toBe(expected);
    });
  },
);

describe(getTypeOfPropertyOfName, () => {
  it('returns undefined for a symbol absent from the containing type', () => {
    const { ast, services } = parseCodeForEslint(`
declare let test: { [key]: string };
declare const key: unique symbol;
type Empty = {};
    `);
    const declaration = ast.body[0] as TSESTree.VariableDeclaration;
    const emptyDeclaration = ast.body[2] as TSESTree.TSTypeAliasDeclaration;
    const type = services.getTypeAtLocation(declaration.declarations[0].id);
    const emptyType = services.getTypeAtLocation(emptyDeclaration.id);
    const [property] = type.getProperties();

    expect(
      getTypeOfPropertyOfName(
        services.program.getTypeChecker(),
        emptyType,
        property.getName(),
        property.getEscapedName(),
      ),
    ).toBeUndefined();
  });
});

describe(getTypeOfPropertyOfType, () => {
  it('resolves the inherited Symbol.unscopables property of a readonly array', () => {
    const { ast, services } = parseCodeForEslint(`
declare let test: Test;
interface Test extends ReadonlyArray<string> {}
    `);
    const declaration = ast.body[0] as TSESTree.VariableDeclaration;
    const type = services.getTypeAtLocation(declaration.declarations[0].id);
    const checker = services.program.getTypeChecker();
    const property = type
      .getProperties()
      .find(property => property.getName().startsWith('__@unscopables@'))!;
    const result = getTypeOfPropertyOfType(checker, type, property)!;

    expect(isTypeAnyType(result)).toBe(false);
    expect(
      checker.typeToString(checker.getTypeOfPropertyOfType(result, 'length')!),
    ).toBe('boolean | undefined');
  });
});
