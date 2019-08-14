import * as util from '../util';

type ParsedOptions =
  | {
      prefixWithI: 'never';
    }
  | {
      prefixWithI: 'always';
      allowUnderscorePrefix: boolean;
    };
type Options = [

    | 'never'
    | 'always'
    | {
        prefixWithI?: 'never';
      }
    | {
        prefixWithI: 'always';
        allowUnderscorePrefix?: boolean;
      },
];
type MessageIds = 'noPrefix' | 'alwaysPrefix';

/**
 * Parses a given value as options.
 */
export function parseOptions([options]: Options): ParsedOptions {
  if (options === 'always') {
    return { prefixWithI: 'always', allowUnderscorePrefix: false };
  }
  if (options !== 'never' && options.prefixWithI === 'always') {
    return {
      prefixWithI: 'always',
      allowUnderscorePrefix: !!options.allowUnderscorePrefix,
    };
  }
  return { prefixWithI: 'never' };
}

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
        oneOf: [
          {
            enum: [
              // Deprecated, equivalent to: { prefixWithI: 'never' }
              'never',
              // Deprecated, equivalent to: { prefixWithI: 'always', allowUnderscorePrefix: false }
              'always',
            ],
          },
          {
            type: 'object',
            properties: {
              prefixWithI: {
                type: 'string',
                enum: ['never'],
              },
            },
            additionalProperties: false,
          },
          {
            type: 'object',
            properties: {
              prefixWithI: {
                type: 'string',
                enum: ['always'],
              },
              allowUnderscorePrefix: {
                type: 'boolean',
              },
            },
            required: ['prefixWithI'], // required to select this "oneOf" alternative
            additionalProperties: false,
          },
        ],
      },
    ],
  },
  defaultOptions: [{ prefixWithI: 'never' }],
  create(context, [options]) {
    const parsedOptions = parseOptions([options]);

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

    /**
     * Checks if a string is prefixed with "I" or "_I".
     * @param name The string to check
     */
    function isPrefixedWithIOrUnderscoreI(name: string): boolean {
      if (typeof name !== 'string') {
        return false;
      }

      return /^_?I[A-Z]/.test(name);
    }

    return {
      TSInterfaceDeclaration(node): void {
        if (parsedOptions.prefixWithI === 'never') {
          if (isPrefixedWithIOrUnderscoreI(node.id.name)) {
            context.report({
              node: node.id,
              messageId: 'noPrefix',
            });
          }
        } else {
          if (parsedOptions.allowUnderscorePrefix) {
            if (!isPrefixedWithIOrUnderscoreI(node.id.name)) {
              context.report({
                node: node.id,
                messageId: 'alwaysPrefix',
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
        }
      },
    };
  },
});
