import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

type Options = [
  {
    allowDestructuring?: boolean;
    allowedNames?: string[];
  },
];
type MessageIds = 'thisAssignment' | 'thisDestructure';

export default createRule<Options, MessageIds>({
  create(context, [{ allowDestructuring, allowedNames }]) {
    return {
      "VariableDeclarator[init.type='ThisExpression'], AssignmentExpression[right.type='ThisExpression']"(
        node: TSESTree.AssignmentExpression | TSESTree.VariableDeclarator,
      ): void {
        const id =
          node.type === AST_NODE_TYPES.VariableDeclarator ? node.id : node.left;
        if (allowDestructuring && id.type !== AST_NODE_TYPES.Identifier) {
          return;
        }

        const hasAllowedName =
          id.type === AST_NODE_TYPES.Identifier
            ? // https://github.com/typescript-eslint/typescript-eslint/issues/5439
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              allowedNames!.includes(id.name)
            : false;
        if (!hasAllowedName) {
          context.report({
            messageId:
              id.type === AST_NODE_TYPES.Identifier
                ? 'thisAssignment'
                : 'thisDestructure',
            node: id,
          });
        }
      },
    };
  },
  defaultOptions: [
    {
      allowDestructuring: true,
      allowedNames: [],
    },
  ],
  meta: {
    docs: {
      description: 'Disallow aliasing `this`',
      recommended: 'recommended',
    },
    messages: {
      thisAssignment: "Unexpected aliasing of 'this' to local variable.",
      thisDestructure:
        "Unexpected aliasing of members of 'this' to local variables.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowDestructuring: {
            description:
              'Whether to ignore destructurings, such as `const { props, state } = this`.',
            type: 'boolean',
          },
          allowedNames: {
            description:
              'Names to ignore, such as ["self"] for `const self = this;`.',
            items: {
              type: 'string',
            },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
  name: 'no-this-alias',
});
