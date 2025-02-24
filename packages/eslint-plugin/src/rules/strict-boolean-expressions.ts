import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';
import type { ReportSuggestionArray } from '@typescript-eslint/utils/ts-eslint';

import { AST_NODE_TYPES, ASTUtils } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  getWrappingFixer,
  isArrayMethodCallWithPredicate,
  isParenlessArrowFunction,
  isTypeArrayTypeOrUnionOfArrayTypes,
  nullThrows,
} from '../util';
import { findTruthinessAssertedArgument } from '../util/assertionFunctionUtils';

export type Options = [
  {
    allowAny?: boolean;
    allowNullableBoolean?: boolean;
    allowNullableEnum?: boolean;
    allowNullableNumber?: boolean;
    allowNullableObject?: boolean;
    allowNullableString?: boolean;
    allowNumber?: boolean;
    allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
    allowString?: boolean;
  },
];

type ConditionErrorMessageId =
  | 'conditionErrorAny'
  | 'conditionErrorNullableBoolean'
  | 'conditionErrorNullableEnum'
  | 'conditionErrorNullableNumber'
  | 'conditionErrorNullableObject'
  | 'conditionErrorNullableString'
  | 'conditionErrorNullish'
  | 'conditionErrorNumber'
  | 'conditionErrorObject'
  | 'conditionErrorOther'
  | 'conditionErrorString';

export type MessageId =
  | 'conditionFixCastBoolean'
  | 'conditionFixCompareArrayLengthNonzero'
  | 'conditionFixCompareArrayLengthZero'
  | 'conditionFixCompareEmptyString'
  | 'conditionFixCompareFalse'
  | 'conditionFixCompareNaN'
  | 'conditionFixCompareNullish'
  | 'conditionFixCompareStringLength'
  | 'conditionFixCompareTrue'
  | 'conditionFixCompareZero'
  | 'conditionFixDefaultEmptyString'
  | 'conditionFixDefaultFalse'
  | 'conditionFixDefaultZero'
  | 'explicitBooleanReturnType'
  | 'noStrictNullCheck'
  | 'predicateCannotBeAsync'
  | ConditionErrorMessageId;

export default createRule<Options, MessageId>({
  name: 'strict-boolean-expressions',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow certain types in boolean expressions',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      conditionErrorAny:
        'Unexpected any value in {{context}}. ' +
        'An explicit comparison or type conversion is required.',
      conditionErrorNullableBoolean:
        'Unexpected nullable boolean value in {{context}}. ' +
        'Please handle the nullish case explicitly.',
      conditionErrorNullableEnum:
        'Unexpected nullable enum value in {{context}}. ' +
        'Please handle the nullish/zero/NaN cases explicitly.',
      conditionErrorNullableNumber:
        'Unexpected nullable number value in {{context}}. ' +
        'Please handle the nullish/zero/NaN cases explicitly.',
      conditionErrorNullableObject:
        'Unexpected nullable object value in {{context}}. ' +
        'An explicit null check is required.',
      conditionErrorNullableString:
        'Unexpected nullable string value in {{context}}. ' +
        'Please handle the nullish/empty cases explicitly.',
      conditionErrorNullish:
        'Unexpected nullish value in conditional. ' +
        'The condition is always false.',
      conditionErrorNumber:
        'Unexpected number value in {{context}}. ' +
        'An explicit zero/NaN check is required.',
      conditionErrorObject:
        'Unexpected object value in {{context}}. ' +
        'The condition is always true.',
      conditionErrorOther:
        'Unexpected value in conditional. ' +
        'A boolean expression is required.',
      conditionErrorString:
        'Unexpected string value in {{context}}. ' +
        'An explicit empty string check is required.',
      conditionFixCastBoolean:
        'Explicitly convert value to a boolean (`Boolean(value)`)',

      conditionFixCompareArrayLengthNonzero:
        "Change condition to check array's length (`value.length > 0`)",
      conditionFixCompareArrayLengthZero:
        "Change condition to check array's length (`value.length === 0`)",
      conditionFixCompareEmptyString:
        'Change condition to check for empty string (`value !== ""`)',
      conditionFixCompareFalse:
        'Change condition to check if false (`value === false`)',
      conditionFixCompareNaN:
        'Change condition to check for NaN (`!Number.isNaN(value)`)',
      conditionFixCompareNullish:
        'Change condition to check for null/undefined (`value != null`)',
      conditionFixCompareStringLength:
        "Change condition to check string's length (`value.length !== 0`)",
      conditionFixCompareTrue:
        'Change condition to check if true (`value === true`)',
      conditionFixCompareZero:
        'Change condition to check for 0 (`value !== 0`)',
      conditionFixDefaultEmptyString:
        'Explicitly treat nullish value the same as an empty string (`value ?? ""`)',
      conditionFixDefaultFalse:
        'Explicitly treat nullish value the same as false (`value ?? false`)',
      conditionFixDefaultZero:
        'Explicitly treat nullish value the same as 0 (`value ?? 0`)',
      explicitBooleanReturnType:
        'Add an explicit `boolean` return type annotation.',
      noStrictNullCheck:
        'This rule requires the `strictNullChecks` compiler option to be turned on to function correctly.',
      predicateCannotBeAsync:
        "Predicate function should not be 'async'; expected a boolean return type.",
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowAny: {
            type: 'boolean',
            description: 'Whether to allow `any`s in a boolean context.',
          },
          allowNullableBoolean: {
            type: 'boolean',
            description:
              'Whether to allow nullable `boolean`s in a boolean context.',
          },
          allowNullableEnum: {
            type: 'boolean',
            description:
              'Whether to allow nullable `enum`s in a boolean context.',
          },
          allowNullableNumber: {
            type: 'boolean',
            description:
              'Whether to allow nullable `number`s in a boolean context.',
          },
          allowNullableObject: {
            type: 'boolean',
            description:
              'Whether to allow nullable `object`s, `symbol`s, and functions in a boolean context.',
          },
          allowNullableString: {
            type: 'boolean',
            description:
              'Whether to allow nullable `string`s in a boolean context.',
          },
          allowNumber: {
            type: 'boolean',
            description: 'Whether to allow `number`s in a boolean context.',
          },
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: {
            type: 'boolean',
            description:
              'Unless this is set to `true`, the rule will error on every file whose `tsconfig.json` does _not_ have the `strictNullChecks` compiler option (or `strict`) set to `true`.',
          },
          allowString: {
            type: 'boolean',
            description: 'Whether to allow `string`s in a boolean context.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allowAny: false,
      allowNullableBoolean: false,
      allowNullableEnum: false,
      allowNullableNumber: false,
      allowNullableObject: true,
      allowNullableString: false,
      allowNumber: true,
      allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
      allowString: true,
    },
  ],
  create(context, [options]) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const compilerOptions = services.program.getCompilerOptions();

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
          start: { column: 0, line: 0 },
          end: { column: 0, line: 0 },
        },
        messageId: 'noStrictNullCheck',
      });
    }

    const traversedNodes = new Set<TSESTree.Node>();

    return {
      CallExpression: traverseCallExpression,
      ConditionalExpression: traverseTestExpression,
      DoWhileStatement: traverseTestExpression,
      ForStatement: traverseTestExpression,
      IfStatement: traverseTestExpression,
      'LogicalExpression[operator!="??"]': traverseLogicalExpression,
      'UnaryExpression[operator="!"]': traverseUnaryLogicalExpression,
      WhileStatement: traverseTestExpression,
    };

    type TestExpression =
      | TSESTree.ConditionalExpression
      | TSESTree.DoWhileStatement
      | TSESTree.ForStatement
      | TSESTree.IfStatement
      | TSESTree.WhileStatement;

    /**
     * Inspects condition of a test expression. (`if`, `while`, `for`, etc.)
     */
    function traverseTestExpression(node: TestExpression): void {
      if (node.test == null) {
        return;
      }
      traverseNode(node.test, true);
    }

    /**
     * Inspects the argument of a unary logical expression (`!`).
     */
    function traverseUnaryLogicalExpression(
      node: TSESTree.UnaryExpression,
    ): void {
      traverseNode(node.argument, true);
    }

    /**
     * Inspects the arguments of a logical expression (`&&`, `||`).
     *
     * If the logical expression is a descendant of a test expression,
     * the `isCondition` flag should be set to true.
     * Otherwise, if the logical expression is there on it's own,
     * it's used for control flow and is not a condition itself.
     */
    function traverseLogicalExpression(
      node: TSESTree.LogicalExpression,
      isCondition = false,
    ): void {
      // left argument is always treated as a condition
      traverseNode(node.left, true);
      // if the logical expression is used for control flow,
      // then its right argument is used for its side effects only
      traverseNode(node.right, isCondition);
    }

    function traverseCallExpression(node: TSESTree.CallExpression): void {
      const assertedArgument = findTruthinessAssertedArgument(services, node);
      if (assertedArgument != null) {
        traverseNode(assertedArgument, true);
      }
      if (isArrayMethodCallWithPredicate(context, services, node)) {
        const predicate = node.arguments.at(0);

        if (predicate) {
          checkArrayMethodCallPredicate(predicate);
        }
      }
    }

    /**
     * Dedicated function to check array method predicate calls. Reports predicate
     * arguments that don't return a boolean value.
     */
    function checkArrayMethodCallPredicate(
      predicateNode: TSESTree.CallExpressionArgument,
    ): void {
      const isFunctionExpression = ASTUtils.isFunction(predicateNode);

      // custom message for accidental `async` function expressions
      if (isFunctionExpression && predicateNode.async) {
        return context.report({
          node: predicateNode,
          messageId: 'predicateCannotBeAsync',
        });
      }

      const returnTypes = services
        .getTypeAtLocation(predicateNode)
        .getCallSignatures()
        .map(signature => {
          const type = signature.getReturnType();

          if (tsutils.isTypeParameter(type)) {
            return checker.getBaseConstraintOfType(type) ?? type;
          }

          return type;
        });
      const flattenTypes = [
        ...new Set(returnTypes.flatMap(type => tsutils.unionTypeParts(type))),
      ];
      const types = inspectVariantTypes(flattenTypes);
      const reportType = determineReportType(types);

      if (reportType == null) {
        return;
      }

      const suggestions: ReportSuggestionArray<MessageId> = [];
      if (
        isFunctionExpression &&
        predicateNode.body.type !== AST_NODE_TYPES.BlockStatement
      ) {
        suggestions.push(
          ...getSuggestionsForConditionError(predicateNode.body, reportType),
        );
      }

      if (isFunctionExpression && !predicateNode.returnType) {
        suggestions.push({
          messageId: 'explicitBooleanReturnType',
          fix: fixer => {
            if (
              predicateNode.type === AST_NODE_TYPES.ArrowFunctionExpression &&
              isParenlessArrowFunction(predicateNode, context.sourceCode)
            ) {
              return [
                fixer.insertTextBefore(predicateNode.params[0], '('),
                fixer.insertTextAfter(predicateNode.params[0], '): boolean'),
              ];
            }

            if (predicateNode.params.length === 0) {
              const closingBracket = nullThrows(
                context.sourceCode.getFirstToken(
                  predicateNode,
                  token => token.value === ')',
                ),
                'function expression has to have a closing parenthesis.',
              );

              return fixer.insertTextAfter(closingBracket, ': boolean');
            }

            const lastClosingParenthesis = nullThrows(
              context.sourceCode.getTokenAfter(
                predicateNode.params[predicateNode.params.length - 1],
                token => token.value === ')',
              ),
              'function expression has to have a closing parenthesis.',
            );

            return fixer.insertTextAfter(lastClosingParenthesis, ': boolean');
          },
        });
      }

      return context.report({
        node: predicateNode,
        messageId: reportType,
        data: {
          context: 'array predicate return type',
        },
        suggest: suggestions,
      });
    }

    /**
     * Inspects any node.
     *
     * If it's a logical expression then it recursively traverses its arguments.
     * If it's any other kind of node then it's type is finally checked against the rule,
     * unless `isCondition` flag is set to false, in which case
     * it's assumed to be used for side effects only and is skipped.
     */
    function traverseNode(
      node: TSESTree.Expression,
      isCondition: boolean,
    ): void {
      // prevent checking the same node multiple times
      if (traversedNodes.has(node)) {
        return;
      }
      traversedNodes.add(node);

      // for logical operator, we check its operands
      if (
        node.type === AST_NODE_TYPES.LogicalExpression &&
        node.operator !== '??'
      ) {
        traverseLogicalExpression(node, isCondition);
        return;
      }

      // skip if node is not a condition
      if (!isCondition) {
        return;
      }

      checkNode(node);
    }

    function determineReportType(
      types: Set<VariantType>,
    ): ConditionErrorMessageId | undefined {
      const is = (...wantedTypes: readonly VariantType[]): boolean =>
        types.size === wantedTypes.length &&
        wantedTypes.every(type => types.has(type));

      // boolean
      if (is('boolean') || is('truthy boolean')) {
        // boolean is always ok
        return undefined;
      }

      // never
      if (is('never')) {
        // never is always okay
        return undefined;
      }

      // nullish
      if (is('nullish')) {
        // condition is always false
        return 'conditionErrorNullish';
      }

      // Known edge case: boolean `true` and nullish values are always valid boolean expressions
      if (is('nullish', 'truthy boolean')) {
        return;
      }

      // nullable boolean
      if (is('nullish', 'boolean')) {
        return !options.allowNullableBoolean
          ? 'conditionErrorNullableBoolean'
          : undefined;
      }

      // Known edge case: truthy primitives and nullish values are always valid boolean expressions
      if (
        (options.allowNumber && is('nullish', 'truthy number')) ||
        (options.allowString && is('nullish', 'truthy string'))
      ) {
        return;
      }

      // string
      if (is('string') || is('truthy string')) {
        return !options.allowString ? 'conditionErrorString' : undefined;
      }

      // nullable string
      if (is('nullish', 'string')) {
        return !options.allowNullableString
          ? 'conditionErrorNullableString'
          : undefined;
      }

      // number
      if (is('number') || is('truthy number')) {
        return !options.allowNumber ? 'conditionErrorNumber' : undefined;
      }

      // nullable number
      if (is('nullish', 'number')) {
        return !options.allowNullableNumber
          ? 'conditionErrorNullableNumber'
          : undefined;
      }

      // object
      if (is('object')) {
        return 'conditionErrorObject';
      }

      // nullable object
      if (is('nullish', 'object')) {
        return !options.allowNullableObject
          ? 'conditionErrorNullableObject'
          : undefined;
      }

      // nullable enum
      if (
        is('nullish', 'number', 'enum') ||
        is('nullish', 'string', 'enum') ||
        is('nullish', 'truthy number', 'enum') ||
        is('nullish', 'truthy string', 'enum') ||
        // mixed enums
        is('nullish', 'truthy number', 'truthy string', 'enum') ||
        is('nullish', 'truthy number', 'string', 'enum') ||
        is('nullish', 'truthy string', 'number', 'enum') ||
        is('nullish', 'number', 'string', 'enum')
      ) {
        return !options.allowNullableEnum
          ? 'conditionErrorNullableEnum'
          : undefined;
      }

      // any
      if (is('any')) {
        return !options.allowAny ? 'conditionErrorAny' : undefined;
      }

      return 'conditionErrorOther';
    }

    function getSuggestionsForConditionError(
      node: TSESTree.Expression,
      conditionError: ConditionErrorMessageId,
    ): ReportSuggestionArray<MessageId> {
      switch (conditionError) {
        case 'conditionErrorAny':
          return [
            {
              messageId: 'conditionFixCastBoolean',
              fix: getWrappingFixer({
                node,
                sourceCode: context.sourceCode,
                wrap: code => `Boolean(${code})`,
              }),
            },
          ];
        case 'conditionErrorNullableBoolean':
          if (isLogicalNegationExpression(node.parent)) {
            // if (!nullableBoolean)
            return [
              {
                messageId: 'conditionFixDefaultFalse',
                fix: getWrappingFixer({
                  node,
                  sourceCode: context.sourceCode,
                  wrap: code => `${code} ?? false`,
                }),
              },
              {
                messageId: 'conditionFixCompareFalse',
                fix: getWrappingFixer({
                  node: node.parent,
                  innerNode: node,
                  sourceCode: context.sourceCode,
                  wrap: code => `${code} === false`,
                }),
              },
            ];
          }
          // if (nullableBoolean)
          return [
            {
              messageId: 'conditionFixDefaultFalse',
              fix: getWrappingFixer({
                node,
                sourceCode: context.sourceCode,
                wrap: code => `${code} ?? false`,
              }),
            },
            {
              messageId: 'conditionFixCompareTrue',
              fix: getWrappingFixer({
                node,
                sourceCode: context.sourceCode,
                wrap: code => `${code} === true`,
              }),
            },
          ];

        case 'conditionErrorNullableEnum':
          if (isLogicalNegationExpression(node.parent)) {
            return [
              {
                messageId: 'conditionFixCompareNullish',
                fix: getWrappingFixer({
                  node: node.parent,
                  innerNode: node,
                  sourceCode: context.sourceCode,
                  wrap: code => `${code} == null`,
                }),
              },
            ];
          }
          return [
            {
              messageId: 'conditionFixCompareNullish',
              fix: getWrappingFixer({
                node,
                sourceCode: context.sourceCode,
                wrap: code => `${code} != null`,
              }),
            },
          ];

        case 'conditionErrorNullableNumber':
          if (isLogicalNegationExpression(node.parent)) {
            // if (!nullableNumber)
            return [
              {
                messageId: 'conditionFixCompareNullish',
                fix: getWrappingFixer({
                  node: node.parent,
                  innerNode: node,
                  sourceCode: context.sourceCode,
                  wrap: code => `${code} == null`,
                }),
              },
              {
                messageId: 'conditionFixDefaultZero',
                fix: getWrappingFixer({
                  node,
                  sourceCode: context.sourceCode,
                  wrap: code => `${code} ?? 0`,
                }),
              },
              {
                messageId: 'conditionFixCastBoolean',
                fix: getWrappingFixer({
                  node: node.parent,
                  innerNode: node,
                  sourceCode: context.sourceCode,
                  wrap: code => `!Boolean(${code})`,
                }),
              },
            ];
          }
          // if (nullableNumber)
          return [
            {
              messageId: 'conditionFixCompareNullish',
              fix: getWrappingFixer({
                node,
                sourceCode: context.sourceCode,
                wrap: code => `${code} != null`,
              }),
            },
            {
              messageId: 'conditionFixDefaultZero',
              fix: getWrappingFixer({
                node,
                sourceCode: context.sourceCode,
                wrap: code => `${code} ?? 0`,
              }),
            },
            {
              messageId: 'conditionFixCastBoolean',
              fix: getWrappingFixer({
                node,
                sourceCode: context.sourceCode,
                wrap: code => `Boolean(${code})`,
              }),
            },
          ];

        case 'conditionErrorNullableObject':
          if (isLogicalNegationExpression(node.parent)) {
            // if (!nullableObject)
            return [
              {
                messageId: 'conditionFixCompareNullish',
                fix: getWrappingFixer({
                  node: node.parent,
                  innerNode: node,
                  sourceCode: context.sourceCode,
                  wrap: code => `${code} == null`,
                }),
              },
            ];
          }
          // if (nullableObject)
          return [
            {
              messageId: 'conditionFixCompareNullish',
              fix: getWrappingFixer({
                node,
                sourceCode: context.sourceCode,
                wrap: code => `${code} != null`,
              }),
            },
          ];

        case 'conditionErrorNullableString':
          if (isLogicalNegationExpression(node.parent)) {
            // if (!nullableString)
            return [
              {
                messageId: 'conditionFixCompareNullish',
                fix: getWrappingFixer({
                  node: node.parent,
                  innerNode: node,
                  sourceCode: context.sourceCode,
                  wrap: code => `${code} == null`,
                }),
              },
              {
                messageId: 'conditionFixDefaultEmptyString',
                fix: getWrappingFixer({
                  node,
                  sourceCode: context.sourceCode,
                  wrap: code => `${code} ?? ""`,
                }),
              },
              {
                messageId: 'conditionFixCastBoolean',
                fix: getWrappingFixer({
                  node: node.parent,
                  innerNode: node,
                  sourceCode: context.sourceCode,
                  wrap: code => `!Boolean(${code})`,
                }),
              },
            ];
          }
          // if (nullableString)
          return [
            {
              messageId: 'conditionFixCompareNullish',
              fix: getWrappingFixer({
                node,
                sourceCode: context.sourceCode,
                wrap: code => `${code} != null`,
              }),
            },
            {
              messageId: 'conditionFixDefaultEmptyString',
              fix: getWrappingFixer({
                node,
                sourceCode: context.sourceCode,
                wrap: code => `${code} ?? ""`,
              }),
            },
            {
              messageId: 'conditionFixCastBoolean',
              fix: getWrappingFixer({
                node,
                sourceCode: context.sourceCode,
                wrap: code => `Boolean(${code})`,
              }),
            },
          ];

        case 'conditionErrorNumber':
          if (isArrayLengthExpression(node, checker, services)) {
            if (isLogicalNegationExpression(node.parent)) {
              // if (!array.length)
              return [
                {
                  messageId: 'conditionFixCompareArrayLengthZero',
                  fix: getWrappingFixer({
                    node: node.parent,
                    innerNode: node,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code} === 0`,
                  }),
                },
              ];
            }
            // if (array.length)
            return [
              {
                messageId: 'conditionFixCompareArrayLengthNonzero',
                fix: getWrappingFixer({
                  node,
                  sourceCode: context.sourceCode,
                  wrap: code => `${code} > 0`,
                }),
              },
            ];
          }
          if (isLogicalNegationExpression(node.parent)) {
            // if (!number)
            return [
              {
                messageId: 'conditionFixCompareZero',
                fix: getWrappingFixer({
                  node: node.parent,
                  innerNode: node,
                  sourceCode: context.sourceCode,
                  // TODO: we have to compare to 0n if the type is bigint
                  wrap: code => `${code} === 0`,
                }),
              },
              {
                // TODO: don't suggest this for bigint because it can't be NaN
                messageId: 'conditionFixCompareNaN',
                fix: getWrappingFixer({
                  node: node.parent,
                  innerNode: node,
                  sourceCode: context.sourceCode,
                  wrap: code => `Number.isNaN(${code})`,
                }),
              },
              {
                messageId: 'conditionFixCastBoolean',
                fix: getWrappingFixer({
                  node: node.parent,
                  innerNode: node,
                  sourceCode: context.sourceCode,
                  wrap: code => `!Boolean(${code})`,
                }),
              },
            ];
          }
          // if (number)
          return [
            {
              messageId: 'conditionFixCompareZero',
              fix: getWrappingFixer({
                node,
                sourceCode: context.sourceCode,
                wrap: code => `${code} !== 0`,
              }),
            },
            {
              messageId: 'conditionFixCompareNaN',
              fix: getWrappingFixer({
                node,
                sourceCode: context.sourceCode,
                wrap: code => `!Number.isNaN(${code})`,
              }),
            },
            {
              messageId: 'conditionFixCastBoolean',
              fix: getWrappingFixer({
                node,
                sourceCode: context.sourceCode,
                wrap: code => `Boolean(${code})`,
              }),
            },
          ];

        case 'conditionErrorString':
          if (isLogicalNegationExpression(node.parent)) {
            // if (!string)
            return [
              {
                messageId: 'conditionFixCompareStringLength',
                fix: getWrappingFixer({
                  node: node.parent,
                  innerNode: node,
                  sourceCode: context.sourceCode,
                  wrap: code => `${code}.length === 0`,
                }),
              },
              {
                messageId: 'conditionFixCompareEmptyString',
                fix: getWrappingFixer({
                  node: node.parent,
                  innerNode: node,
                  sourceCode: context.sourceCode,
                  wrap: code => `${code} === ""`,
                }),
              },
              {
                messageId: 'conditionFixCastBoolean',
                fix: getWrappingFixer({
                  node: node.parent,
                  innerNode: node,
                  sourceCode: context.sourceCode,
                  wrap: code => `!Boolean(${code})`,
                }),
              },
            ];
          }
          // if (string)
          return [
            {
              messageId: 'conditionFixCompareStringLength',
              fix: getWrappingFixer({
                node,
                sourceCode: context.sourceCode,
                wrap: code => `${code}.length > 0`,
              }),
            },
            {
              messageId: 'conditionFixCompareEmptyString',
              fix: getWrappingFixer({
                node,
                sourceCode: context.sourceCode,
                wrap: code => `${code} !== ""`,
              }),
            },
            {
              messageId: 'conditionFixCastBoolean',
              fix: getWrappingFixer({
                node,
                sourceCode: context.sourceCode,
                wrap: code => `Boolean(${code})`,
              }),
            },
          ];

        case 'conditionErrorObject':
        case 'conditionErrorNullish':
        case 'conditionErrorOther':
          return [];
        default:
          conditionError satisfies never;
          throw new Error('Unreachable');
      }
    }

    /**
     * This function does the actual type check on a node.
     * It analyzes the type of a node and checks if it is allowed in a boolean context.
     */
    function checkNode(node: TSESTree.Expression): void {
      const type = getConstrainedTypeAtLocation(services, node);
      const types = inspectVariantTypes(tsutils.unionTypeParts(type));
      const reportType = determineReportType(types);

      if (reportType != null) {
        context.report({
          node,
          messageId: reportType,
          data: {
            context: 'conditional',
          },
          suggest: getSuggestionsForConditionError(node, reportType),
        });
      }
    }

    /** The types we care about */
    type VariantType =
      | 'any'
      | 'boolean'
      | 'enum'
      | 'never'
      | 'nullish'
      | 'number'
      | 'object'
      | 'string'
      | 'truthy boolean'
      | 'truthy number'
      | 'truthy string';

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
      const booleans = types.filter(type =>
        tsutils.isTypeFlagSet(type, ts.TypeFlags.BooleanLike),
      );

      // If incoming type is either "true" or "false", there will be one type
      // object with intrinsicName set accordingly
      // If incoming type is boolean, there will be two type objects with
      // intrinsicName set "true" and "false" each because of ts-api-utils.unionTypeParts()
      if (booleans.length === 1) {
        variantTypes.add(
          tsutils.isTrueLiteralType(booleans[0]) ? 'truthy boolean' : 'boolean',
        );
      } else if (booleans.length === 2) {
        variantTypes.add('boolean');
      }

      const strings = types.filter(type =>
        tsutils.isTypeFlagSet(type, ts.TypeFlags.StringLike),
      );

      if (strings.length) {
        if (
          strings.every(type => type.isStringLiteral() && type.value !== '')
        ) {
          variantTypes.add('truthy string');
        } else {
          variantTypes.add('string');
        }
      }

      const numbers = types.filter(type =>
        tsutils.isTypeFlagSet(
          type,
          ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike,
        ),
      );

      if (numbers.length) {
        if (numbers.every(type => type.isNumberLiteral() && type.value !== 0)) {
          variantTypes.add('truthy number');
        } else {
          variantTypes.add('number');
        }
      }

      if (
        types.some(type => tsutils.isTypeFlagSet(type, ts.TypeFlags.EnumLike))
      ) {
        variantTypes.add('enum');
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
                ts.TypeFlags.TypeParameter |
                ts.TypeFlags.Any |
                ts.TypeFlags.Unknown |
                ts.TypeFlags.Never,
            ),
        )
      ) {
        variantTypes.add(types.some(isBrandedBoolean) ? 'boolean' : 'object');
      }

      if (
        types.some(type =>
          tsutils.isTypeFlagSet(
            type,
            ts.TypeFlags.TypeParameter |
              ts.TypeFlags.Any |
              ts.TypeFlags.Unknown,
          ),
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

function isLogicalNegationExpression(
  node: TSESTree.Node,
): node is TSESTree.UnaryExpression {
  return node.type === AST_NODE_TYPES.UnaryExpression && node.operator === '!';
}

function isArrayLengthExpression(
  node: TSESTree.Node,
  typeChecker: ts.TypeChecker,
  services: ParserServicesWithTypeInformation,
): node is TSESTree.MemberExpressionNonComputedName {
  if (node.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }
  if (node.computed) {
    return false;
  }
  if (node.property.name !== 'length') {
    return false;
  }
  const objectType = getConstrainedTypeAtLocation(services, node.object);
  return isTypeArrayTypeOrUnionOfArrayTypes(objectType, typeChecker);
}

/**
 * Verify is the type is a branded boolean (e.g. `type Foo = boolean & { __brand: 'Foo' }`)
 *
 * @param type The type checked
 */
function isBrandedBoolean(type: ts.Type): boolean {
  return (
    type.isIntersection() &&
    type.types.some(childType => isBooleanType(childType))
  );
}

function isBooleanType(expressionType: ts.Type): boolean {
  return tsutils.isTypeFlagSet(
    expressionType,
    ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLiteral,
  );
}
