import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
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
      category: 'Best Practices',
      recommended: 'error',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowDestructuring: {
            type: 'boolean',
          },
          allowedNames: {
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
      "VariableDeclarator[init.type='ThisExpression']"(
        node: TSESTree.VariableDeclarator,
      ): void {
        const { id } = node;

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
