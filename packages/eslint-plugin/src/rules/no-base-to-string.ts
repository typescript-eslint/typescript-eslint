/* eslint-disable @typescript-eslint/internal/prefer-ast-types-enum */
import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  getTypeName,
  nullThrows,
} from '../util';

enum Usefulness {
  Always = 'always',
  Never = 'will',
  Sometimes = 'may',
}

type Options = [
  {
    ignoredTypeNames?: string[];
  },
];
type MessageIds = 'baseArrayJoin' | 'baseToString';

export default createRule<Options, MessageIds>({
  name: 'no-base-to-string',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require `.toString()` and `.toLocaleString()` to only be called on objects which provide useful information when stringified',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      baseArrayJoin:
        "Using `join()` for {{name}} {{certainty}} use Object's default stringification format ('[object Object]') when stringified.",
      baseToString:
        "'{{name}}' {{certainty}} use Object's default stringification format ('[object Object]') when stringified.",
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          ignoredTypeNames: {
            type: 'array',
            description:
              'Stringified regular expressions of type names to ignore.',
            items: {
              type: 'string',
            },
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      ignoredTypeNames: ['Error', 'RegExp', 'URL', 'URLSearchParams'],
    },
  ],
  create(context, [option]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const ignoredTypeNames = option.ignoredTypeNames ?? [];

    function checkExpression(node: TSESTree.Node, type?: ts.Type): void {
      if (node.type === AST_NODE_TYPES.Literal) {
        return;
      }
      const certainty = collectToStringCertainty(
        type ?? services.getTypeAtLocation(node),
      );
      if (certainty === Usefulness.Always) {
        return;
      }

      context.report({
        node,
        messageId: 'baseToString',
        data: {
          name: context.sourceCode.getText(node),
          certainty,
        },
      });
    }

    function checkExpressionForArrayJoin(
      node: TSESTree.Node,
      type: ts.Type,
    ): void {
      const certainty = collectArrayToStringCertainty(type);

      if (certainty === Usefulness.Always) {
        return;
      }

      context.report({
        node,
        messageId: 'baseArrayJoin',
        data: {
          name: context.sourceCode.getText(node),
          certainty,
        },
      });
    }

    function collectUnionTypeCertainty(
      type: ts.UnionType,
      collectSubTypeCertainty: (type: ts.Type) => Usefulness,
    ): Usefulness {
      const certainties = type.types.map(t => collectSubTypeCertainty(t));
      if (certainties.every(certainty => certainty === Usefulness.Never)) {
        return Usefulness.Never;
      }

      if (certainties.every(certainty => certainty === Usefulness.Always)) {
        return Usefulness.Always;
      }

      return Usefulness.Sometimes;
    }

    function collectIntersectionTypeCertainty(
      type: ts.IntersectionType,
      collectSubTypeCertainty: (type: ts.Type) => Usefulness,
    ): Usefulness {
      for (const subType of type.types) {
        const subtypeUsefulness = collectSubTypeCertainty(subType);

        if (subtypeUsefulness === Usefulness.Always) {
          return Usefulness.Always;
        }
      }

      return Usefulness.Never;
    }

    function collectArrayToStringCertainty(type: ts.Type): Usefulness {
      if (tsutils.isUnionType(type)) {
        return collectUnionTypeCertainty(type, collectArrayToStringCertainty);
      }

      if (tsutils.isIntersectionType(type)) {
        return collectIntersectionTypeCertainty(
          type,
          collectArrayToStringCertainty,
        );
      }

      if (checker.isTupleType(type)) {
        const typeArgs = checker.getTypeArguments(type);
        const certainties = typeArgs.map(t => collectToStringCertainty(t));
        if (certainties.some(certainty => certainty === Usefulness.Never)) {
          return Usefulness.Never;
        }

        if (certainties.some(certainty => certainty === Usefulness.Sometimes)) {
          return Usefulness.Sometimes;
        }

        return Usefulness.Always;
      }

      if (checker.isArrayType(type)) {
        const elemType = nullThrows(
          type.getNumberIndexType(),
          'array should have number index type',
        );
        return collectToStringCertainty(elemType);
      }

      return Usefulness.Always;
    }

    function collectToStringCertainty(type: ts.Type): Usefulness {
      const toString =
        checker.getPropertyOfType(type, 'toString') ??
        checker.getPropertyOfType(type, 'toLocaleString');
      const declarations = toString?.getDeclarations();
      if (!toString || !declarations || declarations.length === 0) {
        return Usefulness.Always;
      }

      if (checker.isArrayType(type) || checker.isTupleType(type)) {
        return collectArrayToStringCertainty(type);
      }

      // Patch for old version TypeScript, the Boolean type definition missing toString()
      if (
        type.flags & ts.TypeFlags.Boolean ||
        type.flags & ts.TypeFlags.BooleanLiteral
      ) {
        return Usefulness.Always;
      }

      if (ignoredTypeNames.includes(getTypeName(checker, type))) {
        return Usefulness.Always;
      }

      if (
        declarations.every(
          ({ parent }) =>
            !ts.isInterfaceDeclaration(parent) ||
            (parent.name.text !== 'Object' && parent.name.text !== 'Array'),
        )
      ) {
        return Usefulness.Always;
      }

      if (type.isIntersection()) {
        return collectIntersectionTypeCertainty(type, collectToStringCertainty);
      }

      if (!type.isUnion()) {
        return Usefulness.Never;
      }
      return collectUnionTypeCertainty(type, collectToStringCertainty);
    }

    function isBuiltInStringCall(node: TSESTree.CallExpression): boolean {
      if (
        node.callee.type === AST_NODE_TYPES.Identifier &&
        node.callee.name === 'String' &&
        node.arguments[0]
      ) {
        const scope = context.sourceCode.getScope(node);
        const variable = scope.set.get('String');
        return !variable?.defs.length;
      }
      return false;
    }

    return {
      'AssignmentExpression[operator = "+="], BinaryExpression[operator = "+"]'(
        node: TSESTree.AssignmentExpression | TSESTree.BinaryExpression,
      ): void {
        const leftType = services.getTypeAtLocation(node.left);
        const rightType = services.getTypeAtLocation(node.right);

        if (getTypeName(checker, leftType) === 'string') {
          checkExpression(node.right, rightType);
        } else if (
          getTypeName(checker, rightType) === 'string' &&
          node.left.type !== AST_NODE_TYPES.PrivateIdentifier
        ) {
          checkExpression(node.left, leftType);
        }
      },
      CallExpression(node: TSESTree.CallExpression): void {
        if (isBuiltInStringCall(node)) {
          checkExpression(node.arguments[0]);
        }
      },
      'CallExpression > MemberExpression.callee > Identifier[name = "join"].property'(
        node: TSESTree.Expression,
      ): void {
        const memberExpr = node.parent as TSESTree.MemberExpression;
        const type = getConstrainedTypeAtLocation(services, memberExpr.object);
        checkExpressionForArrayJoin(memberExpr.object, type);
      },
      'CallExpression > MemberExpression.callee > Identifier[name = /^(toLocaleString|toString)$/].property'(
        node: TSESTree.Expression,
      ): void {
        const memberExpr = node.parent as TSESTree.MemberExpression;
        checkExpression(memberExpr.object);
      },

      TemplateLiteral(node: TSESTree.TemplateLiteral): void {
        if (node.parent.type === AST_NODE_TYPES.TaggedTemplateExpression) {
          return;
        }
        for (const expression of node.expressions) {
          checkExpression(expression);
        }
      },
    };
  },
});
