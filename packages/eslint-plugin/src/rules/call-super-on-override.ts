import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as utils from '../util';

type MessageIds = 'missingSuperMethodCall';

export default utils.createRule<[], MessageIds>({
  name: 'call-super-on-override',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require overridden methods to call super.method in their body',
      recommended: false,
      requiresTypeChecking: false,
    },
    messages: {
      missingSuperMethodCall:
        "Use 'super{{property}}{{parameterTuple}}' to avoid missing super class method implementations",
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          topLevel: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [],
  create(context) {
    return {
      'MethodDefinition[override=true][kind="method"]'(
        node: TSESTree.MethodDefinition,
      ): void {
        let methodName = '',
          methodNameIsLiteral = false,
          methodNameIsNull = false; // don't add quotes for error message on [null] case

        if (node.key.type === AST_NODE_TYPES.Identifier) {
          methodName = node.key.name;
        } else {
          methodNameIsLiteral = true;
          // null & undefined can be used as property names, undefined counted as Identifier & null as Literal
          methodName =
            (node.key as TSESTree.Literal).value?.toString() ?? 'null';
          methodNameIsNull = (node.key as TSESTree.Literal).value == null;
        }

        const { computed: isComputed } = node,
          bodyStatements = node.value.body!.body;

        // Search for super method call
        for (const statement of bodyStatements) {
          if (
            isSuperMethodCall(
              statement,
              methodName,
              !methodNameIsLiteral && isComputed,
            )
          ) {
            return; // We are done here, no missingSuperMethodCall error
          }
        }

        // Raise if not found
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
