import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as ts from 'typescript';

import { createRule, getParserServices, getTypeName } from '../util';
import { isArrayType } from '../util/isArrayType';

enum Usefulness {
  Always = 'always',
  Never = 'will',
  Sometimes = 'may',
}

export type Options = [
  {
    ignoredTypeNames?: string[];
  },
];
export type MessageIds = 'baseToString';

export default createRule<Options, MessageIds>({
  name: 'no-base-to-string',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require `.toString()` to only be called on objects which provide useful information when stringified',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
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

    function checkExpression(node: TSESTree.Expression, type?: ts.Type): void {
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

    function collectToStringCertainty(type: ts.Type): Usefulness {
      if (checker.isArrayType(type) || checker.isTupleType(type)) {
        const types = checker.getTypeArguments(type);

        for (const subType of types) {
          const subtypeUsefulness = collectToStringCertainty(subType);

          if (subtypeUsefulness !== Usefulness.Always) {
            return subtypeUsefulness;
          }
        }

        return Usefulness.Always;
      }

      const toString = checker.getPropertyOfType(type, 'toString');
      const declarations = toString?.getDeclarations();
      if (!toString || !declarations || declarations.length === 0) {
        return Usefulness.Always;
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
        for (const subType of type.types) {
          const subtypeUsefulness = collectToStringCertainty(subType);

          if (subtypeUsefulness === Usefulness.Always) {
            return Usefulness.Always;
          }
        }

        return Usefulness.Never;
      }

      if (!type.isUnion()) {
        return Usefulness.Never;
      }

      let allSubtypesUseful = true;
      let someSubtypeUseful = false;

      for (const subType of type.types) {
        const subtypeUsefulness = collectToStringCertainty(subType);

        if (subtypeUsefulness !== Usefulness.Always && allSubtypesUseful) {
          allSubtypesUseful = false;
        }

        if (subtypeUsefulness !== Usefulness.Never && !someSubtypeUseful) {
          someSubtypeUseful = true;
        }
      }

      if (allSubtypesUseful && someSubtypeUseful) {
        return Usefulness.Always;
      }

      if (someSubtypeUseful) {
        return Usefulness.Sometimes;
      }

      return Usefulness.Never;
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
      'CallExpression > MemberExpression.callee > Identifier[name = "join"].property'(
        node: TSESTree.Expression,
      ): void {
        const memberExpr = node.parent as TSESTree.MemberExpression;
        const maybeArrayType = services.getTypeAtLocation(memberExpr.object);

        if (!isArrayType(checker, maybeArrayType)) {
          return;
        }

        checkExpression(
          memberExpr.parent as TSESTree.CallExpression,
          maybeArrayType,
        );
      },
      'CallExpression > MemberExpression.callee > Identifier[name = "toString"].property'(
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
