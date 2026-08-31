import type { TSESTree } from '@typescript-eslint/utils';
import type { Checker, Type } from '@typescript/native/unstable/sync';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { TypeFlags } from '@typescript/native/unstable/sync';

import { isTypeFlagSet } from './nativeTypeUtils';

type UnsafeAssignment = false | { receiver: Type; sender: Type };

export function isNativeUnsafeAssignment(
  sender: Type,
  receiver: Type,
  checker: Checker,
  senderNode: TSESTree.Node | null,
): UnsafeAssignment {
  return isNativeUnsafeAssignmentWorker(
    sender,
    receiver,
    checker,
    senderNode,
    new Map(),
  );
}

function isNativeUnsafeAssignmentWorker(
  sender: Type,
  receiver: Type,
  checker: Checker,
  senderNode: TSESTree.Node | null,
  visited: Map<Type, Set<Type>>,
): UnsafeAssignment {
  if (
    isTypeFlagSet(sender, TypeFlags.Any) &&
    !isTypeFlagSet(receiver, TypeFlags.Any | TypeFlags.Unknown)
  ) {
    return { receiver, sender };
  }

  const senderReceivers = visited.get(sender);
  if (senderReceivers?.has(receiver)) {
    return false;
  }
  if (senderReceivers) {
    senderReceivers.add(receiver);
  } else {
    visited.set(sender, new Set([receiver]));
  }

  if (!sender.isTypeReference() || !receiver.isTypeReference()) {
    return false;
  }
  if (sender.getTarget().id !== receiver.getTarget().id) {
    return false;
  }

  if (
    senderNode?.type === AST_NODE_TYPES.NewExpression &&
    senderNode.callee.type === AST_NODE_TYPES.Identifier &&
    senderNode.callee.name === 'Map' &&
    senderNode.arguments.length === 0 &&
    senderNode.typeArguments == null
  ) {
    return false;
  }

  const senderArguments = checker.getTypeArguments(sender);
  const receiverArguments = checker.getTypeArguments(receiver);
  for (let index = 0; index < senderArguments.length; index += 1) {
    const isUnsafe = isNativeUnsafeAssignmentWorker(
      senderArguments[index],
      receiverArguments[index],
      checker,
      senderNode,
      visited,
    );
    if (isUnsafe) {
      return { receiver, sender };
    }
  }

  return false;
}
