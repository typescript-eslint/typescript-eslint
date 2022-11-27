import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';

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
      recommended: 'recommended',
      extendsBaseRule: true,
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

      if (symbol && symbol.escapedName === FUNCTION_CONSTRUCTOR) {
        const declarations = symbol.getDeclarations() ?? [];
        for (const declaration of declarations) {
          const sourceFile = declaration.getSourceFile();
          if (program.isSourceFileDefaultLibrary(sourceFile)) {
            return true;
          }
        }
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

    function isReferenceToGlobalFunction(calleeName: string): boolean {
      const ref = context
        .getScope()
        .references.find(ref => ref.identifier.name === calleeName);

      // ensure it's the "global" version
      return !ref?.resolved || ref.resolved.defs.length === 0;
    }

    function checkImpliedEval(
      node: TSESTree.NewExpression | TSESTree.CallExpression,
    ): void {
      const calleeName = getCalleeName(node.callee);
      if (calleeName === null) {
        return;
      }

      if (calleeName === FUNCTION_CONSTRUCTOR) {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node.callee);
        const type = checker.getTypeAtLocation(tsNode);
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
      if (
        EVAL_LIKE_METHODS.has(calleeName) &&
        !isFunction(handler) &&
        isReferenceToGlobalFunction(calleeName)
      ) {
        context.report({ node: handler, messageId: 'noImpliedEvalError' });
      }
    }

    return {
      NewExpression: checkImpliedEval,
      CallExpression: checkImpliedEval,
    };
  },
});
