import type { TSESTree } from '@typescript-eslint/typescript-estree';

import * as ts from 'typescript';

import { getTypeFlags, isTypeFlagSet } from '../src';
import { parseCodeForEslint } from './test-utils/custom-matchers/custom-matchers.js';

describe('typeFlagUtils', () => {
  function getType(code: string): ts.Type {
    const { ast, services } = parseCodeForEslint(code);
    const declaration = ast.body[0] as TSESTree.TSTypeAliasDeclaration;

    return services.getTypeAtLocation(declaration.id);
  }

  describe(getTypeFlags, () => {
    it.for([
      ['type Test = any;', ts.TypeFlags.Any],
      ['type Test = unknown;', ts.TypeFlags.Unknown],
      ['type Test = string;', ts.TypeFlags.String],
      ['type Test = number;', ts.TypeFlags.Number],
      ['type Test = "text";', ts.TypeFlags.StringLiteral],
      ['type Test = 123;', ts.TypeFlags.NumberLiteral],
      [
        'type Test = string | number',
        ts.TypeFlags.String | ts.TypeFlags.Number,
      ],
      ['type Test = "text" | 123', ts.TypeFlags.StringOrNumberLiteral],
    ] as const satisfies [string, ts.TypeFlags][])(
      'when code is "%s", type flags is %d',
      ([code, expected], { expect }) => {
        const type = getType(code);
        const result = getTypeFlags(type);
        expect(result).toBe(expected);
      },
    );
  });

  describe(isTypeFlagSet, () => {
    describe('is type flags set', () => {
      it.for([
        ['type Test = any;', ts.TypeFlags.Any],
        ['type Test = string;', ts.TypeFlags.String],
        ['type Test = string | number;', ts.TypeFlags.String],
        ['type Test = string & { foo: string };', ts.TypeFlags.Intersection],
      ] as const satisfies [string, ts.TypeFlags][])(
        'when code is "%s" and flagsToCheck is %d , returns true',
        ([code, flagsToCheck], { expect }) => {
          const type = getType(code);
          const result = isTypeFlagSet(type, flagsToCheck);
          expect(result).toBe(true);
        },
      );
    });

    describe('is not type flags set', () => {
      it.for([
        ['type Test = string', ts.TypeFlags.Any],
        ['type Test = string | number;', ts.TypeFlags.Any],
        ['type Test = string & { foo: string }', ts.TypeFlags.String],
      ] as const satisfies [string, ts.TypeFlags][])(
        'when code is "%s" and flagsToCheck is %d , returns false',
        ([code, flagsToCheck], { expect }) => {
          const type = getType(code);
          const result = isTypeFlagSet(type, flagsToCheck);
          expect(result).toBe(false);
        },
      );
    });
  });
});
