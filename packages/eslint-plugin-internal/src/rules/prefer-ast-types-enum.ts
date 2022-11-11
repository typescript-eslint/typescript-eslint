import { DefinitionType } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';

import { createRule } from '../util';

const isStringLiteral = (
  node: TSESTree.Literal,
): node is TSESTree.StringLiteral => typeof node.value === 'string';

export default createRule({
  name: __filename,
  meta: {
    type: 'problem',
    docs: {
      recommended: 'error',
      description:
        'Enforce consistent usage of `AST_NODE_TYPES`, `AST_TOKEN_TYPES` and `DefinitionType` enums',
    },
    messages: {
      preferEnum: 'Prefer {{ enumName }}.{{ literal }} over raw literal',
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const report = (
      enumName: 'AST_NODE_TYPES' | 'AST_TOKEN_TYPES' | 'DefinitionType',
      literal: TSESTree.StringLiteral,
    ): void =>
      context.report({
        data: { enumName, literal: literal.value },
        messageId: 'preferEnum',
        node: literal,
        fix: fixer =>
          fixer.replaceText(literal, `${enumName}.${literal.value}`),
      });

    return {
      Literal(node: TSESTree.Literal): void {
        if (
          node.parent?.type === AST_NODE_TYPES.TSEnumMember &&
          node.parent.parent?.type === AST_NODE_TYPES.TSEnumDeclaration &&
          ['AST_NODE_TYPES', 'AST_TOKEN_TYPES', 'DefinitionType'].includes(
            node.parent.parent.id.name,
          )
        ) {
          return;
        }

        if (!isStringLiteral(node)) {
          return;
        }

        const value = node.value;

        if (Object.prototype.hasOwnProperty.call(AST_NODE_TYPES, value)) {
          report('AST_NODE_TYPES', node);
        }

        if (Object.prototype.hasOwnProperty.call(AST_TOKEN_TYPES, value)) {
          report('AST_TOKEN_TYPES', node);
        }

        if (Object.prototype.hasOwnProperty.call(DefinitionType, value)) {
          report('DefinitionType', node);
        }
      },
    };
  },
});
