import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { isBinaryExpression } from 'tsutils';
import * as ts from 'typescript';

import * as util from '../util';

type TMessageIds = 'preferOptionalChain' | 'optionalChainSuggest';
type TOptions = [];

const enum NullishComparisonType {
  /** `x != null`, `x != undefined` */
  NotEqNullOrUndefined,
  /** `x == null`, `x == undefined` */
  EqNullOrUndefined,

  /** `x !== null` */
  NotEqNull,
  /** `x === null` */
  EqNull,

  /** `x !== undefined`, `typeof x !== 'undefined'` */
  NotEqUndefined,
  /** `x === undefined`, `typeof x === 'undefined'` */
  EqUndefined,

  /** `x` */
  NotBoolean,
  /** `!x` */
  Boolean,
}
type ComparisonNode = TSESTree.Expression | TSESTree.PrivateIdentifier;
const enum OperandValidity {
  Valid,
  Invalid,
}
interface ValidOperand {
  type: OperandValidity.Valid;
  comparedName: ComparisonNode;
  comparisonType: NullishComparisonType;
  node: TSESTree.Expression;
}
interface InvalidOperand {
  type: OperandValidity.Invalid;
}
type Operand = ValidOperand | InvalidOperand;
function gatherLogicalOperands(node: TSESTree.LogicalExpression): {
  operands: Operand[];
  seenLogicals: Set<TSESTree.LogicalExpression>;
} {
  const enum ComparisonValueType {
    Null,
    Undefined,
    UndefinedStringLiteral,
  }

  const result: Operand[] = [];
  const { operands, seenLogicals } = flattenLogicalOperands(node);

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
              type: OperandValidity.Valid,
              comparedName: comparedExpression.argument,
              comparisonType: node.operator.startsWith('!')
                ? NullishComparisonType.NotEqUndefined
                : NullishComparisonType.EqUndefined,
              node: operand,
            });
            continue;
          }

          // typeof x === 'string' et al :(
          result.push({ type: OperandValidity.Invalid });
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
                type: OperandValidity.Valid,
                comparedName: comparedExpression,
                comparisonType: operand.operator.startsWith('!')
                  ? NullishComparisonType.NotEqNullOrUndefined
                  : NullishComparisonType.EqNullOrUndefined,
                node: operand,
              });
              continue;
            }
            // x == something :(
            result.push({ type: OperandValidity.Invalid });
            continue;

          case '!==':
          case '===': {
            const comparedName = comparedExpression;
            switch (comparedValue) {
              case ComparisonValueType.Null:
                result.push({
                  type: OperandValidity.Valid,
                  comparedName,
                  comparisonType: operand.operator.startsWith('!')
                    ? NullishComparisonType.NotEqNull
                    : NullishComparisonType.EqNull,
                  node: operand,
                });
                continue;

              case ComparisonValueType.Undefined:
                result.push({
                  type: OperandValidity.Valid,
                  comparedName,
                  comparisonType: operand.operator.startsWith('!')
                    ? NullishComparisonType.NotEqUndefined
                    : NullishComparisonType.EqUndefined,
                  node: operand,
                });
                continue;

              default:
                // x === something :(
                result.push({ type: OperandValidity.Invalid });
                continue;
            }
          }
        }

        result.push({ type: OperandValidity.Invalid });
        continue;
      }

      case AST_NODE_TYPES.UnaryExpression:
        if (operand.operator === '!') {
          // TODO(#4820) - use types here to determine if there is a boolean type that might be refined out
          result.push({
            type: OperandValidity.Valid,
            comparedName: operand.argument,
            comparisonType: NullishComparisonType.NotBoolean,
            node: operand,
          });
        }
        result.push({ type: OperandValidity.Invalid });
        continue;

      case AST_NODE_TYPES.Identifier:
        // TODO(#4820) - use types here to determine if there is a boolean type that might be refined out
        result.push({
          type: OperandValidity.Valid,
          comparedName: operand,
          comparisonType: NullishComparisonType.Boolean,
          node: operand,
        });
        continue;
    }
  }

  return {
    operands: result,
    seenLogicals,
  };

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

  Note that this function purposely does not inspect mixed logical expressions
  like `foo || foo.bar && foo.bar.baz` - it will ignore
  */
  function flattenLogicalOperands(node: TSESTree.LogicalExpression): {
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
}

const enum NodeComparisonResult {
  /** the two nodes are comparably the same */
  Equal,
  /** the left node is a subset of the right node */
  Subset,
  /** the left node is not the same or is a superset of the right node */
  Invalid,
}
function compareNodes(
  _nodeA: ComparisonNode,
  _nodeB: ComparisonNode,
): NodeComparisonResult {
  // TODO - recursively compare two nodes
  // TODO - recursively compare two nodes
  // TODO - recursively compare two nodes
  // TODO - recursively compare two nodes
  // TODO - recursively compare two nodes
  // TODO - recursively compare two nodes
  // TODO - recursively compare two nodes
  // TODO - recursively compare two nodes
  // TODO - recursively compare two nodes
  // TODO - recursively compare two nodes
  // TODO - recursively compare two nodes
  // TODO - recursively compare two nodes
  // TODO - recursively compare two nodes
  // TODO - recursively compare two nodes
  return;
}

type OperandAnalyzer = (
  operand: ValidOperand,
  index: number,
  chain: readonly ValidOperand[],
) => readonly [ValidOperand, ...ValidOperand[]] | null;
const analyzeAndChainOperand: OperandAnalyzer = (operand, index, chain) => {
  // TODO - "!= null"-like chains
  // TODO - "x && x.y" chains
  switch (operand.comparisonType) {
    case NullishComparisonType.NotBoolean:
    case NullishComparisonType.NotEqNullOrUndefined:
      return [operand];

    case NullishComparisonType.NotEqNull: {
      // TODO(#4820) - use types here to determine if the value is just `null` (eg `=== null` would be enough on its own)

      // handle `x === null || x === undefined`
      const nextOperand = chain[index + 1] as ValidOperand | undefined;
      if (
        nextOperand?.comparisonType === NullishComparisonType.NotEqUndefined &&
        compareNodes(operand.node, nextOperand.node) ===
          NodeComparisonResult.Equal
      ) {
        return [operand, nextOperand];
      } else {
        return null;
      }
    }

    case NullishComparisonType.NotEqUndefined: {
      // TODO - use types here to determine if the value is just `undefined` (eg `=== undefined` would be enough on its own)

      // handle `x === undefined || x === null`
      const nextOperand = chain[index + 1] as ValidOperand | undefined;
      if (
        nextOperand?.comparisonType === NullishComparisonType.NotEqNull &&
        compareNodes(operand.node, nextOperand.node) ===
          NodeComparisonResult.Equal
      ) {
        return [operand, nextOperand];
      } else {
        return null;
      }
    }

    default:
      return null;
  }
};
const analyzeOrChainOperand: OperandAnalyzer = (operand, index, chain) => {
  // TODO - "== null"-like chains
  // TODO - "!x || !x.y" chains
  switch (operand.comparisonType) {
    case NullishComparisonType.Boolean:
    case NullishComparisonType.EqNullOrUndefined:
      return [operand];

    case NullishComparisonType.EqNull: {
      // TODO(#4820) - use types here to determine if the value is just `null` (eg `=== null` would be enough on its own)

      // handle `x === null || x === undefined`
      const nextOperand = chain[index + 1] as ValidOperand | undefined;
      if (
        nextOperand?.comparisonType === NullishComparisonType.EqUndefined &&
        compareNodes(operand.node, nextOperand.node) ===
          NodeComparisonResult.Equal
      ) {
        return [operand, nextOperand];
      } else {
        return null;
      }
    }

    case NullishComparisonType.EqUndefined: {
      // TODO - use types here to determine if the value is just `undefined` (eg `=== undefined` would be enough on its own)

      // handle `x === undefined || x === null`
      const nextOperand = chain[index + 1] as ValidOperand | undefined;
      if (
        nextOperand?.comparisonType === NullishComparisonType.EqNull &&
        compareNodes(operand.node, nextOperand.node) ===
          NodeComparisonResult.Equal
      ) {
        return [operand, nextOperand];
      } else {
        return null;
      }
    }

    default:
      return null;
  }
};

function analyzeChain(
  context: TSESLint.RuleContext<TMessageIds, TOptions>,
  operator: TSESTree.LogicalExpression['operator'],
  chain: ValidOperand[],
): void {
  if (chain.length === 0) {
    return;
  }

  const analyzeOperand = ((): OperandAnalyzer | null => {
    switch (operator) {
      case '&&':
        return analyzeAndChainOperand;

      case '||':
        return analyzeOrChainOperand;

      case '??':
        return null;
    }
  })();
  if (!analyzeOperand) {
    return;
  }

  let subChain: ValidOperand[] = [];
  const maybeReportThenReset = (
    newChainSeed?: readonly ValidOperand[],
  ): void => {
    if (subChain.length > 1) {
      context.report({
        messageId: 'preferOptionalChain',
        loc: {
          start: subChain[0].node.loc.start,
          end: subChain[subChain.length - 1].node.loc.end,
        },
      });
    }

    // we've reached the end of a chain of logical expressions
    // we know the validated
    subChain = newChainSeed ? [...newChainSeed] : [];
  };

  for (let i = 0; i < chain.length; i += 1) {
    const lastOperand = subChain[subChain.length - 1] as
      | ValidOperand
      | undefined;
    const operand = chain[i];

    const validatedOperands = analyzeOperand(operand, i, chain);
    if (!validatedOperands) {
      maybeReportThenReset();
      continue;
    }
    // in case multiple operands were consumed - make sure to correctly increment the index
    i += validatedOperands.length - 1;

    if (lastOperand) {
      const currentOperand = validatedOperands[0];
      const comparisonResult = compareNodes(
        lastOperand.node,
        currentOperand.node,
      );
      if (
        comparisonResult === NodeComparisonResult.Subset ||
        comparisonResult === NodeComparisonResult.Equal
      ) {
        // the operands are comparable, so we can continue searching
        subChain.push(...validatedOperands);
      } else {
        maybeReportThenReset(validatedOperands);
      }
    }
  }
}

export default util.createRule<TOptions, TMessageIds>({
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
        if (node.operator === '??') {
          return;
        }

        if (seenLogicals.has(node)) {
          return;
        }

        const { operands, seenLogicals: newSeenLogicals } =
          gatherLogicalOperands(node);

        for (const logical of newSeenLogicals) {
          seenLogicals.add(logical);
        }

        let currentChain: ValidOperand[] = [];
        for (const operand of operands) {
          if (operand.type === OperandValidity.Invalid) {
            analyzeChain(context, node.operator, currentChain);
            currentChain = [];
          } else {
            currentChain.push(operand);
          }
        }

        // make sure to check whatever's left
        analyzeChain(context, node.operator, currentChain);
      },
    };
  },
});
