import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  getTextWithParentheses,
  getTypeFlags,
  isLogicalOrOperator,
  isNodeEqual,
  isNullLiteral,
  isTypeFlagSet,
  isUndefinedIdentifier,
  nullThrows,
  NullThrowsReasons,
} from '../util';

export type Options = [
  {
    allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
    ignoreConditionalTests?: boolean;
    ignoreMixedLogicalExpressions?: boolean;
    ignorePrimitives?:
      | {
          bigint?: boolean;
          boolean?: boolean;
          number?: boolean;
          string?: boolean;
        }
      | true;
    ignoreTernaryTests?: boolean;
  },
];

export type MessageIds =
  | 'noStrictNullCheck'
  | 'preferNullishOverOr'
  | 'preferNullishOverTernary'
  | 'suggestNullish';

export default createRule<Options, MessageIds>({
  name: 'prefer-nullish-coalescing',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using the nullish coalescing operator instead of logical assignments or chaining',
      recommended: 'stylistic',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      noStrictNullCheck:
        'This rule requires the `strictNullChecks` compiler option to be turned on to function correctly.',
      preferNullishOverOr:
        'Prefer using nullish coalescing operator (`??{{ equals }}`) instead of a logical {{ description }} (`||{{ equals }}`), as it is a safer operator.',
      preferNullishOverTernary:
        'Prefer using nullish coalescing operator (`??{{ equals }}`) instead of a ternary expression, as it is simpler to read.',
      suggestNullish: 'Fix to nullish coalescing operator (`??{{ equals }}`).',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: {
            type: 'boolean',
            description:
              'Unless this is set to `true`, the rule will error on every file whose `tsconfig.json` does _not_ have the `strictNullChecks` compiler option (or `strict`) set to `true`.',
          },
          ignoreConditionalTests: {
            type: 'boolean',
            description:
              'Whether to ignore cases that are located within a conditional test.',
          },
          ignoreMixedLogicalExpressions: {
            type: 'boolean',
            description:
              'Whether to ignore any logical or expressions that are part of a mixed logical expression (with `&&`).',
          },
          ignorePrimitives: {
            description:
              'Whether to ignore all (`true`) or some (an object with properties) primitive types.',
            oneOf: [
              {
                type: 'object',
                properties: {
                  bigint: { type: 'boolean' },
                  boolean: { type: 'boolean' },
                  number: { type: 'boolean' },
                  string: { type: 'boolean' },
                },
              },
              {
                type: 'boolean',
                enum: [true],
              },
            ],
          },
          ignoreTernaryTests: {
            type: 'boolean',
            description:
              'Whether to ignore any ternary expressions that could be simplified by using the nullish coalescing operator.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
      ignoreConditionalTests: true,
      ignoreMixedLogicalExpressions: false,
      ignorePrimitives: {
        bigint: false,
        boolean: false,
        number: false,
        string: false,
      },
      ignoreTernaryTests: false,
    },
  ],
  create(
    context,
    [
      {
        allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing,
        ignoreConditionalTests,
        ignoreMixedLogicalExpressions,
        ignorePrimitives,
        ignoreTernaryTests,
      },
    ],
  ) {
    const parserServices = getParserServices(context);
    const compilerOptions = parserServices.program.getCompilerOptions();

    const checker = parserServices.program.getTypeChecker();
    const isStrictNullChecks = tsutils.isStrictCompilerOptionEnabled(
      compilerOptions,
      'strictNullChecks',
    );

    if (
      !isStrictNullChecks &&
      allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing !== true
    ) {
      context.report({
        loc: {
          start: { column: 0, line: 0 },
          end: { column: 0, line: 0 },
        },
        messageId: 'noStrictNullCheck',
      });
    }

    // todo: rename to something more specific?
    function checkAssignmentOrLogicalExpression(
      node: TSESTree.AssignmentExpression | TSESTree.LogicalExpression,
      description: string,
      equals: string,
    ): void {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const type = checker.getTypeAtLocation(tsNode.left);
      if (!isTypeFlagSet(type, ts.TypeFlags.Null | ts.TypeFlags.Undefined)) {
        return;
      }

      if (ignoreConditionalTests === true && isConditionalTest(node)) {
        return;
      }

      if (
        ignoreMixedLogicalExpressions === true &&
        isMixedLogicalExpression(node)
      ) {
        return;
      }

      // https://github.com/typescript-eslint/typescript-eslint/issues/5439
      /* eslint-disable @typescript-eslint/no-non-null-assertion */
      const ignorableFlags = [
        (ignorePrimitives === true || ignorePrimitives!.bigint) &&
          ts.TypeFlags.BigIntLike,
        (ignorePrimitives === true || ignorePrimitives!.boolean) &&
          ts.TypeFlags.BooleanLike,
        (ignorePrimitives === true || ignorePrimitives!.number) &&
          ts.TypeFlags.NumberLike,
        (ignorePrimitives === true || ignorePrimitives!.string) &&
          ts.TypeFlags.StringLike,
      ]
        .filter((flag): flag is number => typeof flag === 'number')
        .reduce((previous, flag) => previous | flag, 0);
      if (
        type.flags !== ts.TypeFlags.Null &&
        type.flags !== ts.TypeFlags.Undefined &&
        (type as ts.UnionOrIntersectionType).types.some(t =>
          tsutils
            .intersectionTypeParts(t)
            .some(t => tsutils.isTypeFlagSet(t, ignorableFlags)),
        )
      ) {
        return;
      }
      /* eslint-enable @typescript-eslint/no-non-null-assertion */

      const barBarOperator = nullThrows(
        context.sourceCode.getTokenAfter(
          node.left,
          token =>
            token.type === AST_TOKEN_TYPES.Punctuator &&
            token.value === node.operator,
        ),
        NullThrowsReasons.MissingToken('operator', node.type),
      );

      function* fix(
        fixer: TSESLint.RuleFixer,
      ): IterableIterator<TSESLint.RuleFix> {
        if (isLogicalOrOperator(node.parent)) {
          // '&&' and '??' operations cannot be mixed without parentheses (e.g. a && b ?? c)
          if (
            node.left.type === AST_NODE_TYPES.LogicalExpression &&
            !isLogicalOrOperator(node.left.left)
          ) {
            yield fixer.insertTextBefore(node.left.right, '(');
          } else {
            yield fixer.insertTextBefore(node.left, '(');
          }
          yield fixer.insertTextAfter(node.right, ')');
        }
        yield fixer.replaceText(
          barBarOperator,
          node.operator.replace('||', '??'),
        );
      }

      context.report({
        node: barBarOperator,
        messageId: 'preferNullishOverOr',
        data: { description, equals },
        suggest: [
          {
            messageId: 'suggestNullish',
            data: { equals },
            fix,
          },
        ],
      });
    }

    return {
      'AssignmentExpression[operator = "||="]'(
        node: TSESTree.AssignmentExpression,
      ): void {
        checkAssignmentOrLogicalExpression(node, 'assignment', '=');
      },
      ConditionalExpression(node: TSESTree.ConditionalExpression): void {
        if (ignoreTernaryTests) {
          return;
        }

        let operator: '!=' | '!==' | '==' | '===' | undefined;
        let nodesInsideTestExpression: TSESTree.Node[] = [];
        if (node.test.type === AST_NODE_TYPES.BinaryExpression) {
          nodesInsideTestExpression = [node.test.left, node.test.right];
          if (
            node.test.operator === '==' ||
            node.test.operator === '!=' ||
            node.test.operator === '===' ||
            node.test.operator === '!=='
          ) {
            operator = node.test.operator;
          }
        } else if (
          node.test.type === AST_NODE_TYPES.LogicalExpression &&
          node.test.left.type === AST_NODE_TYPES.BinaryExpression &&
          node.test.right.type === AST_NODE_TYPES.BinaryExpression
        ) {
          nodesInsideTestExpression = [
            node.test.left.left,
            node.test.left.right,
            node.test.right.left,
            node.test.right.right,
          ];
          if (['||', '||='].includes(node.test.operator)) {
            if (
              node.test.left.operator === '===' &&
              node.test.right.operator === '==='
            ) {
              operator = '===';
            } else if (
              ((node.test.left.operator === '===' ||
                node.test.right.operator === '===') &&
                (node.test.left.operator === '==' ||
                  node.test.right.operator === '==')) ||
              (node.test.left.operator === '==' &&
                node.test.right.operator === '==')
            ) {
              operator = '==';
            }
          } else if (node.test.operator === '&&') {
            if (
              node.test.left.operator === '!==' &&
              node.test.right.operator === '!=='
            ) {
              operator = '!==';
            } else if (
              ((node.test.left.operator === '!==' ||
                node.test.right.operator === '!==') &&
                (node.test.left.operator === '!=' ||
                  node.test.right.operator === '!=')) ||
              (node.test.left.operator === '!=' &&
                node.test.right.operator === '!=')
            ) {
              operator = '!=';
            }
          }
        }

        if (!operator) {
          return;
        }

        let identifier: TSESTree.Node | undefined;
        let hasUndefinedCheck = false;
        let hasNullCheck = false;

        // we check that the test only contains null, undefined and the identifier
        for (const testNode of nodesInsideTestExpression) {
          if (isNullLiteral(testNode)) {
            hasNullCheck = true;
          } else if (isUndefinedIdentifier(testNode)) {
            hasUndefinedCheck = true;
          } else if (
            (operator === '!==' || operator === '!=') &&
            isNodeEqual(testNode, node.consequent)
          ) {
            identifier = testNode;
          } else if (
            (operator === '===' || operator === '==') &&
            isNodeEqual(testNode, node.alternate)
          ) {
            identifier = testNode;
          } else {
            return;
          }
        }

        if (!identifier) {
          return;
        }

        const isFixable = ((): boolean => {
          // it is fixable if we check for both null and undefined, or not if neither
          if (hasUndefinedCheck === hasNullCheck) {
            return hasUndefinedCheck;
          }

          // it is fixable if we loosely check for either null or undefined
          if (operator === '==' || operator === '!=') {
            return true;
          }

          const tsNode = parserServices.esTreeNodeToTSNodeMap.get(identifier);
          const type = checker.getTypeAtLocation(tsNode);
          const flags = getTypeFlags(type);

          if (flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
            return false;
          }

          const hasNullType = (flags & ts.TypeFlags.Null) !== 0;

          // it is fixable if we check for undefined and the type is not nullable
          if (hasUndefinedCheck && !hasNullType) {
            return true;
          }

          const hasUndefinedType = (flags & ts.TypeFlags.Undefined) !== 0;

          // it is fixable if we check for null and the type can't be undefined
          return hasNullCheck && !hasUndefinedType;
        })();

        if (isFixable) {
          context.report({
            node,
            messageId: 'preferNullishOverTernary',
            // TODO: also account for = in the ternary clause
            data: { equals: '' },
            suggest: [
              {
                messageId: 'suggestNullish',
                data: { equals: '' },
                fix(fixer: TSESLint.RuleFixer): TSESLint.RuleFix {
                  const [left, right] =
                    operator === '===' || operator === '=='
                      ? [node.alternate, node.consequent]
                      : [node.consequent, node.alternate];
                  return fixer.replaceText(
                    node,
                    `${getTextWithParentheses(context.sourceCode, left)} ?? ${getTextWithParentheses(
                      context.sourceCode,
                      right,
                    )}`,
                  );
                },
              },
            ],
          });
        }
      },
      'LogicalExpression[operator = "||"]'(
        node: TSESTree.LogicalExpression,
      ): void {
        checkAssignmentOrLogicalExpression(node, 'or', '');
      },
    };
  },
});

function isConditionalTest(node: TSESTree.Node): boolean {
  const parents = new Set<TSESTree.Node | null>([node]);
  let current = node.parent;
  while (current) {
    parents.add(current);

    if (
      (current.type === AST_NODE_TYPES.ConditionalExpression ||
        current.type === AST_NODE_TYPES.DoWhileStatement ||
        current.type === AST_NODE_TYPES.IfStatement ||
        current.type === AST_NODE_TYPES.ForStatement ||
        current.type === AST_NODE_TYPES.WhileStatement) &&
      parents.has(current.test)
    ) {
      return true;
    }

    if (
      [
        AST_NODE_TYPES.ArrowFunctionExpression,
        AST_NODE_TYPES.FunctionExpression,
      ].includes(current.type)
    ) {
      /**
       * This is a weird situation like:
       * `if (() => a || b) {}`
       * `if (function () { return a || b }) {}`
       */
      return false;
    }

    current = current.parent;
  }

  return false;
}

function isMixedLogicalExpression(
  node: TSESTree.AssignmentExpression | TSESTree.LogicalExpression,
): boolean {
  const seen = new Set<TSESTree.Node | undefined>();
  const queue = [node.parent, node.left, node.right];
  for (const current of queue) {
    if (seen.has(current)) {
      continue;
    }
    seen.add(current);

    if (current.type === AST_NODE_TYPES.LogicalExpression) {
      if (current.operator === '&&') {
        return true;
      } else if (['||', '||='].includes(current.operator)) {
        // check the pieces of the node to catch cases like `a || b || c && d`
        queue.push(current.parent, current.left, current.right);
      }
    }
  }

  return false;
}
