import type { TSESTree } from '@typescript-eslint/typescript-estree';

import * as tsutils from 'ts-api-utils';

import { isPropertyReadonly, isTypeReadonly } from '../src/index.js';
import { parseCodeForEslint } from './test-utils/custom-matchers/custom-matchers.js';

describe(isPropertyReadonly, () => {
  it('treats properties of a spread object asserted as const as readonly', () => {
    const { ast, services } = parseCodeForEslint(`
declare const base: { a: string };
const spread = { ...base } as const;
    `);
    const declaration = ast.body[1] as TSESTree.VariableDeclaration;
    const type = services.getTypeAtLocation(declaration.declarations[0].id);
    const checker = services.program.getTypeChecker();
    const property = type.getProperties()[0];

    expect(
      tsutils.isPropertyReadonlyInType(
        type,
        property.getEscapedName(),
        checker,
      ),
    ).toBe(false);
    expect(isPropertyReadonly(type, property, checker)).toBe(true);
    expect(isTypeReadonly(services.program, type)).toBe(true);
  });

  it('still treats mutable properties as mutable', () => {
    const { ast, services } = parseCodeForEslint(`
declare const value: { a: string };
    `);
    const declaration = ast.body[0] as TSESTree.VariableDeclaration;
    const type = services.getTypeAtLocation(declaration.declarations[0].id);
    const checker = services.program.getTypeChecker();
    const property = type.getProperties()[0];

    expect(isPropertyReadonly(type, property, checker)).toBe(false);
    expect(isTypeReadonly(services.program, type)).toBe(false);
  });

  it('still treats declared readonly properties as readonly', () => {
    const { ast, services } = parseCodeForEslint(`
declare const value: { readonly a: string };
    `);
    const declaration = ast.body[0] as TSESTree.VariableDeclaration;
    const type = services.getTypeAtLocation(declaration.declarations[0].id);
    const checker = services.program.getTypeChecker();
    const property = type.getProperties()[0];

    expect(isPropertyReadonly(type, property, checker)).toBe(true);
    expect(isTypeReadonly(services.program, type)).toBe(true);
  });
});
