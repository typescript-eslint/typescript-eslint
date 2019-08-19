import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/camelcase';
import * as util from '../util';

type Options = util.InferOptionsTypeFromRule<typeof baseRule>;
type MessageIds = util.InferMessageIdsTypeFromRule<typeof baseRule>;

export default util.createRule<Options, MessageIds>({
  name: 'camelcase',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce camelCase naming convention',
      category: 'Stylistic Issues',
      recommended: 'error',
    },
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages,
  },
  defaultOptions: [
    {
      allow: ['^UNSAFE_'],
      ignoreDestructuring: false,
      properties: 'never',
    },
  ],
  create(context, [options]) {
    const rules = baseRule.create(context);
    const TS_PROPERTY_TYPES = [
      AST_NODE_TYPES.TSPropertySignature,
      AST_NODE_TYPES.ClassProperty,
      AST_NODE_TYPES.TSParameterProperty,
      AST_NODE_TYPES.TSAbstractClassProperty,
    ];

    const properties = options.properties;
    const allow = (options.allow || []).map(entry => ({
      name: entry,
      regex: new RegExp(entry),
    }));

    /**
     * Checks if a string contains an underscore and isn't all upper-case
     * @param  name The string to check.
     */
    function isUnderscored(name: string): boolean {
      // if there's an underscore, it might be A_CONSTANT, which is okay
      return name.includes('_') && name !== name.toUpperCase();
    }

    /**
     * Checks if a string match the ignore list
     * @param name The string to check.
     * @returns if the string is ignored
     * @private
     */
    function isAllowed(name: string): boolean {
      return (
        allow.findIndex(
          entry => name === entry.name || entry.regex.test(name),
        ) !== -1
      );
    }

    /**
     * Checks if the the node is a valid TypeScript property type.
     * @param node the node to be validated.
     * @returns true if the node is a TypeScript property type.
     * @private
     */
    function isTSPropertyType(node: TSESTree.Node): boolean {
      if (!node.parent) {
        return false;
      }
      if (TS_PROPERTY_TYPES.includes(node.parent.type)) {
        return true;
      }

      if (node.parent.type === AST_NODE_TYPES.AssignmentPattern) {
        return (
          node.parent.parent !== undefined &&
          TS_PROPERTY_TYPES.includes(node.parent.parent.type)
        );
      }

      return false;
    }

    return {
      Identifier(node): void {
        /*
         * Leading and trailing underscores are commonly used to flag
         * private/protected identifiers, strip them
         */
        const name = node.name.replace(/^_+|_+$/g, '');

        // First, we ignore the node if it match the ignore list
        if (isAllowed(name)) {
          return;
        }

        // Check TypeScript specific nodes
        if (isTSPropertyType(node)) {
          if (properties === 'always' && isUnderscored(name)) {
            context.report({
              node,
              messageId: 'notCamelCase',
              data: { name: node.name },
            });
          }

          return;
        }

        // Let the base rule deal with the rest
        rules.Identifier(node);
      },
    };
  },
});
