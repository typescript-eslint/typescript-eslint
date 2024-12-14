import type { TSESTree } from '@typescript-eslint/types';
import type { ParserServicesWithTypeInformation } from '@typescript-eslint/typescript-estree';

import * as tsvfs from '@typescript/vfs';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  getConstrainedTypeAtLocation,
  getConstraintTypeInfoAtLocation,
  isTypeUnknownType,
} from '../src';

/**
 * Creates a dummy value that the type system will treat as if it's a TSESTree.Node.
 */
function mockEstreeNode(): TSESTree.Node {
  // this should never actually be used.
  return null!;
}

/**
 * Creates a mock of the mock ParserServicesWithTypeInformation object.
 *
 * Should be provided with a real type checker. `getTypeAtLocation` will always
 * return the type of the provided node.
 */
function mockServices(
  checker: ts.TypeChecker,
  tsNode: ts.Node,
): ParserServicesWithTypeInformation {
  return {
    getTypeAtLocation: () => checker.getTypeAtLocation(tsNode),
    // @ts-expect-error -- mocking
    program: {
      getTypeChecker: () => checker,
    },
  };
}

interface SourceFileAndTypeChecker {
  sourceFile: ts.SourceFile;
  typeChecker: ts.TypeChecker;
}

// copied with <3 from https://github.com/JoshuaKGoldberg/ts-api-utils/blob/8c747294f24d0adca8817f4028832b855d907b5b/src/test/utils.ts#L41
function createSourceFileAndTypeChecker(
  sourceText: string,
  fileName = 'file.tsx',
): SourceFileAndTypeChecker {
  const compilerOptions: ts.CompilerOptions = {
    lib: ['ES2018'],
    target: ts.ScriptTarget.ES2018,
  };

  const fsMap = tsvfs.createDefaultMapFromNodeModules(compilerOptions, ts);
  fsMap.set(fileName, sourceText);

  const system = tsvfs.createSystem(fsMap);
  const env = tsvfs.createVirtualTypeScriptEnvironment(
    system,
    [fileName],
    ts,
    compilerOptions,
  );

  const program = env.languageService.getProgram();
  if (program == null) {
    throw new Error('Failed to get program.');
  }

  return {
    sourceFile: program.getSourceFile(fileName)!,
    typeChecker: program.getTypeChecker(),
  };
}

/* eslint-disable @typescript-eslint/no-deprecated -- testing a deprecated function */
describe('getConstrainedTypeAtLocation', () => {
  // See https://github.com/typescript-eslint/typescript-eslint/issues/10438
  // eslint-disable-next-line jest/no-disabled-tests -- known issue.
  it.skip('returns unknown for unconstrained generic', () => {
    const sourceCode = `
function foo<T>(x: T);
    `;

    const { sourceFile, typeChecker } =
      createSourceFileAndTypeChecker(sourceCode);

    const functionNode = sourceFile.statements[0] as ts.FunctionDeclaration;
    const parameterNode = functionNode.parameters[0];

    const constraintAtLocation = getConstrainedTypeAtLocation(
      mockServices(typeChecker, parameterNode),
      mockEstreeNode(),
    );

    expect(tsutils.isTypeParameter(constraintAtLocation)).toBe(false);
    // Requires https://github.com/microsoft/TypeScript/issues/60475 to solve.
    expect(isTypeUnknownType(constraintAtLocation)).toBe(true);
  });

  it('returns unknown for extends unknown', () => {
    const sourceCode = `
function foo<T extends unknown>(x: T);
    `;

    const { sourceFile, typeChecker } =
      createSourceFileAndTypeChecker(sourceCode);

    const functionNode = sourceFile.statements[0] as ts.FunctionDeclaration;
    const parameterNode = functionNode.parameters[0];

    const constraintAtLocation = getConstrainedTypeAtLocation(
      mockServices(typeChecker, parameterNode),
      mockEstreeNode(),
    );

    expect(tsutils.isTypeParameter(constraintAtLocation)).toBe(false);
    expect(tsutils.isIntrinsicUnknownType(constraintAtLocation)).toBe(true);
  });

  it('returns unknown for extends any', () => {
    const sourceCode = `
function foo<T extends any>(x: T);
    `;

    const { sourceFile, typeChecker } =
      createSourceFileAndTypeChecker(sourceCode);

    const functionNode = sourceFile.statements[0] as ts.FunctionDeclaration;
    const parameterNode = functionNode.parameters[0];

    const constraintAtLocation = getConstrainedTypeAtLocation(
      mockServices(typeChecker, parameterNode),
      mockEstreeNode(),
    );

    expect(tsutils.isTypeParameter(constraintAtLocation)).toBe(false);
    expect(tsutils.isIntrinsicUnknownType(constraintAtLocation)).toBe(true);
  });

  it('returns string for extends string', () => {
    const sourceCode = `
function foo<T extends string>(x: T);
    `;

    const { sourceFile, typeChecker } =
      createSourceFileAndTypeChecker(sourceCode);

    const functionNode = sourceFile.statements[0] as ts.FunctionDeclaration;
    const parameterNode = functionNode.parameters[0];

    const constraintAtLocation = getConstrainedTypeAtLocation(
      mockServices(typeChecker, parameterNode),
      mockEstreeNode(),
    );

    expect(tsutils.isTypeParameter(constraintAtLocation)).toBe(false);
    expect(tsutils.isIntrinsicStringType(constraintAtLocation)).toBe(true);
  });

  it('returns string for non-generic string', () => {
    const sourceCode = `
function foo(x: string);
    `;

    const { sourceFile, typeChecker } =
      createSourceFileAndTypeChecker(sourceCode);

    const functionNode = sourceFile.statements[0] as ts.FunctionDeclaration;
    const parameterNode = functionNode.parameters[0];

    const constraintAtLocation = getConstrainedTypeAtLocation(
      mockServices(typeChecker, parameterNode),
      mockEstreeNode(),
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

    const { sourceFile, typeChecker } =
      createSourceFileAndTypeChecker(sourceCode);

    const outerFunctionNode = sourceFile
      .statements[0] as ts.FunctionDeclaration;
    const innerFunctionNode = outerFunctionNode.body!
      .statements[0] as ts.FunctionDeclaration;
    const parameterNode = innerFunctionNode.parameters[0];

    const constraintAtLocation = getConstrainedTypeAtLocation(
      mockServices(typeChecker, parameterNode),
      mockEstreeNode(),
    );

    expect(tsutils.isTypeParameter(constraintAtLocation)).toBe(false);
    expect(tsutils.isIntrinsicStringType(constraintAtLocation)).toBe(true);
  });
});
/* eslint-enable @typescript-eslint/no-deprecated*/

describe('getConstraintTypeInfoAtLocation', () => {
  it('returns undefined for unconstrained generic', () => {
    const sourceCode = `
function foo<T>(x: T);
    `;

    const { sourceFile, typeChecker } =
      createSourceFileAndTypeChecker(sourceCode);

    const functionNode = sourceFile.statements[0] as ts.FunctionDeclaration;
    const parameterNode = functionNode.parameters[0];
    const parameterType = typeChecker.getTypeAtLocation(parameterNode);

    const { constraintType, isTypeParameter, type } =
      getConstraintTypeInfoAtLocation(
        mockServices(typeChecker, parameterNode),
        mockEstreeNode(),
      );

    expect(type).toBe(parameterType);
    expect(isTypeParameter).toBe(true);
    // ideally one day we'll be able to change this to assert that it be the intrinsic unknown type.
    // Requires https://github.com/microsoft/TypeScript/issues/60475
    expect(constraintType).toBeUndefined();
  });

  it('returns unknown for extends unknown', () => {
    const sourceCode = `
function foo<T extends unknown>(x: T);
    `;

    const { sourceFile, typeChecker } =
      createSourceFileAndTypeChecker(sourceCode);

    const functionNode = sourceFile.statements[0] as ts.FunctionDeclaration;
    const parameterNode = functionNode.parameters[0];
    const parameterType = typeChecker.getTypeAtLocation(parameterNode);

    const { constraintType, isTypeParameter, type } =
      getConstraintTypeInfoAtLocation(
        mockServices(typeChecker, parameterNode),
        mockEstreeNode(),
      );

    expect(type).toBe(parameterType);
    expect(isTypeParameter).toBe(true);
    expect(constraintType).toBeDefined();
    expect(tsutils.isTypeParameter(constraintType!)).toBe(false);
    expect(tsutils.isIntrinsicUnknownType(constraintType!)).toBe(true);
  });

  it('returns unknown for extends any', () => {
    const sourceCode = `
function foo<T extends any>(x: T);
    `;

    const { sourceFile, typeChecker } =
      createSourceFileAndTypeChecker(sourceCode);

    const functionNode = sourceFile.statements[0] as ts.FunctionDeclaration;
    const parameterNode = functionNode.parameters[0];
    const parameterType = typeChecker.getTypeAtLocation(parameterNode);

    const { constraintType, isTypeParameter, type } =
      getConstraintTypeInfoAtLocation(
        mockServices(typeChecker, parameterNode),
        mockEstreeNode(),
      );

    expect(type).toBe(parameterType);
    expect(isTypeParameter).toBe(true);
    expect(constraintType).toBeDefined();
    expect(tsutils.isTypeParameter(constraintType!)).toBe(false);
    expect(tsutils.isIntrinsicUnknownType(constraintType!)).toBe(true);
  });

  it('returns string for extends string', () => {
    const sourceCode = `
function foo<T extends string>(x: T);
    `;

    const { sourceFile, typeChecker } =
      createSourceFileAndTypeChecker(sourceCode);

    const functionNode = sourceFile.statements[0] as ts.FunctionDeclaration;
    const parameterNode = functionNode.parameters[0];
    const parameterType = typeChecker.getTypeAtLocation(parameterNode);

    const { constraintType, isTypeParameter, type } =
      getConstraintTypeInfoAtLocation(
        mockServices(typeChecker, parameterNode),
        mockEstreeNode(),
      );

    expect(type).toBe(parameterType);
    expect(isTypeParameter).toBe(true);
    expect(constraintType).toBeDefined();
    expect(tsutils.isTypeParameter(constraintType!)).toBe(false);
    expect(tsutils.isIntrinsicStringType(constraintType!)).toBe(true);
  });

  it('returns string for non-generic string', () => {
    const sourceCode = `
function foo(x: string);
    `;

    const { sourceFile, typeChecker } =
      createSourceFileAndTypeChecker(sourceCode);

    const functionNode = sourceFile.statements[0] as ts.FunctionDeclaration;
    const parameterNode = functionNode.parameters[0];
    const parameterType = typeChecker.getTypeAtLocation(parameterNode);

    const { constraintType, isTypeParameter, type } =
      getConstraintTypeInfoAtLocation(
        mockServices(typeChecker, parameterNode),
        mockEstreeNode(),
      );

    expect(type).toBe(parameterType);
    expect(isTypeParameter).toBe(false);
    expect(constraintType).toBeDefined();
    expect(tsutils.isTypeParameter(constraintType!)).toBe(false);
    expect(tsutils.isIntrinsicStringType(constraintType!)).toBe(true);
    expect(type).toBe(constraintType);
  });

  it('handles type parameter whose constraint is a constrained type parameter', () => {
    const sourceCode = `
function foo<T extends string>() {
  function bar<V extends T>(x: V) {
  }
}
    `;

    const { sourceFile, typeChecker } =
      createSourceFileAndTypeChecker(sourceCode);

    const outerFunctionNode = sourceFile
      .statements[0] as ts.FunctionDeclaration;
    const innerFunctionNode = outerFunctionNode.body!
      .statements[0] as ts.FunctionDeclaration;
    const parameterNode = innerFunctionNode.parameters[0];
    const parameterType = typeChecker.getTypeAtLocation(parameterNode);

    const { constraintType, isTypeParameter, type } =
      getConstraintTypeInfoAtLocation(
        mockServices(typeChecker, parameterNode),
        mockEstreeNode(),
      );

    expect(type).toBe(parameterType);
    expect(constraintType).toBeDefined();
    expect(tsutils.isTypeParameter(constraintType!)).toBe(false);
    expect(tsutils.isIntrinsicStringType(constraintType!)).toBe(true);
    expect(isTypeParameter).toBe(true);
  });

  it('handles type parameter whose constraint is an unconstrained type parameter', () => {
    const sourceCode = `
function foo<T>() {
  function bar<V extends T>(x: V) {
  }
}
    `;

    const { sourceFile, typeChecker } =
      createSourceFileAndTypeChecker(sourceCode);

    const outerFunctionNode = sourceFile
      .statements[0] as ts.FunctionDeclaration;
    const innerFunctionNode = outerFunctionNode.body!
      .statements[0] as ts.FunctionDeclaration;
    const parameterNode = innerFunctionNode.parameters[0];
    const parameterType = typeChecker.getTypeAtLocation(parameterNode);

    const { constraintType, isTypeParameter, type } =
      getConstraintTypeInfoAtLocation(
        mockServices(typeChecker, parameterNode),
        mockEstreeNode(),
      );

    expect(type).toBe(parameterType);
    expect(isTypeParameter).toBe(true);
    expect(constraintType).toBeUndefined();
  });
});
