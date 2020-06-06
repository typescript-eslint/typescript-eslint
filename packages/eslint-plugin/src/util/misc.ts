/**
 * @fileoverview Really small utility functions that didn't deserve their own files
 */

import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

/**
 * Check if the context file name is *.d.ts or *.d.tsx
 */
function isDefinitionFile(fileName: string): boolean {
  return /\.d\.tsx?$/i.test(fileName || '');
}

/**
 * Upper cases the first character or the string
 */
function upperCaseFirst(str: string): string {
  return str[0].toUpperCase() + str.slice(1);
}

/** Return true if both parameters are equal. */
type Equal<T> = (a: T, b: T) => boolean;

function arraysAreEqual<T>(
  a: T[] | undefined,
  b: T[] | undefined,
  eq: (a: T, b: T) => boolean,
): boolean {
  return (
    a === b ||
    (a !== undefined &&
      b !== undefined &&
      a.length === b.length &&
      a.every((x, idx) => eq(x, b[idx])))
  );
}

/** Returns the first non-`undefined` result. */
function findFirstResult<T, U>(
  inputs: T[],
  getResult: (t: T) => U | undefined,
): U | undefined {
  for (const element of inputs) {
    const result = getResult(element);
    if (result !== undefined) {
      return result;
    }
  }
  return undefined;
}

/**
 * Gets a string representation of the name of the index signature.
 */
function getNameFromIndexSignature(node: TSESTree.TSIndexSignature): string {
  const propName: TSESTree.PropertyName | undefined = node.parameters.find(
    (parameter: TSESTree.Parameter): parameter is TSESTree.Identifier =>
      parameter.type === AST_NODE_TYPES.Identifier,
  );
  return propName ? propName.name : '(index signature)';
}

/**
 * Gets a string name representation of the name of the given MethodDefinition
 * or ClassProperty node, with handling for computed property names.
 */
function getNameFromMember(
  member:
    | TSESTree.MethodDefinition
    | TSESTree.TSMethodSignature
    | TSESTree.TSAbstractMethodDefinition
    | TSESTree.ClassProperty
    | TSESTree.TSAbstractClassProperty
    | TSESTree.Property
    | TSESTree.TSPropertySignature,
  sourceCode: TSESLint.SourceCode,
): string {
  if (member.key.type === AST_NODE_TYPES.Identifier) {
    return member.key.name;
  }
  if (member.key.type === AST_NODE_TYPES.Literal) {
    return `${member.key.value}`;
  }

  return sourceCode.text.slice(...member.key.range);
}

type ExcludeKeys<
  TObj extends Record<string, unknown>,
  TKeys extends keyof TObj
> = { [k in Exclude<keyof TObj, TKeys>]: TObj[k] };
type RequireKeys<
  TObj extends Record<string, unknown>,
  TKeys extends keyof TObj
> = ExcludeKeys<TObj, TKeys> & { [k in TKeys]-?: Exclude<TObj[k], undefined> };

function getEnumNames<T extends string>(myEnum: Record<T, unknown>): T[] {
  return Object.keys(myEnum).filter(x => isNaN(parseInt(x))) as T[];
}

export {
  arraysAreEqual,
  Equal,
  ExcludeKeys,
  findFirstResult,
  getEnumNames,
  getNameFromIndexSignature,
  getNameFromMember,
  isDefinitionFile,
  RequireKeys,
  upperCaseFirst,
};
