import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { isTypeAnyType, isTypeUnknownType } from './predicates';

/**
 * Checks if a type is from the default library (lib.*.d.ts files).
 * We skip these to avoid false positives from built-in types like Object, Array, etc.
 */
function isFromDefaultLibrary(type: ts.Type): boolean {
  const symbol = type.getSymbol();
  if (!symbol) {
    return false;
  }

  const declarations = symbol.getDeclarations();
  if (!declarations || declarations.length === 0) {
    return false;
  }

  return declarations.some(decl => {
    const fileName = decl.getSourceFile().fileName.replaceAll('\\', '/');
    return fileName.includes('/lib.') && fileName.endsWith('.d.ts');
  });
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
): false | { receiver: ts.Type; sender: ts.Type } {
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
): false | { receiver: ts.Type; sender: ts.Type } {
  if (isTypeAnyType(type)) {
    // Allow assignment of any ==> unknown.
    if (isTypeUnknownType(receiver)) {
      return false;
    }

    if (!isTypeAnyType(receiver)) {
      return { receiver, sender: type };
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
        return { receiver, sender: type };
      }
    }

    return false;
  }

  // Check object types - compare properties, index signatures, and call signatures
  if (tsutils.isObjectType(type) && tsutils.isObjectType(receiver)) {
    // Only check properties for non-default-library types to avoid
    // false positives from built-in types like Object, Array, etc.
    if (!isFromDefaultLibrary(type)) {
      const typeProperties = type.getProperties();
      const receiverProperties = new Map(
        receiver.getProperties().map(prop => [prop.getName(), prop]),
      );

      for (const typeProp of typeProperties) {
        const receiverProp = receiverProperties.get(typeProp.getName());
        if (!receiverProp) {
          continue;
        }

        const typePropType = checker.getTypeOfSymbol(typeProp);
        const receiverPropType = checker.getTypeOfSymbol(receiverProp);

        const unsafe = isUnsafeAssignmentWorker(
          typePropType,
          receiverPropType,
          checker,
          senderNode,
          visited,
        );
        if (unsafe) {
          return { receiver, sender: type };
        }
      }
    }

    // Always check index signatures and call signatures,
    // even for default library types (e.g., Record<string, any>)
    for (const indexKind of [ts.IndexKind.String, ts.IndexKind.Number]) {
      const typeIndexInfo = checker.getIndexInfoOfType(type, indexKind);
      const receiverIndexInfo = checker.getIndexInfoOfType(receiver, indexKind);

      if (typeIndexInfo && receiverIndexInfo) {
        const unsafe = isUnsafeAssignmentWorker(
          typeIndexInfo.type,
          receiverIndexInfo.type,
          checker,
          senderNode,
          visited,
        );
        if (unsafe) {
          return { receiver, sender: type };
        }
      }
    }

    // Check call signatures (function return types)
    const senderSignatures = type.getCallSignatures();
    const receiverSignatures = receiver.getCallSignatures();

    if (senderSignatures.length > 0 && receiverSignatures.length > 0) {
      const minSigs = Math.min(
        senderSignatures.length,
        receiverSignatures.length,
      );

      for (let i = 0; i < minSigs; i += 1) {
        const senderReturnType = checker.getReturnTypeOfSignature(
          senderSignatures[i],
        );
        const receiverReturnType = checker.getReturnTypeOfSignature(
          receiverSignatures[i],
        );

        const unsafe = isUnsafeAssignmentWorker(
          senderReturnType,
          receiverReturnType,
          checker,
          senderNode,
          visited,
        );
        if (unsafe) {
          return { receiver, sender: type };
        }
      }
    }
  }

  // Check union types - compare constituent types pairwise
  if (type.isUnion() && receiver.isUnion()) {
    const senderMembers = type.types;
    const receiverMembers = receiver.types;

    if (senderMembers.length === receiverMembers.length) {
      for (let i = 0; i < senderMembers.length; i += 1) {
        const unsafe = isUnsafeAssignmentWorker(
          senderMembers[i],
          receiverMembers[i],
          checker,
          senderNode,
          visited,
        );
        if (unsafe) {
          return { receiver, sender: type };
        }
      }
    }

    return false;
  }

  // Check intersection types - compare constituent types pairwise
  if (type.isIntersection() && receiver.isIntersection()) {
    const senderMembers = type.types;
    const receiverMembers = receiver.types;

    if (senderMembers.length === receiverMembers.length) {
      for (let i = 0; i < senderMembers.length; i += 1) {
        const unsafe = isUnsafeAssignmentWorker(
          senderMembers[i],
          receiverMembers[i],
          checker,
          senderNode,
          visited,
        );
        if (unsafe) {
          return { receiver, sender: type };
        }
      }
    }

    return false;
  }

  return false;
}
