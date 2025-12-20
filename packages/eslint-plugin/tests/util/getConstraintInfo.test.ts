import type { ParserOptions } from '@typescript-eslint/parser';
import type { TSESTree } from '@typescript-eslint/utils';

import { parseForESLint } from '@typescript-eslint/parser';
import * as path from 'node:path';
import * as tsutils from 'ts-api-utils';

import { getConstraintInfo } from '../../src/util/getConstraintInfo.js';
import { getFixturesRootDir } from '../RuleTester.js';

const FIXTURES_DIR = getFixturesRootDir();

const DEFAULT_PARSER_OPTIONS = {
  disallowAutomaticSingleRunInference: true,
  filePath: path.join(FIXTURES_DIR, 'file.ts'),
  project: './tsconfig.json',
  projectService: false,
  tsconfigRootDir: FIXTURES_DIR,
} as const satisfies ParserOptions;

describe(getConstraintInfo, () => {
  it('returns undefined for unconstrained generic', () => {
    const sourceCode = `
function foo<T>(x: T);
    `;

    const { ast, services } = parseForESLint(
      sourceCode,
      DEFAULT_PARSER_OPTIONS,
    );

    assert.isNotNull(services.program);

    const checker = services.program.getTypeChecker();

    const functionNode = ast.body[0] as TSESTree.FunctionDeclaration;
    const parameterNode = functionNode.params[0];
    const parameterType = services.getTypeAtLocation(parameterNode);

    const { constraintType, isTypeParameter } = getConstraintInfo(
      checker,
      parameterType,
    );

    expect(isTypeParameter).toBe(true);
    // ideally one day we'll be able to change this to assert that it be the intrinsic unknown type.
    // Requires https://github.com/microsoft/TypeScript/issues/60475
    assert.isUndefined(constraintType);
  });

  it('returns unknown for extends unknown', () => {
    const sourceCode = `
function foo<T extends unknown>(x: T);
    `;

    const { ast, services } = parseForESLint(
      sourceCode,
      DEFAULT_PARSER_OPTIONS,
    );

    assert.isNotNull(services.program);

    const checker = services.program.getTypeChecker();

    const functionNode = ast.body[0] as TSESTree.FunctionDeclaration;
    const parameterNode = functionNode.params[0];
    const parameterType = services.getTypeAtLocation(parameterNode);

    const { constraintType, isTypeParameter } = getConstraintInfo(
      checker,
      parameterType,
    );

    expect(isTypeParameter).toBe(true);

    assert.isDefined(constraintType);

    expect(tsutils.isTypeParameter(constraintType)).toBe(false);
    expect(tsutils.isIntrinsicUnknownType(constraintType)).toBe(true);
  });

  it('returns unknown for extends any', () => {
    const sourceCode = `
function foo<T extends any>(x: T);
    `;

    const { ast, services } = parseForESLint(
      sourceCode,
      DEFAULT_PARSER_OPTIONS,
    );

    assert.isNotNull(services.program);

    const checker = services.program.getTypeChecker();

    const functionNode = ast.body[0] as TSESTree.FunctionDeclaration;
    const parameterNode = functionNode.params[0];
    const parameterType = services.getTypeAtLocation(parameterNode);

    const { constraintType, isTypeParameter } = getConstraintInfo(
      checker,
      parameterType,
    );

    expect(isTypeParameter).toBe(true);

    assert.isDefined(constraintType);

    expect(tsutils.isTypeParameter(constraintType)).toBe(false);
    expect(tsutils.isIntrinsicUnknownType(constraintType)).toBe(true);
  });

  it('returns string for extends string', () => {
    const sourceCode = `
function foo<T extends string>(x: T);
    `;

    const { ast, services } = parseForESLint(
      sourceCode,
      DEFAULT_PARSER_OPTIONS,
    );

    assert.isNotNull(services.program);

    const checker = services.program.getTypeChecker();

    const functionNode = ast.body[0] as TSESTree.FunctionDeclaration;
    const parameterNode = functionNode.params[0];
    const parameterType = services.getTypeAtLocation(parameterNode);

    const { constraintType, isTypeParameter } = getConstraintInfo(
      checker,
      parameterType,
    );

    expect(isTypeParameter).toBe(true);

    assert.isDefined(constraintType);

    expect(tsutils.isTypeParameter(constraintType)).toBe(false);
    expect(tsutils.isIntrinsicStringType(constraintType)).toBe(true);
  });

  it('returns string for non-generic string', () => {
    const sourceCode = `
function foo(x: string);
    `;

    const { ast, services } = parseForESLint(
      sourceCode,
      DEFAULT_PARSER_OPTIONS,
    );

    assert.isNotNull(services.program);

    const checker = services.program.getTypeChecker();

    const functionNode = ast.body[0] as TSESTree.FunctionDeclaration;
    const parameterNode = functionNode.params[0];
    const parameterType = services.getTypeAtLocation(parameterNode);

    const { constraintType, isTypeParameter } = getConstraintInfo(
      checker,
      parameterType,
    );

    expect(isTypeParameter).toBe(false);

    assert.isDefined(constraintType);

    expect(tsutils.isTypeParameter(constraintType)).toBe(false);
    expect(tsutils.isIntrinsicStringType(constraintType)).toBe(true);
    expect(constraintType).toBe(parameterType);
  });

  it('handles type parameter whose constraint is a constrained type parameter', () => {
    const sourceCode = `
function foo<T extends string>() {
  function bar<V extends T>(x: V) {
  }
}
    `;

    const { ast, services } = parseForESLint(
      sourceCode,
      DEFAULT_PARSER_OPTIONS,
    );

    assert.isNotNull(services.program);

    const checker = services.program.getTypeChecker();

    const outerFunctionNode = ast.body[0] as TSESTree.FunctionDeclaration;
    const innerFunctionNode = outerFunctionNode.body
      .body[0] as TSESTree.FunctionDeclaration;
    const parameterNode = innerFunctionNode.params[0];
    const parameterType = services.getTypeAtLocation(parameterNode);

    const { constraintType, isTypeParameter } = getConstraintInfo(
      checker,
      parameterType,
    );

    assert.isDefined(constraintType);

    expect(tsutils.isTypeParameter(constraintType)).toBe(false);
    expect(tsutils.isIntrinsicStringType(constraintType)).toBe(true);
    expect(isTypeParameter).toBe(true);
  });

  it('handles type parameter whose constraint is an unconstrained type parameter', () => {
    const sourceCode = `
function foo<T>() {
  function bar<V extends T>(x: V) {
  }
}
    `;

    const { ast, services } = parseForESLint(
      sourceCode,
      DEFAULT_PARSER_OPTIONS,
    );

    assert.isNotNull(services.program);

    const checker = services.program.getTypeChecker();

    const outerFunctionNode = ast.body[0] as TSESTree.FunctionDeclaration;
    const innerFunctionNode = outerFunctionNode.body
      .body[0] as TSESTree.FunctionDeclaration;
    const parameterNode = innerFunctionNode.params[0];
    const parameterType = services.getTypeAtLocation(parameterNode);

    const { constraintType, isTypeParameter } = getConstraintInfo(
      checker,
      parameterType,
    );

    expect(isTypeParameter).toBe(true);

    assert.isUndefined(constraintType);
  });
});
