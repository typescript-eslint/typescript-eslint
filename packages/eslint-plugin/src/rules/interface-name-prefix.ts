import * as util from '../util';

type Options = ['never' | 'always'];
type MessageIds = 'noPrefix' | 'alwaysPrefix';

export default util.createRule<Options, MessageIds>({
  name: 'interface-name-prefix',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require that interface names should or should not prefixed with `I`',
      category: 'Stylistic Issues',
      // this will always be recommended as there's no reason to use this convention
      // https://github.com/typescript-eslint/typescript-eslint/issues/374
      recommended: 'error',
    },
    messages: {
      noPrefix: 'Interface name must not be prefixed with "I".',
      alwaysPrefix: 'Interface name must be prefixed with "I".',
    },
    schema: [
      {
        enum: ['never', 'always'],
      },
    ],
  },
  defaultOptions: ['never'],
  create(context, [option]) {
    const never = option !== 'always';

    /**
     * Checks if a string is prefixed with "I".
     * @param name The string to check
     */
    function isPrefixedWithI(name: string): boolean {
      if (typeof name !== 'string') {
        return false;
      }

      return /^I[A-Z]/.test(name);
    }

    return {
      TSInterfaceDeclaration(node): void {
        if (never) {
          if (isPrefixedWithI(node.id.name)) {
            context.report({
              node: node.id,
              messageId: 'noPrefix',
            });
          }
        } else {
          if (!isPrefixedWithI(node.id.name)) {
            context.report({
              node: node.id,
              messageId: 'alwaysPrefix',
            });
          }
        }
      },
    };
  },
});
