import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

type Modifier =
  | 'readonly'
  | 'private'
  | 'protected'
  | 'public'
  | 'private readonly'
  | 'protected readonly'
  | 'public readonly';
type Options = [
  {
    allows: Modifier[];
  },
];
type MessageIds = 'noParamProp';

export default util.createRule<Options, MessageIds>({
  name: 'no-parameter-properties',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow the use of parameter properties in class constructors',
      category: 'Stylistic Issues',
      // too opinionated to be recommended
      recommended: false,
    },
    messages: {
      noParamProp:
        'Property {{parameter}} cannot be declared in the constructor.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allows: {
            type: 'array',
            items: {
              enum: [
                'readonly',
                'private',
                'protected',
                'public',
                'private readonly',
                'protected readonly',
                'public readonly',
              ],
            },
            minItems: 1,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      allows: [],
    },
  ],
  create(context, [{ allows }]) {
    /**
     * Gets the modifiers of `node`.
     * @param node the node to be inspected.
     */
    function getModifiers(node: TSESTree.TSParameterProperty): Modifier {
      const modifiers: Modifier[] = [];

      if (node.accessibility) {
        modifiers.push(node.accessibility);
      }
      if (node.readonly) {
        modifiers.push('readonly');
      }

      return modifiers.filter(Boolean).join(' ') as Modifier;
    }

    return {
      TSParameterProperty(node): void {
        const modifiers = getModifiers(node);

        if (!allows.includes(modifiers)) {
          // HAS to be an identifier or assignment or TSC will throw
          if (
            node.parameter.type !== AST_NODE_TYPES.Identifier &&
            node.parameter.type !== AST_NODE_TYPES.AssignmentPattern
          ) {
            return;
          }

          const name =
            node.parameter.type === AST_NODE_TYPES.Identifier
              ? node.parameter.name
              : // has to be an Identifier or TSC will throw an error
                (node.parameter.left as TSESTree.Identifier).name;

          context.report({
            node,
            messageId: 'noParamProp',
            data: {
              parameter: name,
            },
          });
        }
      },
    };
  },
});
