import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  isBuiltinSymbolLike,
  isReferenceToGlobalFunction,
} from '../util';

const FUNCTION_CONSTRUCTOR = 'Function';
const GLOBAL_CANDIDATES = new Set(['global', 'globalThis', 'window']);
const EVAL_LIKE_FUNCTIONS = new Set([
  'execScript',
  'setImmediate',
  'setInterval',
  'setTimeout',
]);

export default createRule({
  name: 'no-implied-eval',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow the use of `eval()`-like functions',
      extendsBaseRule: true,
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      noFunctionConstructor:
        'Implied eval. Do not use the Function constructor to create functions.',
      noImpliedEvalError: 'Implied eval. Consider passing a function.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function getCalleeName(node: TSESTree.Expression): string | null {
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
      const type = services.getTypeAtLocation(node);
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

      if (isBuiltinSymbolLike(services.program, type, FUNCTION_CONSTRUCTOR)) {
        return true;
      }

      const signatures = checker.getSignaturesOfType(
        type,
        ts.SignatureKind.Call,
      );

      return signatures.length > 0;
    }

    function isBind(node: TSESTree.Node): boolean {
      return node.type === AST_NODE_TYPES.MemberExpression
        ? isBind(node.property)
        : node.type === AST_NODE_TYPES.Identifier && node.name === 'bind';
    }

    function isFunction(node: TSESTree.Node): boolean {
      switch (node.type) {
        case AST_NODE_TYPES.ArrowFunctionExpression:
        case AST_NODE_TYPES.FunctionDeclaration:
        case AST_NODE_TYPES.FunctionExpression:
          return true;

        case AST_NODE_TYPES.Literal:
        case AST_NODE_TYPES.TemplateLiteral:
          return false;

        case AST_NODE_TYPES.CallExpression:
          return isBind(node.callee) || isFunctionType(node);

        default:
          return isFunctionType(node);
      }
    }

    function checkImpliedEval(
      node: TSESTree.CallExpression | TSESTree.NewExpression,
    ): void {
      const calleeName = getCalleeName(node.callee);
      if (calleeName == null) {
        return;
      }

      if (calleeName === FUNCTION_CONSTRUCTOR) {
        const type = services.getTypeAtLocation(node.callee);
        const symbol = type.getSymbol();
        if (symbol) {
          if (
            isBuiltinSymbolLike(services.program, type, 'FunctionConstructor')
          ) {
            context.report({ node, messageId: 'noFunctionConstructor' });
            return;
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
      if (
        EVAL_LIKE_FUNCTIONS.has(calleeName) &&
        !isFunction(handler) &&
        isReferenceToGlobalFunction(calleeName, node, context.sourceCode)
      ) {
        context.report({ node: handler, messageId: 'noImpliedEvalError' });
      }
    }

    return {
      CallExpression: checkImpliedEval,
      NewExpression: checkImpliedEval,
    };
  },
});
