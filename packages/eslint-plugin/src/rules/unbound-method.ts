import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';

import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

interface Config {
  ignoreStatic: boolean;
}

type Options = [Config];

type MessageIds = 'unbound';

export default util.createRule<Options, MessageIds>({
  name: 'unbound-method',
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Enforces unbound methods are called with their expected scope.',
      tslintName: 'no-unbound-method',
      recommended: 'error'
    },
    messages: {
      unbound:
        'Avoid referencing unbound methods which may cause unintentional scoping of `this`.'
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreStatic: {
            type: 'boolean'
          }
        },
        additionalProperties: false
      }
    ],
    type: 'problem'
  },
  defaultOptions: [
    {
      ignoreStatic: false
    }
  ],
  create(context, [{ ignoreStatic }]) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      MemberExpression(node) {
        if (isSafeUse(node)) {
          return;
        }

        const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const symbol = checker.getSymbolAtLocation(originalNode);

        if (symbol && isDangerousMethod(symbol, ignoreStatic)) {
          context.report({
            messageId: 'unbound',
            node
          });
        }
      }
    };
  }
});

function isDangerousMethod(symbol: ts.Symbol, ignoreStatic: boolean) {
  const { valueDeclaration } = symbol;

  switch (valueDeclaration.kind) {
    case ts.SyntaxKind.MethodDeclaration:
    case ts.SyntaxKind.MethodSignature:
      return !(
        ignoreStatic &&
        tsutils.hasModifier(
          valueDeclaration.modifiers,
          ts.SyntaxKind.StaticKeyword
        )
      );
  }

  return false;
}

function isSafeUse(node: TSESTree.Node): boolean {
  const parent = node.parent!;

  switch (parent.type) {
    case AST_NODE_TYPES.IfStatement:
    case AST_NODE_TYPES.ForStatement:
    case AST_NODE_TYPES.MemberExpression:
    case AST_NODE_TYPES.UpdateExpression:
    case AST_NODE_TYPES.WhileStatement:
      return true;

    case AST_NODE_TYPES.CallExpression:
      return parent.callee === node;

    case AST_NODE_TYPES.ConditionalExpression:
      return parent.test === node;

    case AST_NODE_TYPES.LogicalExpression:
      return parent.operator !== '||';

    case AST_NODE_TYPES.TaggedTemplateExpression:
      return parent.tag === node;

    case AST_NODE_TYPES.TSNonNullExpression:
    case AST_NODE_TYPES.TSAsExpression:
    case AST_NODE_TYPES.TSTypeAssertion:
      return isSafeUse(parent);
  }

  return false;
}
