import type { TSESLint } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import * as util from '../util';

type Options = [
  {
    allowSingleExtends?: boolean;
  },
];
type MessageIds = 'noEmpty' | 'noEmptyWithSuper';

export default util.createRule<Options, MessageIds>({
  name: 'no-empty-interface',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow the declaration of empty interfaces',
      recommended: 'stylistic',
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      noEmpty: 'An empty interface is equivalent to `{}`.',
      noEmptyWithSuper:
        'An interface declaring no members is equivalent to its supertype.',
    },
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
  defaultOptions: [
    {
      allowSingleExtends: false,
    },
  ],
  create(context, [{ allowSingleExtends }]) {
    return {
      TSInterfaceDeclaration(node): void {
        const sourceCode = context.getSourceCode();
        const filename = context.getFilename();

        if (node.body.body.length !== 0) {
          // interface contains members --> Nothing to report
          return;
        }

        const extend = node.extends;
        if (!extend || extend.length === 0) {
          context.report({
            node: node.id,
            messageId: 'noEmpty',
          });
        } else if (extend.length === 1) {
          // interface extends exactly 1 interface --> Report depending on rule setting
          if (!allowSingleExtends) {
            const fix = (fixer: TSESLint.RuleFixer): TSESLint.RuleFix => {
              let typeParam = '';
              if (node.typeParameters) {
                typeParam = sourceCode.getText(node.typeParameters);
              }
              return fixer.replaceText(
                node,
                `type ${sourceCode.getText(
                  node.id,
                )}${typeParam} = ${sourceCode.getText(extend[0])}`,
              );
            };
            const scope = context.getScope();

            const mergedWithClassDeclaration = scope.set
              .get(node.id.name)
              ?.defs?.some(
                def => def.node.type === AST_NODE_TYPES.ClassDeclaration,
              );

            const isInAmbientDeclaration = !!(
              util.isDefinitionFile(filename) &&
              scope.type === 'tsModule' &&
              scope.block.declare
            );

            const useAutoFix = !(
              isInAmbientDeclaration || mergedWithClassDeclaration
            );

            context.report({
              node: node.id,
              messageId: 'noEmptyWithSuper',
              ...(useAutoFix
                ? { fix }
                : !mergedWithClassDeclaration
                ? {
                    suggest: [
                      {
                        messageId: 'noEmptyWithSuper',
                        fix,
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
