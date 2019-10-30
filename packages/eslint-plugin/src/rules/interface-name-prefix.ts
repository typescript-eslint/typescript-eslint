import * as util from '../util';

type ParsedOptions =
  | {
      prefixWithI: 'never';
    }
  | {
      prefixWithI: 'always';
      allowUnderscorePrefix: boolean;
      replacePrefixI: string;
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
        replacePrefixI?: string;
      },
];
type MessageIds = 'noPrefix' | 'alwaysPrefix';

/**
 * Parses a given value as options.
 */
export function parseOptions([options]: Options): ParsedOptions {
  const replacePrefixI = 'I';
  if (options === 'always') {
    return {
      prefixWithI: 'always',
      allowUnderscorePrefix: false,
      replacePrefixI,
    };
  }
  if (options !== 'never' && options.prefixWithI === 'always') {
    return {
      prefixWithI: 'always',
      allowUnderscorePrefix: !!options.allowUnderscorePrefix,
      replacePrefixI: options.replacePrefixI || replacePrefixI,
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
      alwaysPrefix: 'Interface name must be prefixed with "{{prefix}}".',
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
              replacePrefixI: {
                type: 'string',
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
     * Checks if a string is prefixed with "@param prefix".
     * @param name The string to check
     * @param prefix Check prefix
     */
    function isPrefixedWithI(name: string, prefix = 'I'): boolean {
      if (typeof name !== 'string' || typeof prefix !== 'string') {
        return false;
      }

      return new RegExp(`^${prefix}[A-Z]`).test(name);
    }

    /**
     * Checks if a string is prefixed with "@param prefix" or "_@param prefix".
     * @param name The string to check
     * @param prefix Check prefix
     */
    function isPrefixedWithIOrUnderscoreI(name: string, prefix = 'I'): boolean {
      if (typeof name !== 'string' || typeof prefix !== 'string') {
        return false;
      }

      return new RegExp(`^_?${prefix}[A-Z]`).test(name);
    }

    return {
      TSInterfaceDeclaration(node): void {
        if (parsedOptions.prefixWithI === 'never') {
          if (isPrefixedWithIOrUnderscoreI(node.id.name)) {
            context.report({
              node: node.id,
              messageId: 'noPrefix',
              data: {
                prefix: 'I',
              },
            });
          }
        } else {
          if (parsedOptions.allowUnderscorePrefix) {
            if (
              !isPrefixedWithIOrUnderscoreI(
                node.id.name,
                parsedOptions.replacePrefixI,
              )
            ) {
              context.report({
                node: node.id,
                messageId: 'alwaysPrefix',
                data: {
                  prefix: parsedOptions.replacePrefixI || 'I',
                },
              });
            }
          } else {
            if (!isPrefixedWithI(node.id.name, parsedOptions.replacePrefixI)) {
              context.report({
                node: node.id,
                messageId: 'alwaysPrefix',
                data: {
                  prefix: parsedOptions.replacePrefixI || 'I',
                },
              });
            }
          }
        }
      },
    };
  },
});
