import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { parseRegExpLiteral } from '@eslint-community/regexpp';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  getStaticValue,
  isClosingParenToken,
  isStaticMemberAccessOfValue,
  nullThrows,
  NullThrowsReasons,
} from '../util';

export default createRule({
  name: 'prefer-includes',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce `includes` method over `indexOf` method',
      recommended: 'stylistic',
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

  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
  defaultOptions: [],

  create(context) {
    const globalScope = context.sourceCode.getScope(context.sourceCode.ast);
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function isNumber(node: TSESTree.Node, value: number): boolean {
      const evaluated = getStaticValue(node, globalScope);
      return evaluated?.value === value;
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
     * Whether `node` creates a new `RegExp` object, so its `lastIndex` is 0.
     */
    function isNewRegExpObject(node: TSESTree.Node): boolean {
      while (
        node.type === AST_NODE_TYPES.SequenceExpression ||
        node.type === AST_NODE_TYPES.TSAsExpression ||
        node.type === AST_NODE_TYPES.TSNonNullExpression ||
        node.type === AST_NODE_TYPES.TSSatisfiesExpression ||
        node.type === AST_NODE_TYPES.TSTypeAssertion
      ) {
        node =
          node.type === AST_NODE_TYPES.SequenceExpression
            ? node.expressions[node.expressions.length - 1]
            : node.expression;
      }
      if (node.type === AST_NODE_TYPES.Literal) {
        return true;
      }
      if (
        (node.type !== AST_NODE_TYPES.CallExpression &&
          node.type !== AST_NODE_TYPES.NewExpression) ||
        node.callee.type !== AST_NODE_TYPES.Identifier ||
        node.callee.name !== 'RegExp'
      ) {
        return false;
      }
      if (node.type === AST_NODE_TYPES.NewExpression) {
        return true;
      }
      // `RegExp(re)` and `RegExp(re, undefined)` return `re` itself
      const pattern = node.arguments.at(0);
      const flags = node.arguments.at(1);
      if (pattern == null || pattern.type === AST_NODE_TYPES.SpreadElement) {
        return false;
      }
      return (
        (flags != null && getStaticValue(flags, globalScope)?.value != null) ||
        isNewRegExpObject(pattern)
      );
    }

    /**
     * Parse a given node if it's a `RegExp` instance.
     * @param node The node to parse.
     * @param allowGlobal Whether the `g` flag can't change the result, as on a new object.
     */
    function parseRegExp(
      node: TSESTree.Node,
      allowGlobal: boolean,
    ): string | null {
      const evaluated = getStaticValue(node, globalScope);
      if (evaluated == null || !(evaluated.value instanceof RegExp)) {
        return null;
      }

      // `g` and `y` make `test` start at `lastIndex`, which is 0 on a new object,
      // but `y` still only matches at that index
      const { flags, pattern } = parseRegExpLiteral(evaluated.value);
      if (
        pattern.alternatives.length !== 1 ||
        flags.ignoreCase ||
        (flags.global && !allowGlobal) ||
        flags.sticky
      ) {
        return null;
      }

      // Check if it can determine a unique string.
      const chars = pattern.alternatives[0].elements;
      if (!chars.every(c => c.type === 'Character')) {
        return null;
      }

      // To string.
      return String.fromCodePoint(...chars.map(c => c.value));
    }

    function escapeString(str: string): string {
      const EscapeMap = {
        '\0': '\\0',
        '\t': '\\t',
        '\n': '\\n',
        '\v': '\\v',
        '\f': '\\f',
        '\r': '\\r',
        "'": "\\'",
        '\\': '\\\\',
        // "\b" cause unexpected replacements
        // '\b': '\\b',
      };
      const replaceRegex = new RegExp(Object.values(EscapeMap).join('|'), 'g');

      return (
        str
          .replaceAll(replaceRegex, (char, offset: number) =>
            // `\0` followed by a digit would be a (disallowed) legacy octal escape
            char === '\0' && /\d/.test(str.charAt(offset + 1))
              ? '\\x00'
              : EscapeMap[char as keyof typeof EscapeMap],
          )
          // a lone surrogate can't be written as UTF-8, so keep it as an escape
          .replaceAll(
            /\p{Surrogate}/gu,
            char => `\\u${char.charCodeAt(0).toString(16)}`,
          )
      );
    }

    function checkArrayIndexOf(
      node: TSESTree.MemberExpression,
      allowFixing: boolean,
    ): void {
      if (!isStaticMemberAccessOfValue(node, context, 'indexOf')) {
        return;
      }
      // Check if the comparison is equivalent to `includes()`.
      const callNode = node.parent as TSESTree.CallExpression;
      const compareNode = (
        callNode.parent.type === AST_NODE_TYPES.ChainExpression
          ? callNode.parent.parent
          : callNode.parent
      ) as TSESTree.BinaryExpression;
      const negative = isNegativeCheck(compareNode);
      if (!negative && !isPositiveCheck(compareNode)) {
        return;
      }

      // Get the symbol of `indexOf` method.
      const indexofMethodDeclarations = services
        .getSymbolAtLocation(node.property)
        ?.getDeclarations();
      if (
        indexofMethodDeclarations == null ||
        indexofMethodDeclarations.length === 0
      ) {
        return;
      }

      // Check if every declaration of `indexOf` method has `includes` method
      // and the two methods have the same parameters.
      for (const indexofMethodDecl of indexofMethodDeclarations) {
        const typeDecl = indexofMethodDecl.parent;
        const type = checker.getTypeAtLocation(typeDecl);
        const includesMethodDecl = type
          .getProperty('includes')
          ?.getDeclarations();
        if (
          !includesMethodDecl?.some(includesMethodDecl =>
            hasSameParameters(includesMethodDecl, indexofMethodDecl),
          )
        ) {
          return;
        }
      }

      // Report it.
      context.report({
        node: compareNode,
        messageId: 'preferIncludes',
        ...(allowFixing && {
          *fix(fixer): Generator<TSESLint.RuleFix> {
            if (negative) {
              yield fixer.insertTextBefore(callNode, '!');
            }
            yield fixer.replaceText(node.property, 'includes');
            // keep any parentheses around the call, as in `(a.indexOf(b)) !== -1`
            const lastLeftToken = nullThrows(
              context.sourceCode.getTokenBefore(compareNode.right, {
                filter: isClosingParenToken,
              }),
              NullThrowsReasons.MissingToken(')', 'call expression'),
            );
            yield fixer.removeRange([
              lastLeftToken.range[1],
              compareNode.range[1],
            ]);
          },
        }),
      });
    }

    return {
      // a.indexOf(b) !== 1
      'BinaryExpression > CallExpression.left > MemberExpression'(
        node: TSESTree.MemberExpression,
      ): void {
        checkArrayIndexOf(node, /* allowFixing */ true);
      },

      // a?.indexOf(b) !== 1
      'BinaryExpression > ChainExpression.left > CallExpression > MemberExpression'(
        node: TSESTree.MemberExpression,
      ): void {
        checkArrayIndexOf(node, /* allowFixing */ false);
      },

      // /bar/.test(foo)
      'CallExpression[arguments.length=1] > MemberExpression.callee[property.name="test"][computed=false]'(
        node: { parent: TSESTree.CallExpression } & TSESTree.MemberExpression,
      ): void {
        const callNode = node.parent;
        const text = parseRegExp(node.object, isNewRegExpObject(node.object));
        if (text == null) {
          return;
        }

        //check the argument type of test methods
        const argument = callNode.arguments[0];
        const type = getConstrainedTypeAtLocation(services, argument);

        const includesMethodDecl = type
          .getProperty('includes')
          ?.getDeclarations();
        if (includesMethodDecl == null) {
          return;
        }

        context.report({
          node: callNode,
          messageId: 'preferStringIncludes',
          *fix(fixer) {
            const argNode = callNode.arguments[0];
            const needsParen =
              argNode.type !== AST_NODE_TYPES.Literal &&
              argNode.type !== AST_NODE_TYPES.TemplateLiteral &&
              argNode.type !== AST_NODE_TYPES.Identifier &&
              argNode.type !== AST_NODE_TYPES.MemberExpression &&
              argNode.type !== AST_NODE_TYPES.CallExpression;

            yield fixer.removeRange([callNode.range[0], argNode.range[0]]);
            yield fixer.removeRange([argNode.range[1], callNode.range[1]]);
            if (needsParen) {
              yield fixer.insertTextBefore(argNode, '(');
              yield fixer.insertTextAfter(argNode, ')');
            }
            yield fixer.insertTextAfter(
              argNode,
              `${node.optional ? '?.' : '.'}includes('${escapeString(text)}')`,
            );
          },
        });
      },
    };
  },
});
