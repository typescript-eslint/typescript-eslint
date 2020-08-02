import * as ts from 'typescript';
import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as tsutils from 'tsutils';
import * as util from '../util';

const FUNCTION_CONSTRUCTOR = 'Function';
const GLOBAL_CANDIDATES = new Set(['global', 'window', 'globalThis']);
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
      recommended: 'error',
      requiresTypeChecking: true,
    },
    messages: {
      noImpliedEvalError: 'Implied eval. Consider passing a function.',
      noFunctionConstructor:
        'Implied eval. Do not use the Function constructor to create functions.',
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const program = parserServices.program;
    const checker = parserServices.program.getTypeChecker();

    function getCalleeName(
      node: TSESTree.LeftHandSideExpression,
    ): string | null {
      if (node.type === AST_NODE_TYPES.Identifier) {
        return node.name;
      }

      if (
        node.type === AST_NODE_TYPES.MemberExpression &&
        node.object.type === AST_NODE_TYPES.Identifier &&
        GLOBAL_CANDIDATES.has(node.object.name)
      ) {
        if (node.property.type === AST_NODE_TYPES.Identifier) {
          return node.property.name;
        }

        if (
          node.property.type === AST_NODE_TYPES.Literal &&
          typeof node.property.value === 'string'
        ) {
          return node.property.value;
        }
      }

      return null;
    }

    function isFunctionType(node: TSESTree.Node): boolean {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const type = checker.getTypeAtLocation(tsNode);
      const symbol = type.getSymbol();

      if (
        symbol &&
        tsutils.isSymbolFlagSet(
          symbol,
          ts.SymbolFlags.Function | ts.SymbolFlags.Method,
        )
      ) {
        return true;
      }

      const signatures = checker.getSignaturesOfType(
        type,
        ts.SignatureKind.Call,
      );

      return signatures.length > 0;
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

    function checkImpliedEval(
      node: TSESTree.NewExpression | TSESTree.CallExpression,
    ): void {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node.callee);
      const type = checker.getTypeAtLocation(tsNode);

      const calleeName = getCalleeName(node.callee);
      if (calleeName === null) {
        return;
      }

      if (calleeName === FUNCTION_CONSTRUCTOR) {
        const symbol = type.getSymbol();
        if (symbol) {
          const declarations = symbol.getDeclarations() ?? [];
          for (const declaration of declarations) {
            const sourceFile = declaration.getSourceFile();
            if (program.isSourceFileDefaultLibrary(sourceFile)) {
              context.report({ node, messageId: 'noFunctionConstructor' });
              return;
            }
          }
        } else {
          context.report({ node, messageId: 'noFunctionConstructor' });
          return;
        }
      }

      if (node.arguments.length === 0) {
        return;
      }

      const [handler] = node.arguments;
      if (EVAL_LIKE_METHODS.has(calleeName) && !isFunction(handler)) {
        context.report({ node: handler, messageId: 'noImpliedEvalError' });
      }
    }

    return {
      NewExpression: checkImpliedEval,
      CallExpression: checkImpliedEval,
    };
  },
});
