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

export type Options = [
  {
    ignoredTypeNames?: string[];
    checkUnknown?: boolean;
  },
];
export type MessageIds = 'baseArrayJoin' | 'baseToString';

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
          checkUnknown: {
            type: 'boolean',
            description: 'Whether to also check values of type `unknown`',
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
      checkUnknown: false,
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
        new Set(),
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
      const certainty = collectJoinCertainty(type, new Set());

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

    function collectTupleCertainty(
      type: ts.TypeReference,
      visited: Set<ts.Type>,
    ): Usefulness {
      const typeArgs = checker.getTypeArguments(type);
      const certainties = typeArgs.map(t =>
        collectToStringCertainty(t, visited),
      );
      if (certainties.some(certainty => certainty === Usefulness.Never)) {
        return Usefulness.Never;
      }

      if (certainties.some(certainty => certainty === Usefulness.Sometimes)) {
        return Usefulness.Sometimes;
      }

      return Usefulness.Always;
    }

    function collectArrayCertainty(
      type: ts.Type,
      visited: Set<ts.Type>,
    ): Usefulness {
      const elemType = nullThrows(
        type.getNumberIndexType(),
        'array should have number index type',
      );
      return collectToStringCertainty(elemType, visited);
    }

    function collectJoinCertainty(
      type: ts.Type,
      visited: Set<ts.Type>,
    ): Usefulness {
      if (tsutils.isUnionType(type)) {
        return collectUnionTypeCertainty(type, t =>
          collectJoinCertainty(t, visited),
        );
      }

      if (tsutils.isIntersectionType(type)) {
        return collectIntersectionTypeCertainty(type, t =>
          collectJoinCertainty(t, visited),
        );
      }

      if (checker.isTupleType(type)) {
        return collectTupleCertainty(type, visited);
      }

      if (checker.isArrayType(type)) {
        return collectArrayCertainty(type, visited);
      }

      return Usefulness.Always;
    }

    function collectToStringCertainty(
      type: ts.Type,
      visited: Set<ts.Type>,
    ): Usefulness {
      if (visited.has(type)) {
        // don't report if this is a self referencing array or tuple type
        return Usefulness.Always;
      }

      if (tsutils.isTypeParameter(type)) {
        const constraint = type.getConstraint();
        if (constraint) {
          return collectToStringCertainty(constraint, visited);
        }
        // unconstrained generic means `unknown`
        return option.checkUnknown ? Usefulness.Sometimes : Usefulness.Always;
      }

      // the Boolean type definition missing toString()
      if (
        type.flags & ts.TypeFlags.Boolean ||
        type.flags & ts.TypeFlags.BooleanLiteral
      ) {
        return Usefulness.Always;
      }

      if (ignoredTypeNames.includes(getTypeName(checker, type))) {
        return Usefulness.Always;
      }

      if (type.isIntersection()) {
        return collectIntersectionTypeCertainty(type, t =>
          collectToStringCertainty(t, visited),
        );
      }

      if (type.isUnion()) {
        return collectUnionTypeCertainty(type, t =>
          collectToStringCertainty(t, visited),
        );
      }

      if (checker.isTupleType(type)) {
        return collectTupleCertainty(type, new Set([...visited, type]));
      }

      if (checker.isArrayType(type)) {
        return collectArrayCertainty(type, new Set([...visited, type]));
      }

      const toString =
        checker.getPropertyOfType(type, 'toString') ??
        checker.getPropertyOfType(type, 'toLocaleString');

      if (!toString) {
        // unknown
        if (option.checkUnknown && type.flags === ts.TypeFlags.Unknown) {
          return Usefulness.Sometimes;
        }
        // e.g. any
        return Usefulness.Always;
      }

      const declarations = toString.getDeclarations();

      if (declarations == null || declarations.length !== 1) {
        // If there are multiple declarations, at least one of them must not be
        // the default object toString.
        //
        // This may only matter for older versions of TS
        // see https://github.com/typescript-eslint/typescript-eslint/issues/8585
        return Usefulness.Always;
      }

      const declaration = declarations[0];
      const isBaseToString =
        ts.isInterfaceDeclaration(declaration.parent) &&
        declaration.parent.name.text === 'Object';
      return isBaseToString ? Usefulness.Never : Usefulness.Always;
    }

    function isBuiltInStringCall(node: TSESTree.CallExpression): boolean {
      if (
        node.callee.type === AST_NODE_TYPES.Identifier &&
        // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
        node.callee.name === 'String' &&
        node.arguments[0]
      ) {
        const scope = context.sourceCode.getScope(node);
        // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
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
        if (
          isBuiltInStringCall(node) &&
          node.arguments[0].type !== AST_NODE_TYPES.SpreadElement
        ) {
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
