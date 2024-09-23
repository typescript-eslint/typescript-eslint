/**
 * @fileoverview Really small utility functions that didn't deserve their own files
 */
import { requiresQuoting } from '@typescript-eslint/type-utils';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import type { RuleContext } from '@typescript-eslint/utils/ts-eslint';
import * as ts from 'typescript';

import { getStaticValue, isParenthesized } from './astUtils';

const DEFINITION_EXTENSIONS = [
  ts.Extension.Dts,
  ts.Extension.Dcts,
  ts.Extension.Dmts,
] as const;
/**
 * Check if the context file name is *.d.ts or *.d.tsx
 */
function isDefinitionFile(fileName: string): boolean {
  const lowerFileName = fileName.toLowerCase();
  for (const definitionExt of DEFINITION_EXTENSIONS) {
    if (lowerFileName.endsWith(definitionExt)) {
      return true;
    }
  }
  return false;
}

/**
 * Upper cases the first character or the string
 */
function upperCaseFirst(str: string): string {
  return str[0].toUpperCase() + str.slice(1);
}

function arrayGroupByToMap<T, Key extends number | string>(
  array: T[],
  getKey: (item: T) => Key,
): Map<Key, T[]> {
  const groups = new Map<Key, T[]>();

  for (const item of array) {
    const key = getKey(item);
    const existing = groups.get(key);

    if (existing) {
      existing.push(item);
    } else {
      groups.set(key, [item]);
    }
  }

  return groups;
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

enum MemberNameType {
  Private = 1,
  Quoted = 2,
  Normal = 3,
  Expression = 4,
}

/**
 * Gets a string name representation of the name of the given MethodDefinition
 * or PropertyDefinition node, with handling for computed property names.
 */
function getNameFromMember(
  member:
    | TSESTree.MethodDefinition
    | TSESTree.AccessorProperty
    | TSESTree.Property
    | TSESTree.PropertyDefinition
    | TSESTree.TSAbstractMethodDefinition
    | TSESTree.TSAbstractAccessorProperty
    | TSESTree.TSAbstractPropertyDefinition
    | TSESTree.TSMethodSignature
    | TSESTree.TSPropertySignature,
  sourceCode: TSESLint.SourceCode,
): { type: MemberNameType; name: string } {
  if (member.key.type === AST_NODE_TYPES.Identifier) {
    return {
      type: MemberNameType.Normal,
      name: member.key.name,
    };
  }
  if (member.key.type === AST_NODE_TYPES.PrivateIdentifier) {
    return {
      type: MemberNameType.Private,
      name: `#${member.key.name}`,
    };
  }
  if (member.key.type === AST_NODE_TYPES.Literal) {
    const name = `${member.key.value}`;
    if (requiresQuoting(name)) {
      return {
        type: MemberNameType.Quoted,
        name: `"${name}"`,
      };
    }
    return {
      type: MemberNameType.Normal,
      name,
    };
  }

  return {
    type: MemberNameType.Expression,
    name: sourceCode.text.slice(...member.key.range),
  };
}

type ExcludeKeys<
  Obj extends Record<string, unknown>,
  Keys extends keyof Obj,
> = { [k in Exclude<keyof Obj, Keys>]: Obj[k] };
type RequireKeys<
  Obj extends Record<string, unknown>,
  Keys extends keyof Obj,
> = ExcludeKeys<Obj, Keys> & { [k in Keys]-?: Exclude<Obj[k], undefined> };

function getEnumNames<T extends string>(myEnum: Record<T, unknown>): T[] {
  return Object.keys(myEnum).filter(x => isNaN(Number(x))) as T[];
}

/**
 * Given an array of words, returns an English-friendly concatenation, separated with commas, with
 * the `and` clause inserted before the last item.
 *
 * Example: ['foo', 'bar', 'baz' ] returns the string "foo, bar, and baz".
 */
function formatWordList(words: string[]): string {
  if (!words.length) {
    return '';
  }

  if (words.length === 1) {
    return words[0];
  }

  return [words.slice(0, -1).join(', '), words.slice(-1)[0]].join(' and ');
}

/**
 * Iterates the array in reverse and returns the index of the first element it
 * finds which passes the predicate function.
 *
 * @returns Returns the index of the element if it finds it or -1 otherwise.
 */
function findLastIndex<T>(
  members: T[],
  predicate: (member: T) => boolean | null | undefined,
): number {
  let idx = members.length - 1;

  while (idx >= 0) {
    const valid = predicate(members[idx]);
    if (valid) {
      return idx;
    }
    idx--;
  }

  return -1;
}

function typeNodeRequiresParentheses(
  node: TSESTree.TypeNode,
  text: string,
): boolean {
  return (
    node.type === AST_NODE_TYPES.TSFunctionType ||
    node.type === AST_NODE_TYPES.TSConstructorType ||
    node.type === AST_NODE_TYPES.TSConditionalType ||
    (node.type === AST_NODE_TYPES.TSUnionType && text.startsWith('|')) ||
    (node.type === AST_NODE_TYPES.TSIntersectionType && text.startsWith('&'))
  );
}

function isRestParameterDeclaration(decl: ts.Declaration): boolean {
  return ts.isParameter(decl) && decl.dotDotDotToken != null;
}

function isParenlessArrowFunction(
  node: TSESTree.ArrowFunctionExpression,
  sourceCode: TSESLint.SourceCode,
): boolean {
  return (
    node.params.length === 1 && !isParenthesized(node.params[0], sourceCode)
  );
}

type NodeWithKey =
  | TSESTree.MemberExpression
  | TSESTree.MethodDefinition
  | TSESTree.Property
  | TSESTree.PropertyDefinition
  | TSESTree.TSAbstractMethodDefinition
  | TSESTree.TSAbstractPropertyDefinition;

/**
 * Gets a member being accessed or declared if its value can be determined statically, and
 * resolves it to the string or symbol value that will be used as the actual member
 * access key at runtime. Otherwise, returns `undefined`.
 *
 * ```ts
 * x.member // returns 'member'
 * ^^^^^^^^
 *
 * x?.member // returns 'member' (optional chaining is treated the same)
 * ^^^^^^^^^
 *
 * x['value'] // returns 'value'
 * ^^^^^^^^^^
 *
 * x[Math.random()] // returns undefined (not a static value)
 * ^^^^^^^^^^^^^^^^
 *
 * arr[0] // returns '0' (NOT 0)
 * ^^^^^^
 *
 * arr[0n] // returns '0' (NOT 0n)
 * ^^^^^^^
 *
 * const s = Symbol.for('symbolName')
 * x[s] // returns `Symbol.for('symbolName')` (since it's a static/global symbol)
 * ^^^^
 *
 * const us = Symbol('symbolName')
 * x[us] // returns undefined (since it's a unique symbol, so not statically analyzable)
 * ^^^^^
 *
 * var object = {
 *     1234: '4567', // returns '1234' (NOT 1234)
 *     ^^^^^^^^^^^^
 *     method() { } // returns 'method'
 *     ^^^^^^^^^^^^
 * }
 *
 * class WithMembers {
 *     foo: string // returns 'foo'
 *     ^^^^^^^^^^^
 * }
 * ```
 */
function getStaticMemberAccessValue(
  node: NodeWithKey,
  { sourceCode }: RuleContext<string, unknown[]>,
): string | symbol | undefined {
  const key =
    node.type === AST_NODE_TYPES.MemberExpression ? node.property : node.key;
  const { type } = key;
  if (
    !node.computed &&
    (type === AST_NODE_TYPES.Identifier ||
      type === AST_NODE_TYPES.PrivateIdentifier)
  ) {
    return key.name;
  }
  const result = getStaticValue(key, sourceCode.getScope(node));
  if (!result) {
    return undefined;
  }
  const { value } = result;
  return typeof value === 'symbol' ? value : String(value);
}

/**
 * Answers whether the member expression looks like
 * `x.value`, `x['value']`,
 * or even `const v = 'value'; x[v]` (or optional variants thereof).
 */
const isStaticMemberAccessOfValue = (
  memberExpression: NodeWithKey,
  context: RuleContext<string, unknown[]>,
  ...values: (string | symbol)[]
): boolean =>
  (values as (string | symbol | undefined)[]).includes(
    getStaticMemberAccessValue(memberExpression, context),
  );

export {
  arrayGroupByToMap,
  arraysAreEqual,
  type Equal,
  type ExcludeKeys,
  findFirstResult,
  formatWordList,
  getEnumNames,
  getStaticMemberAccessValue,
  getNameFromIndexSignature,
  getNameFromMember,
  isDefinitionFile,
  isRestParameterDeclaration,
  isParenlessArrowFunction,
  isStaticMemberAccessOfValue,
  MemberNameType,
  type RequireKeys,
  typeNodeRequiresParentheses,
  upperCaseFirst,
  findLastIndex,
};
