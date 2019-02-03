/**
 * @fileoverview Enforces unbound methods are called with their expected scope.
 * @author Josh Goldberg <https://github.com/joshuakgoldberg>
 */
'use strict';

const tsutils = require('tsutils');
const ts = require('typescript');

const util = require('../util');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const defaultOptions = [
  {
    ignoreStatic: false
  }
];

/**
 * @type {import("eslint").Rule.RuleModule}
 */
module.exports = {
  meta: {
    docs: {
      description:
        'Enforces unbound methods are called with their expected scope.',
      extraDescription: [util.tslintRule('no-unbound-method')],
      category: 'TypeScript',
      url: util.metaDocsUrl('no-unbound-method'),
      recommended: 'error'
    },
    fixable: null,
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

  create(context) {
    const { ignoreStatic } = util.applyDefault(
      defaultOptions,
      context.options
    )[0];
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      MemberExpression(node) {
        if (isSafeUse(node)) {
          return;
        }

        const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const symbol = checker.getSymbolAtLocation(originalNode);

        if (isDangerousMethod(symbol, ignoreStatic)) {
          context.report({
            messageId: 'unbound',
            node
          });
        }
      }
    };
  }
};

function isDangerousMethod(symbol, ignoreStatic) {
  const declaration =
    typeof symbol === 'undefined' ? undefined : symbol.valueDeclaration;
  if (typeof declaration === 'undefined') {
    return false;
  }

  switch (declaration.kind) {
    case ts.SyntaxKind.MethodDeclaration:
    case ts.SyntaxKind.MethodSignature:
      return !(
        ignoreStatic &&
        tsutils.hasModifier(declaration.modifiers, ts.SyntaxKind.StaticKeyword)
      );
  }

  return false;
}

function isSafeUse(node) {
  const { parent } = node;

  switch (parent.type) {
    case 'IfStatement':
    case 'ForStatement':
    case 'MemberExpression':
    case 'UpdateExpression':
    case 'WhileStatement':
      return true;

    case 'CallExpression':
      return parent.callee === node;

    case 'ConditionalExpression':
      return parent.test === node;

    case 'LogicalExpression':
      return parent.operator !== '||';

    case 'TaggedTemplateExpression':
      return parent.tag === node;

    case 'TSNonNullExpression':
    case 'TSAsExpression':
    case 'TSTypeAssertionExpression':
      return isSafeUse(parent);
  }

  return false;
}
