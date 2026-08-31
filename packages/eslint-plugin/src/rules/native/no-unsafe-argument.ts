import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type { Type } from '@typescript/native/unstable/sync';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { ElementFlags, TypeFlags } from '@typescript/native/unstable/sync';

import type { MessageIds } from '../no-unsafe-argument';

import * as util from '../../util';
import { isNativeUnsafeAssignment } from './isNativeUnsafeAssignment';
import { NativeFunctionSignature } from './NativeFunctionSignature';
import { isTypeFlagSet } from './nativeTypeUtils';

type Options = [];

export function create(
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
): TSESLint.RuleListener {
  const services = util.getNativeParserServices(context);
  const { checker, project } = services.native;

  const describeType = (type: Type): string =>
    type.isErrorType() ? 'error typed' : `\`${checker.typeToString(type)}\``;

  const describeTypeForSpread = (type: Type): string => {
    if (
      checker.isArrayType(type) &&
      type.isTypeReference() &&
      checker.getTypeArguments(type)[0]?.isErrorType()
    ) {
      return 'error';
    }
    return describeType(type);
  };

  const describeTypeForTuple = (type: Type): string =>
    type.isErrorType()
      ? 'error typed'
      : `of type \`${checker.typeToString(type)}\``;

  function checkUnsafeArguments(
    arguments_: TSESTree.CallExpressionArgument[] | TSESTree.Expression[],
    callee: TSESTree.Expression,
    node:
      | TSESTree.CallExpression
      | TSESTree.NewExpression
      | TSESTree.TaggedTemplateExpression,
  ): void {
    if (
      arguments_.length === 0 ||
      isTypeFlagSet(services.getTypeAtLocation(callee), TypeFlags.Any)
    ) {
      return;
    }

    const signature = NativeFunctionSignature.create(
      checker,
      project,
      services.esTreeNodeToTSNodeMap.get(node),
    );
    if (node.type === AST_NODE_TYPES.TaggedTemplateExpression) {
      signature.getNextParameterType();
    }

    const typeNodes = arguments_.map(argument =>
      argument.type === AST_NODE_TYPES.SpreadElement
        ? argument.argument
        : argument,
    );
    const argumentTypes = services.getTypesAtLocations(typeNodes);

    for (const [index, argument] of arguments_.entries()) {
      const argumentType = argumentTypes[index];
      if (argument.type === AST_NODE_TYPES.SpreadElement) {
        if (isTypeFlagSet(argumentType, TypeFlags.Any)) {
          context.report({
            data: { sender: describeType(argumentType) },
            messageId: 'unsafeSpread',
            node: argument,
          });
        } else if (
          checker.isArrayType(argumentType) &&
          argumentType.isTypeReference() &&
          isTypeFlagSet(
            checker.getTypeArguments(argumentType)[0],
            TypeFlags.Any,
          )
        ) {
          context.report({
            data: { sender: describeTypeForSpread(argumentType) },
            messageId: 'unsafeArraySpread',
            node: argument,
          });
        } else if (
          checker.isTupleType(argumentType) &&
          argumentType.isTypeReference()
        ) {
          for (const tupleType of checker.getTypeArguments(argumentType)) {
            const parameterType = signature.getNextParameterType();
            if (
              parameterType != null &&
              isNativeUnsafeAssignment(tupleType, parameterType, checker, null)
            ) {
              context.report({
                data: {
                  receiver: describeType(parameterType),
                  sender: describeTypeForTuple(tupleType),
                },
                messageId: 'unsafeTupleSpread',
                node: argument,
              });
            }
          }
          const tupleTarget = argumentType.getTarget();
          if (
            tupleTarget.isTupleType() &&
            tupleTarget.elementFlags.some(
              flags => (flags & ElementFlags.Variable) !== 0,
            )
          ) {
            signature.consumeRemainingArguments();
          }
        }
        continue;
      }

      const parameterType = signature.getNextParameterType();
      if (
        parameterType != null &&
        isNativeUnsafeAssignment(argumentType, parameterType, checker, argument)
      ) {
        context.report({
          data: {
            receiver: describeType(parameterType),
            sender: describeType(argumentType),
          },
          messageId: 'unsafeArgument',
          node: argument,
        });
      }
    }
  }

  return {
    'CallExpression, NewExpression'(
      node: TSESTree.CallExpression | TSESTree.NewExpression,
    ): void {
      checkUnsafeArguments(node.arguments, node.callee, node);
    },
    TaggedTemplateExpression(node: TSESTree.TaggedTemplateExpression): void {
      checkUnsafeArguments(node.quasi.expressions, node.tag, node);
    },
  };
}
