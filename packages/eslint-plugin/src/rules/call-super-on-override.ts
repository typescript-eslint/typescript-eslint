import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as utils from '../util';

/**
 * TODO:
 * 1. Grabbing the type of the extended class
 * 2. Checking whether it has a method / function property under the same name
 */

export default utils.createRule({
  name: 'call-super-on-override',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require overridden methods to call super.method in their body',
      recommended: false,
    },
    messages: {
      missingSuperMethodCall:
        "Use 'super{{property}}{{parameterTuple}}' to avoid missing super class method implementations",
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      'MethodDefinition[override=true][kind="method"]'(
        node: TSESTree.MethodDefinition,
      ): void {
        const methodName =
          node.key.type === AST_NODE_TYPES.Identifier
            ? node.key.name
            : (node.key as TSESTree.Literal).value?.toString() ?? 'null';
        const methodNameIsLiteral = node.key.type === AST_NODE_TYPES.Identifier;
        const methodNameIsNull =
          node.key.type !== AST_NODE_TYPES.Identifier
            ? (node.key as TSESTree.Literal).value == null
            : false;

        const { computed: isComputed } = node;
        const bodyStatements = node.value.body!.body;

        for (const statement of bodyStatements) {
          if (
            isSuperMethodCall(
              statement,
              methodName,
              !methodNameIsLiteral && isComputed,
            )
          ) {
            return;
          }
        }

        context.report({
          messageId: 'missingSuperMethodCall',
          node: node,
          data: {
            property: isComputed
              ? `[${
                  methodNameIsLiteral && !methodNameIsNull
                    ? `'${methodName}'`
                    : methodName
                }]`
              : `.${methodName}`,
            parameterTuple: `(${node.value.params
              .map(p => (p as TSESTree.Identifier).name)
              .join(', ')})`,
          },
        });
      },
    };
  },
});

const isSuperMethodCall = (
  statement: TSESTree.Statement | undefined,
  methodName: string,
  methodIsComputedIdentifier: boolean,
): boolean => {
  // for edge cases like this -> override [X]() { super.X() }
  // we make sure that computed identifier should have computed callback
  let calleeIsComputedIdentifier = false;

  const calleeName =
    statement?.type === AST_NODE_TYPES.ExpressionStatement &&
    statement.expression.type === AST_NODE_TYPES.CallExpression &&
    statement.expression.callee.type === AST_NODE_TYPES.MemberExpression &&
    statement.expression.callee.object.type === AST_NODE_TYPES.Super &&
    (statement.expression.callee.property.type === AST_NODE_TYPES.Identifier
      ? ((calleeIsComputedIdentifier = statement.expression.callee.computed),
        statement.expression.callee.property.name)
      : statement.expression.callee.property.type === AST_NODE_TYPES.Literal
      ? statement.expression.callee.property.value?.toString() ?? 'null'
      : undefined);

  return methodIsComputedIdentifier
    ? calleeIsComputedIdentifier
      ? methodName === calleeName
      : false
    : methodName === calleeName;
};
