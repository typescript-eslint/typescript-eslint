/* eslint-disable @typescript-eslint/internal/prefer-ast-types-enum */
import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import { createRule, getParserServices, getTypeName } from '../util';

enum Usefulness {
  Always = 'always',
  Never = 'will',
  Sometimes = 'may',
}

type Options = [
  {
    checkArrayJoin?: boolean;
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
        "Using `join()` for {{name}} use Object's default stringification format ('[object Object]') when stringified.",
      baseToString:
        "'{{name}}' {{certainty}} use Object's default stringification format ('[object Object]') when stringified.",
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          checkArrayJoin: {
            type: 'boolean',
            description:
              'Whether to check for arrays that are stringified by `Array.prototype.join`.',
          },
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
      checkArrayJoin: false,
      ignoredTypeNames: ['Error', 'RegExp', 'URL', 'URLSearchParams'],
    },
  ],
  create(context, [option]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const ignoredTypeNames = option.ignoredTypeNames ?? [];
    const checkArrayJoin = option.checkArrayJoin ?? false;

    function getToStringCertainty(
      node: TSESTree.Node,
      type?: ts.Type,
    ): Usefulness {
      if (node.type === AST_NODE_TYPES.Literal) {
        return Usefulness.Always;
      }

      const certainty = collectToStringCertainty(
        type ?? services.getTypeAtLocation(node),
      );
      return certainty;
    }

    function checkExpression(
      node: TSESTree.Node,
      type?: ts.Type,
      messageId: MessageIds = 'baseToString',
    ): void {
      const certainty = getToStringCertainty(node, type);
      if (certainty === Usefulness.Always) {
        return;
      }

      context.report({
        node,
        messageId,
        data: {
          name: context.sourceCode.getText(node),
          certainty,
        },
      });
    }

    function collectToStringCertainty(type: ts.Type): Usefulness {
      const toString =
        checker.getPropertyOfType(type, 'toString') ??
        checker.getPropertyOfType(type, 'toLocaleString');
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
            !ts.isInterfaceDeclaration(parent) || parent.name.text !== 'Object',
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
      ...(checkArrayJoin
        ? {
            'CallExpression > MemberExpression.callee > Identifier[name = "join"].property'(
              node: TSESTree.Expression,
            ): void {
              const memberExpr = node.parent as TSESTree.MemberExpression;
              const type = services.getTypeAtLocation(memberExpr.object);
              const typeParts = tsutils.typeParts(type);
              const isArrayOrTuple = typeParts.every(
                part => checker.isArrayType(part) || checker.isTupleType(part),
              );
              if (!isArrayOrTuple) {
                return;
              }

              const typeArg = type.getNumberIndexType();
              checkExpression(memberExpr.object, typeArg, 'baseArrayJoin');
            },
          }
        : undefined),
    };
  },
});
