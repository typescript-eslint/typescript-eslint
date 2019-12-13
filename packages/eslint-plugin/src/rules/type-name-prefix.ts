import * as util from '../util';

type Options = [{ prefixWithT: PrefixWithT }];
type PrefixWithT = 'always' | 'never';

export default util.createRule<Options, PrefixWithT>({
  name: 'type-name-prefix',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require that type names should or should not prefixed with `T`',
      category: 'Stylistic Issues',
      recommended: false,
    },
    messages: {
      always: 'Type name must be prefixed with "T".',
      never: 'Type name must not be prefixed with "T".',
    },
    schema: [
      {
        oneOf: [
          {
            type: 'object',
            properties: {
              prefixWithT: {
                type: 'string',
                enum: ['never', 'always'],
              },
            },
            additionalProperties: false,
            requiresTypeChecking: true,
          },
        ],
      },
    ],
  },
  defaultOptions: [{ prefixWithT: 'never' }],
  create(context, [options]) {
    const isPrefixed = (name: string): boolean => /^T[A-Z0-9]/.test(name);

    const rule = options.prefixWithT;
    const ensureRule =
      rule === 'never'
        ? (name: string): boolean => !isPrefixed(name)
        : (name: string): boolean => isPrefixed(name);

    return {
      TSTypeAliasDeclaration(node): void {
        ensureRule(node.id.name) ||
          context.report({ node: node.id, messageId: rule });
      },
    };
  },
});
