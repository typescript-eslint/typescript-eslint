import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import debug from 'debug';
import {
  isCallExpression,
  isJsxExpression,
  isIdentifier,
  isNewExpression,
  isParameterDeclaration,
  isPropertyDeclaration,
  isTypeReference,
  isUnionOrIntersectionType,
  isVariableDeclaration,
  unionTypeParts,
  isPropertyAssignment,
  isBinaryExpression,
} from 'tsutils';
import * as ts from 'typescript';

const log = debug('typescript-eslint:eslint-plugin:utils:types');

/**
 * Checks if the given type is either an array type,
 * or a union made up solely of array types.
 */
export function isTypeArrayTypeOrUnionOfArrayTypes(
  type: ts.Type,
  checker: ts.TypeChecker,
): boolean {
  for (const t of unionTypeParts(type)) {
    if (!checker.isArrayType(t)) {
      return false;
    }
  }

  return true;
}

/**
 * @param type Type being checked by name.
 * @param allowedNames Symbol names checking on the type.
 * @returns Whether the type is, extends, or contains all of the allowed names.
 */
export function containsAllTypesByName(
  type: ts.Type,
  allowAny: boolean,
  allowedNames: Set<string>,
): boolean {
  if (isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return !allowAny;
  }

  if (isTypeReference(type)) {
    type = type.target;
  }

  const symbol = type.getSymbol();
  if (symbol && allowedNames.has(symbol.name)) {
    return true;
  }

  if (isUnionOrIntersectionType(type)) {
    return type.types.every(t =>
      containsAllTypesByName(t, allowAny, allowedNames),
    );
  }

  const bases = type.getBaseTypes();
  return (
    typeof bases !== 'undefined' &&
    bases.length > 0 &&
    bases.every(t => containsAllTypesByName(t, allowAny, allowedNames))
  );
}

/**
 * Get the type name of a given type.
 * @param typeChecker The context sensitive TypeScript TypeChecker.
 * @param type The type to get the name of.
 */
export function getTypeName(
  typeChecker: ts.TypeChecker,
  type: ts.Type,
): string {
  // It handles `string` and string literal types as string.
  if ((type.flags & ts.TypeFlags.StringLike) !== 0) {
    return 'string';
  }

  // If the type is a type parameter which extends primitive string types,
  // but it was not recognized as a string like. So check the constraint
  // type of the type parameter.
  if ((type.flags & ts.TypeFlags.TypeParameter) !== 0) {
    // `type.getConstraint()` method doesn't return the constraint type of
    // the type parameter for some reason. So this gets the constraint type
    // via AST.
    const symbol = type.getSymbol();
    const decls = symbol?.getDeclarations();
    const typeParamDecl = decls?.[0] as ts.TypeParameterDeclaration;
    if (
      ts.isTypeParameterDeclaration(typeParamDecl) &&
      typeParamDecl.constraint != null
    ) {
      return getTypeName(
        typeChecker,
        typeChecker.getTypeFromTypeNode(typeParamDecl.constraint),
      );
    }
  }

  // If the type is a union and all types in the union are string like,
  // return `string`. For example:
  // - `"a" | "b"` is string.
  // - `string | string[]` is not string.
  if (
    type.isUnion() &&
    type.types
      .map(value => getTypeName(typeChecker, value))
      .every(t => t === 'string')
  ) {
    return 'string';
  }

  // If the type is an intersection and a type in the intersection is string
  // like, return `string`. For example: `string & {__htmlEscaped: void}`
  if (
    type.isIntersection() &&
    type.types
      .map(value => getTypeName(typeChecker, value))
      .some(t => t === 'string')
  ) {
    return 'string';
  }

  return typeChecker.typeToString(type);
}

/**
 * Resolves the given node's type. Will resolve to the type's generic constraint, if it has one.
 */
export function getConstrainedTypeAtLocation(
  checker: ts.TypeChecker,
  node: ts.Node,
): ts.Type {
  const nodeType = checker.getTypeAtLocation(node);
  const constrained = checker.getBaseConstraintOfType(nodeType);

  return constrained ?? nodeType;
}

/**
 * Checks if the given type is (or accepts) nullable
 * @param isReceiver true if the type is a receiving type (i.e. the type of a called function's parameter)
 */
export function isNullableType(
  type: ts.Type,
  {
    isReceiver = false,
    allowUndefined = true,
  }: { isReceiver?: boolean; allowUndefined?: boolean } = {},
): boolean {
  const flags = getTypeFlags(type);

  if (isReceiver && flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return true;
  }

  if (allowUndefined) {
    return (flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)) !== 0;
  } else {
    return (flags & ts.TypeFlags.Null) !== 0;
  }
}

/**
 * Gets the declaration for the given variable
 */
export function getDeclaration(
  checker: ts.TypeChecker,
  node: ts.Expression,
): ts.Declaration | null {
  const symbol = checker.getSymbolAtLocation(node);
  if (!symbol) {
    return null;
  }
  const declarations = symbol.getDeclarations();
  return declarations?.[0] ?? null;
}

/**
 * Gets all of the type flags in a type, iterating through unions automatically
 */
export function getTypeFlags(type: ts.Type): ts.TypeFlags {
  let flags: ts.TypeFlags = 0;
  for (const t of unionTypeParts(type)) {
    flags |= t.flags;
  }
  return flags;
}

/**
 * Checks if the given type is (or accepts) the given flags
 * @param isReceiver true if the type is a receiving type (i.e. the type of a called function's parameter)
 */
export function isTypeFlagSet(
  type: ts.Type,
  flagsToCheck: ts.TypeFlags,
  isReceiver?: boolean,
): boolean {
  const flags = getTypeFlags(type);

  if (isReceiver && flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return true;
  }

  return (flags & flagsToCheck) !== 0;
}

/**
 * @returns Whether a type is an instance of the parent type, including for the parent's base types.
 */
export function typeIsOrHasBaseType(
  type: ts.Type,
  parentType: ts.Type,
): boolean {
  const parentSymbol = parentType.getSymbol();
  if (!type.getSymbol() || !parentSymbol) {
    return false;
  }

  const typeAndBaseTypes = [type];
  const ancestorTypes = type.getBaseTypes();

  if (ancestorTypes) {
    typeAndBaseTypes.push(...ancestorTypes);
  }

  for (const baseType of typeAndBaseTypes) {
    const baseSymbol = baseType.getSymbol();
    if (baseSymbol && baseSymbol.name === parentSymbol.name) {
      return true;
    }
  }

  return false;
}

/**
 * Gets the source file for a given node
 */
export function getSourceFileOfNode(node: ts.Node): ts.SourceFile {
  while (node && node.kind !== ts.SyntaxKind.SourceFile) {
    node = node.parent;
  }
  return node as ts.SourceFile;
}

export function getTokenAtPosition(
  sourceFile: ts.SourceFile,
  position: number,
): ts.Node {
  const queue: ts.Node[] = [sourceFile];
  let current: ts.Node;
  while (queue.length > 0) {
    current = queue.shift()!;
    // find the child that contains 'position'
    for (const child of current.getChildren(sourceFile)) {
      const start = child.getFullStart();
      if (start > position) {
        // If this child begins after position, then all subsequent children will as well.
        return current;
      }

      const end = child.getEnd();
      if (
        position < end ||
        (position === end && child.kind === ts.SyntaxKind.EndOfFileToken)
      ) {
        queue.push(child);
        break;
      }
    }
  }
  return current!;
}

export interface EqualsKind {
  isPositive: boolean;
  isStrict: boolean;
}

export function getEqualsKind(operator: string): EqualsKind | undefined {
  switch (operator) {
    case '==':
      return {
        isPositive: true,
        isStrict: false,
      };

    case '===':
      return {
        isPositive: true,
        isStrict: true,
      };

    case '!=':
      return {
        isPositive: false,
        isStrict: false,
      };

    case '!==':
      return {
        isPositive: false,
        isStrict: true,
      };

    default:
      return undefined;
  }
}

export function getTypeArguments(
  type: ts.TypeReference,
  checker: ts.TypeChecker,
): readonly ts.Type[] {
  // getTypeArguments was only added in TS3.7
  if (checker.getTypeArguments) {
    return checker.getTypeArguments(type);
  }

  return type.typeArguments ?? [];
}

/**
 * @returns true if the type is `unknown`
 */
export function isTypeUnknownType(type: ts.Type): boolean {
  return isTypeFlagSet(type, ts.TypeFlags.Unknown);
}

/**
 * @returns true if the type is `any`
 */
export function isTypeAnyType(type: ts.Type): boolean {
  if (isTypeFlagSet(type, ts.TypeFlags.Any)) {
    if (type.intrinsicName === 'error') {
      log('Found an "error" any type');
    }
    return true;
  }
  return false;
}

/**
 * @returns true if the type is `any[]`
 */
export function isTypeAnyArrayType(
  type: ts.Type,
  checker: ts.TypeChecker,
): boolean {
  return (
    checker.isArrayType(type) &&
    isTypeAnyType(
      // getTypeArguments was only added in TS3.7
      getTypeArguments(type, checker)[0],
    )
  );
}

/**
 * @returns true if the type is `unknown[]`
 */
export function isTypeUnknownArrayType(
  type: ts.Type,
  checker: ts.TypeChecker,
): boolean {
  return (
    checker.isArrayType(type) &&
    isTypeUnknownType(
      // getTypeArguments was only added in TS3.7
      getTypeArguments(type, checker)[0],
    )
  );
}

export const enum AnyType {
  Any,
  AnyArray,
  Safe,
}
/**
 * @returns `AnyType.Any` if the type is `any`, `AnyType.AnyArray` if the type is `any[]` or `readonly any[]`,
 *          otherwise it returns `AnyType.Safe`.
 */
export function isAnyOrAnyArrayTypeDiscriminated(
  node: ts.Node,
  checker: ts.TypeChecker,
): AnyType {
  const type = checker.getTypeAtLocation(node);
  if (isTypeAnyType(type)) {
    return AnyType.Any;
  }
  if (isTypeAnyArrayType(type, checker)) {
    return AnyType.AnyArray;
  }
  return AnyType.Safe;
}

/**
 * Does a simple check to see if there is an any being assigned to a non-any type.
 *
 * This also checks generic positions to ensure there's no unsafe sub-assignments.
 * Note: in the case of generic positions, it makes the assumption that the two types are the same.
 *
 * @example See tests for examples
 *
 * @returns false if it's safe, or an object with the two types if it's unsafe
 */
export function isUnsafeAssignment(
  type: ts.Type,
  receiver: ts.Type,
  checker: ts.TypeChecker,
  senderNode: TSESTree.Node | null,
): false | { sender: ts.Type; receiver: ts.Type } {
  if (isTypeAnyType(type)) {
    // Allow assignment of any ==> unknown.
    if (isTypeUnknownType(receiver)) {
      return false;
    }

    if (!isTypeAnyType(receiver)) {
      return { sender: type, receiver };
    }
  }

  if (isTypeReference(type) && isTypeReference(receiver)) {
    // TODO - figure out how to handle cases like this,
    // where the types are assignable, but not the same type
    /*
    function foo(): ReadonlySet<number> { return new Set<any>(); }

    // and

    type Test<T> = { prop: T }
    type Test2 = { prop: string }
    declare const a: Test<any>;
    const b: Test2 = a;
    */

    if (type.target !== receiver.target) {
      // if the type references are different, assume safe, as we won't know how to compare the two types
      // the generic positions might not be equivalent for both types
      return false;
    }

    if (
      senderNode?.type === AST_NODE_TYPES.NewExpression &&
      senderNode.callee.type === AST_NODE_TYPES.Identifier &&
      senderNode.callee.name === 'Map' &&
      senderNode.arguments.length === 0 &&
      senderNode.typeParameters == null
    ) {
      // special case to handle `new Map()`
      // unfortunately Map's default empty constructor is typed to return `Map<any, any>` :(
      // https://github.com/typescript-eslint/typescript-eslint/issues/2109#issuecomment-634144396
      return false;
    }

    const typeArguments = type.typeArguments ?? [];
    const receiverTypeArguments = receiver.typeArguments ?? [];

    for (let i = 0; i < typeArguments.length; i += 1) {
      const arg = typeArguments[i];
      const receiverArg = receiverTypeArguments[i];

      const unsafe = isUnsafeAssignment(arg, receiverArg, checker, senderNode);
      if (unsafe) {
        return { sender: type, receiver };
      }
    }

    return false;
  }

  return false;
}

/**
 * Returns the contextual type of a given node.
 * Contextual type is the type of the target the node is going into.
 * i.e. the type of a called function's parameter, or the defined type of a variable declaration
 */
export function getContextualType(
  checker: ts.TypeChecker,
  node: ts.Expression,
): ts.Type | undefined {
  const parent = node.parent;
  if (!parent) {
    return;
  }

  if (isCallExpression(parent) || isNewExpression(parent)) {
    if (node === parent.expression) {
      // is the callee, so has no contextual type
      return;
    }
  } else if (
    isVariableDeclaration(parent) ||
    isPropertyDeclaration(parent) ||
    isParameterDeclaration(parent)
  ) {
    return parent.type ? checker.getTypeFromTypeNode(parent.type) : undefined;
  } else if (isJsxExpression(parent)) {
    return checker.getContextualType(parent);
  } else if (isPropertyAssignment(parent) && isIdentifier(node)) {
    return checker.getContextualType(node);
  } else if (
    isBinaryExpression(parent) &&
    parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
    parent.right === node
  ) {
    // is RHS of assignment
    return checker.getTypeAtLocation(parent.left);
  } else if (
    ![ts.SyntaxKind.TemplateSpan, ts.SyntaxKind.JsxExpression].includes(
      parent.kind,
    )
  ) {
    // parent is not something we know we can get the contextual type of
    return;
  }
  // TODO - support return statement checking

  return checker.getContextualType(node);
}
