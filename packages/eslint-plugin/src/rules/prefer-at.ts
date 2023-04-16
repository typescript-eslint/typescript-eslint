import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as path from 'path';
import * as ts from 'typescript';

import * as util from '../util';

export default util.createRule({
  name: 'prefer-at',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Enforce the use of `array.at(-1)` instead of `array[array.length - 1]`',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      preferAt:
        'Expected a `{{name}}.at(-1)` instead of `{{name}}[{{name}}.length - 1]`.',
    },
    schema: [
      {
        oneOf: [
          {
            type: 'object',
            properties: {
              ignoreFunctions: {
                type: 'boolean',
              },
            },
            additionalProperties: false,
          },
        ],
      },
    ],
  },
  defaultOptions: [
    {
      ignoreFunctions: false,
    },
  ],
  create(context, [options]) {
    const parserServices = util.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    class UnknownNodeError extends Error {
      public constructor(node: TSESTree.Node) {
        super(`UnknownNode ${node.type}`);
      }
    }

    function getName(node: TSESTree.Node): string {
      switch (node.type) {
        case AST_NODE_TYPES.Identifier:
          return node.name;
        case AST_NODE_TYPES.MemberExpression:
          return getName(node.property);
        default:
          throw new UnknownNodeError(node);
      }
    }

    function getFullName(node: TSESTree.Node): string {
      switch (node.type) {
        case AST_NODE_TYPES.PrivateIdentifier:
          return `#${node.name}`;
        case AST_NODE_TYPES.Identifier:
          return node.name;
        case AST_NODE_TYPES.Literal:
          return node.raw;
        case AST_NODE_TYPES.ThisExpression:
          return 'this';
        case AST_NODE_TYPES.CallExpression:
          return `${getFullName(node.callee)}()`;
        case AST_NODE_TYPES.MemberExpression:
          if (node.property.type === AST_NODE_TYPES.Literal) {
            return `${getFullName(node.object)}[${node.property.raw}]`;
          }
          return `${getFullName(node.object)}.${getFullName(node.property)}`;
        default:
          throw new UnknownNodeError(node);
      }
    }

    function hasCallExpression(node: TSESTree.MemberExpression): boolean {
      return (
        node.object.type === AST_NODE_TYPES.CallExpression ||
        (node.object.type === AST_NODE_TYPES.MemberExpression &&
          hasCallExpression(node.object))
      );
    }

    function getTypeAtLocation(node: TSESTree.Node): ts.Type | undefined {
      const originalNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      if (!originalNode) {
        return undefined;
      }
      return checker.getTypeAtLocation(originalNode);
    }

    type SupportedObject = (type: ts.Type) => boolean;

    function checkObjectName(name: string): SupportedObject {
      return type => type.getSymbol()?.name === name;
    }

    function checkObjectType(flags: ts.TypeFlags): SupportedObject {
      return type => type.getFlags() === flags;
    }

    const supporterObjects: Array<SupportedObject> = [
      checkObjectName('Array'),
      checkObjectName('Int8Array'),
      checkObjectName('Uint8Array'),
      checkObjectName('Uint8ClampedArray'),
      checkObjectName('Int16Array'),
      checkObjectName('Uint16Array'),
      checkObjectName('Int32Array'),
      checkObjectName('Float32Array'),
      checkObjectName('Uint32Array'),
      checkObjectName('Float64Array'),
      checkObjectName('BigInt64Array'),
      checkObjectName('BigUint64Array'),
      // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
      checkObjectName('String'),
      checkObjectType(ts.TypeFlags.String),
    ];

    function isSupportedObject(type: ts.Type): boolean {
      return supporterObjects.some(check => check(type));
    }

    function isExpectedObject(
      node: TSESTree.Node,
    ): node is TSESTree.MemberExpression {
      if (
        node.type !== AST_NODE_TYPES.MemberExpression ||
        (options.ignoreFunctions && hasCallExpression(node))
      ) {
        return false;
      }
      const type = getTypeAtLocation(node.object);
      if (type && !isSupportedObject(type)) {
        return false;
      }
      const atMember = type?.getProperty('at');
      return (
        atMember?.declarations?.every(declaration => {
          const sourceFile = declaration.getSourceFile();
          const directory = path.join(sourceFile.fileName, '../');
          return directory.endsWith(path.join('node_modules/typescript/lib/'));
        }) ?? false
      );
    }

    function isExpectedExpressionLeft(
      node: TSESTree.BinaryExpression,
    ): boolean {
      if (!isExpectedObject(node.left) || getName(node.left) !== 'length') {
        return false;
      }
      const type = getTypeAtLocation(node.left);
      return type?.getFlags() === ts.TypeFlags.Number;
    }

    function isExpectedExpressionRight(
      node: TSESTree.BinaryExpression,
    ): boolean {
      const type = getTypeAtLocation(node.right);
      return (
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        type?.isNumberLiteral() || type?.getFlags() === ts.TypeFlags.Number
      );
    }

    function isExpectedExpression<T extends TSESTree.BinaryExpression>(
      node: T,
    ): node is T & { left: TSESTree.MemberExpression } {
      return isExpectedExpressionRight(node) && isExpectedExpressionLeft(node);
    }

    return {
      'MemberExpression[property.type="BinaryExpression"][property.operator="-"]'(
        node: TSESTree.MemberExpressionComputedName & {
          property: TSESTree.BinaryExpression & { operator: '-' };
        },
      ): void {
        try {
          if (!isExpectedExpression(node.property)) {
            return;
          }
          const objectName = getFullName(node.object);
          const memberName = getFullName(node.property.left.object);
          if (objectName !== memberName) {
            return;
          }
          const rightName = getFullName(node.property.right);
          context.report({
            messageId: 'preferAt',
            data: {
              name: objectName,
            },
            node,
            fix: fixer =>
              fixer.replaceText(node, `${objectName}.at(-${rightName})`),
          });
        } catch (error) {
          if (error instanceof UnknownNodeError) {
            return;
          }
          throw error;
        }
      },
    };
  },
});
