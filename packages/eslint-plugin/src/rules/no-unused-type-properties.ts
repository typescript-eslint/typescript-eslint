import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

type ObjectPatternWithTypeAnnotation = util.MakeRequired<
  TSESTree.ObjectPattern,
  'typeAnnotation'
>;

export default util.createRule({
  name: 'no-unused-type-properties',
  meta: {
    docs: {
      description: 'Flag unused properties on inline object types',
      recommended: 'error',
    },
    fixable: 'code',
    messages: {
      unused: 'This property type is unused and may be removed.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    return {
      'ObjectPattern[typeAnnotation]'(
        node: ObjectPatternWithTypeAnnotation,
      ): void {
        // TODO: move into the esquery query??
        if (
          node.typeAnnotation.typeAnnotation.type !==
          AST_NODE_TYPES.TSTypeLiteral
        ) {
          return;
        }

        const usedNames = new Set<string>();

        for (const property of node.properties) {
          if (property.type === AST_NODE_TYPES.RestElement) {
            return;
          }

          // TODO: allow keys like ['ab']: ... that aren't identifiers
          if (property.key.type === AST_NODE_TYPES.Identifier) {
            usedNames.add(property.key.name);
          }
        }

        for (const member of node.typeAnnotation.typeAnnotation.members) {
          // TODO: TSIndexSignature
          if (
            (member.type === AST_NODE_TYPES.TSMethodSignature ||
              member.type === AST_NODE_TYPES.TSPropertySignature) &&
            // TODO: maybe member keys other than identifiers?
            member.key.type === AST_NODE_TYPES.Identifier &&
            !usedNames.has(member.key.name)
          ) {
            context.report({
              fix(fixer) {
                return fixer.remove(member);
              },
              messageId: 'unused',
              node: member,
            });
          }
        }
      },
    };
  },
});
