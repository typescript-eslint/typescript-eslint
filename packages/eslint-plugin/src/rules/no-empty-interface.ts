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
      category: 'Best Practices',
      recommended: 'error',
    },
    fixable: 'code',
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
        if (node.body.body.length !== 0) {
          // interface contains members --> Nothing to report
          return;
        }

        if (!node.extends || node.extends.length === 0) {
          context.report({
            node: node.id,
            messageId: 'noEmpty',
          });
        } else if (node.extends.length === 1) {
          // interface extends exactly 1 interface --> Report depending on rule setting
          if (allowSingleExtends) {
            return;
          } else {
            context.report({
              node: node.id,
              messageId: 'noEmptyWithSuper',
              fix(fixer) {
                if (node.extends && node.extends.length) {
                  const {
                    id,
                    extends: [extend],
                    body,
                  } = node;

                  return [
                    // replace `interface` keyword to `type`
                    fixer.replaceTextRange(
                      [id.parent?.range[0] || 0, id.range[0]],
                      'type ',
                    ),
                    // replace `extends` keyword to `=` symbol
                    fixer.replaceTextRange(
                      [id.range[1], extend.range[0]],
                      ' = ',
                    ),
                    // remove brackets `{}`
                    fixer.removeRange([body.range[0] - 1, body.range[1]]),
                  ];
                }

                return null;
              },
            });
          }
        }
      },
    };
  },
});
