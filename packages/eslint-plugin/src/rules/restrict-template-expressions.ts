import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import * as util from '../util';

type Options = [
  {
    allowNullable?: boolean;
    allowNumber?: boolean;
    allowBoolean?: boolean;
  },
];

type MessageId = 'invalidType';

export default util.createRule<Options, MessageId>({
  name: 'restrict-template-expressions',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce template literal expressions to be of string type',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      invalidType: 'Invalid type of template literal expression.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowBoolean: { type: 'boolean' },
          allowNullable: { type: 'boolean' },
          allowNumber: { type: 'boolean' },
        },
      },
    ],
  },
  defaultOptions: [{}],
  create(context, [options]) {
    const service = util.getParserServices(context);
    const typeChecker = service.program.getTypeChecker();

    type BaseType =
      | 'string'
      | 'number'
      | 'bigint'
      | 'boolean'
      | 'null'
      | 'undefined'
      | 'other';

    const allowedTypes: BaseType[] = [
      'string',
      ...(options.allowNumber ? (['number', 'bigint'] as const) : []),
      ...(options.allowBoolean ? (['boolean'] as const) : []),
      ...(options.allowNullable ? (['null', 'undefined'] as const) : []),
    ];

    function isAllowedType(types: BaseType[]): boolean {
      for (const type of types) {
        if (!allowedTypes.includes(type)) {
          return false;
        }
      }
      return true;
    }

    return {
      TemplateLiteral(node: TSESTree.TemplateLiteral): void {
        // don't check tagged template literals
        if (node.parent!.type === AST_NODE_TYPES.TaggedTemplateExpression) {
          return;
        }

        for (const expr of node.expressions) {
          const type = getNodeType(expr);
          if (!isAllowedType(type)) {
            context.report({
              node: expr,
              messageId: 'invalidType',
            });
          }
        }
      },
    };

    /**
     * Helper function to get base type of node
     * @param node the node to be evaluated.
     */
    function getNodeType(node: TSESTree.Node): BaseType[] {
      const tsNode = service.esTreeNodeToTSNodeMap.get(node);
      const type = typeChecker.getTypeAtLocation(tsNode);

      return getBaseType(type);
    }

    function getBaseType(type: ts.Type): BaseType[] {
      const constraint = type.getConstraint();
      if (
        constraint &&
        // for generic types with union constraints, it will return itself
        constraint !== type
      ) {
        return getBaseType(constraint);
      }

      if (type.isStringLiteral()) {
        return ['string'];
      }
      if (type.isNumberLiteral()) {
        return ['number'];
      }
      if (type.flags & ts.TypeFlags.BigIntLiteral) {
        return ['bigint'];
      }
      if (type.flags & ts.TypeFlags.BooleanLiteral) {
        return ['boolean'];
      }
      if (type.flags & ts.TypeFlags.Null) {
        return ['null'];
      }
      if (type.flags & ts.TypeFlags.Undefined) {
        return ['undefined'];
      }

      if (type.isUnion()) {
        return type.types
          .map(getBaseType)
          .reduce((all, array) => [...all, ...array], []);
      }

      const stringType = typeChecker.typeToString(type);
      if (
        stringType === 'string' ||
        stringType === 'number' ||
        stringType === 'bigint' ||
        stringType === 'boolean'
      ) {
        return [stringType];
      }

      return ['other'];
    }
  },
});
