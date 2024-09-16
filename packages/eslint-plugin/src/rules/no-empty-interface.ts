import type { TSESLint } from '@typescript-eslint/utils';

import { ScopeType } from '@typescript-eslint/scope-manager';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, isDefinitionFile } from '../util';

type Options = [
  {
    allowSingleExtends?: boolean;
  },
];
type MessageIds = 'noEmpty' | 'noEmptyWithSuper';

export default createRule<Options, MessageIds>({
  defaultOptions: [
    {
      allowSingleExtends: false,
    },
  ],
  meta: {
    type: 'suggestion',
    deprecated: true,
    docs: {
      description: 'Disallow the declaration of empty interfaces',
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      noEmpty: 'An empty interface is equivalent to `{}`.',
      noEmptyWithSuper:
        'An interface declaring no members is equivalent to its supertype.',
    },
    replacedBy: ['@typescript-eslint/no-empty-object-type'],
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowSingleExtends: {
            type: 'boolean',
          },
        },
      },
    ],
  },
  name: 'no-empty-interface',
  create(context, [{ allowSingleExtends }]) {
    return {
      TSInterfaceDeclaration(node): void {
        if (node.body.body.length !== 0) {
          // interface contains members --> Nothing to report
          return;
        }

        const extend = node.extends;
        if (extend.length === 0) {
          context.report({
            messageId: 'noEmpty',
            node: node.id,
          });
        } else if (extend.length === 1) {
          // interface extends exactly 1 interface --> Report depending on rule setting
          if (!allowSingleExtends) {
            const fix = (fixer: TSESLint.RuleFixer): TSESLint.RuleFix => {
              let typeParam = '';
              if (node.typeParameters) {
                typeParam = context.sourceCode.getText(node.typeParameters);
              }
              return fixer.replaceText(
                node,
                `type ${context.sourceCode.getText(
                  node.id,
                )}${typeParam} = ${context.sourceCode.getText(extend[0])}`,
              );
            };
            const scope = context.sourceCode.getScope(node);

            const mergedWithClassDeclaration = scope.set
              .get(node.id.name)
              ?.defs.some(
                def => def.node.type === AST_NODE_TYPES.ClassDeclaration,
              );

            const isInAmbientDeclaration = !!(
              isDefinitionFile(context.filename) &&
              scope.type === ScopeType.tsModule &&
              scope.block.declare
            );

            const useAutoFix = !(
              isInAmbientDeclaration || mergedWithClassDeclaration
            );

            context.report({
              messageId: 'noEmptyWithSuper',
              node: node.id,
              ...(useAutoFix
                ? { fix }
                : !mergedWithClassDeclaration
                  ? {
                      suggest: [
                        {
                          fix,
                          messageId: 'noEmptyWithSuper',
                        },
                      ],
                    }
                  : null),
            });
          }
        }
      },
    };
  },
});
