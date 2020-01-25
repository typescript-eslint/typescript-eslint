import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';

import * as util from '../util';
import { getTypeName } from '../util';

type MessageIds = 'baseToString';

enum Usefulness {
  Always,
  Never = 'will',
  Sometimes = 'may',
}

export default util.createRule<[], MessageIds>({
  name: 'base-to-string',
  meta: {
    docs: {
      description:
        'Requires that `.toString()` is only called on objects which provide useful information when stringified',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      baseToString:
        "'{{name}} {{certainty}} evaluate to '[Object object]' when stringified.",
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();

    function checkExpression(node: TSESTree.Expression, type?: ts.Type): void {
      if (node.type === AST_NODE_TYPES.Literal) {
        return;
      }

      const certainty = collectToStringCertainty(
        type ??
          typeChecker.getTypeAtLocation(
            parserServices.esTreeNodeToTSNodeMap.get(node),
          ),
      );
      if (certainty === Usefulness.Always) {
        return;
      }

      context.report({
        data: {
          certainty,
          name: context.getSourceCode().getText(node),
        },
        messageId: 'baseToString',
        node,
      });
    }

    function collectToStringCertainty(type: ts.Type): Usefulness {
      const toString = typeChecker.getPropertyOfType(type, 'toString');
      if (toString === undefined || toString.declarations.length === 0) {
        return Usefulness.Always;
      }

      if (
        toString.declarations.every(
          ({ parent }) =>
            !ts.isInterfaceDeclaration(parent) || parent.name.text !== 'Object',
        )
      ) {
        return Usefulness.Always;
      }

      if (!type.isUnion()) {
        return Usefulness.Never;
      }

      for (const subType of type.types) {
        if (collectToStringCertainty(subType) !== Usefulness.Never) {
          return Usefulness.Sometimes;
        }
      }

      return Usefulness.Never;
    }

    return {
      BinaryExpression(node: TSESTree.BinaryExpression): void {
        const leftType = typeChecker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(node.left),
        );
        const rightType = typeChecker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(node.right),
        );

        if (getTypeName(typeChecker, leftType) === 'string') {
          checkExpression(node.right, rightType);
        } else if (getTypeName(typeChecker, rightType) === 'string') {
          checkExpression(node.left, leftType);
        }
      },

      CallExpression(node: TSESTree.CallExpression): void {
        const { callee } = node;
        if (callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        const { property } = callee;
        if (
          property.type !== AST_NODE_TYPES.Identifier ||
          property.name !== 'toString'
        ) {
          return;
        }

        checkExpression(callee.object);
      },

      TemplateLiteral(node: TSESTree.TemplateLiteral): void {
        for (const expression of node.expressions) {
          checkExpression(expression);
        }
      },
    };
  },
});
