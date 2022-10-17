import type { TSESTree } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import * as util from '../util';

const SyntaxKind = ts.SyntaxKind;

export default util.createRule({
  name: 'no-unsafe-declaration-merging',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unsafe declaration merging',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      unsafeMerging:
        'Unsafe declaration merging between classes and interfaces.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    function checkUnsafeDeclaration(
      node: TSESTree.Identifier,
      unsafeKind: ts.SyntaxKind,
    ): void {
      if (node.parent) {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const type = checker.getTypeAtLocation(tsNode);
        const symbol = type.getSymbol();
        if (symbol?.declarations?.some(decl => decl.kind === unsafeKind)) {
          context.report({
            node: node.parent,
            messageId: 'unsafeMerging',
          });
        }
      }
    }

    return {
      ClassDeclaration(node): void {
        if (node.id) {
          checkUnsafeDeclaration(node.id, SyntaxKind.InterfaceDeclaration);
        }
      },
      TSInterfaceDeclaration(node): void {
        checkUnsafeDeclaration(node.id, SyntaxKind.ClassDeclaration);
      },
    };
  },
});
