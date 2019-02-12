/**
 * @fileoverview Enforce giving `compare` argument to `Array#sort`
 * @author Toru Nagashima <https://github.com/mysticatea>
 */

import * as ts from 'typescript';
import { TSESTree } from '@typescript-eslint/typescript-estree';
import * as util from '../util';

export default util.createRule({
  name: 'require-array-sort-compare',
  defaultOptions: [],

  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce giving `compare` argument to `Array#sort`',
      category: 'Best Practices',
      recommended: false
    },
    messages: {
      requireCompare: "Require 'compare' argument."
    },
    schema: []
  },

  create(context) {
    const service = util.getParserServices(context);
    const checker = service.program.getTypeChecker();

    return {
      CallExpression(node: TSESTree.CallExpression) {
        // Skip if this is not a call of `sort` method or giving arguments.
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.computed ||
          node.callee.property.type !== 'Identifier' ||
          node.callee.property.name !== 'sort' ||
          node.arguments.length >= 1
        ) {
          return;
        }

        // Get the symbol of the `sort` method.
        const tsNode = service.esTreeNodeToTSNodeMap.get(node.callee);
        const sortSymbol = checker.getSymbolAtLocation(tsNode);
        if (sortSymbol == null) {
          return;
        }

        // Check the owner type of the `sort` method.
        for (const methodDecl of sortSymbol.declarations) {
          const typeDecl = methodDecl.parent;
          if (
            ts.isInterfaceDeclaration(typeDecl) &&
            ts.isSourceFile(typeDecl.parent) &&
            typeDecl.name.escapedText === 'Array'
          ) {
            context.report({ node, messageId: 'requireCompare' });
            return;
          }
        }
      }
    };
  }
});
