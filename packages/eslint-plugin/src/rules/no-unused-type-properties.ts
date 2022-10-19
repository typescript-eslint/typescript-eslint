import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

type ObjectPatternWithTypeAnnotation = TSESTree.ObjectPattern & {
  typeAnnotation: {
    typeAnnotation: {
      type: AST_NODE_TYPES.TSTypeLiteral;
    };
  };
};

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
      "ObjectPattern[typeAnnotation.typeAnnotation.type='TSTypeLiteral']"(
        node: ObjectPatternWithTypeAnnotation,
      ): void {
        const usedNames = new Set<string>();

        for (const property of node.properties) {
          if (property.type === AST_NODE_TYPES.RestElement) {
            return;
          }

          if (property.key.type === AST_NODE_TYPES.Identifier) {
            usedNames.add(property.key.name);
          } else if (property.key.type === AST_NODE_TYPES.Literal) {
            usedNames.add(`${property.key.value}`);
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
