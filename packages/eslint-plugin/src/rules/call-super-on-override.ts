import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import * as utils from '../util';

type Options = [
  {
    ignoreMethods: boolean;
    topLevel: boolean;
  },
];

type MessageIds = 'missingSuperMethodCall' | 'topLevelSuperMethodCall';

export default utils.createRule<Options, MessageIds>({
  name: 'call-super-on-override',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require overridden methods to call super.method in their body',
      recommended: 'warn',
      requiresTypeChecking: false,
    },
    messages: {
      missingSuperMethodCall:
        "Use 'super.{{property}}{{parameterTuple}}' to avoid missing super class method implementations",
      topLevelSuperMethodCall:
        "super method must be called before accessing 'this' in the overridden method of a derived class.",
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          ignoreMethods: {
            type: 'boolean',
          },
          topLevel: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      ignoreMethods: false,
      topLevel: false,
    },
  ],
  create(context, [{ ignoreMethods, topLevel }]) {
    return {
      'MethodDefinition[override=true][kind="method"]'(
        node: TSESTree.MethodDefinition,
      ): void {
        if (ignoreMethods) {
          return;
        }

        const { name: methodName } = node.key as TSESTree.Identifier,
          bodyStatements = node.value.body!.body;

        // Search for super method call
        let thisWasAccessed = false;
        for (const statement of bodyStatements) {
          if (!thisWasAccessed && isThisAccess(statement)) {
            thisWasAccessed = true;
          }

          if (isSuperMethodCall(statement, methodName)) {
            if (topLevel && thisWasAccessed) {
              context.report({
                messageId: 'topLevelSuperMethodCall',
                node: bodyStatements[0],
              });
            }

            return; // We are done here, missingSuperMethodCall error
          }
        }

        // Raise if not found
        context.report({
          messageId: 'missingSuperMethodCall',
          node: node,
          data: {
            property: methodName,
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
): boolean =>
  statement != null &&
  statement.type === AST_NODE_TYPES.ExpressionStatement &&
  statement.expression.type === AST_NODE_TYPES.CallExpression &&
  statement.expression.callee.type === AST_NODE_TYPES.MemberExpression &&
  statement.expression.callee.object.type === AST_NODE_TYPES.Super &&
  statement.expression.callee.property.type === AST_NODE_TYPES.Identifier &&
  statement.expression.callee.property.name === methodName;

const isThisAccess = (statement: TSESTree.Statement): boolean => {
  if (!isCallExpression(statement)) {
    return false;
  }

  let obj = (statement.expression as TSESTree.CallExpression).callee;

  // Going deeper and deeper
  while (obj.type === AST_NODE_TYPES.MemberExpression) {
    obj = (obj as TSESTree.MemberExpression).object;
  }

  return obj.type === AST_NODE_TYPES.ThisExpression;
};

const isCallExpression = (
  statement: TSESTree.Statement,
): statement is TSESTree.ExpressionStatement =>
  statement.type === AST_NODE_TYPES.ExpressionStatement &&
  statement.expression.type === AST_NODE_TYPES.CallExpression;
