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

type InferOptionsTypeFromRuleNever<T> = T extends TSESLint.RuleModule<
  never,
  infer TOptions
>
  ? TOptions
  : unknown;
/**
 * Uses type inference to fetch the TOptions type from the given RuleModule
 */
type InferOptionsTypeFromRule<T> = T extends TSESLint.RuleModule<
  string,
  infer TOptions
>
  ? TOptions
  : InferOptionsTypeFromRuleNever<T>;

/**
 * Uses type inference to fetch the TMessageIds type from the given RuleModule
 */
type InferMessageIdsTypeFromRule<T> = T extends TSESLint.RuleModule<
  infer TMessageIds,
  unknown[]
>
  ? TMessageIds
  : unknown;

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
export function getNameFromIndexSignature(
  node: TSESTree.TSIndexSignature,
): string {
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
  if (isLiteralOrIdentifier(member.key)) {
    if (member.key.type === AST_NODE_TYPES.Identifier) {
      return member.key.name;
    }
    return `${member.key.value}`;
  }

  return sourceCode.text.slice(...member.key.range);
}

/**
 * This covers both actual property names, as well as computed properties that are either
 * an identifier or a literal at the top level.
 */
function isLiteralOrIdentifier(
  node: TSESTree.Expression,
): node is TSESTree.Literal | TSESTree.Identifier {
  return (
    node.type === AST_NODE_TYPES.Literal ||
    node.type === AST_NODE_TYPES.Identifier
  );
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
  getNameFromMember,
  InferMessageIdsTypeFromRule,
  InferOptionsTypeFromRule,
  isDefinitionFile,
  isLiteralOrIdentifier,
  RequireKeys,
  upperCaseFirst,
};
