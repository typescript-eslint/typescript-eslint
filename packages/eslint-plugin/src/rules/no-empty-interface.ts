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
        const sourceCode = context.getSourceCode();

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
            context.report({
              node: node.id,
              messageId: 'noEmptyWithSuper',
              fix: fixer =>
                fixer.replaceText(
                  node,
                  `type ${sourceCode.getText(node.id)} = ${sourceCode.getText(
                    extend[0],
                  )}`,
                ),
            });
          }
        }
      },
    };
  },
});
