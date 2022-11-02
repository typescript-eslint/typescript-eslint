import { AST_NODE_TYPES, TSESLint } from '@typescript-eslint/utils';

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
      recommended: 'error',
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

            // Check if interface is within ambient declaration
            let useAutoFix = true;
            let hasSuggest = true;
            const scope = context.getScope();

            if (util.isDefinitionFile(filename)) {
              if (scope.type === 'tsModule' && scope.block.declare) {
                useAutoFix = false;
              }
            }

            // Checks if the interface declaration is merged with class declarations.
            const defs = scope.set.get(node.id.name)?.defs;
            if (
              defs?.some(
                def => def.node.type === AST_NODE_TYPES.ClassDeclaration,
              )
            ) {
              useAutoFix = false;
              hasSuggest = false;
            }

            context.report({
              node: node.id,
              messageId: 'noEmptyWithSuper',
              ...(useAutoFix
                ? { fix }
                : hasSuggest
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
