import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  FunctionSignature,
  getParserServices,
  isTypeAnyArrayType,
  isTypeAnyType,
  isUnsafeAssignment,
  nullThrows,
} from '../util';

export type MessageIds =
  | 'unsafeArgument'
  | 'unsafeArraySpread'
  | 'unsafeSpread'
  | 'unsafeTupleSpread';

export default createRule<[], MessageIds>({
  name: 'no-unsafe-argument',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow calling a function with a value with type `any`',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      unsafeArgument:
        'Unsafe argument of type {{sender}} assigned to a parameter of type {{receiver}}.',
      unsafeArraySpread: 'Unsafe spread of an {{sender}} array type.',
      unsafeSpread: 'Unsafe spread of an {{sender}} type.',
      unsafeTupleSpread:
        'Unsafe spread of a tuple type. The argument is {{sender}} and is assigned to a parameter of type {{receiver}}.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function describeType(type: ts.Type): string {
      if (tsutils.isIntrinsicErrorType(type)) {
        return 'error typed';
      }

      return `\`${checker.typeToString(type)}\``;
    }

    function describeTypeForSpread(type: ts.Type): string {
      if (
        checker.isArrayType(type) &&
        tsutils.isIntrinsicErrorType(checker.getTypeArguments(type)[0])
      ) {
        return 'error';
      }

      return describeType(type);
    }

    function describeTypeForTuple(type: ts.Type): string {
      if (tsutils.isIntrinsicErrorType(type)) {
        return 'error typed';
      }

      return `of type \`${checker.typeToString(type)}\``;
    }

    function checkUnsafeArguments(
      args: TSESTree.CallExpressionArgument[] | TSESTree.Expression[],
      callee: TSESTree.Expression,
      node:
        | TSESTree.CallExpression
        | TSESTree.NewExpression
        | TSESTree.TaggedTemplateExpression,
    ): void {
      if (args.length === 0) {
        return;
      }

      // ignore any-typed calls as these are caught by no-unsafe-call
      if (isTypeAnyType(services.getTypeAtLocation(callee))) {
        return;
      }

      const tsNode = services.esTreeNodeToTSNodeMap.get(node);
      const signature = nullThrows(
        FunctionSignature.create(checker, tsNode),
        'Expected to a signature resolved',
      );

      if (node.type === AST_NODE_TYPES.TaggedTemplateExpression) {
        // Consumes the first parameter (TemplateStringsArray) of the function called with TaggedTemplateExpression.
        signature.getNextParameterType();
      }

      for (const argument of args) {
        switch (argument.type) {
          // spreads consume
          case AST_NODE_TYPES.SpreadElement: {
            const spreadArgType = services.getTypeAtLocation(argument.argument);

            if (isTypeAnyType(spreadArgType)) {
              // foo(...any)
              context.report({
                node: argument,
                messageId: 'unsafeSpread',
                data: { sender: describeType(spreadArgType) },
              });
            } else if (isTypeAnyArrayType(spreadArgType, checker)) {
              // foo(...any[])

              // TODO - we could break down the spread and compare the array type against each argument
              context.report({
                node: argument,
                messageId: 'unsafeArraySpread',
                data: { sender: describeTypeForSpread(spreadArgType) },
              });
            } else if (checker.isTupleType(spreadArgType)) {
              // foo(...[tuple1, tuple2])
              const spreadTypeArguments =
                checker.getTypeArguments(spreadArgType);
              for (const tupleType of spreadTypeArguments) {
                const parameterType = signature.getNextParameterType();
                if (parameterType == null) {
                  continue;
                }
                const result = isUnsafeAssignment(
                  tupleType,
                  parameterType,
                  checker,
                  // we can't pass the individual tuple members in here as this will most likely be a spread variable
                  // not a spread array
                  null,
                );
                if (result) {
                  context.report({
                    node: argument,
                    messageId: 'unsafeTupleSpread',
                    data: {
                      receiver: describeType(parameterType),
                      sender: describeTypeForTuple(tupleType),
                    },
                  });
                }
              }
              if (
                spreadArgType.target.combinedFlags & ts.ElementFlags.Variable
              ) {
                // the last element was a rest - so all remaining defined arguments can be considered "consumed"
                // all remaining arguments should be compared against the rest type (if one exists)
                signature.consumeRemainingArguments();
              }
            } else {
              // something that's iterable
              // handling this will be pretty complex - so we ignore it for now
              // TODO - handle generic iterable case
            }
            break;
          }

          default: {
            const parameterType = signature.getNextParameterType();
            if (parameterType == null) {
              continue;
            }

            const argumentType = services.getTypeAtLocation(argument);
            const result = isUnsafeAssignment(
              argumentType,
              parameterType,
              checker,
              argument,
            );
            if (result) {
              context.report({
                node: argument,
                messageId: 'unsafeArgument',
                data: {
                  receiver: describeType(parameterType),
                  sender: describeType(argumentType),
                },
              });
            }
          }
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
  },
});
