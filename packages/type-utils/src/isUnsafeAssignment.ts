import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { isTypeAnyType, isTypeUnknownType } from './predicates';
import { getTypeOfPropertyOfName } from './propertyTypes';

function typeContainsAny(
  type: ts.Type,
  checker: ts.TypeChecker,
  seen = new Set<ts.Type>(),
): boolean {
  if (seen.has(type)) {
    return false;
  }
  seen.add(type);

  if (isTypeAnyType(type)) {
    return true;
  }

  if (tsutils.isUnionOrIntersectionType(type)) {
    return type.types.some(t => typeContainsAny(t, checker, seen));
  }

  if (tsutils.isTypeReference(type)) {
    const args = type.typeArguments ?? [];
    return args.some(arg => typeContainsAny(arg, checker, seen));
  }

  if (checker.isArrayType(type) || checker.isTupleType(type)) {
    return checker
      .getTypeArguments(type)
      .some(arg => typeContainsAny(arg, checker, seen));
  }

  if (tsutils.isObjectType(type)) {
    const stringIndex = checker.getIndexInfoOfType(type, ts.IndexKind.String);
    if (stringIndex && typeContainsAny(stringIndex.type, checker, seen)) {
      return true;
    }

    const numberIndex = checker.getIndexInfoOfType(type, ts.IndexKind.Number);
    if (numberIndex && typeContainsAny(numberIndex.type, checker, seen)) {
      return true;
    }

    for (const property of type.getProperties()) {
      const propertyType = getTypeOfPropertyOfName(
        checker,
        type,
        property.getName(),
        property.getEscapedName(),
      );
      if (propertyType && typeContainsAny(propertyType, checker, seen)) {
        return true;
      }
    }
  }

  return false;
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
): false | { receiver: ts.Type; sender: ts.Type; deep?: boolean } {
  return isUnsafeAssignmentWorker(
    type,
    receiver,
    checker,
    senderNode,
    new Map(),
  );
}

function isUnsafeAssignmentWorker(
  type: ts.Type,
  receiver: ts.Type,
  checker: ts.TypeChecker,
  senderNode: TSESTree.Node | null,
  visited: Map<ts.Type, Set<ts.Type>>,
): false | { receiver: ts.Type; sender: ts.Type; deep?: boolean } {
  function isFromDefaultLibrary(t: ts.Type): boolean {
    const declarations = t.getSymbol()?.getDeclarations();
    return (
      declarations?.some(decl => {
        const fileName = decl.getSourceFile().fileName;
        return (
          decl.getSourceFile().hasNoDefaultLib ||
          fileName.includes('typescript/lib')
        );
      }) ?? false
    );
  }

  if (type === receiver) {
    return false;
  }

  if (!typeContainsAny(type, checker)) {
    return false;
  }

  if (isTypeAnyType(type)) {
    // Allow assignment of any ==> unknown.
    if (isTypeUnknownType(receiver)) {
      return false;
    }

    if (!isTypeAnyType(receiver)) {
      return { deep: true, receiver, sender: type };
    }
  }

  const typeAlreadyVisited = visited.get(type);

  if (typeAlreadyVisited) {
    if (typeAlreadyVisited.has(receiver)) {
      return false;
    }
    typeAlreadyVisited.add(receiver);
  } else {
    visited.set(type, new Set([receiver]));
  }

  if (tsutils.isTypeReference(type) && tsutils.isTypeReference(receiver)) {
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
      senderNode.typeArguments == null
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

      const unsafe = isUnsafeAssignmentWorker(
        arg,
        receiverArg,
        checker,
        senderNode,
        visited,
      );
      if (unsafe) {
        return { deep: true, receiver, sender: type };
      }
    }

    return false;
  }

  if (tsutils.isUnionType(type)) {
    for (const unionType of tsutils.unionConstituents(type)) {
      const unsafe = isUnsafeAssignmentWorker(
        unionType,
        receiver,
        checker,
        senderNode,
        visited,
      );
      if (unsafe) {
        return { deep: true, receiver, sender: type };
      }
    }
    return false;
  }

  if (tsutils.isUnionType(receiver)) {
    for (const receiverType of tsutils.unionConstituents(receiver)) {
      const unsafe = isUnsafeAssignmentWorker(
        type,
        receiverType,
        checker,
        senderNode,
        visited,
      );
      if (unsafe) {
        return { deep: true, receiver, sender: type };
      }
    }
    return false;
  }

  if (checker.isTupleType(type) && checker.isTupleType(receiver)) {
    const senderElements = checker.getTypeArguments(type);
    const receiverElements = checker.getTypeArguments(receiver);
    const length = Math.min(senderElements.length, receiverElements.length);

    for (let i = 0; i < length; i += 1) {
      const unsafe = isUnsafeAssignmentWorker(
        senderElements[i],
        receiverElements[i],
        checker,
        senderNode,
        visited,
      );
      if (unsafe) {
        return { deep: true, receiver, sender: type };
      }
    }

    return false;
  }

  if (checker.isArrayType(type) && checker.isArrayType(receiver)) {
    const senderElementType = checker.getTypeArguments(type)[0];
    const receiverElementType = checker.getTypeArguments(receiver)[0];

    const unsafe = isUnsafeAssignmentWorker(
      senderElementType,
      receiverElementType,
      checker,
      senderNode,
      visited,
    );

    if (unsafe) {
      return { deep: true, receiver, sender: type };
    }

    return false;
  }

  if (tsutils.isObjectType(type) && tsutils.isObjectType(receiver)) {
    if (isFromDefaultLibrary(receiver)) {
      return false;
    }

    const receiverStringIndex = checker.getIndexInfoOfType(
      receiver,
      ts.IndexKind.String,
    );
    if (receiverStringIndex) {
      const senderStringIndex = checker.getIndexInfoOfType(
        type,
        ts.IndexKind.String,
      );
      if (senderStringIndex) {
        const unsafe = isUnsafeAssignmentWorker(
          senderStringIndex.type,
          receiverStringIndex.type,
          checker,
          senderNode,
          visited,
        );
        if (unsafe) {
          return { deep: true, receiver, sender: type };
        }
      }
    }

    const receiverNumberIndex = checker.getIndexInfoOfType(
      receiver,
      ts.IndexKind.Number,
    );
    if (receiverNumberIndex) {
      const senderNumberIndex = checker.getIndexInfoOfType(
        type,
        ts.IndexKind.Number,
      );
      if (senderNumberIndex) {
        const unsafe = isUnsafeAssignmentWorker(
          senderNumberIndex.type,
          receiverNumberIndex.type,
          checker,
          senderNode,
          visited,
        );
        if (unsafe) {
          return { deep: true, receiver, sender: type };
        }
      }
    }

    for (const receiverProperty of receiver.getProperties()) {
      const propertyName = receiverProperty.getName();
      const senderPropertyType = getTypeOfPropertyOfName(
        checker,
        type,
        propertyName,
        receiverProperty.getEscapedName(),
      );
      if (!senderPropertyType) {
        continue;
      }

      const receiverPropertyType = getTypeOfPropertyOfName(
        checker,
        receiver,
        propertyName,
        receiverProperty.getEscapedName(),
      );
      if (!receiverPropertyType) {
        continue;
      }

      const unsafe = isUnsafeAssignmentWorker(
        senderPropertyType,
        receiverPropertyType,
        checker,
        senderNode,
        visited,
      );
      if (unsafe) {
        return { deep: true, receiver, sender: type };
      }
    }
  }

  return false;
}
