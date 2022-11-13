import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

type Options = ['fields' | 'getters'];
type MessageIds = 'preferFieldStyle' | 'preferGetterStyle';

const isSupportedLiteral = (
  node: TSESTree.Node,
): node is TSESTree.LiteralExpression => {
  if (node.type === AST_NODE_TYPES.Literal) {
    return true;
  }

  if (
    node.type === AST_NODE_TYPES.TaggedTemplateExpression ||
    node.type === AST_NODE_TYPES.TemplateLiteral
  ) {
    return ('quasi' in node ? node.quasi.quasis : node.quasis).length === 1;
  }

  return false;
};

export default util.createRule<Options, MessageIds>({
  name: 'class-literal-property-style',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce that literals on classes are exposed in a consistent style',
      recommended: 'strict',
    },
    messages: {
      preferFieldStyle: 'Literals should be exposed using readonly fields.',
      preferGetterStyle: 'Literals should be exposed using getters.',
    },
    schema: [
      {
        enum: ['fields', 'getters'],
      },
    ],
  },
  defaultOptions: ['fields'],
  create(context, [style]) {
    return {
      ...(style === 'fields' && {
        'MethodDefinition[kind="get"]'(node: TSESTree.MethodDefinition): void {
          if (!node.value.body?.body.length) {
            return;
          }

          const [statement] = node.value.body.body;

          if (statement.type !== AST_NODE_TYPES.ReturnStatement) {
            return;
          }

          if (node.parent?.type === AST_NODE_TYPES.ClassBody) {
            const classBody: TSESTree.ClassBody = node.parent;
            const setter = classBody.body.find(
              item =>
                item.type === AST_NODE_TYPES.MethodDefinition &&
                item.kind === 'set' &&
                isEqualPropertyKey(node.key, item.key),
            );
            if (setter) {
              return;
            }
          }

          const { argument } = statement;

          if (!argument || !isSupportedLiteral(argument)) {
            return;
          }

          context.report({
            node: node.key,
            messageId: 'preferFieldStyle',
          });
        },
      }),
      ...(style === 'getters' && {
        PropertyDefinition(node): void {
          if (!node.readonly || node.declare) {
            return;
          }

          const { value } = node;

          if (!value || !isSupportedLiteral(value)) {
            return;
          }

          context.report({
            node: node.key,
            messageId: 'preferGetterStyle',
          });
        },
      }),
    };
  },
});

function getPropertyName(key: TSESTree.PropertyName): unknown {
  switch (key.type) {
    case AST_NODE_TYPES.PrivateIdentifier:
    case AST_NODE_TYPES.Identifier:
      return key.name;
    case AST_NODE_TYPES.Literal:
      return key.raw;
    default:
      return undefined;
  }
}

function isEqualPropertyKey(
  base: TSESTree.PropertyName,
  key: TSESTree.PropertyName,
): boolean {
  return (
    base.type === key.type && getPropertyName(base) === getPropertyName(key)
  );
}
