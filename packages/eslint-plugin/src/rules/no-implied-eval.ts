import * as ts from 'typescript';
import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as util from '../util';

const EVAL_LIKE_METHODS = new Set([
  'setImmediate',
  'setInterval',
  'setTimeout',
  'execScript',
]);

export default util.createRule({
  name: 'no-implied-eval',
  meta: {
    docs: {
      description: 'Disallow the use of `eval()`-like methods',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      noImpliedEvalError: 'Implied eval. Consider passing a function.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    function isEvalLikeMethod(node: TSESTree.CallExpression): boolean {
      const callee = node.callee;

      if (callee.type === AST_NODE_TYPES.Identifier) {
        return EVAL_LIKE_METHODS.has(callee.name);
      }

      if (
        callee.type === AST_NODE_TYPES.MemberExpression &&
        callee.object.type === AST_NODE_TYPES.Identifier &&
        callee.object.name === 'window'
      ) {
        if (callee.property.type === AST_NODE_TYPES.Identifier) {
          return EVAL_LIKE_METHODS.has(callee.property.name);
        }

        if (
          callee.property.type === AST_NODE_TYPES.Literal &&
          typeof callee.property.value === 'string'
        ) {
          return EVAL_LIKE_METHODS.has(callee.property.value);
        }
      }

      return false;
    }

    function isFunctionType(node: TSESTree.Node): boolean {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const type = checker.getTypeAtLocation(tsNode);
      const symbol = type.getSymbol();

      if (
        symbol?.flags === ts.SymbolFlags.Function ||
        symbol?.flags === ts.SymbolFlags.Method
      ) {
        return true;
      }

      const signatures = checker.getSignaturesOfType(
        type,
        ts.SignatureKind.Call,
      );

      if (signatures.length) {
        const [{ declaration }] = signatures;
        return declaration?.kind === ts.SyntaxKind.FunctionType;
      }

      return false;
    }

    function isFunction(node: TSESTree.Node): boolean {
      switch (node.type) {
        case AST_NODE_TYPES.ArrowFunctionExpression:
        case AST_NODE_TYPES.FunctionDeclaration:
        case AST_NODE_TYPES.FunctionExpression:
          return true;

        case AST_NODE_TYPES.MemberExpression:
        case AST_NODE_TYPES.Identifier:
          return isFunctionType(node);

        case AST_NODE_TYPES.CallExpression:
          return (
            (node.callee.type === AST_NODE_TYPES.Identifier &&
              node.callee.name === 'bind') ||
            isFunctionType(node)
          );

        default:
          return false;
      }
    }

    return {
      CallExpression(node): void {
        if (node.arguments.length === 0) {
          return;
        }

        const [handler] = node.arguments;
        if (isEvalLikeMethod(node) && !isFunction(handler)) {
          context.report({ node: handler, messageId: 'noImpliedEvalError' });
        }
      },
    };
  },
});
