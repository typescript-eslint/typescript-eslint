import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'tsutils';
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
    const sourceCode = context.getSourceCode();

    function getName(node: TSESTree.Node): string | undefined {
      switch (node.type) {
        case AST_NODE_TYPES.Identifier:
          return node.name;
        case AST_NODE_TYPES.MemberExpression:
          return getName(node.property);
        default:
          return undefined;
      }
    }

    function getFullName(node: TSESTree.Node): string {
      const name = sourceCode.text.slice(node.range[0], node.range[1]);
      switch (node.type) {
        case AST_NODE_TYPES.AssignmentExpression:
        case AST_NODE_TYPES.AwaitExpression:
        case AST_NODE_TYPES.BinaryExpression:
        case AST_NODE_TYPES.ConditionalExpression:
        case AST_NODE_TYPES.SequenceExpression:
        case AST_NODE_TYPES.LogicalExpression:
        case AST_NODE_TYPES.TSAsExpression:
          return `(${name})`;
        default:
          return name;
      }
    }

    function hasCallExpression(node: TSESTree.MemberExpression): boolean {
      return node.object.type === AST_NODE_TYPES.CallExpression;
    }

    function getTypeAtLocation(node: TSESTree.Node): ts.Type {
      return checker.getTypeAtLocation(
        parserServices.esTreeNodeToTSNodeMap.get(node),
      );
    }

    const supportedObjects = new Set<string | undefined>([
      // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
      'String',
      'Array',
      'Int8Array',
      'Uint8Array',
      'Uint8ClampedArray',
      'Int16Array',
      'Uint16Array',
      'Int32Array',
      'Float32Array',
      'Uint32Array',
      'Float64Array',
      'BigInt64Array',
      'BigUint64Array',
    ]);

    function isSupportedObject(type: ts.Type): boolean {
      return (
        supportedObjects.has(type.getSymbol()?.name) ||
        tsutils.isTypeFlagSet(type, ts.TypeFlags.String)
      );
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
      if (!isSupportedObject(type)) {
        return false;
      }
      const atMember = type.getProperty('at');
      return Boolean(atMember);
    }

    function isExpectedExpressionLeft(
      node: TSESTree.BinaryExpression,
    ): boolean {
      if (!isExpectedObject(node.left) || getName(node.left) !== 'length') {
        return false;
      }
      const type = getTypeAtLocation(node.left);
      return tsutils.isTypeFlagSet(type, ts.TypeFlags.NumberLike);
    }

    function isExpectedExpressionRight(
      node: TSESTree.BinaryExpression,
    ): boolean {
      const type = getTypeAtLocation(node.right);
      return tsutils.isTypeFlagSet(type, ts.TypeFlags.NumberLike);
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
        if (!isExpectedExpression(node.property)) {
          return;
        }
        const objectName = getFullName(node.object);
        const memberName = getFullName(node.property.left.object);
        const rightName = getFullName(node.property.right);
        if (objectName !== memberName) {
          return;
        }
        context.report({
          messageId: 'preferAt',
          data: {
            name: objectName,
          },
          node,
          fix: fixer =>
            fixer.replaceText(node, `${objectName}.at(-${rightName})`),
        });
      },
    };
  },
});
