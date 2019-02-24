import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import * as util from '../util';

type Options = [
  {
    allowConstructorOnly?: boolean;
    allowEmpty?: boolean;
    allowStaticOnly?: boolean;
  }
];
type MessageIds = 'empty' | 'onlyStatic' | 'onlyConstructor';

export default util.createRule<Options, MessageIds>({
  name: 'no-extraneous-class',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Forbids the use of classes as namespaces',
      tslintRuleName: 'no-unnecessary-class',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowConstructorOnly: {
            type: 'boolean',
          },
          allowEmpty: {
            type: 'boolean',
          },
          allowStaticOnly: {
            type: 'boolean',
          },
        },
      },
    ],
    messages: {
      empty: 'Unexpected empty class.',
      onlyStatic: 'Unexpected class with only static properties.',
      onlyConstructor: 'Unexpected class with only a constructor.',
    },
  },
  defaultOptions: [
    {
      allowConstructorOnly: false,
      allowEmpty: false,
      allowStaticOnly: false,
    },
  ],
  create(context, [{ allowConstructorOnly, allowEmpty, allowStaticOnly }]) {
    return {
      ClassBody(node) {
        const parent = node.parent as
          | TSESTree.ClassDeclaration
          | TSESTree.ClassExpression
          | undefined;

        if (!parent || parent.superClass) {
          return;
        }

        const reportNode = 'id' in parent && parent.id ? parent.id : parent;

        if (node.body.length === 0) {
          if (allowEmpty) {
            return;
          }

          context.report({
            node: reportNode,
            messageId: 'empty',
          });

          return;
        }

        let onlyStatic = true;
        let onlyConstructor = true;

        for (const prop of node.body) {
          if ('kind' in prop && prop.kind === 'constructor') {
            if (
              prop.value.params.some(
                param => param.type === AST_NODE_TYPES.TSParameterProperty,
              )
            ) {
              onlyConstructor = false;
              onlyStatic = false;
            }
          } else {
            onlyConstructor = false;
            if ('static' in prop && !prop.static) {
              onlyStatic = false;
            }
          }
          if (!(onlyStatic || onlyConstructor)) break;
        }

        if (onlyConstructor) {
          if (!allowConstructorOnly) {
            context.report({
              node: reportNode,
              messageId: 'onlyConstructor',
            });
          }
          return;
        }
        if (onlyStatic && !allowStaticOnly) {
          context.report({
            node: reportNode,
            messageId: 'onlyStatic',
          });
        }
      },
    };
  },
});
