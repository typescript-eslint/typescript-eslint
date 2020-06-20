import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';

import * as util from '../util';

enum Usefulness {
  Always,
  Never = 'will',
  Sometimes = 'may',
}

type Options = [
  {
    ignoredTypeNames?: string[];
  },
];
type MessageIds = 'baseToString';

export default util.createRule<Options, MessageIds>({
  name: 'no-base-to-string',
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
        "'{{name}} {{certainty}} evaluate to '[object Object]' when stringified.",
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoredTypeNames: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'suggestion',
  },
  defaultOptions: [
    {
      ignoredTypeNames: ['RegExp'],
    },
  ],
  create(context, [option]) {
    const parserServices = util.getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();
    const ignoredTypeNames = option.ignoredTypeNames ?? [];

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

      if (ignoredTypeNames.includes(util.getTypeName(typeChecker, type))) {
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

    return {
      'AssignmentExpression[operator = "+="], BinaryExpression[operator = "+"]'(
        node: TSESTree.AssignmentExpression | TSESTree.BinaryExpression,
      ): void {
        const leftType = typeChecker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(node.left),
        );
        const rightType = typeChecker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(node.right),
        );

        if (util.getTypeName(typeChecker, leftType) === 'string') {
          checkExpression(node.right, rightType);
        } else if (util.getTypeName(typeChecker, rightType) === 'string') {
          checkExpression(node.left, leftType);
        }
      },
      'CallExpression > MemberExpression.callee > Identifier[name = "toString"].property'(
        node: TSESTree.Expression,
      ): void {
        const memberExpr = node.parent as TSESTree.MemberExpression;
        checkExpression(memberExpr.object);
      },
      TemplateLiteral(node: TSESTree.TemplateLiteral): void {
        if (
          node.parent &&
          node.parent.type === AST_NODE_TYPES.TaggedTemplateExpression
        ) {
          return;
        }
        for (const expression of node.expressions) {
          checkExpression(expression);
        }
      },
    };
  },
});
