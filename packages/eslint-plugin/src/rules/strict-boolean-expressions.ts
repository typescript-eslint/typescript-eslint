import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import * as tsutils from 'tsutils';
import * as util from '../util';

type Options = [
  {
    ignoreRhs?: boolean;
    allowNullable?: boolean;
    allowSafe?: boolean;
  },
];

type MessageId =
  | 'conditionErrorOther'
  | 'conditionErrorAny'
  | 'conditionErrorNullish'
  | 'conditionErrorNullableBoolean'
  | 'conditionErrorPrimitive'
  | 'conditionErrorNullablePrimitive'
  | 'conditionErrorObject'
  | 'conditionErrorNullableObject';

export default util.createRule<Options, MessageId>({
  name: 'strict-boolean-expressions',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Restricts the types allowed in boolean expressions',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreRhs: {
            type: 'boolean',
          },
          allowNullable: {
            type: 'boolean',
          },
          allowSafe: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      conditionErrorOther:
        'Unexpected value in conditional. ' +
        'A boolean expression is required.',
      conditionErrorAny:
        'Unexpected any value in conditional. ' +
        'An explicit comparison or type cast is required.',
      conditionErrorNullish:
        'Unexpected nullish value in conditional. ' +
        'The condition is always false.',
      conditionErrorNullableBoolean:
        'Unexpected nullable boolean value in conditional. ' +
        'Please handle the nullish case explicitly.',
      conditionErrorPrimitive:
        'Unexpected possibly falsy value in conditional. ' +
        'An explicit comparison is required.',
      conditionErrorNullablePrimitive:
        'Unexpected nullable, possibly falsy value in conditional. ' +
        'Please handle the nullish and falsy cases explicitly.',
      conditionErrorObject:
        'Unexpected object value in conditional. ' +
        'The condition is always true.',
      conditionErrorNullableObject:
        'Unexpected nullable object value in conditional. ' +
        'An explicit null check is required.',
    },
  },
  defaultOptions: [
    {
      ignoreRhs: false,
      allowNullable: false,
      allowSafe: false,
    },
  ],
  create(context, [options]) {
    const service = util.getParserServices(context);
    const checker = service.program.getTypeChecker();

    const checkedNodes = new WeakSet<TSESTree.Node>();

    return {
      ConditionalExpression: checkTestExpression,
      DoWhileStatement: checkTestExpression,
      ForStatement: checkTestExpression,
      IfStatement: checkTestExpression,
      WhileStatement: checkTestExpression,
      'LogicalExpression[operator!="??"]': checkBinaryLogicalExpression,
      'UnaryExpression[operator="!"]': checkUnaryLogicalExpression,
    };

    type ExpressionWithTest =
      | TSESTree.ConditionalExpression
      | TSESTree.DoWhileStatement
      | TSESTree.ForStatement
      | TSESTree.IfStatement
      | TSESTree.WhileStatement;

    function checkTestExpression(node: ExpressionWithTest): boolean {
      if (node.test == null) {
        return false;
      }

      if (node.test.type === AST_NODE_TYPES.LogicalExpression) {
        if (node.test.operator !== '??') {
          if (checkBinaryLogicalExpression(node.test)) {
            return true;
          }
        }
      }

      return checkNode(node.test);
    }

    function checkBinaryLogicalExpression(
      node: TSESTree.LogicalExpression,
    ): boolean {
      if (checkedNodes.has(node)) {
        return false;
      }
      checkedNodes.add(node);

      let hasError = false;
      if (checkNode(node.left)) {
        hasError = true;
      }
      if (!options.ignoreRhs) {
        if (checkNode(node.right)) {
          hasError = true;
        }
      }
      return hasError;
    }

    function checkUnaryLogicalExpression(node: TSESTree.UnaryExpression): void {
      checkNode(node.argument);
    }

    function checkNode(node: TSESTree.Node): boolean {
      const tsNode = service.esTreeNodeToTSNodeMap.get(node);
      const type = util.getConstrainedTypeAtLocation(checker, tsNode);
      let messageId: MessageId | undefined;

      const {
        isBoolean,
        hasBoolean,
        hasFalsyT,
        hasMixedT,
        hasTruthyT,
        hasAny,
      } = tsutils.isTypeFlagSet(type, ts.TypeFlags.Union)
        ? getConditionTypes((type as ts.UnionType).types)
        : getConditionTypes([type]);

      // boolean
      if (isBoolean) {
        // boolean is always okay
        return false;
      }
      // any or unknown
      else if (hasAny) {
        messageId = 'conditionErrorAny';
      }
      // undefined | null
      else if (!hasBoolean && hasFalsyT && !hasMixedT && !hasTruthyT) {
        messageId = 'conditionErrorNullish';
      }
      // boolean | undefined | null
      else if (hasBoolean && hasFalsyT && !hasMixedT && !hasTruthyT) {
        if (!options.allowNullable) {
          messageId = 'conditionErrorNullableBoolean';
        }
      }
      // string | number
      else if (!hasBoolean && !hasFalsyT && hasMixedT && !hasTruthyT) {
        messageId = 'conditionErrorPrimitive';
      }
      // string | number | undefined | null
      else if (!hasBoolean && hasFalsyT && hasMixedT && !hasTruthyT) {
        messageId = 'conditionErrorNullablePrimitive';
      }
      // object | function | boolean
      else if (hasBoolean && !hasFalsyT && !hasMixedT && hasTruthyT) {
        if (!options.allowSafe) {
          messageId = 'conditionErrorOther';
        }
      }
      // object | function | boolean | null | undefined
      else if (hasBoolean && hasFalsyT && !hasMixedT && hasTruthyT) {
        if (!options.allowSafe || !options.allowNullable) {
          messageId = 'conditionErrorOther';
        }
      }
      // object | function | undefined | null
      else if (!hasBoolean && hasFalsyT && !hasMixedT && hasTruthyT) {
        if (!options.allowSafe || !options.allowNullable) {
          messageId = 'conditionErrorNullableObject';
        }
      }
      // any other combination
      else {
        messageId = 'conditionErrorOther';
      }

      if (messageId != null) {
        context.report({ node, messageId });
        return true;
      }
      return false;
    }

    interface ConditionTypes {
      isBoolean: boolean;
      hasBoolean: boolean;
      hasFalsyT: boolean;
      hasMixedT: boolean;
      hasTruthyT: boolean;
      hasAny: boolean;
    }

    function getConditionTypes(types: ts.Type[]): ConditionTypes {
      return {
        isBoolean: types.every(type =>
          tsutils.isTypeFlagSet(type, ts.TypeFlags.BooleanLike),
        ),
        hasBoolean: types.some(type =>
          tsutils.isTypeFlagSet(type, ts.TypeFlags.BooleanLike),
        ),
        hasFalsyT: types.some(
          type =>
            tsutils.isTypeFlagSet(type, ts.TypeFlags.Null) ||
            tsutils.isTypeFlagSet(type, ts.TypeFlags.Undefined) ||
            tsutils.isTypeFlagSet(type, ts.TypeFlags.VoidLike),
        ),
        hasMixedT: types.some(
          type =>
            tsutils.isTypeFlagSet(type, ts.TypeFlags.StringLike) ||
            tsutils.isTypeFlagSet(type, ts.TypeFlags.NumberLike),
        ),
        hasTruthyT: types.some(
          type =>
            !tsutils.isTypeFlagSet(type, ts.TypeFlags.Null) &&
            !tsutils.isTypeFlagSet(type, ts.TypeFlags.Undefined) &&
            !tsutils.isTypeFlagSet(type, ts.TypeFlags.VoidLike) &&
            !tsutils.isTypeFlagSet(type, ts.TypeFlags.BooleanLike) &&
            !tsutils.isTypeFlagSet(type, ts.TypeFlags.StringLike) &&
            !tsutils.isTypeFlagSet(type, ts.TypeFlags.NumberLike) &&
            !tsutils.isTypeFlagSet(type, ts.TypeFlags.Any) &&
            !tsutils.isTypeFlagSet(type, ts.TypeFlags.Unknown),
        ),
        hasAny: types.every(
          type =>
            tsutils.isTypeFlagSet(type, ts.TypeFlags.Any) ||
            tsutils.isTypeFlagSet(type, ts.TypeFlags.Unknown),
        ),
      };
    }
  },
});
