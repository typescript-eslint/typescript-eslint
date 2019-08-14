import { TSESTree } from '@typescript-eslint/experimental-utils';
import ts from 'typescript';
import * as util from '../util';

export default util.createRule({
  name: 'require-array-sort-compare',
  defaultOptions: [],

  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce giving `compare` argument to `Array#sort`',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      requireCompare: "Require 'compare' argument.",
    },
    schema: [],
  },

  create(context) {
    const service = util.getParserServices(context);
    const checker = service.program.getTypeChecker();

    return {
      "CallExpression[arguments.length=0] > MemberExpression[property.name='sort'][computed=false]"(
        node: TSESTree.MemberExpression,
      ): void {
        // Get the symbol of the `sort` method.
        const tsNode = service.esTreeNodeToTSNodeMap.get(node);
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
            context.report({ node: node.parent!, messageId: 'requireCompare' });
            return;
          }
        }
      },
    };
  },
});
