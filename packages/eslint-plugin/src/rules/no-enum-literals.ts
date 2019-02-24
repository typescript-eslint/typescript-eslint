import ts from 'typescript';
import * as util from '../util';
import { TSESTree } from '@typescript-eslint/typescript-estree';

export default util.createRule({
  name: 'no-enum-literals',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallows usage of literals instead of enums',
      category: 'Best Practices',
      recommended: 'error',
    },
    messages: {
      noLiterals: 'Do not use literal values instead of enums',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    /**
     * is node an identifier with type of an enum
     * @param node identifier node
     */
    function isNodeEnumIdentifier(node: TSESTree.Node): boolean {
      const originalNode = parserServices.esTreeNodeToTSNodeMap.get<
        ts.Identifier
      >(node);
      const type = checker.getTypeAtLocation(originalNode);

      if (!type.symbol) {
        return false;
      }

      const { name } = type.symbol;

      return !['Number', 'String'].includes(name);
    }

    function isNumberOrStringLiteral(
      node: TSESTree.Node,
    ): node is TSESTree.Literal {
      return (
        node.type === 'Literal' &&
        ['number', 'string'].includes(typeof node.value)
      );
    }

    return {
      AssignmentExpression(node) {
        if (
          isNodeEnumIdentifier(node.left) &&
          isNumberOrStringLiteral(node.right)
        ) {
          context.report({
            node: node.right,
            messageId: 'noLiterals',
          });
        }
      },
      BinaryExpression(node) {
        if (
          isNodeEnumIdentifier(node.left) &&
          isNumberOrStringLiteral(node.right)
        ) {
          context.report({
            node: node.right,
            messageId: 'noLiterals',
          });
        }

        if (
          isNumberOrStringLiteral(node.left) &&
          isNodeEnumIdentifier(node.right)
        ) {
          context.report({
            node: node.left,
            messageId: 'noLiterals',
          });
        }
      },
      VariableDeclarator(node) {
        if (
          isNodeEnumIdentifier(node.id) &&
          node.init &&
          isNumberOrStringLiteral(node.init)
        ) {
          context.report({
            node: node.init,
            messageId: 'noLiterals',
          });
        }
      },
    };
  },
});
