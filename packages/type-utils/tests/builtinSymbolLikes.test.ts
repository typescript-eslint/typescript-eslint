import type { TSESTree } from '@typescript-eslint/typescript-estree';
import type * as ts from 'typescript';

import { isBuiltinSymbolLike } from '../src/index.js';
import { parseCodeForEslint } from './test-utils/custom-matchers/custom-matchers.js';

describe(isBuiltinSymbolLike, () => {
  function getType(code: string): { program: ts.Program; type: ts.Type } {
    const { ast, services } = parseCodeForEslint(code);
    const declaration = ast.body.at(-1) as TSESTree.TSTypeAliasDeclaration;
    return {
      program: services.program,
      type: services.getTypeAtLocation(declaration.id),
    };
  }

  describe('matches direct builtin types', () => {
    it.for([
      ['type Test = Promise<void>;', 'Promise'],
      ['type Test = Error;', 'Error'],
      ['type Test = Array<number>;', 'Array'],
      ['type Test = Map<string, number>;', 'Map'],
    ] as const)(
      'when code is %s with symbolName %s, returns true',
      ([code, symbolName], { expect }) => {
        const { program, type } = getType(code);

        expect(isBuiltinSymbolLike(program, type, symbolName)).toBe(true);
      },
    );
  });

  describe('matches derived instance types of classes extending builtins', () => {
    it.for([
      ['class Foo extends Promise<number> {}; type Test = Foo;', 'Promise'],
      ['class Foo extends Error {}; type Test = Foo;', 'Error'],
      ['class Foo extends Array<string> {}; type Test = Foo;', 'Array'],
    ] as const)(
      'when code is %s with symbolName %s, returns true',
      ([code, symbolName], { expect }) => {
        const { program, type } = getType(code);

        expect(isBuiltinSymbolLike(program, type, symbolName)).toBe(true);
      },
    );
  });

  describe('matches constructor types of classes extending builtins', () => {
    it.for([
      [
        'class Foo extends Array {} type Test = typeof Foo;',
        ['ArrayConstructor', 'Array'],
      ],
      [
        'class Foo extends Promise<number> {} type Test = typeof Foo;',
        'Promise',
      ],
      ['class Foo extends Error {} type Test = typeof Foo;', 'Error'],
    ] as const)(
      'when code is %s with symbolName %s, returns true',
      ([code, symbolName], { expect }) => {
        const { program, type } = getType(code);

        expect(
          isBuiltinSymbolLike(program, type, symbolName as string | string[]),
        ).toBe(true);
      },
    );
  });

  describe('matches array of symbol names', () => {
    it('matches when any name in the array matches', () => {
      const { program, type } = getType('type Test = Array<number>;');

      expect(isBuiltinSymbolLike(program, type, ['Map', 'Array'])).toBe(true);
    });

    it('does not match when no name in the array matches', () => {
      const { program, type } = getType('type Test = Array<number>;');

      expect(isBuiltinSymbolLike(program, type, ['Map', 'Set'])).toBe(false);
    });
  });

  describe('does not match non-builtin types', () => {
    it.for([
      ['type Test = number;', 'Number'],
      ['interface Foo {} type Test = Foo;', 'Error'],
      ['class Foo {} type Test = Foo;', 'Array'],
    ] as const)(
      'when code is %s with symbolName %s, returns false',
      ([code, symbolName], { expect }) => {
        const { program, type } = getType(code);

        expect(isBuiltinSymbolLike(program, type, symbolName)).toBe(false);
      },
    );
  });

  describe('handles type parameters with constraints', () => {
    it('returns true when the constraint is a matching builtin', () => {
      const { program, type } = getType('type Test<T extends Error> = T;');

      expect(isBuiltinSymbolLike(program, type, 'Error')).toBe(true);
    });

    it('returns false when the constraint is not a matching builtin', () => {
      const { program, type } = getType('type Test<T extends Error> = T;');

      expect(isBuiltinSymbolLike(program, type, 'Promise')).toBe(false);
    });

    it('returns false when there is no constraint', () => {
      const { program, type } = getType('type Test<T> = T;');

      expect(isBuiltinSymbolLike(program, type, 'Error')).toBe(false);
    });
  });

  describe('handles union and intersection types', () => {
    it('returns true for union only when all constituents match', () => {
      const { program, type } = getType(
        'type Test = Promise<number> | Promise<string>;',
      );

      expect(isBuiltinSymbolLike(program, type, 'Promise')).toBe(true);
    });

    it('returns false for union when not all constituents match', () => {
      const { program, type } = getType(
        'interface Foo {}; type Test = Promise<number> | Foo;',
      );

      expect(isBuiltinSymbolLike(program, type, 'Promise')).toBe(false);
    });

    it('returns true for intersection when any constituent matches', () => {
      const { program, type } = getType(
        'interface Foo {}; type Test = Foo & Error;',
      );

      expect(isBuiltinSymbolLike(program, type, 'Error')).toBe(true);
    });
  });
});
