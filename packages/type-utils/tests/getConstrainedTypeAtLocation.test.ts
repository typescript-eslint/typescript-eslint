import type { TSESTree } from '@typescript-eslint/types';
import type { ParserServicesWithTypeInformation } from '@typescript-eslint/typescript-estree';

import { parseForESLint } from '@typescript-eslint/parser';
import path from 'node:path';
import * as tsutils from 'ts-api-utils';

import { getConstrainedTypeAtLocation, isTypeUnknownType } from '../src';

function parseCodeForEslint(code: string): ReturnType<typeof parseForESLint> & {
  services: ParserServicesWithTypeInformation;
} {
  const rootDir = path.join(__dirname, 'fixtures');

  // @ts-expect-error -- services will have type information.
  return parseForESLint(code, {
    disallowAutomaticSingleRunInference: true,
    filePath: path.join(rootDir, 'file.ts'),
    project: './tsconfig.json',
    tsconfigRootDir: rootDir,
  });
}

describe('getConstrainedTypeAtLocation', () => {
  // See https://github.com/typescript-eslint/typescript-eslint/issues/10438
  // eslint-disable-next-line jest/no-disabled-tests -- known issue.
  it.skip('returns unknown for unconstrained generic', () => {
    const sourceCode = `
function foo<T>(x: T);
    `;

    const { ast, services } = parseCodeForEslint(sourceCode);

    const functionNode = ast.body[0] as TSESTree.FunctionDeclaration;
    const parameterNode = functionNode.params[0];

    const constraintAtLocation = getConstrainedTypeAtLocation(
      services,
      parameterNode,
    );

    expect(tsutils.isTypeParameter(constraintAtLocation)).toBe(false);
    // Requires https://github.com/microsoft/TypeScript/issues/60475 to solve.
    expect(isTypeUnknownType(constraintAtLocation)).toBe(true);
  });

  it('returns unknown for extends unknown', () => {
    const sourceCode = `
function foo<T extends unknown>(x: T);
    `;

    const { ast, services } = parseCodeForEslint(sourceCode);

    const functionNode = ast.body[0] as TSESTree.FunctionDeclaration;
    const parameterNode = functionNode.params[0];

    const constraintAtLocation = getConstrainedTypeAtLocation(
      services,
      parameterNode,
    );

    expect(tsutils.isTypeParameter(constraintAtLocation)).toBe(false);
    expect(tsutils.isIntrinsicUnknownType(constraintAtLocation)).toBe(true);
  });

  it('returns unknown for extends any', () => {
    const sourceCode = `
function foo<T extends any>(x: T);
    `;

    const { ast, services } = parseCodeForEslint(sourceCode);

    const functionNode = ast.body[0] as TSESTree.FunctionDeclaration;
    const parameterNode = functionNode.params[0];

    const constraintAtLocation = getConstrainedTypeAtLocation(
      services,
      parameterNode,
    );

    expect(tsutils.isTypeParameter(constraintAtLocation)).toBe(false);
    expect(tsutils.isIntrinsicUnknownType(constraintAtLocation)).toBe(true);
  });

  it('returns string for extends string', () => {
    const sourceCode = `
function foo<T extends string>(x: T);
    `;

    const { ast, services } = parseCodeForEslint(sourceCode);

    const functionNode = ast.body[0] as TSESTree.FunctionDeclaration;
    const parameterNode = functionNode.params[0];

    const constraintAtLocation = getConstrainedTypeAtLocation(
      services,
      parameterNode,
    );

    expect(tsutils.isTypeParameter(constraintAtLocation)).toBe(false);
    expect(tsutils.isIntrinsicStringType(constraintAtLocation)).toBe(true);
  });

  it('returns string for non-generic string', () => {
    const sourceCode = `
function foo(x: string);
    `;

    const { ast, services } = parseCodeForEslint(sourceCode);

    const functionNode = ast.body[0] as TSESTree.FunctionDeclaration;
    const parameterNode = functionNode.params[0];

    const constraintAtLocation = getConstrainedTypeAtLocation(
      services,
      parameterNode,
    );

    expect(tsutils.isTypeParameter(constraintAtLocation)).toBe(false);
    expect(tsutils.isIntrinsicStringType(constraintAtLocation)).toBe(true);
  });

  it('handles type parameter whose constraint is a constrained type parameter', () => {
    const sourceCode = `
function foo<T extends string>() {
  function bar<V extends T>(x: V) {
  }
}
    `;

    const { ast, services } = parseCodeForEslint(sourceCode);

    const outerFunctionNode = ast.body[0] as TSESTree.FunctionDeclaration;
    const innerFunctionNode = outerFunctionNode.body
      .body[0] as TSESTree.FunctionDeclaration;
    const parameterNode = innerFunctionNode.params[0];

    const constraintAtLocation = getConstrainedTypeAtLocation(
      services,
      parameterNode,
    );

    expect(tsutils.isTypeParameter(constraintAtLocation)).toBe(false);
    expect(tsutils.isIntrinsicStringType(constraintAtLocation)).toBe(true);
  });
});
