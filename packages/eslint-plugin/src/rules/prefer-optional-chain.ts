import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { isBinaryExpression } from 'tsutils';
import * as ts from 'typescript';

import * as util from '../util';

type ValidChainTarget =
  | TSESTree.BinaryExpression
  | TSESTree.CallExpression
  | TSESTree.ChainExpression
  | TSESTree.Identifier
  | TSESTree.PrivateIdentifier
  | TSESTree.MemberExpression
  | TSESTree.ThisExpression
  | TSESTree.MetaProperty;

/*
The AST is always constructed such the first element is always the deepest element.
I.e. for this code: `foo && foo.bar && foo.bar.baz && foo.bar.baz.buzz`
The AST will look like this:
{
  left: {
    left: {
      left: foo
      right: foo.bar
    }
    right: foo.bar.baz
  }
  right: foo.bar.baz.buzz
}

So given any logical expression, we can perform a depth-first traversal to get
the operands in order.
*/
function gatherLogicalOperands(node: TSESTree.LogicalExpression): {
  operands: TSESTree.Expression[];
  seenLogicals: Set<TSESTree.LogicalExpression>;
} {
  const operands: TSESTree.Expression[] = [];
  const seenLogicals = new Set<TSESTree.LogicalExpression>([node]);

  const stack: TSESTree.Expression[] = [node.right, node.left];
  let current: TSESTree.Expression | undefined;
  while ((current = stack.pop())) {
    if (
      current.type === AST_NODE_TYPES.LogicalExpression &&
      current.operator === node.operator
    ) {
      seenLogicals.add(current);
      stack.push(current.right);
      stack.push(current.left);
    } else {
      operands.push(current);
    }
  }

  return {
    operands,
    seenLogicals,
  };
}

const enum ComparisonType {
  // x == null
  // x == undefined
  NotEqNullOrUndefined,
  EqNullOrUndefined,

  // x === null
  NotEqNull,
  EqNull,

  // x === undefined
  // typeof x === 'undefined'
  NotEqUndefined,
  EqUndefined,

  // x
  // !x
  NotBoolean,
  Boolean,
}
type AnalysedOperand =
  | {
      type: 'valid-comparison';
      comparedName: string[];
      comparisonType: ComparisonType;
      node: TSESTree.Expression;
    }
  | {
      type: 'invalid-comparison';
    };
const enum ComparisonValueType {
  Null,
  Undefined,
  UndefinedStringLiteral,
}
function getComparisonValueType(
  node: TSESTree.Expression,
): ComparisonValueType | null {
  switch (node.type) {
    case AST_NODE_TYPES.Literal:
      if (node.value === null && node.raw === 'null') {
        return ComparisonValueType.Null;
      }
      if (node.value === 'undefined') {
        return ComparisonValueType.UndefinedStringLiteral;
      }
      return null;

    case AST_NODE_TYPES.Identifier:
      if (node.name === 'undefined') {
        return ComparisonValueType.Undefined;
      }
      return null;
  }

  return null;
}

function getComparedName(
  node: TSESTree.Expression | TSESTree.PrivateIdentifier,
): string[] {
  // TODO
}

function analyseLogicalOperands(node: TSESTree.LogicalExpression): {
  operands: AnalysedOperand[];
  operator: TSESTree.LogicalExpression['operator'];
  seenLogicals: Set<TSESTree.LogicalExpression>;
} {
  const result: AnalysedOperand[] = [];
  const { operands, seenLogicals } = gatherLogicalOperands(node);

  for (const operand of operands) {
    switch (operand.type) {
      case AST_NODE_TYPES.BinaryExpression: {
        // check for "yoda" style logical: null != x
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- TODO - add ignore IIFE option
        const { comparedExpression, comparedValue } = (() => {
          const comparedValueLeft = getComparisonValueType(node.left);
          if (comparedValueLeft) {
            return {
              comparedExpression: operand.right,
              comparedValue: comparedValueLeft,
            };
          } else {
            return {
              comparedExpression: operand.left,
              comparedValue: getComparisonValueType(operand.right),
            };
          }
        })();

        if (comparedValue === ComparisonValueType.UndefinedStringLiteral) {
          if (
            comparedExpression.type === AST_NODE_TYPES.UnaryExpression &&
            comparedExpression.operator === 'typeof'
          ) {
            // typeof x === 'undefined'
            result.push({
              type: 'valid-comparison',
              comparedName: getComparedName(comparedExpression.argument),
              comparisonType: node.operator.startsWith('!')
                ? ComparisonType.NotEqUndefined
                : ComparisonType.EqUndefined,
              node: operand,
            });
            continue;
          }

          // typeof x === 'string' et al :(
          result.push({ type: 'invalid-comparison' });
          continue;
        }

        switch (operand.operator) {
          case '!=':
          case '==':
            if (
              comparedValue === ComparisonValueType.Null ||
              comparedValue === ComparisonValueType.Undefined
            ) {
              // x == null, x == undefined
              result.push({
                type: 'valid-comparison',
                comparedName: getComparedName(comparedExpression),
                comparisonType: operand.operator.startsWith('!')
                  ? ComparisonType.NotEqNullOrUndefined
                  : ComparisonType.EqNullOrUndefined,
                node: operand,
              });
              continue;
            }
            // x == something :(
            result.push({ type: 'invalid-comparison' });
            continue;

          case '!==':
          case '===': {
            const comparedName = getComparedName(comparedExpression);
            switch (comparedValue) {
              case ComparisonValueType.Null:
                result.push({
                  type: 'valid-comparison',
                  comparedName,
                  comparisonType: operand.operator.startsWith('!')
                    ? ComparisonType.NotEqNull
                    : ComparisonType.EqNull,
                  node: operand,
                });
                continue;

              case ComparisonValueType.Undefined:
                result.push({
                  type: 'valid-comparison',
                  comparedName,
                  comparisonType: operand.operator.startsWith('!')
                    ? ComparisonType.NotEqUndefined
                    : ComparisonType.EqUndefined,
                  node: operand,
                });
                continue;

              default:
                // x === something :(
                result.push({ type: 'invalid-comparison' });
                continue;
            }
          }
        }

        result.push({ type: 'invalid-comparison' });
        continue;
      }

      case AST_NODE_TYPES.UnaryExpression:
        if (operand.operator === '!') {
          result.push({
            type: 'valid-comparison',
            comparedName: getComparedName(operand.argument),
            comparisonType: ComparisonType.NotBoolean,
            node: operand,
          });
        }
        result.push({ type: 'invalid-comparison' });
        continue;

      case AST_NODE_TYPES.Identifier:
        result.push({
          type: 'valid-comparison',
          comparedName: getComparedName(operand),
          comparisonType: ComparisonType.Boolean,
          node: operand,
        });
        continue;
    }
  }

  return {
    operands: result,
    seenLogicals,
    operator: node.operator,
  };
}

function analyzeAndChain(chain: AnalysedOperand[]): void {
  // TODO - expect "!= null"-like chain
}
function analyzeOrChain(chain: AnalysedOperand[]): void {
  // TODO - expect "== null"-like chain
}
function analyzeChain(
  operator: TSESTree.LogicalExpression['operator'],
  chain: AnalysedOperand[],
): void {
  if (chain.length === 0) {
    return;
  }

  switch (operator) {
    case '&&':
      analyzeAndChain(chain);
      break;
    case '||':
      analyzeOrChain(chain);
      break;
  }
}

export default util.createRule({
  name: 'prefer-optional-chain',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using concise optional chain expressions instead of chained logical ands, negated logical ors, or empty objects',
      recommended: 'strict',
    },
    hasSuggestions: true,
    messages: {
      preferOptionalChain:
        "Prefer using an optional chain expression instead, as it's more concise and easier to read.",
      optionalChainSuggest: 'Change to an optional chain.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();
    const parserServices = util.getParserServices(context, true);

    const seenLogicals = new Set<TSESTree.LogicalExpression>();

    return {
      // specific handling for `(foo ?? {}).bar` / `(foo || {}).bar`
      'LogicalExpression[operator="||"], LogicalExpression[operator="??"]'(
        node: TSESTree.LogicalExpression,
      ): void {
        seenLogicals.add(node);

        const leftNode = node.left;
        const rightNode = node.right;
        const parentNode = node.parent;
        const isRightNodeAnEmptyObjectLiteral =
          rightNode.type === AST_NODE_TYPES.ObjectExpression &&
          rightNode.properties.length === 0;
        if (
          !isRightNodeAnEmptyObjectLiteral ||
          !parentNode ||
          parentNode.type !== AST_NODE_TYPES.MemberExpression ||
          parentNode.optional
        ) {
          return;
        }

        function isLeftSideLowerPrecedence(): boolean {
          const logicalTsNode = parserServices.esTreeNodeToTSNodeMap.get(node);

          const leftTsNode = parserServices.esTreeNodeToTSNodeMap.get(leftNode);
          const operator = isBinaryExpression(logicalTsNode)
            ? logicalTsNode.operatorToken.kind
            : ts.SyntaxKind.Unknown;
          const leftPrecedence = util.getOperatorPrecedence(
            leftTsNode.kind,
            operator,
          );

          return leftPrecedence < util.OperatorPrecedence.LeftHandSide;
        }
        context.report({
          node: parentNode,
          messageId: 'optionalChainSuggest',
          suggest: [
            {
              messageId: 'optionalChainSuggest',
              fix: (fixer): TSESLint.RuleFix => {
                const leftNodeText = sourceCode.getText(leftNode);
                // Any node that is made of an operator with higher or equal precedence,
                const maybeWrappedLeftNode = isLeftSideLowerPrecedence()
                  ? `(${leftNodeText})`
                  : leftNodeText;
                const propertyToBeOptionalText = sourceCode.getText(
                  parentNode.property,
                );
                const maybeWrappedProperty = parentNode.computed
                  ? `[${propertyToBeOptionalText}]`
                  : propertyToBeOptionalText;
                return fixer.replaceTextRange(
                  parentNode.range,
                  `${maybeWrappedLeftNode}?.${maybeWrappedProperty}`,
                );
              },
            },
          ],
        });
      },

      LogicalExpression(node): void {
        if (seenLogicals.has(node)) {
          return;
        }

        const {
          operands,
          operator,
          seenLogicals: newSeenLogicals,
        } = analyseLogicalOperands(node);

        for (const logical of newSeenLogicals) {
          seenLogicals.add(logical);
        }

        if (operator === '??') {
          return;
        }

        let currentChain: AnalysedOperand[] = [];
        for (const operand of operands) {
          if (operand.type === 'invalid-comparison') {
            analyzeChain(operator, currentChain);
            currentChain = [];
          } else {
            currentChain.push(operand);
          }
        }

        // make sure to check whatever's left
        analyzeChain(operator, currentChain);
      },

      [[
        'LogicalExpression[operator="||"] > UnaryExpression[operator="!"] > Identifier',
        'LogicalExpression[operator="||"] > UnaryExpression[operator="!"] > MemberExpression',
        'LogicalExpression[operator="||"] > UnaryExpression[operator="!"] > ChainExpression > MemberExpression',
        'LogicalExpression[operator="||"] > UnaryExpression[operator="!"] > MetaProperty',
      ].join(',')](
        initialIdentifierOrNotEqualsExpr:
          | TSESTree.Identifier
          | TSESTree.MemberExpression
          | TSESTree.MetaProperty,
      ): void {
        // selector guarantees this cast
        const initialExpression = (
          initialIdentifierOrNotEqualsExpr.parent!.type ===
          AST_NODE_TYPES.ChainExpression
            ? initialIdentifierOrNotEqualsExpr.parent.parent
            : initialIdentifierOrNotEqualsExpr.parent
        )!.parent as TSESTree.LogicalExpression;

        if (
          initialExpression.left.type !== AST_NODE_TYPES.UnaryExpression ||
          initialExpression.left.argument !== initialIdentifierOrNotEqualsExpr
        ) {
          // the node(identifier or member expression) is not the deepest left node
          return;
        }

        // walk up the tree to figure out how many logical expressions we can include
        let previous: TSESTree.LogicalExpression = initialExpression;
        let current: TSESTree.Node = initialExpression;
        let previousLeftText = getText(initialIdentifierOrNotEqualsExpr);
        let optionallyChainedCode = previousLeftText;
        let expressionCount = 1;
        while (current.type === AST_NODE_TYPES.LogicalExpression) {
          if (
            current.right.type !== AST_NODE_TYPES.UnaryExpression ||
            !isValidChainTarget(
              current.right.argument,
              // only allow unary '!' with identifiers for the first chain - !foo || !foo()
              expressionCount === 1,
            )
          ) {
            break;
          }
          const { rightText, shouldBreak } = breakIfInvalid({
            rightNode: current.right.argument,
            previousLeftText,
          });
          if (shouldBreak) {
            break;
          }

          let invalidOptionallyChainedPrivateProperty;
          ({
            invalidOptionallyChainedPrivateProperty,
            expressionCount,
            previousLeftText,
            optionallyChainedCode,
            previous,
            current,
          } = normalizeRepeatingPatterns(
            rightText,
            expressionCount,
            previousLeftText,
            optionallyChainedCode,
            previous,
            current,
          ));
          if (invalidOptionallyChainedPrivateProperty) {
            return;
          }
        }

        reportIfMoreThanOne({
          expressionCount,
          previous,
          optionallyChainedCode,
          sourceCode,
          context,
          shouldHandleChainedAnds: false,
        });
      },
      [[
        'LogicalExpression[operator="&&"] > Identifier',
        'LogicalExpression[operator="&&"] > MemberExpression',
        'LogicalExpression[operator="&&"] > ChainExpression > MemberExpression',
        'LogicalExpression[operator="&&"] > MetaProperty',
        'LogicalExpression[operator="&&"] > BinaryExpression[operator="!=="]',
        'LogicalExpression[operator="&&"] > BinaryExpression[operator="!="]',
      ].join(',')](
        initialIdentifierOrNotEqualsExpr:
          | TSESTree.BinaryExpression
          | TSESTree.Identifier
          | TSESTree.MemberExpression
          | TSESTree.MetaProperty,
      ): void {
        // selector guarantees this cast
        const initialExpression = (
          initialIdentifierOrNotEqualsExpr.parent?.type ===
          AST_NODE_TYPES.ChainExpression
            ? initialIdentifierOrNotEqualsExpr.parent.parent
            : initialIdentifierOrNotEqualsExpr.parent
        ) as TSESTree.LogicalExpression;

        if (initialExpression.left !== initialIdentifierOrNotEqualsExpr) {
          // the node(identifier or member expression) is not the deepest left node
          return;
        }
        if (!isValidChainTarget(initialIdentifierOrNotEqualsExpr, true)) {
          return;
        }

        // walk up the tree to figure out how many logical expressions we can include
        let previous: TSESTree.LogicalExpression = initialExpression;
        let current: TSESTree.Node = initialExpression;
        let previousLeftText = getText(initialIdentifierOrNotEqualsExpr);
        let optionallyChainedCode = previousLeftText;
        let expressionCount = 1;
        while (current.type === AST_NODE_TYPES.LogicalExpression) {
          if (
            !isValidChainTarget(
              current.right,
              // only allow identifiers for the first chain - foo && foo()
              expressionCount === 1,
            )
          ) {
            break;
          }
          const { rightText, shouldBreak } = breakIfInvalid({
            rightNode: current.right,
            previousLeftText,
          });
          if (shouldBreak) {
            break;
          }

          let invalidOptionallyChainedPrivateProperty;
          ({
            invalidOptionallyChainedPrivateProperty,
            expressionCount,
            previousLeftText,
            optionallyChainedCode,
            previous,
            current,
          } = normalizeRepeatingPatterns(
            rightText,
            expressionCount,
            previousLeftText,
            optionallyChainedCode,
            previous,
            current,
          ));
          if (invalidOptionallyChainedPrivateProperty) {
            return;
          }
        }

        reportIfMoreThanOne({
          expressionCount,
          previous,
          optionallyChainedCode,
          sourceCode,
          context,
          shouldHandleChainedAnds: true,
        });
      },
    };

    interface BreakIfInvalidResult {
      leftText: string;
      rightText: string;
      shouldBreak: boolean;
    }

    interface BreakIfInvalidOptions {
      previousLeftText: string;
      rightNode: ValidChainTarget;
    }

    function breakIfInvalid({
      previousLeftText,
      rightNode,
    }: BreakIfInvalidOptions): BreakIfInvalidResult {
      let shouldBreak = false;

      const rightText = getText(rightNode);
      // can't just use startsWith because of cases like foo && fooBar.baz;
      const matchRegex = new RegExp(
        `^${
          // escape regex characters
          previousLeftText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        }[^a-zA-Z0-9_$]`,
      );
      if (
        !matchRegex.test(rightText) &&
        // handle redundant cases like foo.bar && foo.bar
        previousLeftText !== rightText
      ) {
        shouldBreak = true;
      }
      return { shouldBreak, leftText: previousLeftText, rightText };
    }

    function getText(node: ValidChainTarget): string {
      if (node.type === AST_NODE_TYPES.BinaryExpression) {
        return getText(
          // isValidChainTarget ensures this is type safe
          node.left as ValidChainTarget,
        );
      }

      if (node.type === AST_NODE_TYPES.CallExpression) {
        const calleeText = getText(
          // isValidChainTarget ensures this is type safe
          node.callee as ValidChainTarget,
        );

        // ensure that the call arguments are left untouched, or else we can break cases that _need_ whitespace:
        // - JSX: <Foo Needs Space Between Attrs />
        // - Unary Operators: typeof foo, await bar, delete baz
        const closingParenToken = util.nullThrows(
          sourceCode.getLastToken(node),
          util.NullThrowsReasons.MissingToken('closing parenthesis', node.type),
        );
        const openingParenToken = util.nullThrows(
          sourceCode.getFirstTokenBetween(
            node.callee,
            closingParenToken,
            util.isOpeningParenToken,
          ),
          util.NullThrowsReasons.MissingToken('opening parenthesis', node.type),
        );

        const argumentsText = sourceCode.text.substring(
          openingParenToken.range[0],
          closingParenToken.range[1],
        );

        return `${calleeText}${argumentsText}`;
      }

      if (
        node.type === AST_NODE_TYPES.Identifier ||
        node.type === AST_NODE_TYPES.PrivateIdentifier
      ) {
        return node.name;
      }

      if (node.type === AST_NODE_TYPES.MetaProperty) {
        return `${node.meta.name}.${node.property.name}`;
      }

      if (node.type === AST_NODE_TYPES.ThisExpression) {
        return 'this';
      }

      if (node.type === AST_NODE_TYPES.ChainExpression) {
        /* istanbul ignore if */ if (
          node.expression.type === AST_NODE_TYPES.TSNonNullExpression
        ) {
          // this shouldn't happen
          return '';
        }
        return getText(node.expression);
      }

      if (node.object.type === AST_NODE_TYPES.TSNonNullExpression) {
        // Not supported mixing with TSNonNullExpression
        return '';
      }

      return getMemberExpressionText(node);
    }

    /**
     * Gets a normalized representation of the given MemberExpression
     */
    function getMemberExpressionText(node: TSESTree.MemberExpression): string {
      let objectText: string;

      // cases should match the list in ALLOWED_MEMBER_OBJECT_TYPES
      switch (node.object.type) {
        case AST_NODE_TYPES.MemberExpression:
          objectText = getMemberExpressionText(node.object);
          break;

        case AST_NODE_TYPES.CallExpression:
        case AST_NODE_TYPES.Identifier:
        case AST_NODE_TYPES.MetaProperty:
        case AST_NODE_TYPES.ThisExpression:
          objectText = getText(node.object);
          break;

        /* istanbul ignore next */
        default:
          return '';
      }

      let propertyText: string;
      if (node.computed) {
        // cases should match the list in ALLOWED_COMPUTED_PROP_TYPES
        switch (node.property.type) {
          case AST_NODE_TYPES.Identifier:
            propertyText = getText(node.property);
            break;

          case AST_NODE_TYPES.Literal:
          case AST_NODE_TYPES.TemplateLiteral:
          case AST_NODE_TYPES.BinaryExpression:
            propertyText = sourceCode.getText(node.property);
            break;

          case AST_NODE_TYPES.MemberExpression:
            propertyText = getMemberExpressionText(node.property);
            break;

          /* istanbul ignore next */
          default:
            return '';
        }

        return `${objectText}${node.optional ? '?.' : ''}[${propertyText}]`;
      } else {
        // cases should match the list in ALLOWED_NON_COMPUTED_PROP_TYPES
        switch (node.property.type) {
          case AST_NODE_TYPES.Identifier:
            propertyText = getText(node.property);
            break;
          case AST_NODE_TYPES.PrivateIdentifier:
            propertyText = '#' + getText(node.property);
            break;

          default:
            propertyText = sourceCode.getText(node.property);
        }

        return `${objectText}${node.optional ? '?.' : '.'}${propertyText}`;
      }
    }
  },
});

const ALLOWED_MEMBER_OBJECT_TYPES: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.CallExpression,
  AST_NODE_TYPES.Identifier,
  AST_NODE_TYPES.MemberExpression,
  AST_NODE_TYPES.ThisExpression,
  AST_NODE_TYPES.MetaProperty,
]);
const ALLOWED_COMPUTED_PROP_TYPES: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.Identifier,
  AST_NODE_TYPES.Literal,
  AST_NODE_TYPES.MemberExpression,
  AST_NODE_TYPES.TemplateLiteral,
]);
const ALLOWED_NON_COMPUTED_PROP_TYPES: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.Identifier,
  AST_NODE_TYPES.PrivateIdentifier,
]);

interface ReportIfMoreThanOneOptions {
  expressionCount: number;
  previous: TSESTree.LogicalExpression;
  optionallyChainedCode: string;
  sourceCode: Readonly<TSESLint.SourceCode>;
  context: Readonly<
    TSESLint.RuleContext<
      'preferOptionalChain' | 'optionalChainSuggest',
      never[]
    >
  >;
  shouldHandleChainedAnds: boolean;
}

function reportIfMoreThanOne({
  expressionCount,
  previous,
  optionallyChainedCode,
  sourceCode,
  context,
  shouldHandleChainedAnds,
}: ReportIfMoreThanOneOptions): void {
  if (expressionCount > 1) {
    if (
      shouldHandleChainedAnds &&
      previous.right.type === AST_NODE_TYPES.BinaryExpression
    ) {
      let operator = previous.right.operator;
      if (
        previous.right.operator === '!==' &&
        // TODO(#4820): Use the type checker to know whether this is `null`
        previous.right.right.type === AST_NODE_TYPES.Literal &&
        previous.right.right.raw === 'null'
      ) {
        // case like foo !== null && foo.bar !== null
        operator = '!=';
      }
      // case like foo && foo.bar !== someValue
      optionallyChainedCode += ` ${operator} ${sourceCode.getText(
        previous.right.right,
      )}`;
    }

    context.report({
      node: previous,
      messageId: 'preferOptionalChain',
      suggest: [
        {
          messageId: 'optionalChainSuggest',
          fix: (fixer): TSESLint.RuleFix[] => [
            fixer.replaceText(
              previous,
              `${shouldHandleChainedAnds ? '' : '!'}${optionallyChainedCode}`,
            ),
          ],
        },
      ],
    });
  }
}

interface NormalizedPattern {
  invalidOptionallyChainedPrivateProperty: boolean;
  expressionCount: number;
  previousLeftText: string;
  optionallyChainedCode: string;
  previous: TSESTree.LogicalExpression;
  current: TSESTree.Node;
}

function normalizeRepeatingPatterns(
  rightText: string,
  expressionCount: number,
  previousLeftText: string,
  optionallyChainedCode: string,
  previous: TSESTree.Node,
  current: TSESTree.Node,
): NormalizedPattern {
  const leftText = previousLeftText;
  let invalidOptionallyChainedPrivateProperty = false;
  // omit weird doubled up expression that make no sense like foo.bar && foo.bar
  if (rightText !== previousLeftText) {
    expressionCount += 1;
    previousLeftText = rightText;

    /*
    Diff the left and right text to construct the fix string
    There are the following cases:

    1)
    rightText === 'foo.bar.baz.buzz'
    leftText === 'foo.bar.baz'
    diff === '.buzz'

    2)
    rightText === 'foo.bar.baz.buzz()'
    leftText === 'foo.bar.baz'
    diff === '.buzz()'

    3)
    rightText === 'foo.bar.baz.buzz()'
    leftText === 'foo.bar.baz.buzz'
    diff === '()'

    4)
    rightText === 'foo.bar.baz[buzz]'
    leftText === 'foo.bar.baz'
    diff === '[buzz]'

    5)
    rightText === 'foo.bar.baz?.buzz'
    leftText === 'foo.bar.baz'
    diff === '?.buzz'
    */
    const diff = rightText.replace(leftText, '');
    if (diff.startsWith('.#')) {
      // Do not handle direct optional chaining on private properties because of a typescript bug (https://github.com/microsoft/TypeScript/issues/42734)
      // We still allow in computed properties
      invalidOptionallyChainedPrivateProperty = true;
    }
    if (diff.startsWith('?')) {
      // item was "pre optional chained"
      optionallyChainedCode += diff;
    } else {
      const needsDot = diff.startsWith('(') || diff.startsWith('[');
      optionallyChainedCode += `?${needsDot ? '.' : ''}${diff}`;
    }
  }

  previous = current as TSESTree.LogicalExpression;
  current = util.nullThrows(
    current.parent,
    util.NullThrowsReasons.MissingParent,
  );
  return {
    invalidOptionallyChainedPrivateProperty,
    expressionCount,
    previousLeftText,
    optionallyChainedCode,
    previous,
    current,
  };
}

function isValidChainTarget(
  node: TSESTree.Node,
  allowIdentifier: boolean,
): node is ValidChainTarget {
  if (node.type === AST_NODE_TYPES.ChainExpression) {
    return isValidChainTarget(node.expression, allowIdentifier);
  }

  if (node.type === AST_NODE_TYPES.MemberExpression) {
    const isObjectValid =
      ALLOWED_MEMBER_OBJECT_TYPES.has(node.object.type) &&
      // make sure to validate the expression is of our expected structure
      isValidChainTarget(node.object, true);
    const isPropertyValid = node.computed
      ? ALLOWED_COMPUTED_PROP_TYPES.has(node.property.type) &&
        // make sure to validate the member expression is of our expected structure
        (node.property.type === AST_NODE_TYPES.MemberExpression
          ? isValidChainTarget(node.property, allowIdentifier)
          : true)
      : ALLOWED_NON_COMPUTED_PROP_TYPES.has(node.property.type);

    return isObjectValid && isPropertyValid;
  }

  if (node.type === AST_NODE_TYPES.CallExpression) {
    return isValidChainTarget(node.callee, allowIdentifier);
  }

  if (
    allowIdentifier &&
    (node.type === AST_NODE_TYPES.Identifier ||
      node.type === AST_NODE_TYPES.ThisExpression ||
      node.type === AST_NODE_TYPES.MetaProperty)
  ) {
    return true;
  }

  /*
  special case for the following, where we only want the left
  - foo !== null
  - foo != null
  - foo !== undefined
  - foo != undefined
  */
  return (
    node.type === AST_NODE_TYPES.BinaryExpression &&
    ['!==', '!='].includes(node.operator) &&
    isValidChainTarget(node.left, allowIdentifier) &&
    (util.isUndefinedIdentifier(node.right) || util.isNullLiteral(node.right))
  );
}
