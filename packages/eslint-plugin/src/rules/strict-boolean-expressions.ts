import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import * as tsutils from 'tsutils';
import * as util from '../util';

export type Options = [
  {
    allowString?: boolean;
    allowNumber?: boolean;
    allowNullableObject?: boolean;
    allowNullableBoolean?: boolean;
    allowNullableString?: boolean;
    allowNullableNumber?: boolean;
    allowAny?: boolean;
    allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
  },
];

export type MessageId =
  | 'conditionErrorOther'
  | 'conditionErrorAny'
  | 'conditionErrorNullish'
  | 'conditionErrorNullableBoolean'
  | 'conditionErrorString'
  | 'conditionErrorNullableString'
  | 'conditionErrorNumber'
  | 'conditionErrorNullableNumber'
  | 'conditionErrorObject'
  | 'conditionErrorNullableObject'
  | 'noStrictNullCheck';

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
          allowString: { type: 'boolean' },
          allowNumber: { type: 'boolean' },
          allowNullableObject: { type: 'boolean' },
          allowNullableBoolean: { type: 'boolean' },
          allowNullableString: { type: 'boolean' },
          allowNullableNumber: { type: 'boolean' },
          allowAny: { type: 'boolean' },
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: {
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
      conditionErrorString:
        'Unexpected string value in conditional. ' +
        'An explicit empty string check is required.',
      conditionErrorNullableString:
        'Unexpected nullable string value in conditional. ' +
        'Please handle the nullish/empty cases explicitly.',
      conditionErrorNumber:
        'Unexpected number value in conditional. ' +
        'An explicit zero/NaN check is required.',
      conditionErrorNullableNumber:
        'Unexpected nullable number value in conditional. ' +
        'Please handle the nullish/zero/NaN cases explicitly.',
      conditionErrorObject:
        'Unexpected object value in conditional. ' +
        'The condition is always true.',
      conditionErrorNullableObject:
        'Unexpected nullable object value in conditional. ' +
        'An explicit null check is required.',
      noStrictNullCheck:
        'This rule requires the `strictNullChecks` compiler option to be turned on to function correctly.',
    },
  },
  defaultOptions: [
    {
      allowString: true,
      allowNumber: true,
      allowNullableObject: true,
      allowNullableBoolean: false,
      allowNullableString: false,
      allowNullableNumber: false,
      allowAny: false,
      allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
    },
  ],
  create(context, [options]) {
    const service = util.getParserServices(context);
    const checker = service.program.getTypeChecker();
    const compilerOptions = service.program.getCompilerOptions();
    const isStrictNullChecks = tsutils.isStrictCompilerOptionEnabled(
      compilerOptions,
      'strictNullChecks',
    );

    if (
      !isStrictNullChecks &&
      options.allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing !== true
    ) {
      context.report({
        loc: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 0 },
        },
        messageId: 'noStrictNullCheck',
      });
    }

    const checkedNodes = new Set<TSESTree.Node>();

    return {
      ConditionalExpression: checkTestExpression,
      DoWhileStatement: checkTestExpression,
      ForStatement: checkTestExpression,
      IfStatement: checkTestExpression,
      WhileStatement: checkTestExpression,
      'LogicalExpression[operator!="??"]': checkNode,
      'UnaryExpression[operator="!"]': checkUnaryLogicalExpression,
    };

    type TestExpression =
      | TSESTree.ConditionalExpression
      | TSESTree.DoWhileStatement
      | TSESTree.ForStatement
      | TSESTree.IfStatement
      | TSESTree.WhileStatement;

    function checkTestExpression(node: TestExpression): void {
      if (node.test == null) {
        return;
      }
      checkNode(node.test, true);
    }

    function checkUnaryLogicalExpression(node: TSESTree.UnaryExpression): void {
      checkNode(node.argument, true);
    }

    /**
     * This function analyzes the type of a node and checks if it is allowed in a boolean context.
     * It can recurse when checking nested logical operators, so that only the outermost operands are reported.
     * The right operand of a logical expression is ignored unless it's a part of a test expression (if/while/ternary/etc).
     * @param node The AST node to check.
     * @param isTestExpr Whether the node is a descendant of a test expression.
     */
    function checkNode(node: TSESTree.Node, isTestExpr = false): void {
      // prevent checking the same node multiple times
      if (checkedNodes.has(node)) {
        return;
      }
      checkedNodes.add(node);

      // for logical operator, we check its operands
      if (
        node.type === AST_NODE_TYPES.LogicalExpression &&
        node.operator !== '??'
      ) {
        checkNode(node.left, isTestExpr);

        // we ignore the right operand when not in a context of a test expression
        if (isTestExpr) {
          checkNode(node.right, isTestExpr);
        }
        return;
      }

      const tsNode = service.esTreeNodeToTSNodeMap.get(node);
      const type = util.getConstrainedTypeAtLocation(checker, tsNode);
      const types = inspectVariantTypes(tsutils.unionTypeParts(type));

      const is = (...wantedTypes: readonly VariantType[]): boolean =>
        types.size === wantedTypes.length &&
        wantedTypes.every(type => types.has(type));

      // boolean
      if (is('boolean')) {
        // boolean is always okay
        return;
      }

      // never
      if (is('never')) {
        // never is always okay
        return;
      }

      // nullish
      if (is('nullish')) {
        // condition is always false
        context.report({ node, messageId: 'conditionErrorNullish' });
        return;
      }

      // nullable boolean
      if (is('nullish', 'boolean')) {
        if (!options.allowNullableBoolean) {
          context.report({ node, messageId: 'conditionErrorNullableBoolean' });
        }
        return;
      }

      // string
      if (is('string')) {
        if (!options.allowString) {
          context.report({ node, messageId: 'conditionErrorString' });
        }
        return;
      }

      // nullable string
      if (is('nullish', 'string')) {
        if (!options.allowNullableString) {
          context.report({ node, messageId: 'conditionErrorNullableString' });
        }
        return;
      }

      // number
      if (is('number')) {
        if (!options.allowNumber) {
          context.report({ node, messageId: 'conditionErrorNumber' });
        }
        return;
      }

      // nullable number
      if (is('nullish', 'number')) {
        if (!options.allowNullableNumber) {
          context.report({ node, messageId: 'conditionErrorNullableNumber' });
        }
        return;
      }

      // object
      if (is('object')) {
        // condition is always true
        context.report({ node, messageId: 'conditionErrorObject' });
        return;
      }

      // nullable object
      if (is('nullish', 'object')) {
        if (!options.allowNullableObject) {
          context.report({ node, messageId: 'conditionErrorNullableObject' });
        }
        return;
      }

      // any
      if (is('any')) {
        if (!options.allowAny) {
          context.report({ node, messageId: 'conditionErrorAny' });
        }
        return;
      }

      // other
      context.report({ node, messageId: 'conditionErrorOther' });
    }

    /** The types we care about */
    type VariantType =
      | 'nullish'
      | 'boolean'
      | 'string'
      | 'number'
      | 'object'
      | 'any'
      | 'never';

    /**
     * Check union variants for the types we care about
     */
    function inspectVariantTypes(types: ts.Type[]): Set<VariantType> {
      const variantTypes = new Set<VariantType>();

      if (
        types.some(type =>
          tsutils.isTypeFlagSet(
            type,
            ts.TypeFlags.Null | ts.TypeFlags.Undefined | ts.TypeFlags.VoidLike,
          ),
        )
      ) {
        variantTypes.add('nullish');
      }

      if (
        types.some(type =>
          tsutils.isTypeFlagSet(type, ts.TypeFlags.BooleanLike),
        )
      ) {
        variantTypes.add('boolean');
      }

      if (
        types.some(type => tsutils.isTypeFlagSet(type, ts.TypeFlags.StringLike))
      ) {
        variantTypes.add('string');
      }

      if (
        types.some(type =>
          tsutils.isTypeFlagSet(
            type,
            ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike,
          ),
        )
      ) {
        variantTypes.add('number');
      }

      if (
        types.some(
          type =>
            !tsutils.isTypeFlagSet(
              type,
              ts.TypeFlags.Null |
                ts.TypeFlags.Undefined |
                ts.TypeFlags.VoidLike |
                ts.TypeFlags.BooleanLike |
                ts.TypeFlags.StringLike |
                ts.TypeFlags.NumberLike |
                ts.TypeFlags.BigIntLike |
                ts.TypeFlags.Any |
                ts.TypeFlags.Unknown |
                ts.TypeFlags.Never,
            ),
        )
      ) {
        variantTypes.add('object');
      }

      if (
        types.some(
          type => util.isTypeAnyType(type) || util.isTypeUnknownType(type),
        )
      ) {
        variantTypes.add('any');
      }

      if (types.some(type => tsutils.isTypeFlagSet(type, ts.TypeFlags.Never))) {
        variantTypes.add('never');
      }

      return variantTypes;
    }
  },
});
