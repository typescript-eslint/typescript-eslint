import { TSESTree } from '@typescript-eslint/experimental-utils';
import baseRule from 'eslint/lib/rules/no-unused-expressions';
import * as util from '../util';

export default util.createRule({
  name: 'no-unused-expressions',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow unused expressions',
      category: 'Best Practices',
      recommended: false,
    },
    schema: baseRule.meta.schema,
    messages: {
      expected:
        'Expected an assignment or function call and instead saw an expression.',
    },
  },
  defaultOptions: [],
  create(context) {
    const config: Record<string, boolean> = context.options[0] || {},
      allowShortCircuit = config.allowShortCircuit || false,
      allowTernary = config.allowTernary || false,
      allowTaggedTemplates = config.allowTaggedTemplates || false;

    /**
     * @param node - any node
     * @returns whether the given node structurally represents a directive
     */
    function looksLikeDirective(node: TSESTree.Node): boolean {
      return (
        node.type === 'ExpressionStatement' &&
        node.expression.type === 'Literal' &&
        typeof node.expression.value === 'string'
      );
    }

    /**
     * @param predicate - ([a] -> Boolean) the function used to make the determination
     * @param list - the input list
     * @returns the leading sequence of members in the given list that pass the given predicate
     */
    function takeWhile<T>(predicate: (a: T) => boolean, list: T[]): T[] {
      for (let i = 0; i < list.length; ++i) {
        if (!predicate(list[i])) {
          return list.slice(0, i);
        }
      }
      return list.slice();
    }

    /**
     * @param node - a Program or BlockStatement node
     * @returns the leading sequence of directive nodes in the given node's body
     */
    function directives(
      node: TSESTree.Program | TSESTree.BlockStatement,
    ): TSESTree.Node[] {
      return takeWhile(looksLikeDirective, node.body);
    }

    /**
     * @param node - any node
     * @param ancestors - the given node's ancestors
     * @returns whether the given node is considered a directive in its current position
     */
    function isDirective(
      node: TSESTree.Node,
      ancestors: TSESTree.Node[],
    ): boolean {
      const parent = ancestors[ancestors.length - 1],
        grandparent = ancestors[ancestors.length - 2];

      return (
        (parent.type === 'Program' ||
          (parent.type === 'BlockStatement' &&
            grandparent.type.includes('Function'))) &&
        directives(parent).includes(node)
      );
    }

    /**
     * Determines whether or not a given node is a valid expression. Recurses on short circuit eval and ternary nodes if enabled by flags.
     * @param node - any node
     * @returns whether the given node is a valid expression
     */
    function isValidExpression(node: TSESTree.Node): boolean {
      if (allowTernary) {
        // Recursive check for ternary and logical expressions
        if (node.type === 'ConditionalExpression') {
          return (
            isValidExpression(node.consequent) &&
            isValidExpression(node.alternate)
          );
        }
      }

      if (allowShortCircuit) {
        if (node.type === 'LogicalExpression') {
          return isValidExpression(node.right);
        }
      }

      if (allowTaggedTemplates && node.type === 'TaggedTemplateExpression') {
        return true;
      }

      return (
        /^(?:Assignment|(Optional)?Call|New|Update|Yield|Await)Expression$/u.test(
          node.type,
        ) ||
        (node.type === 'UnaryExpression' &&
          ['delete', 'void'].includes(node.operator))
      );
    }

    return {
      ExpressionStatement(node): void {
        if (
          !isValidExpression(node.expression) &&
          !isDirective(node, context.getAncestors())
        ) {
          context.report({ node, messageId: 'expected' });
        }
      },
    };
  },
});
