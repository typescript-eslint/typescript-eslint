import { TSESTree } from '@typescript-eslint/experimental-utils';
import { getStaticValue } from 'eslint-utils';
import { AST as RegExpAST, parseRegExpLiteral } from 'regexpp';
import ts from 'typescript';
import { createRule, getParserServices } from '../util';

export default createRule({
  name: 'prefer-includes',
  defaultOptions: [],

  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce `includes` method over `indexOf` method',
      category: 'Best Practices',
      recommended: 'error',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      preferIncludes: "Use 'includes()' method instead.",
      preferStringIncludes:
        'Use `String#includes()` method with a string instead.',
    },
    schema: [],
  },

  create(context) {
    const globalScope = context.getScope();
    const services = getParserServices(context);
    const types = services.program.getTypeChecker();

    function isNumber(node: TSESTree.Node, value: number): boolean {
      const evaluated = getStaticValue(node, globalScope);
      return evaluated !== null && evaluated.value === value;
    }

    function isPositiveCheck(node: TSESTree.BinaryExpression): boolean {
      switch (node.operator) {
        case '!==':
        case '!=':
        case '>':
          return isNumber(node.right, -1);
        case '>=':
          return isNumber(node.right, 0);
        default:
          return false;
      }
    }
    function isNegativeCheck(node: TSESTree.BinaryExpression): boolean {
      switch (node.operator) {
        case '===':
        case '==':
        case '<=':
          return isNumber(node.right, -1);
        case '<':
          return isNumber(node.right, 0);
        default:
          return false;
      }
    }

    function hasSameParameters(
      nodeA: ts.Declaration,
      nodeB: ts.Declaration,
    ): boolean {
      if (!ts.isFunctionLike(nodeA) || !ts.isFunctionLike(nodeB)) {
        return false;
      }

      const paramsA = nodeA.parameters;
      const paramsB = nodeB.parameters;
      if (paramsA.length !== paramsB.length) {
        return false;
      }

      for (let i = 0; i < paramsA.length; ++i) {
        const paramA = paramsA[i];
        const paramB = paramsB[i];

        // Check name, type, and question token once.
        if (paramA.getText() !== paramB.getText()) {
          return false;
        }
      }

      return true;
    }

    /**
     * Parse a given node if it's a `RegExp` instance.
     * @param node The node to parse.
     */
    function parseRegExp(node: TSESTree.Node): string | null {
      const evaluated = getStaticValue(node, globalScope);
      if (evaluated == null || !(evaluated.value instanceof RegExp)) {
        return null;
      }

      const { pattern, flags } = parseRegExpLiteral(evaluated.value);
      if (
        pattern.alternatives.length !== 1 ||
        flags.ignoreCase ||
        flags.global
      ) {
        return null;
      }

      // Check if it can determine a unique string.
      const chars = pattern.alternatives[0].elements;
      if (!chars.every(c => c.type === 'Character')) {
        return null;
      }

      // To string.
      return String.fromCodePoint(
        ...chars.map(c => (c as RegExpAST.Character).value),
      );
    }

    return {
      "BinaryExpression > CallExpression.left > MemberExpression.callee[property.name='indexOf'][computed=false]"(
        node: TSESTree.MemberExpression,
      ): void {
        // Check if the comparison is equivalent to `includes()`.
        const callNode = node.parent as TSESTree.CallExpression;
        const compareNode = callNode.parent as TSESTree.BinaryExpression;
        const negative = isNegativeCheck(compareNode);
        if (!negative && !isPositiveCheck(compareNode)) {
          return;
        }

        // Get the symbol of `indexOf` method.
        const tsNode = services.esTreeNodeToTSNodeMap.get(node.property);
        const indexofMethodSymbol = types.getSymbolAtLocation(tsNode);
        if (
          indexofMethodSymbol == null ||
          indexofMethodSymbol.declarations.length === 0
        ) {
          return;
        }

        // Check if every declaration of `indexOf` method has `includes` method
        // and the two methods have the same parameters.
        for (const instanceofMethodDecl of indexofMethodSymbol.declarations) {
          const typeDecl = instanceofMethodDecl.parent;
          const type = types.getTypeAtLocation(typeDecl);
          const includesMethodSymbol = type.getProperty('includes');
          if (
            includesMethodSymbol == null ||
            !includesMethodSymbol.declarations.some(includesMethodDecl =>
              hasSameParameters(includesMethodDecl, instanceofMethodDecl),
            )
          ) {
            return;
          }
        }

        // Report it.
        context.report({
          node: compareNode,
          messageId: 'preferIncludes',
          *fix(fixer) {
            if (negative) {
              yield fixer.insertTextBefore(callNode, '!');
            }
            yield fixer.replaceText(node.property, 'includes');
            yield fixer.removeRange([callNode.range[1], compareNode.range[1]]);
          },
        });
      },

      // /bar/.test(foo)
      'CallExpression > MemberExpression.callee[property.name="test"][computed=false]'(
        node: TSESTree.MemberExpression,
      ): void {
        const callNode = node.parent as TSESTree.CallExpression;
        const text =
          callNode.arguments.length === 1 ? parseRegExp(node.object) : null;
        if (text == null) {
          return;
        }

        context.report({
          node: callNode,
          messageId: 'preferStringIncludes',
          *fix(fixer) {
            const argNode = callNode.arguments[0];
            const needsParen =
              argNode.type !== 'Literal' &&
              argNode.type !== 'TemplateLiteral' &&
              argNode.type !== 'Identifier' &&
              argNode.type !== 'MemberExpression' &&
              argNode.type !== 'CallExpression';

            yield fixer.removeRange([callNode.range[0], argNode.range[0]]);
            if (needsParen) {
              yield fixer.insertTextBefore(argNode, '(');
              yield fixer.insertTextAfter(argNode, ')');
            }
            yield fixer.insertTextAfter(
              argNode,
              `.includes(${JSON.stringify(text)}`,
            );
          },
        });
      },
    };
  },
});
