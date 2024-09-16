import type {
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getConstrainedTypeAtLocation,
  getParserServices,
  getWrappingFixer,
  isTypeArrayTypeOrUnionOfArrayTypes,
} from '../util';

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

export type MessageId =
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
  | 'conditionErrorString'
  | 'conditionFixCastBoolean'
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
  | 'noStrictNullCheck';

export default createRule<Options, MessageId>({
  name: 'strict-boolean-expressions',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow certain types in boolean expressions',
      requiresTypeChecking: true,
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      conditionErrorAny:
        'Unexpected any value in conditional. ' +
        'An explicit comparison or type cast is required.',
      conditionErrorNullableBoolean:
        'Unexpected nullable boolean value in conditional. ' +
        'Please handle the nullish case explicitly.',
      conditionErrorNullableEnum:
        'Unexpected nullable enum value in conditional. ' +
        'Please handle the nullish/zero/NaN cases explicitly.',
      conditionErrorNullableNumber:
        'Unexpected nullable number value in conditional. ' +
        'Please handle the nullish/zero/NaN cases explicitly.',
      conditionErrorNullableObject:
        'Unexpected nullable object value in conditional. ' +
        'An explicit null check is required.',
      conditionErrorNullableString:
        'Unexpected nullable string value in conditional. ' +
        'Please handle the nullish/empty cases explicitly.',
      conditionErrorNullish:
        'Unexpected nullish value in conditional. ' +
        'The condition is always false.',
      conditionErrorNumber:
        'Unexpected number value in conditional. ' +
        'An explicit zero/NaN check is required.',
      conditionErrorObject:
        'Unexpected object value in conditional. ' +
        'The condition is always true.',
      conditionErrorOther:
        'Unexpected value in conditional. ' +
        'A boolean expression is required.',
      conditionErrorString:
        'Unexpected string value in conditional. ' +
        'An explicit empty string check is required.',
      conditionFixCastBoolean:
        'Explicitly cast value to a boolean (`Boolean(value)`)',

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
      noStrictNullCheck:
        'This rule requires the `strictNullChecks` compiler option to be turned on to function correctly.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowAny: { type: 'boolean' },
          allowNullableBoolean: { type: 'boolean' },
          allowNullableEnum: { type: 'boolean' },
          allowNullableNumber: { type: 'boolean' },
          allowNullableObject: { type: 'boolean' },
          allowNullableString: { type: 'boolean' },
          allowNumber: { type: 'boolean' },
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: {
            type: 'boolean',
          },
          allowString: { type: 'boolean' },
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
          end: { column: 0, line: 0 },
          start: { column: 0, line: 0 },
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
      const assertedArgument = findAssertedArgument(node);
      if (assertedArgument != null) {
        traverseNode(assertedArgument, true);
      }
    }

    /**
     * Inspect a call expression to see if it's a call to an assertion function.
     * If it is, return the node of the argument that is asserted.
     */
    function findAssertedArgument(
      node: TSESTree.CallExpression,
    ): TSESTree.Expression | undefined {
      // If the call looks like `assert(expr1, expr2, ...c, d, e, f)`, then we can
      // only care if `expr1` or `expr2` is asserted, since anything that happens
      // within or after a spread argument is out of scope to reason about.
      const checkableArguments: TSESTree.Expression[] = [];
      for (const argument of node.arguments) {
        if (argument.type === AST_NODE_TYPES.SpreadElement) {
          break;
        }

        checkableArguments.push(argument);
      }

      // nothing to do
      if (checkableArguments.length === 0) {
        return undefined;
      }

      // Game plan: we're going to check the type of the callee. If it has call
      // signatures and they _ALL_ agree that they assert on a parameter at the
      // _SAME_ position, we'll consider the argument in that position to be an
      // asserted argument.
      const calleeType = getConstrainedTypeAtLocation(services, node.callee);
      const callSignatures = tsutils.getCallSignaturesOfType(calleeType);

      let assertedParameterIndex: number | undefined = undefined;
      for (const signature of callSignatures) {
        const declaration = signature.getDeclaration();
        const returnTypeAnnotation = declaration.type;

        // Be sure we're dealing with a truthiness assertion function.
        if (
          !(
            returnTypeAnnotation != null &&
            ts.isTypePredicateNode(returnTypeAnnotation) &&
            // This eliminates things like `x is string` and `asserts x is T`
            // leaving us with just the `asserts x` cases.
            returnTypeAnnotation.type == null &&
            // I think this is redundant but, still, it needs to be true
            returnTypeAnnotation.assertsModifier != null
          )
        ) {
          return undefined;
        }

        const assertionTarget = returnTypeAnnotation.parameterName;
        if (assertionTarget.kind !== ts.SyntaxKind.Identifier) {
          // This can happen when asserting on `this`. Ignore!
          return undefined;
        }

        // If the first parameter is `this`, skip it, so that our index matches
        // the index of the argument at the call site.
        const firstParameter = declaration.parameters.at(0);
        const nonThisParameters =
          firstParameter?.name.kind === ts.SyntaxKind.Identifier &&
          firstParameter.name.text === 'this'
            ? declaration.parameters.slice(1)
            : declaration.parameters;

        // Don't bother inspecting parameters past the number of
        // arguments we have at the call site.
        const checkableNonThisParameters = nonThisParameters.slice(
          0,
          checkableArguments.length,
        );

        let assertedParameterIndexForThisSignature: number | undefined;
        for (const [index, parameter] of checkableNonThisParameters.entries()) {
          if (parameter.dotDotDotToken != null) {
            // Cannot assert a rest parameter, and can't have a rest parameter
            // before the asserted parameter. It's not only a TS error, it's
            // not something we can logically make sense of, so give up here.
            return undefined;
          }

          if (parameter.name.kind !== ts.SyntaxKind.Identifier) {
            // Only identifiers are valid for assertion targets, so skip over
            // anything like `{ destructuring: parameter }: T`
            continue;
          }

          // we've found a match between the "target"s in
          // `function asserts(target: T): asserts target;`
          if (parameter.name.text === assertionTarget.text) {
            assertedParameterIndexForThisSignature = index;
            break;
          }
        }

        if (assertedParameterIndexForThisSignature == null) {
          // Didn't find an assertion target in this signature that could match
          // the call site.
          return undefined;
        }

        if (
          assertedParameterIndex != null &&
          assertedParameterIndex !== assertedParameterIndexForThisSignature
        ) {
          // The asserted parameter we found for this signature didn't match
          // previous signatures.
          return undefined;
        }

        assertedParameterIndex = assertedParameterIndexForThisSignature;
      }

      // Didn't find a unique assertion index.
      if (assertedParameterIndex == null) {
        return undefined;
      }

      return checkableArguments[assertedParameterIndex];
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

    /**
     * This function does the actual type check on a node.
     * It analyzes the type of a node and checks if it is allowed in a boolean context.
     */
    function checkNode(node: TSESTree.Expression): void {
      const type = getConstrainedTypeAtLocation(services, node);
      const types = inspectVariantTypes(tsutils.unionTypeParts(type));

      const is = (...wantedTypes: readonly VariantType[]): boolean =>
        types.size === wantedTypes.length &&
        wantedTypes.every(type => types.has(type));

      // boolean
      if (is('boolean') || is('truthy boolean')) {
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
        context.report({ messageId: 'conditionErrorNullish', node });
        return;
      }

      // Known edge case: boolean `true` and nullish values are always valid boolean expressions
      if (is('nullish', 'truthy boolean')) {
        return;
      }

      // nullable boolean
      if (is('nullish', 'boolean')) {
        if (!options.allowNullableBoolean) {
          if (isLogicalNegationExpression(node.parent)) {
            // if (!nullableBoolean)
            context.report({
              messageId: 'conditionErrorNullableBoolean',
              node,
              suggest: [
                {
                  fix: getWrappingFixer({
                    node,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code} ?? false`,
                  }),
                  messageId: 'conditionFixDefaultFalse',
                },
                {
                  fix: getWrappingFixer({
                    innerNode: node,
                    node: node.parent,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code} === false`,
                  }),
                  messageId: 'conditionFixCompareFalse',
                },
              ],
            });
          } else {
            // if (nullableBoolean)
            context.report({
              messageId: 'conditionErrorNullableBoolean',
              node,
              suggest: [
                {
                  fix: getWrappingFixer({
                    node,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code} ?? false`,
                  }),
                  messageId: 'conditionFixDefaultFalse',
                },
                {
                  fix: getWrappingFixer({
                    node,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code} === true`,
                  }),
                  messageId: 'conditionFixCompareTrue',
                },
              ],
            });
          }
        }
        return;
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
        if (!options.allowString) {
          if (isLogicalNegationExpression(node.parent)) {
            // if (!string)
            context.report({
              messageId: 'conditionErrorString',
              node,
              suggest: [
                {
                  fix: getWrappingFixer({
                    innerNode: node,
                    node: node.parent,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code}.length === 0`,
                  }),
                  messageId: 'conditionFixCompareStringLength',
                },
                {
                  fix: getWrappingFixer({
                    innerNode: node,
                    node: node.parent,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code} === ""`,
                  }),
                  messageId: 'conditionFixCompareEmptyString',
                },
                {
                  fix: getWrappingFixer({
                    innerNode: node,
                    node: node.parent,
                    sourceCode: context.sourceCode,
                    wrap: code => `!Boolean(${code})`,
                  }),
                  messageId: 'conditionFixCastBoolean',
                },
              ],
            });
          } else {
            // if (string)
            context.report({
              messageId: 'conditionErrorString',
              node,
              suggest: [
                {
                  fix: getWrappingFixer({
                    node,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code}.length > 0`,
                  }),
                  messageId: 'conditionFixCompareStringLength',
                },
                {
                  fix: getWrappingFixer({
                    node,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code} !== ""`,
                  }),
                  messageId: 'conditionFixCompareEmptyString',
                },
                {
                  fix: getWrappingFixer({
                    node,
                    sourceCode: context.sourceCode,
                    wrap: code => `Boolean(${code})`,
                  }),
                  messageId: 'conditionFixCastBoolean',
                },
              ],
            });
          }
        }
        return;
      }

      // nullable string
      if (is('nullish', 'string')) {
        if (!options.allowNullableString) {
          if (isLogicalNegationExpression(node.parent)) {
            // if (!nullableString)
            context.report({
              messageId: 'conditionErrorNullableString',
              node,
              suggest: [
                {
                  fix: getWrappingFixer({
                    innerNode: node,
                    node: node.parent,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code} == null`,
                  }),
                  messageId: 'conditionFixCompareNullish',
                },
                {
                  fix: getWrappingFixer({
                    node,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code} ?? ""`,
                  }),
                  messageId: 'conditionFixDefaultEmptyString',
                },
                {
                  fix: getWrappingFixer({
                    innerNode: node,
                    node: node.parent,
                    sourceCode: context.sourceCode,
                    wrap: code => `!Boolean(${code})`,
                  }),
                  messageId: 'conditionFixCastBoolean',
                },
              ],
            });
          } else {
            // if (nullableString)
            context.report({
              messageId: 'conditionErrorNullableString',
              node,
              suggest: [
                {
                  fix: getWrappingFixer({
                    node,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code} != null`,
                  }),
                  messageId: 'conditionFixCompareNullish',
                },
                {
                  fix: getWrappingFixer({
                    node,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code} ?? ""`,
                  }),
                  messageId: 'conditionFixDefaultEmptyString',
                },
                {
                  fix: getWrappingFixer({
                    node,
                    sourceCode: context.sourceCode,
                    wrap: code => `Boolean(${code})`,
                  }),
                  messageId: 'conditionFixCastBoolean',
                },
              ],
            });
          }
        }
        return;
      }

      // number
      if (is('number') || is('truthy number')) {
        if (!options.allowNumber) {
          if (isArrayLengthExpression(node, checker, services)) {
            if (isLogicalNegationExpression(node.parent)) {
              // if (!array.length)
              context.report({
                fix: getWrappingFixer({
                  innerNode: node,
                  node: node.parent,
                  sourceCode: context.sourceCode,
                  wrap: code => `${code} === 0`,
                }),
                messageId: 'conditionErrorNumber',
                node,
              });
            } else {
              // if (array.length)
              context.report({
                fix: getWrappingFixer({
                  node,
                  sourceCode: context.sourceCode,
                  wrap: code => `${code} > 0`,
                }),
                messageId: 'conditionErrorNumber',
                node,
              });
            }
          } else if (isLogicalNegationExpression(node.parent)) {
            // if (!number)
            context.report({
              messageId: 'conditionErrorNumber',
              node,
              suggest: [
                {
                  fix: getWrappingFixer({
                    innerNode: node,
                    node: node.parent,
                    sourceCode: context.sourceCode,
                    // TODO: we have to compare to 0n if the type is bigint
                    wrap: code => `${code} === 0`,
                  }),
                  messageId: 'conditionFixCompareZero',
                },
                {
                  // TODO: don't suggest this for bigint because it can't be NaN
                  fix: getWrappingFixer({
                    innerNode: node,
                    node: node.parent,
                    sourceCode: context.sourceCode,
                    wrap: code => `Number.isNaN(${code})`,
                  }),
                  messageId: 'conditionFixCompareNaN',
                },
                {
                  fix: getWrappingFixer({
                    innerNode: node,
                    node: node.parent,
                    sourceCode: context.sourceCode,
                    wrap: code => `!Boolean(${code})`,
                  }),
                  messageId: 'conditionFixCastBoolean',
                },
              ],
            });
          } else {
            // if (number)
            context.report({
              messageId: 'conditionErrorNumber',
              node,
              suggest: [
                {
                  fix: getWrappingFixer({
                    node,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code} !== 0`,
                  }),
                  messageId: 'conditionFixCompareZero',
                },
                {
                  fix: getWrappingFixer({
                    node,
                    sourceCode: context.sourceCode,
                    wrap: code => `!Number.isNaN(${code})`,
                  }),
                  messageId: 'conditionFixCompareNaN',
                },
                {
                  fix: getWrappingFixer({
                    node,
                    sourceCode: context.sourceCode,
                    wrap: code => `Boolean(${code})`,
                  }),
                  messageId: 'conditionFixCastBoolean',
                },
              ],
            });
          }
        }
        return;
      }

      // nullable number
      if (is('nullish', 'number')) {
        if (!options.allowNullableNumber) {
          if (isLogicalNegationExpression(node.parent)) {
            // if (!nullableNumber)
            context.report({
              messageId: 'conditionErrorNullableNumber',
              node,
              suggest: [
                {
                  fix: getWrappingFixer({
                    innerNode: node,
                    node: node.parent,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code} == null`,
                  }),
                  messageId: 'conditionFixCompareNullish',
                },
                {
                  fix: getWrappingFixer({
                    node,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code} ?? 0`,
                  }),
                  messageId: 'conditionFixDefaultZero',
                },
                {
                  fix: getWrappingFixer({
                    innerNode: node,
                    node: node.parent,
                    sourceCode: context.sourceCode,
                    wrap: code => `!Boolean(${code})`,
                  }),
                  messageId: 'conditionFixCastBoolean',
                },
              ],
            });
          } else {
            // if (nullableNumber)
            context.report({
              messageId: 'conditionErrorNullableNumber',
              node,
              suggest: [
                {
                  fix: getWrappingFixer({
                    node,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code} != null`,
                  }),
                  messageId: 'conditionFixCompareNullish',
                },
                {
                  fix: getWrappingFixer({
                    node,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code} ?? 0`,
                  }),
                  messageId: 'conditionFixDefaultZero',
                },
                {
                  fix: getWrappingFixer({
                    node,
                    sourceCode: context.sourceCode,
                    wrap: code => `Boolean(${code})`,
                  }),
                  messageId: 'conditionFixCastBoolean',
                },
              ],
            });
          }
        }
        return;
      }

      // object
      if (is('object')) {
        // condition is always true
        context.report({ messageId: 'conditionErrorObject', node });
        return;
      }

      // nullable object
      if (is('nullish', 'object')) {
        if (!options.allowNullableObject) {
          if (isLogicalNegationExpression(node.parent)) {
            // if (!nullableObject)
            context.report({
              messageId: 'conditionErrorNullableObject',
              node,
              suggest: [
                {
                  fix: getWrappingFixer({
                    innerNode: node,
                    node: node.parent,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code} == null`,
                  }),
                  messageId: 'conditionFixCompareNullish',
                },
              ],
            });
          } else {
            // if (nullableObject)
            context.report({
              messageId: 'conditionErrorNullableObject',
              node,
              suggest: [
                {
                  fix: getWrappingFixer({
                    node,
                    sourceCode: context.sourceCode,
                    wrap: code => `${code} != null`,
                  }),
                  messageId: 'conditionFixCompareNullish',
                },
              ],
            });
          }
        }
        return;
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
        if (!options.allowNullableEnum) {
          if (isLogicalNegationExpression(node.parent)) {
            context.report({
              fix: getWrappingFixer({
                innerNode: node,
                node: node.parent,
                sourceCode: context.sourceCode,
                wrap: code => `${code} == null`,
              }),
              messageId: 'conditionErrorNullableEnum',
              node,
            });
          } else {
            context.report({
              fix: getWrappingFixer({
                node,
                sourceCode: context.sourceCode,
                wrap: code => `${code} != null`,
              }),
              messageId: 'conditionErrorNullableEnum',
              node,
            });
          }
        }
        return;
      }

      // any
      if (is('any')) {
        if (!options.allowAny) {
          context.report({
            messageId: 'conditionErrorAny',
            node,
            suggest: [
              {
                fix: getWrappingFixer({
                  node,
                  sourceCode: context.sourceCode,
                  wrap: code => `Boolean(${code})`,
                }),
                messageId: 'conditionFixCastBoolean',
              },
            ],
          });
        }
        return;
      }

      // other
      context.report({ messageId: 'conditionErrorOther', node });
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
    type.types.some(childType =>
      tsutils.isTypeFlagSet(
        childType,
        ts.TypeFlags.BooleanLiteral | ts.TypeFlags.Boolean,
      ),
    )
  );
}
