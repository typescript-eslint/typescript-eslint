import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as util from '../util';

type Options = [
  {
    allowDestructuring?: boolean;
    allowedNames?: string[];
  },
];
type MessageIds = 'thisAssignment' | 'thisDestructure';

export default util.createRule<Options, MessageIds>({
  name: 'no-this-alias',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow aliasing `this`',
      recommended: 'error',
    },
    schema: [
      {
        type: 'object',
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
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    ],
    messages: {
      thisAssignment: "Unexpected aliasing of 'this' to local variable.",
      thisDestructure:
        "Unexpected aliasing of members of 'this' to local variables.",
    },
  },
  defaultOptions: [
    {
      allowDestructuring: true,
      allowedNames: [],
    },
  ],
  create(context, [{ allowDestructuring, allowedNames }]) {
    return {
      "VariableDeclarator[init.type='ThisExpression'], AssignmentExpression[right.type='ThisExpression']"(
        node: TSESTree.VariableDeclarator | TSESTree.AssignmentExpression,
      ): void {
        const id =
          node.type === AST_NODE_TYPES.VariableDeclarator ? node.id : node.left;
        if (allowDestructuring && id.type !== AST_NODE_TYPES.Identifier) {
          return;
        }

        const hasAllowedName =
          id.type === AST_NODE_TYPES.Identifier
            ? allowedNames!.includes(id.name)
            : false;
        if (!hasAllowedName) {
          context.report({
            node: id,
            messageId:
              id.type === AST_NODE_TYPES.Identifier
                ? 'thisAssignment'
                : 'thisDestructure',
          });
        }
      },
    };
  },
});
