import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

export type Options = [
  {
    allowConstructorOnly?: boolean;
    allowEmpty?: boolean;
    allowStaticOnly?: boolean;
    allowWithDecorator?: boolean;
  },
];
export type MessageIds = 'empty' | 'onlyConstructor' | 'onlyStatic';

export default createRule<Options, MessageIds>({
  name: 'no-extraneous-class',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow classes used as namespaces',
      recommended: 'strict',
    },
    messages: {
      empty: 'Unexpected empty class.',
      onlyConstructor: 'Unexpected class with only a constructor.',
      onlyStatic: 'Unexpected class with only static properties.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowConstructorOnly: {
            type: 'boolean',
            description:
              'Whether to allow extraneous classes that contain only a constructor.',
          },
          allowEmpty: {
            type: 'boolean',
            description:
              'Whether to allow extraneous classes that have no body (i.e. are empty).',
          },
          allowStaticOnly: {
            type: 'boolean',
            description:
              'Whether to allow extraneous classes that only contain static members.',
          },
          allowWithDecorator: {
            type: 'boolean',
            description:
              'Whether to allow extraneous classes that include a decorator.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allowConstructorOnly: false,
      allowEmpty: false,
      allowStaticOnly: false,
      allowWithDecorator: false,
    },
  ],
  create(
    context,
    [{ allowConstructorOnly, allowEmpty, allowStaticOnly, allowWithDecorator }],
  ) {
    const isAllowWithDecorator = (
      node: TSESTree.ClassDeclaration | TSESTree.ClassExpression | undefined,
    ): boolean => {
      return !!(
        allowWithDecorator &&
        node?.decorators &&
        node.decorators.length !== 0
      );
    };

    return {
      ClassBody(node): void {
        const parent = node.parent;

        if (parent.superClass || isAllowWithDecorator(parent)) {
          return;
        }

        const reportNode =
          parent.type === AST_NODE_TYPES.ClassDeclaration && parent.id
            ? parent.id
            : parent;
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
          if (
            prop.type === AST_NODE_TYPES.MethodDefinition &&
            prop.kind === 'constructor'
          ) {
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
            if (
              ((prop.type === AST_NODE_TYPES.PropertyDefinition ||
                prop.type === AST_NODE_TYPES.MethodDefinition ||
                prop.type === AST_NODE_TYPES.AccessorProperty) &&
                !prop.static) ||
              prop.type === AST_NODE_TYPES.TSAbstractPropertyDefinition ||
              prop.type === AST_NODE_TYPES.TSAbstractMethodDefinition || // `static abstract` methods and properties are currently not supported. See: https://github.com/microsoft/TypeScript/issues/34516
              prop.type === AST_NODE_TYPES.TSAbstractAccessorProperty
            ) {
              onlyStatic = false;
            }
          }
          if (!(onlyStatic || onlyConstructor)) {
            break;
          }
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
